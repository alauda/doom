import type { Extension as FromMarkdownExtension } from 'mdast-util-from-markdown'

import type { Attrs } from './attributes-transformer.js'

/**
 * Fully-configured extension to add Heading ID nodes to Markdown.
 **/
export function mdastAttributes(): FromMarkdownExtension {
  return {
    enter: {
      attrs(token) {
        this.enter({ type: 'attrs', value: null }, token)
        this.buffer()
      },
    },
    exit: {
      attrs(token) {
        const attrs = this.resume()
        const node = this.stack[this.stack.length - 1] as Attrs
        this.exit(token)
        node.value = attrs
      },
    },
  }
}
