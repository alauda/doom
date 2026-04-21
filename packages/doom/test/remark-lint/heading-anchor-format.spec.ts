import { describe, expect, test } from '@rstest/core'

import { lint, lintMdx } from './_helper.ts'

import { headingAnchorFormat } from '#remark-lint/heading-anchor-format.ts'

describe('heading-anchor-format', () => {
  test('allows canonical heading anchor syntax', async () => {
    const messages = await lint(headingAnchorFormat, '## Title {#hash}\n')
    expect(messages).toHaveLength(0)
  })

  test('allows unrelated id-bearing html away from headings', async () => {
    const messages = await lint(
      headingAnchorFormat,
      '<span id="hash"></span>\n\nParagraph\n\n## Title\n',
    )
    expect(messages).toHaveLength(0)
  })

  test('flags anchor element inside heading', async () => {
    const messages = await lint(
      headingAnchorFormat,
      '## Title <a id="hash"></a>\n',
    )
    expect(messages).toHaveLength(1)
    expect(String(messages[0])).toContain('# Title {#hash}')
  })

  test('flags non-anchor element inside heading', async () => {
    const messages = await lint(
      headingAnchorFormat,
      '## Title <span id="hash"></span>\n',
    )
    expect(messages).toHaveLength(1)
    expect(String(messages[0])).toContain('<span id="hash">')
  })

  test('flags id-bearing element before heading', async () => {
    const messages = await lint(
      headingAnchorFormat,
      '<a id="hash"></a>\n## Title\n',
    )
    expect(messages).toHaveLength(1)
    expect(String(messages[0])).toContain('# Title {#hash}')
  })

  test('flags id-bearing element after heading', async () => {
    const messages = await lint(
      headingAnchorFormat,
      '## Title\n<a id="hash"></a>\n',
    )
    expect(messages).toHaveLength(1)
    expect(String(messages[0])).toContain('# Title {#hash}')
  })

  test('flags blank-line separated id-bearing element before heading', async () => {
    const messages = await lint(
      headingAnchorFormat,
      '<a id="hash"></a>\n\n## Title\n',
    )
    expect(messages).toHaveLength(1)
    expect(String(messages[0])).toContain('<a id="hash"></a>')
  })

  test('flags blank-line separated id-bearing element after heading', async () => {
    const messages = await lint(
      headingAnchorFormat,
      '## Title\n\n<a id="hash"></a>\n',
    )
    expect(messages).toHaveLength(1)
    expect(String(messages[0])).toContain('<a id="hash"></a>')
  })

  test('flags mdx jsx element inside heading', async () => {
    const messages = await lintMdx(
      headingAnchorFormat,
      '## Title <Badge id="hash" />\n',
    )
    expect(messages).toHaveLength(1)
    expect(String(messages[0])).toContain('<Badge id="hash" />')
    expect(String(messages[0])).toContain('# Title \\{#hash}')
  })

  test('flags mdx jsx element before heading', async () => {
    const messages = await lintMdx(
      headingAnchorFormat,
      '<Badge id="hash" />\n\n## Title\n',
    )
    expect(messages).toHaveLength(1)
    expect(String(messages[0])).toContain('# Title \\{#hash}')
  })

  test('flags mdx jsx element after heading', async () => {
    const messages = await lintMdx(
      headingAnchorFormat,
      '## Title\n\n<Badge id="hash" />\n',
    )
    expect(messages).toHaveLength(1)
    expect(String(messages[0])).toContain('# Title \\{#hash}')
  })
})
