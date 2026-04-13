import { describe, expect, test } from '@rstest/core'
import type { Root } from 'mdast'
import remarkParse from 'remark-parse'
import { unified } from 'unified'

import { remarkMermaid } from '#plugins/mermaid/remark-mermaid.ts'

const parser = unified().use(remarkParse)

const parseAndTransform = (markdown: string): Root => {
  const tree = parser.parse(markdown)
  // @ts-expect-error - We know the plugin will modify the tree in place, but TypeScript doesn't understand that.
  remarkMermaid()(tree)
  return tree
}

describe('remarkMermaid', () => {
  test('transforms mermaid code block to Mermaid JSX element', () => {
    const markdown = '```mermaid\ngraph TD\nA --> B\n```'
    const tree = parseAndTransform(markdown)

    const element = tree.children[0] as unknown as {
      type: string
      name: string
      attributes: Array<{ name: string; value: string }>
    }

    expect(element.type).toBe('mdxJsxFlowElement')
    expect(element.name).toBe('Mermaid')
  })

  test('passes mermaid content as children attribute', () => {
    const markdown = '```mermaid\nsequenceDiagram\nAlice->>Bob: Hello\n```'
    const tree = parseAndTransform(markdown)

    const element = tree.children[0] as unknown as {
      attributes: Array<{ name: string; value: string }>
    }

    const childrenAttr = element.attributes.find(
      (attr) => attr.name === 'children',
    )
    expect(childrenAttr).toBeDefined()
    expect(childrenAttr!.value).toBe('sequenceDiagram\nAlice->>Bob: Hello')
  })

  test('does not transform non-mermaid code blocks', () => {
    const markdown = '```javascript\nconst x = 1;\n```'
    const tree = parseAndTransform(markdown)

    const element = tree.children[0] as unknown as { type: string }
    expect(element.type).toBe('code')
  })

  test('preserves other content around mermaid blocks', () => {
    const markdown = '# Title\n\n```mermaid\ngraph\n```\n\nText after'
    const tree = parseAndTransform(markdown)

    expect(tree.children).toHaveLength(3)
    expect((tree.children[0] as unknown as { type: string }).type).toBe(
      'heading',
    )
    expect((tree.children[1] as unknown as { type: string }).type).toBe(
      'mdxJsxFlowElement',
    )
    expect((tree.children[2] as unknown as { type: string }).type).toBe(
      'paragraph',
    )
  })

  test('handles empty mermaid block', () => {
    const markdown = '```mermaid\n```'
    const tree = parseAndTransform(markdown)

    const element = tree.children[0] as unknown as {
      type: string
      attributes: Array<{ name: string; value: string }>
    }

    expect(element.type).toBe('mdxJsxFlowElement')
    const childrenAttr = element.attributes.find(
      (attr) => attr.name === 'children',
    )
    expect(childrenAttr!.value).toBe('')
  })

  test('does not modify code block with different language', () => {
    const markdown = '```typescript\nconst x: number = 1;\n```'
    const tree = parseAndTransform(markdown)

    const element = tree.children[0] as unknown as {
      type: string
      lang: string
    }

    expect(element.type).toBe('code')
    expect(element.lang).toBe('typescript')
  })

  test('handles mermaid block with complex diagram', () => {
    const markdown = `\`\`\`mermaid
flowchart LR
  A[Start] --> B{Decision}
  B -->|Yes| C[OK]
  B -->|No| D[Cancel]
\`\`\``
    const tree = parseAndTransform(markdown)

    const element = tree.children[0] as unknown as {
      type: string
      name: string
      attributes: Array<{ name: string; value: string }>
    }

    expect(element.type).toBe('mdxJsxFlowElement')
    expect(element.name).toBe('Mermaid')

    const childrenAttr = element.attributes.find(
      (attr) => attr.name === 'children',
    )
    expect(childrenAttr!.value).toContain('flowchart LR')
    expect(childrenAttr!.value).toContain('A[Start]')
  })
})
