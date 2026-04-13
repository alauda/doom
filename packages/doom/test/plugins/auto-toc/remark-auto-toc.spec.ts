import { describe, expect, test } from '@rstest/core'
import type { Root } from 'mdast'
import remarkParse from 'remark-parse'
import { unified } from 'unified'

import { remarkAutoToc } from '#plugins/auto-toc/remark-auto-toc.ts'

const parser = unified().use(remarkParse)

const parseAndTransform = (markdown: string): Root => {
  const tree = parser.parse(markdown)
  // @ts-expect-error - We know the plugin will modify the tree in place, but TypeScript doesn't understand that.
  remarkAutoToc()(tree)
  return tree
}

describe('remarkAutoToc', () => {
  test('inserts Toc component before first h2', () => {
    const markdown = '# Title\n\n## First Section\n\nContent'
    const tree = parseAndTransform(markdown)

    // Should have: h1, import, div(with Toc), h2, paragraph
    const types = tree.children.map((child) => (child as { type: string }).type)
    expect(types).toContain('mdxJsxFlowElement')
  })

  test('adds useTranslation import', () => {
    const markdown = '## Section\n\nContent'
    const tree = parseAndTransform(markdown)

    const importNode = tree.children.find(
      (child) => (child as { type: string }).type === 'mdxjsEsm',
    )
    expect(importNode).toBeDefined()
  })

  test('does not modify document without h2', () => {
    const markdown = '# Title\n\n### H3 only\n\nContent'
    const originalTree = parser.parse(markdown)
    const transformedTree = parseAndTransform(markdown)

    expect(transformedTree.children.length).toBe(originalTree.children.length)
  })

  test('creates div with doom-auto-toc class', () => {
    const markdown = '## Section'
    const tree = parseAndTransform(markdown)

    const divElement = tree.children.find(
      (child) =>
        (child as { type: string; name?: string }).type ===
          'mdxJsxFlowElement' &&
        (child as { type: string; name: string }).name === 'div',
    ) as unknown as {
      attributes: Array<{ name: string; value: string }>
    }

    expect(divElement).toBeDefined()
    const classAttr = divElement.attributes.find(
      (attr) => attr.name === 'className',
    )
    expect(classAttr!.value).toContain('doom-auto-toc')
  })

  test('includes rp-toc-exclude class', () => {
    const markdown = '## Section'
    const tree = parseAndTransform(markdown)

    const divElement = tree.children.find(
      (child) =>
        (child as { type: string; name?: string }).type ===
          'mdxJsxFlowElement' &&
        (child as { type: string; name: string }).name === 'div',
    ) as unknown as {
      attributes: Array<{ name: string; value: string }>
    }

    const classAttr = divElement.attributes.find(
      (attr) => attr.name === 'className',
    )
    expect(classAttr!.value).toContain('rp-toc-exclude')
  })

  test('inserts before first h2, preserving content before', () => {
    const markdown = '# Title\n\nSome paragraph\n\n## First H2\n\n## Second H2'
    const tree = parseAndTransform(markdown)

    // Find the position of the first h2
    const h2Index = tree.children.findIndex(
      (child) =>
        (child as { type: string; depth?: number }).type === 'heading' &&
        (child as { depth: number }).depth === 2,
    )

    // The import and div should be inserted before the first h2
    // so h2Index should be after the import and div
    expect(h2Index).toBeGreaterThan(1)
  })

  test('handles document starting with h2', () => {
    const markdown = '## First Section\n\nContent'
    const tree = parseAndTransform(markdown)

    // Import should be first
    expect((tree.children[0] as { type: string }).type).toBe('mdxjsEsm')
    // Div with Toc should be second
    expect((tree.children[1] as { type: string }).type).toBe(
      'mdxJsxFlowElement',
    )
  })
})
