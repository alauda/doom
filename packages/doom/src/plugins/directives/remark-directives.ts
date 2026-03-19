import { h } from 'hastscript'
import type { Root } from 'mdast'
import { toMarkdown } from 'mdast-util-to-markdown'
import type { Plugin } from 'unified'
import { visit } from 'unist-util-visit'

const CONTAINER_DIRECTIVE_TYPES = new Set([
  'tip',
  'note',
  'warning',
  'caution',
  'danger',
  'info',
  'details',
  '$$$callout$$$',
])

export const remarkDirectives: Plugin<[], Root> = function () {
  return (root) => {
    visit(root, (node, index, parent) => {
      if (
        node.type !== 'containerDirective' &&
        node.type !== 'leafDirective' &&
        node.type !== 'textDirective'
      ) {
        return
      }

      if (
        node.type === 'containerDirective' &&
        CONTAINER_DIRECTIVE_TYPES.has(node.name)
      ) {
        return
      }

      const data = (node.data ||= {})

      const setProperties = (className: string) => {
        // https://github.com/syntax-tree/hastscript/pull/24
        const n = h(data.hName || 'div', node.attributes!)
        data.hProperties = {
          ...n.properties,
          className: [
            ...((n.properties.className || []) as string[]),
            className,
          ],
        }
      }

      switch (node.name) {
        case 'callouts': {
          setProperties('doom-callouts')
          break
        }
        case 'callout': {
          data.hName = 'span'
          setProperties('doom-callout')
          break
        }
        default: {
          parent!.children[index!] = {
            type: 'text',
            // https://github.com/remarkjs/remark/blob/ed7b185d304adaf5aa80fc78a912603a5cd6e85a/packages/remark-stringify/lib/index.js#L31-L37
            value: toMarkdown(node, {
              ...this.data('settings'),
              extensions: this.data('toMarkdownExtensions'),
            }),
          }
        }
      }
    })
  }
}
