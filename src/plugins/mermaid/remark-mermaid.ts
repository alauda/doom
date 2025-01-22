import type { Plugin } from 'unified'
import type { Root } from 'mdast'
import { visit } from 'unist-util-visit'

export const remarkMermaid: Plugin<[], Root> = function () {
  return (root) => {
    visit(root, 'code', (node, index, parent) => {
      if (!parent || node.lang !== 'mermaid') {
        return
      }
      parent.children.splice(index!, 1, {
        type: 'mdxJsxFlowElement',
        name: 'Mermaid',
        attributes: [
          {
            type: 'mdxJsxAttribute',
            name: 'children',
            value: node.value,
          },
        ],
        children: [],
      })
    })
  }
}
