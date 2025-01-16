import type { Root } from 'mdast'
import type { Plugin } from 'unified'
import { visit } from 'unist-util-visit'

export const remarkDirectives: Plugin<[], Root> = function () {
  return (root) => {
    visit(root, (node) => {
      if (
        node.type !== 'containerDirective' &&
        node.type !== 'leafDirective' &&
        node.type !== 'textDirective'
      ) {
        return
      }

      const data = node.data || (node.data = {})

      switch (node.name) {
        case 'callouts': {
          data.hProperties = { className: 'doom-callouts' }
          break
        }
        default: {
          return
        }
      }
    })
  }
}
