import { describe, expect, test } from '@rstest/core'
import type { Root } from 'mdast'
import remarkDirective from 'remark-directive'
import remarkParse from 'remark-parse'
import { unified } from 'unified'

import { remarkDirectives } from '#plugins/directives/remark-directives.ts'

const parser = unified().use(remarkParse).use(remarkDirective)

const parseAndTransform = (markdown: string): Root => {
  const tree = parser.parse(markdown)
  // @ts-expect-error - We know the plugin will modify the tree in place, but TypeScript doesn't understand that.
  remarkDirectives()(tree)
  return tree
}

describe('remarkDirectives', () => {
  test('transforms callouts directive to div with doom-callouts class', () => {
    const markdown = ':::callouts\nSome content\n:::'
    const tree = parseAndTransform(markdown)

    const directive = tree.children[0] as unknown as {
      data: { hProperties: { className: string[] } }
    }

    expect(directive.data.hProperties.className).toContain('doom-callouts')
  })

  test('transforms callout directive to span with doom-callout class', () => {
    const markdown = ':::callout\nContent\n:::'
    const tree = parseAndTransform(markdown)

    const directive = tree.children[0] as unknown as {
      data: { hName: string; hProperties: { className: string[] } }
    }

    expect(directive.data.hName).toBe('span')
    expect(directive.data.hProperties.className).toContain('doom-callout')
  })

  test('preserves standard container directives (tip)', () => {
    const markdown = ':::tip\nTip content\n:::'
    const tree = parseAndTransform(markdown)

    const directive = tree.children[0] as unknown as {
      type: string
      name: string
      data?: unknown
    }

    expect(directive.type).toBe('containerDirective')
    expect(directive.name).toBe('tip')
  })

  test('preserves standard container directives (warning)', () => {
    const markdown = ':::warning\nWarning content\n:::'
    const tree = parseAndTransform(markdown)

    const directive = tree.children[0] as unknown as {
      type: string
      name: string
    }

    expect(directive.type).toBe('containerDirective')
    expect(directive.name).toBe('warning')
  })

  test('preserves standard container directives (danger)', () => {
    const markdown = ':::danger\nDanger content\n:::'
    const tree = parseAndTransform(markdown)

    const directive = tree.children[0] as unknown as {
      type: string
      name: string
    }

    expect(directive.type).toBe('containerDirective')
    expect(directive.name).toBe('danger')
  })

  test('preserves standard container directives (note)', () => {
    const markdown = ':::note\nNote content\n:::'
    const tree = parseAndTransform(markdown)

    const directive = tree.children[0] as unknown as {
      type: string
      name: string
    }

    expect(directive.type).toBe('containerDirective')
    expect(directive.name).toBe('note')
  })

  test('preserves standard container directives (caution)', () => {
    const markdown = ':::caution\nCaution content\n:::'
    const tree = parseAndTransform(markdown)

    const directive = tree.children[0] as unknown as {
      type: string
      name: string
    }

    expect(directive.type).toBe('containerDirective')
    expect(directive.name).toBe('caution')
  })

  test('preserves standard container directives (info)', () => {
    const markdown = ':::info\nInfo content\n:::'
    const tree = parseAndTransform(markdown)

    const directive = tree.children[0] as unknown as {
      type: string
      name: string
    }

    expect(directive.type).toBe('containerDirective')
    expect(directive.name).toBe('info')
  })

  test('preserves standard container directives (details)', () => {
    const markdown = ':::details\nDetails content\n:::'
    const tree = parseAndTransform(markdown)

    const directive = tree.children[0] as unknown as {
      type: string
      name: string
    }

    expect(directive.type).toBe('containerDirective')
    expect(directive.name).toBe('details')
  })

  test('preserves attributes on callouts directive', () => {
    const markdown = ':::callouts{.custom-class #my-id}\nContent\n:::'
    const tree = parseAndTransform(markdown)

    const directive = tree.children[0] as unknown as {
      data: { hProperties: { className: string[]; id?: string } }
    }

    expect(directive.data.hProperties.className).toContain('custom-class')
    expect(directive.data.hProperties.className).toContain('doom-callouts')
  })

  test('handles multiple consecutive callouts directives', () => {
    const markdown = ':::callouts\nFirst\n:::\n\n:::callouts\nSecond\n:::'
    const tree = parseAndTransform(markdown)

    const directives = tree.children.filter(
      (child) =>
        (child as { type: string }).type === 'containerDirective' &&
        (child as { name: string }).name === 'callouts',
    )

    expect(directives).toHaveLength(2)
    for (const directive of directives) {
      const d = directive as unknown as {
        data: { hProperties: { className: string[] } }
      }
      expect(d.data.hProperties.className).toContain('doom-callouts')
    }
  })

  test('handles nested content in callout directive', () => {
    const markdown =
      ':::callout\n**Bold** and *italic* text\n\n- List item\n:::'
    const tree = parseAndTransform(markdown)

    const directive = tree.children[0] as unknown as {
      data: { hName: string }
      children: unknown[]
    }

    expect(directive.data.hName).toBe('span')
    expect(directive.children.length).toBeGreaterThan(0)
  })
})
