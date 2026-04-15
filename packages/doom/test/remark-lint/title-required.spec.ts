import { describe, expect, test } from '@rstest/core'

import { lint, lintMdx } from './_helper.ts'

import { titleRequired } from '#remark-lint/title-required.ts'

describe('title-required', () => {
  test('allows frontmatter title', async () => {
    const messages = await lint(titleRequired, '---\ntitle: My Title\n---\n')
    expect(messages).toHaveLength(0)
  })

  test('allows markdown h1 heading', async () => {
    const messages = await lint(titleRequired, '# My Title\n')
    expect(messages).toHaveLength(0)
  })

  test('allows html h1 element', async () => {
    const messages = await lint(titleRequired, '<h1>My Title</h1>\n')
    expect(messages).toHaveLength(0)
  })

  test('allows mdx h1 element', async () => {
    const messages = await lintMdx(titleRequired, '<h1>My Title</h1>\n')
    expect(messages).toHaveLength(0)
  })

  test('flags missing title', async () => {
    const messages = await lint(titleRequired, 'Just some content\n')
    expect(messages).toHaveLength(1)
    expect(String(messages[0])).toContain('Title is required')
  })

  test('flags multiple h1 headings', async () => {
    const messages = await lint(
      titleRequired,
      '# First Title\n\n# Second Title\n',
    )
    expect(messages).toHaveLength(1)
    expect(String(messages[0])).toContain('Multiple level 1 headings')
  })

  test('flags multiple html h1 elements', async () => {
    const messages = await lint(
      titleRequired,
      '<h1>First</h1>\n\n<h1>Second</h1>\n',
    )
    expect(messages).toHaveLength(1)
    expect(String(messages[0])).toContain('Multiple level 1 headings')
  })

  test('flags multiple mdx h1 elements', async () => {
    const messages = await lintMdx(
      titleRequired,
      '<h1>First</h1>\n\n<h1>Second</h1>\n',
    )
    expect(messages).toHaveLength(1)
    expect(String(messages[0])).toContain('Multiple level 1 headings')
  })

  test('does not flag h2 or deeper headings as duplicates', async () => {
    const messages = await lint(
      titleRequired,
      '# Main Title\n\n## Section 1\n\n## Section 2\n',
    )
    expect(messages).toHaveLength(0)
  })
})
