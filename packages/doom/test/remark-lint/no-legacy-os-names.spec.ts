import { describe, expect, test } from '@rstest/core'

import { lint, lintMdx } from './_helper.ts'

import { noLegacyOSNames } from '#remark-lint/no-legacy-os-names.ts'

describe('no-legacy-os-names', () => {
  test('allows Alauda OS names and unrelated words', async () => {
    const messages = await lint(
      noLegacyOSNames,
      [
        'Alauda OS image',
        'alauda os search query',
        'AlaudaOS-Clone',
        'microservices are unrelated',
      ].join('\n'),
    )

    expect(messages).toHaveLength(0)
  })

  test('flags legacy OS names in markdown content', async () => {
    const messages = await lint(
      noLegacyOSNames,
      [
        '# MicroOS-Based Global Clusters',
        '',
        'Use Micro OS for x86.',
        '',
        '- micros global cluster',
        '',
        '| Source | Target |',
        '|---|---|',
        '| KubeOS | Alauda OS |',
        '| Kube OS | Alauda OS |',
        '',
        '`kubeos-clone`',
      ].join('\n'),
    )

    expect(messages).toHaveLength(6)
    expect(messages.map(String).join('\n')).toContain('MicroOS')
    expect(messages.map(String).join('\n')).toContain('Micro OS')
    expect(messages.map(String).join('\n')).toContain('micros')
    expect(messages.map(String).join('\n')).toContain('KubeOS')
    expect(messages.map(String).join('\n')).toContain('Kube OS')
    expect(messages.map(String).join('\n')).toContain('kubeos')
  })

  test('flags legacy OS names in frontmatter and code blocks', async () => {
    const messages = await lint(
      noLegacyOSNames,
      [
        '---',
        'queries:',
        '  - microos cluster path',
        '---',
        '',
        '```yaml',
        'name: kubeos-clone',
        '```',
      ].join('\n'),
    )

    expect(messages).toHaveLength(2)
    expect(messages.map(String).join('\n')).toContain('microos')
    expect(messages.map(String).join('\n')).toContain('kubeos')
  })

  test('flags legacy OS names in MDX string attributes', async () => {
    const messages = await lintMdx(
      noLegacyOSNames,
      '<ExternalSiteLink children="MicroOS on Huawei DCS" />\n',
    )

    expect(messages).toHaveLength(1)
    expect(String(messages[0])).toContain('MicroOS')
  })
})
