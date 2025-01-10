import { Root } from 'mdast'
import { visit } from 'unist-util-visit'
import type { Plugin } from 'unified'

export const remarkJsxTable: Plugin<[], Root> = () => (ast) => {
  visit(ast, 'mdxJsxFlowElement', (node) => {
    if (
      node.name &&
      ['table', 'tr', 'th', 'td'].includes(node.name) &&
      node.data?._mdxExplicitJsx
    ) {
      delete node.data._mdxExplicitJsx
    }
  })
}
