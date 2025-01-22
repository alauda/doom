import type { Plugin } from '@rspress/core'

import { remarkMermaid } from './remark-mermaid.js'

export const mermaidPlugin = (): Plugin => {
  return {
    name: 'doom-mermaid',
    markdown: {
      remarkPlugins: [remarkMermaid],
    },
  }
}
