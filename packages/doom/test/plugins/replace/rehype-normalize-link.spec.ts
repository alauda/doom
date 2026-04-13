import { describe, expect, test } from '@rstest/core'
import type { Element, Root } from 'hast'

import { rehypeNormalizeLink } from '#plugins/replace/rehype-normalize-link.ts'

const createImgElement = (
  src: string | number | undefined,
  alt?: string,
): Element => ({
  type: 'element',
  tagName: 'img',
  properties: { src, alt },
  children: [],
})

const createTree = (children: Element[]): Root => ({
  type: 'root',
  children,
})

describe('rehypeNormalizeLink', () => {
  const process = (tree: Root): Root => {
    // @ts-expect-error - We are directly testing the plugin function
    rehypeNormalizeLink()(tree)
    return tree
  }

  describe('image handling', () => {
    test('transforms relative image src to mdx import', () => {
      const tree = createTree([createImgElement('./image.png', 'test')])
      const result = process(tree)

      // Should have added an import at the beginning
      expect(result.children.length).toBe(2)

      // First child should be mdxjsEsm import
      const importNode = result.children[0]
      expect(importNode.type).toBe('mdxjsEsm')
    })

    test('ignores external URLs', () => {
      const tree = createTree([
        createImgElement('https://example.com/image.png', 'external'),
      ])
      const originalLength = tree.children.length
      const result = process(tree)

      // Should not add imports for external URLs
      const imports = result.children.filter((c) => c.type === 'mdxjsEsm')
      expect(imports.length).toBe(0)
      expect(result.children.length).toBe(originalLength)
    })

    test('ignores absolute paths', () => {
      const tree = createTree([createImgElement('/images/logo.png', 'logo')])
      const originalLength = tree.children.length
      const result = process(tree)

      // Should not add imports for absolute paths
      const imports = result.children.filter((c) => c.type === 'mdxjsEsm')
      expect(imports.length).toBe(0)
      expect(result.children.length).toBe(originalLength)
    })

    test('handles img without src', () => {
      const tree = createTree([createImgElement(undefined, 'no-src')])
      const result = process(tree)

      // Should not crash and should not add imports
      const imports = result.children.filter((c) => c.type === 'mdxjsEsm')
      expect(imports.length).toBe(0)
    })

    test('handles img with non-string src', () => {
      const tree = createTree([createImgElement(123, 'test')])
      const result = process(tree)

      // Should not crash and should not add imports
      const imports = result.children.filter((c) => c.type === 'mdxjsEsm')
      expect(imports.length).toBe(0)
    })

    test('handles multiple images', () => {
      const tree = createTree([
        createImgElement('./a.png', 'a'),
        createImgElement('./b.png', 'b'),
        createImgElement('https://external.com/c.png', 'c'),
      ])
      const result = process(tree)

      // Should add 2 imports (for a.png and b.png, not for external)
      const imports = result.children.filter((c) => c.type === 'mdxjsEsm')
      expect(imports.length).toBe(2)
    })

    test('ignores non-img elements', () => {
      const tree = createTree([
        {
          type: 'element',
          tagName: 'div',
          properties: { src: './image.png' },
          children: [],
        },
      ])
      const result = process(tree)

      // Should not add imports for non-img elements
      const imports = result.children.filter((c) => c.type === 'mdxjsEsm')
      expect(imports.length).toBe(0)
    })

    test('transforms img without alt attribute', () => {
      const tree = createTree([createImgElement('./image.png')])
      const result = process(tree)

      // Should still transform the image
      const imports = result.children.filter((c) => c.type === 'mdxjsEsm')
      expect(imports.length).toBe(1)
    })

    test('transforms relative paths with parent directory', () => {
      const tree = createTree([createImgElement('../assets/image.png', 'test')])
      const result = process(tree)

      // Should add import for relative path with ../
      const imports = result.children.filter((c) => c.type === 'mdxjsEsm')
      expect(imports.length).toBe(1)
    })

    test('transforms nested relative paths', () => {
      const tree = createTree([
        createImgElement('./deep/nested/image.png', 'test'),
      ])
      const result = process(tree)

      // Should add import for nested relative path
      const imports = result.children.filter((c) => c.type === 'mdxjsEsm')
      expect(imports.length).toBe(1)
    })

    test('generates unique variable names for multiple images', () => {
      const tree = createTree([
        createImgElement('./first.png', 'first'),
        createImgElement('./second.png', 'second'),
      ])
      const result = process(tree)

      const imports = result.children.filter((c) => c.type === 'mdxjsEsm')
      expect(imports.length).toBe(2)

      // Check import values are unique
      const importValues = imports.map((i) => (i as { value?: string }).value)
      expect(new Set(importValues).size).toBe(2)
    })

    test('transforms img element to mdxJsxFlowElement', () => {
      const tree = createTree([createImgElement('./image.png', 'test')])
      process(tree)

      // The img element should be transformed
      const transformed = tree.children.find(
        (c) => (c as { name?: string }).name === 'img',
      )
      expect(transformed).toBeDefined()
      expect((transformed as { type: string }).type).toBe('mdxJsxFlowElement')
    })
  })
})
