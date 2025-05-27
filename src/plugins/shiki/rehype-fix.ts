import type { Root } from 'hast'
import type { Plugin } from 'unified'
import { visit } from 'unist-util-visit'

/**
 * Restores metadata (e.g., titles) for code blocks that `rehype-raw` removes unexpectedly.
 * This function addresses a compatibility issue where `rehype-raw` strips metadata from code blocks.
 * @see https://github.com/syntax-tree/hast-util-raw/issues/29
 * @see https://github.com/web-infra-dev/rspress/blob/ab7567460e63712300b64d7ab46065a2f1c1e069/packages/core/src/node/mdx/rehypePlugins/codeMeta.ts#L5-L22
 */
export const rehypeFix: Plugin<[], Root> = function () {
  return (ast) => {
    visit(ast, 'element', (node) => {
      // <pre><code>...</code></pre>
      // 1. Find pre element
      const childNode = node.children.at(0)
      if (
        node.tagName === 'pre' &&
        childNode?.type === 'element' &&
        childNode.tagName === 'code'
      ) {
        if (
          !childNode.data?.meta &&
          typeof childNode.properties.meta === 'string'
        ) {
          ;(childNode.data ??= {}).meta ??= childNode.properties.meta
        }
      }
    })
  }
}
