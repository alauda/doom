import { htmlTagNames } from 'html-tag-names'
import type { Root } from 'mdast'
import type { Plugin } from 'unified'
import { visit } from 'unist-util-visit'

export const remarkExplicitJsx: Plugin<[], Root> = () => (ast) => {
  visit(ast, (node) => {
    if (
      (node.type === 'mdxJsxTextElement' ||
        node.type === 'mdxJsxFlowElement') &&
      htmlTagNames.includes(node.name!) &&
      node.data?._mdxExplicitJsx
    ) {
      delete node.data._mdxExplicitJsx
    }
  })
}
