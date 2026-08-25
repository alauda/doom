import { describe, expect, test } from '@rstest/core'

import { mdProcessor, mdxProcessor } from '#plugins/index.ts'
import {
  collectComponents,
  collectHeadingDepths,
  collectJsxAttributes,
  collectLinkTargets,
  collectProseText,
  diffMultiset,
  docDirInRoot,
  resolveLinkTarget,
} from '#remark-lint/translation-parity/shared.ts'

/**
 * The judgement in the `translation-parity` rules lives in these collectors:
 * the rules themselves only diff what comes back. The end-to-end evidence that
 * they find real damage and stay quiet otherwise comes from running
 * `doom translate check` over a real corpus — see the rules' own comments for
 * the measured numbers.
 */

describe('resolveLinkTarget: making a translation comparable with its source', () => {
  test('resolves a relative link against the document that holds it', () => {
    expect(resolveLinkTarget('../global/upgrade.mdx', 'en/install')).toBe(
      '/global/upgrade.mdx',
    )
  })

  test('an asset pointing back into the source tree names the same file as the source spelling', () => {
    // What the translation says, because assets are not copied per language...
    const inTranslation = resolveLinkTarget(
      '../../../en/networking/how_to/assets/x.png',
      'zh/networking/how_to',
    )
    // ...and what the source says.
    const inSource = resolveLinkTarget('./assets/x.png', 'en/networking/how_to')

    expect(inTranslation).toBe(inSource)
    expect(inTranslation).toBe('/networking/how_to/assets/x.png')
  })

  test('strips the language segment from a root-absolute link', () => {
    expect(resolveLinkTarget('/zh/global/install.html', 'zh/install')).toBe(
      '/global/install.html',
    )
    expect(resolveLinkTarget('/global/install.html', 'en/install')).toBe(
      '/global/install.html',
    )
  })

  test('keeps the anchor, so a link retargeted to another section is still a difference', () => {
    expect(resolveLinkTarget('../a.mdx#step-2', 'en/install')).toBe(
      '/a.mdx#step-2',
    )
    expect(resolveLinkTarget('#local', 'en/install')).toBe('#local')
  })

  test('leaves external links alone', () => {
    for (const url of [
      'https://example.com/docs',
      'mailto:a@b.com',
      '//cdn.example.com/x.js',
    ]) {
      expect(resolveLinkTarget(url, 'zh/install')).toBe(url)
    }
  })

  test('distinguishes the corruptions measured on the corpus', () => {
    const at = (url: string) => resolveLinkTarget(url, 'zh/overview')
    // path segment collapsed
    expect(
      at('../virtualization/virtualization/virtual_machine/n.mdx'),
    ).not.toBe(at('../virtualization/virtualization_virtual_machine/n.mdx'))
    // underscore turned into a dot, and into a hyphen
    expect(at('../global_dr.mdx')).not.toBe(at('../global.dr.mdx'))
    expect(at('../how_to/access/10-failover.mdx')).not.toBe(
      at('../how-to/access/10-failover.mdx'),
    )
  })
})

describe('collectLinkTargets: everywhere a document can point', () => {
  const targets = (source: string, dir = 'en/install', mdx = true) =>
    collectLinkTargets(
      (mdx ? mdxProcessor : mdProcessor).parse(source),
      dir,
    ).sort()

  test('reads markdown links, images and reference definitions', () => {
    expect(
      targets(
        [
          'See [the guide](../guide.mdx) and ![alt](./x.png).',
          '',
          '[ref]: ../other.mdx',
        ].join('\n'),
      ),
    ).toEqual(['/guide.mdx', '/install/x.png', '/other.mdx'])
  })

  test('reads href and src on components', () => {
    expect(
      targets(
        '<ExternalSiteLink name="infra" href="/global/install.html" />\n\n<img src="./a.png" alt="x" />\n',
      ),
    ).toEqual(['/global/install.html', '/install/a.png'])
  })

  test('reads href and src inside raw HTML', () => {
    expect(
      targets(
        'Text <a href="../foo.html">link</a> and <img src="./a.png" /> end.',
        'en/install',
        false,
      ),
    ).toEqual(['/foo.html', '/install/a.png'])
  })
})

describe('collectors', () => {
  test('counts component open tags by name', () => {
    const counts = collectComponents(
      mdxProcessor.parse(
        '<Term name="a" /> and <Term name="b" />\n\n<Directive type="note">\n\ntext\n\n</Directive>\n',
      ),
    )
    expect(counts.get('Term')).toBe(2)
    expect(counts.get('Directive')).toBe(1)
  })

  test('reads heading levels in order', () => {
    expect(
      collectHeadingDepths(
        mdxProcessor.parse('# One\n\n## Two\n\n### Three\n\n## Four\n'),
      ),
    ).toEqual([1, 2, 3, 2])
  })

  test('reads attribute values through expressions', () => {
    const attrs = collectJsxAttributes(
      mdxProcessor.parse(
        '<K8sAPI name="backups.velero.io" namespaced={false} {...rest} />\n',
      ),
    )
    expect(attrs.get('K8sAPI.name')).toEqual(['backups.velero.io'])
    expect(attrs.get('K8sAPI.namespaced')).toEqual(['false'])
    expect(attrs.get('K8sAPI.{...}')).toEqual(['...rest'])
  })

  test('prose excludes code, inline code and attributes', () => {
    const prose = collectProseText(
      mdxProcessor.parse(
        [
          'Run `kubectl get pods` now.',
          '',
          '```sh',
          'echo hidden',
          '```',
          '',
          '<Term name="productShort" /> ships it.',
        ].join('\n'),
      ),
    )
    expect(prose).toContain('Run')
    expect(prose).toContain('ships it.')
    expect(prose).not.toContain('kubectl')
    expect(prose).not.toContain('echo hidden')
    expect(prose).not.toContain('productShort')
  })
})

describe('diffMultiset', () => {
  test('reports what is missing and what is extra, counting duplicates', () => {
    expect(diffMultiset(['a', 'b', 'b'], ['b', 'c'])).toEqual({
      missing: ['a', 'b'],
      extra: ['c'],
    })
  })

  test('says nothing when the multisets agree, whatever the order', () => {
    expect(diffMultiset(['a', 'b'], ['b', 'a'])).toEqual({
      missing: [],
      extra: [],
    })
  })
})

describe('docDirInRoot', () => {
  test('gives the directory a document sits in, inside its language tree', () => {
    expect(docDirInRoot('zh', 'install/installing.mdx')).toBe('zh/install')
    expect(docDirInRoot('en', 'index.mdx')).toBe('en')
  })
})
