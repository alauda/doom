import { describe, expect, test } from '@rstest/core'
import type { Root } from 'mdast'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import { unified } from 'unified'

import { parseToc } from '../../../src/plugins/replace/parse-toc.ts'

const parser = unified().use(remarkParse).use(remarkGfm)

const parseMarkdown = (markdown: string): Root => {
  return parser.parse(markdown)
}

describe('parseToc', () => {
  test('extracts h1 as title and skips it from toc', () => {
    const markdown = '# Main Title\n\n## Section 1\n\n### Subsection'
    const tree = parseMarkdown(markdown)
    const { title, toc } = parseToc(tree)

    expect(title).toBe('Main Title')
    expect(toc.length).toBe(2)
    expect(toc[0]?.text).toBe('Section 1')
    expect(toc[0]?.depth).toBe(2)
    expect(toc[1]?.text).toBe('Subsection')
  })

  test('collects h2 to h4 by default', () => {
    const markdown = '## H2\n### H3\n#### H4\n##### H5'
    const tree = parseMarkdown(markdown)
    const { toc } = parseToc(tree)

    expect(toc.length).toBe(3)
    expect(toc[0]?.depth).toBe(2)
    expect(toc[1]?.depth).toBe(3)
    expect(toc[2]?.depth).toBe(4)
  })

  test('skips h5 and deeper by default', () => {
    const markdown = '## H2\n##### H5\n###### H6'
    const tree = parseMarkdown(markdown)
    const { toc } = parseToc(tree)

    expect(toc.length).toBe(1)
    expect(toc[0]?.text).toBe('H2')
  })

  test('includes all depths when allDepths is true', () => {
    const markdown = '## H2\n##### H5\n###### H6'
    const tree = parseMarkdown(markdown)
    const { toc } = parseToc(tree, true)

    expect(toc.length).toBe(3)
    expect(toc[0]?.depth).toBe(2)
    expect(toc[1]?.depth).toBe(5)
    expect(toc[2]?.depth).toBe(6)
  })

  test('generates slugs from heading text', () => {
    const markdown = '## Hello World'
    const tree = parseMarkdown(markdown)
    const { toc } = parseToc(tree)

    expect(toc[0]?.id).toBe('hello-world')
  })

  test('handles inline code in headings', () => {
    const markdown = '## `const` keyword'
    const tree = parseMarkdown(markdown)
    const { toc } = parseToc(tree)

    expect(toc[0]?.text).toContain('`const`')
  })

  test('handles strong text in headings', () => {
    const markdown = '## **Bold** text'
    const tree = parseMarkdown(markdown)
    const { toc } = parseToc(tree)

    expect(toc[0]?.text).toContain('**Bold**')
  })

  test('assigns correct index to toc items', () => {
    const markdown = '## First\n\n## Second\n\n## Third'
    const tree = parseMarkdown(markdown)
    const { toc } = parseToc(tree)

    expect(toc[0]?.index).toBe(0)
    expect(toc[1]?.index).toBe(1)
    expect(toc[2]?.index).toBe(2)
  })

  test('returns empty toc and empty title for document without headings', () => {
    const markdown = 'Just some text without headings'
    const tree = parseMarkdown(markdown)
    const { title, toc } = parseToc(tree)

    expect(title).toBe('')
    expect(toc.length).toBe(0)
  })

  test('sets title only once for multiple h1s', () => {
    const markdown = '# First Title\n\n# Second Title\n\n## Section'
    const tree = parseMarkdown(markdown)
    const { title, toc } = parseToc(tree)

    expect(title).toBe('First Title')
    expect(toc.length).toBe(1)
  })

  test('skips h1 from toc when allDepths is true', () => {
    const markdown = '# Main\n## Sub'
    const tree = parseMarkdown(markdown)
    const { toc } = parseToc(tree, true)

    expect(toc.length).toBe(2)
    expect(toc[0]?.depth).toBe(1)
    expect(toc[1]?.depth).toBe(2)
  })
})
