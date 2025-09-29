import type { RspressPlugin } from '@rspress/core'

import { remarkMermaid } from './remark-mermaid.ts'

export const mermaidPlugin = (): RspressPlugin => {
  return {
    name: 'doom-mermaid',
    markdown: {
      remarkPlugins: [remarkMermaid],
    },
  }
}
