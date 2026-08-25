import { describe, expect, test } from '@rstest/core'

import {
  MaskIntegrityError,
  type MaskEntry,
  maskAst,
  restoreMaskedContent,
} from '#cli/translate-mask.ts'
import { mdProcessor, mdxProcessor } from '#plugins/index.ts'

/** Masks a document the way `doom translate` does and returns what the model would see. */
const mask = (source: string, mdx = true) => {
  const processor = mdx ? mdxProcessor : mdProcessor
  const tree = processor.parse(source)
  const entries = maskAst(tree)
  return { entries, masked: processor.stringify(tree), processor }
}

/** Restores a (possibly tampered with) model response. */
const restore = (
  translated: string,
  entries: readonly MaskEntry[],
  mdx = true,
) => restoreMaskedContent(translated, entries, mdx ? mdxProcessor : mdProcessor)

const findingsOf = (run: () => unknown) => {
  try {
    run()
  } catch (error) {
    if (error instanceof MaskIntegrityError) {
      return error.findings
    }
    throw error
  }
  throw new Error('expected a MaskIntegrityError, but the round trip passed')
}

describe('maskAst: what the model is allowed to see', () => {
  test('masks a link target but leaves the link text to translate', () => {
    const { masked, entries } = mask(
      'See [the guide](../how_to/access/10-failover.mdx#step) now.',
    )

    expect(masked).toContain('[the guide](__DOOM_TR_LINK_0__)')
    expect(masked).not.toContain('10-failover')
    expect(entries).toEqual([
      {
        kind: 'LINK',
        placeholder: '__DOOM_TR_LINK_0__',
        occurrences: 1,
        url: '../how_to/access/10-failover.mdx#step',
      },
    ])

    expect(restore(masked.replace('the guide', '本指南'), entries)).toContain(
      '[本指南](../how_to/access/10-failover.mdx#step)',
    )
  })

  test('masks an image target but leaves its alt text to translate', () => {
    const { masked, entries } = mask(
      '![Node Isolation Strategy](./assets/iso.png)',
    )

    expect(masked).toContain('![Node Isolation Strategy](__DOOM_TR_IMG_0__)')
    expect(
      restore(
        masked.replace('Node Isolation Strategy', '节点隔离策略'),
        entries,
      ),
    ).toContain('![节点隔离策略](./assets/iso.png)')
  })

  test('masks a bare URL whole, so it cannot be rewritten into a markdown link', () => {
    const source =
      'See https://example.com/docs for details, then read www.foo.org.'
    const { masked, entries } = mask(source)

    // Carried by inline code: a placeholder in a prose text position gets
    // escaped by the stringifier into `\_\_DOOM\_TR\_...`, which is exactly the
    // kind of mangling the model then "helpfully" cleans up.
    expect(masked).toContain('`__DOOM_TR_URL_0__`')
    expect(masked).toContain('`__DOOM_TR_URL_1__`')
    expect(masked).not.toContain('example.com')
    expect(masked).not.toContain('\\_\\_DOOM')

    const restored = restore(
      masked.replace('for details, then read', '了解详情，然后阅读'),
      entries,
    )
    expect(restored).toContain('https://example.com/docs')
    expect(restored).toContain('www.foo.org')
    expect(restored).not.toContain('`http')
  })

  test('masks a custom heading anchor and puts it back in escaped form', () => {
    const { masked, entries } = mask('# Cluster Plugins \\{#cluster-plugins}\n')

    expect(masked).toContain('# Cluster Plugins `__DOOM_TR_ANCHOR_0__`')
    expect(masked).not.toContain('cluster-plugins')

    expect(
      restore(masked.replace('Cluster Plugins', '集群插件'), entries),
    ).toBe('# 集群插件 \\{#cluster-plugins}\n')
  })

  test('masks every JSX attribute except the declared prose ones', () => {
    const source = [
      '<ExternalSiteLink name="immutable-infra" href="/global/install.html" children="Installing the global Cluster" />',
      '',
      '<Directive type="warning" title="Current behavior">',
      '',
      'Body prose.',
      '',
      '</Directive>',
      '',
      '<Tab label="Web Console" />',
      '',
      '<img src="./assets/q.png" alt="expand" width="800" style={{ verticalAlign: \'middle\' }} />',
    ].join('\n')
    const { masked } = mask(source)

    // identifiers and targets are gone
    expect(masked).not.toContain('immutable-infra')
    expect(masked).not.toContain('/global/install.html')
    expect(masked).not.toContain('"warning"')
    expect(masked).not.toContain('./assets/q.png')
    expect(masked).not.toContain('verticalAlign')
    expect(masked).not.toContain('"800"')

    // declared prose survives for the model to translate
    expect(masked).toContain('children="Installing the global Cluster"')
    expect(masked).toContain('title="Current behavior"')
    expect(masked).toContain('label="Web Console"')
    expect(masked).toContain('alt="expand"')
    expect(masked).toContain('Body prose.')
  })

  test('masks a component nobody has classified, by default', () => {
    const { masked } = mask(
      '<BrandNewComponent target="/some/path" caption="Read me" />',
    )

    expect(masked).not.toContain('/some/path')
    // Over-masking a caption leaves English on the page: visible, and harmless.
    expect(masked).not.toContain('Read me')
  })

  test('masks code with no length floor, and inline code', () => {
    const source = [
      'Run `kubectl get pods` first.',
      '',
      '```sh title="short.sh"',
      'echo hi',
      '```',
    ].join('\n')
    const { masked, entries } = mask(source)

    expect(masked).toContain('`__DOOM_TR_ICODE_0__`')
    expect(masked).not.toContain('kubectl get pods')
    expect(masked).not.toContain('echo hi')
    expect(masked).not.toContain('short.sh')

    const restored = restore(
      masked.replace('Run', '先运行').replace(' first.', '。'),
      entries,
    )
    expect(restored).toContain('`kubectl get pods`')
    expect(restored).toContain('```sh title="short.sh"')
    expect(restored).toContain('echo hi')
  })

  test('masks MDX expressions so pragma comments survive translation', () => {
    const { masked, entries } = mask(
      '{/* cspell:disable-next-line */}\n\nSome prose.\n',
    )

    expect(masked).not.toContain('cspell')
    expect(
      restore(masked.replace('Some prose.', '一些正文。'), entries),
    ).toContain('{/* cspell:disable-next-line */}')
  })

  test('masks href and src inside raw HTML in a plain markdown file', () => {
    const source =
      'Text <a href="../foo.html">link</a> and <img src="./a.png" alt="x" /> end.'
    const { masked, entries } = mask(source, false)

    expect(masked).not.toContain('../foo.html')
    expect(masked).not.toContain('./a.png')
    expect(masked).toContain('>link<')

    const restored = restore(masked.replace('>link<', '>链接<'), entries, false)
    expect(restored).toContain('<a href="../foo.html">链接</a>')
    expect(restored).toContain('<img src="./a.png" alt="x" />')
  })

  test('shares one placeholder between a footnote and its definition, and expects it back twice', () => {
    const source = [
      'Thresholds are documented upstream[^1].',
      '',
      '[^1]: See https://kubernetes.io/docs/ for the current list.',
    ].join('\n')
    const { masked, entries } = mask(source)

    const footnote = entries.find((entry) => entry.kind === 'FNID')
    expect(footnote?.occurrences).toBe(2)

    const restored = restore(
      masked.replace(
        'Thresholds are documented upstream',
        '阈值由上游文档给出',
      ),
      entries,
    )
    expect(restored).toContain('阈值由上游文档给出[^1]')
    expect(restored).toContain('[^1]: ')
    expect(restored).toContain('https://kubernetes.io/docs/')
  })

  test('refuses to mask a source that already contains a reserved token', () => {
    const findings = findingsOf(() =>
      mask('Literally __DOOM_TR_LINK_0__ in the source.'),
    )

    expect(findings).toEqual([
      {
        code: 'source-contains-placeholder',
        placeholder: '__doom_tr_link_0__',
      },
    ])
  })
})

describe('restoreMaskedContent: the corruption classes this proposal was opened for', () => {
  // Each case below is one of the six failure modes measured on the real
  // corpus. They are reproduced as what the model returns, and every one has to
  // come back as a finding — a check that has never produced a true positive on
  // real damage is not a check.

  test('a JSX component flattened into a markdown link is caught', () => {
    // Observed: <ExternalSiteLink name=… href=… /> came back as [text](../global/install.html)
    const { masked, entries } = mask(
      'Before you start, see <ExternalSiteLink name="immutable-infra" href="/global/install.html" children="Install" />.',
    )
    const flattened = masked.replace(
      /<ExternalSiteLink[^>]*\/>/,
      '[安装](../global/install.html)',
    )

    const findings = findingsOf(() => restore(flattened, entries))

    expect(findings.map((finding) => finding.code)).toEqual([
      'missing-placeholder',
      'missing-placeholder',
    ])
    expect(findings.every((finding) => finding.kind === 'JSXATTR')).toBe(true)
  })

  test('a rewritten link target cannot happen, and mangling the token is caught', () => {
    // Observed: ../virtualization/virtualization/virtual_machine/… collapsed to
    // ../virtualization/virtualization_virtual_machine/…, and ../global_dr.mdx
    // became ../global.dr.mdx. The model no longer sees the path at all, so the
    // only way to reach the target is to damage the placeholder.
    const { masked, entries } = mask(
      'See [release notes](../virtualization/virtualization/virtual_machine/notes.mdx).',
    )
    expect(masked).not.toContain('virtual_machine')

    const mangled = masked.replace('__DOOM_TR_LINK_0__', '__DOOM_TR_LINK_1__')
    const findings = findingsOf(() => restore(mangled, entries))

    expect(findings.map((finding) => finding.code).sort()).toEqual([
      'missing-placeholder',
      'unregistered-placeholder',
    ])
  })

  test('a duplicated link is caught', () => {
    // Observed: the model kept the correct component and hallucinated a second
    // relative markdown link to the same target next to it.
    const { masked, entries } = mask(
      'Read [the upgrade guide](../global/upgrade.mdx).',
    )
    const duplicated = masked.replace(
      '[the upgrade guide](__DOOM_TR_LINK_0__)',
      '[升级指南](__DOOM_TR_LINK_0__)（[升级指南](__DOOM_TR_LINK_0__)）',
    )

    const findings = findingsOf(() => restore(duplicated, entries))

    expect(findings).toEqual([
      {
        code: 'duplicate-placeholder',
        placeholder: '__DOOM_TR_LINK_0__',
        kind: 'LINK',
        expected: 1,
        actual: 2,
        detail: '../global/upgrade.mdx',
      },
    ])
  })

  test('a dropped bullet is caught when it carried anything protected', () => {
    // Observed in zh/extend/cluster_plugin.mdx: the English source has two
    // bullets, the Chinese translation only one — the sentence telling readers
    // without Customer Portal access to contact support vanished.
    const { masked, entries } = mask(
      [
        '- Download the package from the <Term name="customerPortal" /> portal.',
        '- If you do not have access, contact <Term name="company" /> support.',
      ].join('\n'),
    )
    const truncated = masked.split('\n').slice(0, 1).join('\n')

    const findings = findingsOf(() => restore(truncated, entries))

    expect(findings).toHaveLength(1)
    expect(findings[0]).toMatchObject({
      code: 'missing-placeholder',
      kind: 'JSXATTR',
      expected: 1,
      actual: 0,
      detail: 'company',
    })
  })

  test('a dropped sentence of pure prose is NOT caught here — that is the semantic gate\u2019s job', () => {
    // Stated as a test so nobody mistakes the mask for a content check: with
    // nothing protected inside it, a deleted sentence leaves no trace at this
    // layer.
    const { masked, entries } = mask(
      [
        '- Download the package from the portal.',
        '- If you do not have access, contact support.',
      ].join('\n'),
    )
    const truncated = masked.split('\n').slice(0, 1).join('\n')

    expect(() => restore(truncated, entries)).not.toThrow()
  })

  test('an invented placeholder is caught', () => {
    const { masked, entries } = mask('Plain prose with [a link](../a.mdx).')
    const hallucinated = `${masked}\n\nAlso see __DOOM_TR_LINK_7__.\n`

    const findings = findingsOf(() => restore(hallucinated, entries))

    expect(findings).toEqual([
      { code: 'unregistered-placeholder', placeholder: '__doom_tr_link_7__' },
    ])
  })

  test('output that is not valid MDX is caught', () => {
    const findings = findingsOf(() =>
      restore('Text with <Unclosed attr="x">\n', []),
    )

    expect(findings[0].code).toBe('unparseable-output')
  })

  test('protected inline code demoted to prose is caught', () => {
    const { masked, entries } = mask('Run `kubectl get pods` now.')
    // The model dropped the backticks. Markdown then reads the leading `__` as
    // strong emphasis, so the token no longer exists as such in the tree.
    const flattened = masked.replace(
      '`__DOOM_TR_ICODE_0__`',
      '__DOOM_TR_ICODE_0__',
    )

    const findings = findingsOf(() => restore(flattened, entries))

    expect(findings).toEqual([
      {
        code: 'missing-placeholder',
        placeholder: '__DOOM_TR_ICODE_0__',
        kind: 'ICODE',
        expected: 1,
        actual: 0,
        detail: 'kubectl get pods',
      },
    ])
  })

  test('a placeholder moved into a node kind it was not issued for is caught', () => {
    const { masked, entries } = mask('Read [the guide](../a.mdx) now.')
    // Count and registration both still check out — only restoration cannot
    // place it, so the last sweep is what catches this one.
    const moved = masked.replace(
      '[the guide](__DOOM_TR_LINK_0__)',
      '`__DOOM_TR_LINK_0__`',
    )

    const findings = findingsOf(() => restore(moved, entries))

    expect(findings).toEqual([
      {
        code: 'unrestored-placeholder',
        placeholder: '__doom_tr_link_0__',
        detail: 'the model moved it into a node kind it was not issued for',
      },
    ])
  })
})

describe('restoreMaskedContent: an untouched round trip is byte-identical', () => {
  test('a realistic page comes back exactly as it went in', () => {
    const source = [
      '---',
      'title: Cluster Plugins',
      'weight: 20',
      '---',
      '',
      '# Cluster Plugins \\{#cluster-plugins}',
      '',
      'Install <Term name="productShort" /> plugins from the console. See',
      '[the plugin guide](../extend/plugin.mdx#install) or https://example.com/plugins.',
      '',
      '<Directive type="note" title="Current behavior">',
      '',
      'Run `kubectl get clusterplugins` to list them.',
      '',
      '```yaml title="plugin.yaml"',
      'apiVersion: v1',
      'kind: ConfigMap',
      '```',
      '',
      '</Directive>',
      '',
      '| Field | Description |',
      '| --- | --- |',
      '| `name` | The plugin name |',
      '',
      '<ExternalSiteLink name="immutable-infra" href="/global/install.html" children="Installing the global Cluster" />',
      '',
      '{/* cspell:disable-next-line */}',
      '',
      '![Plugin list](./assets/plugins.png)',
    ].join('\n')

    const tree = mdxProcessor.parse(source)
    const original = mdxProcessor.stringify(tree)
    const entries = maskAst(tree)
    const masked = mdxProcessor.stringify(tree)

    // Nothing the model must not author is in what it receives...
    for (const secret of [
      'cluster-plugins',
      'productShort',
      '../extend/plugin.mdx#install',
      'example.com',
      '"note"',
      'kubectl get clusterplugins',
      'apiVersion: v1',
      'plugin.yaml',
      'immutable-infra',
      '/global/install.html',
      'cspell',
      './assets/plugins.png',
    ]) {
      expect(masked).not.toContain(secret)
    }
    // ...while everything it must translate still is.
    for (const prose of [
      'Install',
      'Cluster Plugins',
      'the plugin guide',
      'Current behavior',
      'Installing the global Cluster',
      'Description',
      'Plugin list',
    ]) {
      expect(masked).toContain(prose)
    }

    expect(restore(masked, entries)).toBe(original)
  })
})
