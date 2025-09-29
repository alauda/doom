import type { RspressPlugin } from '@rspress/core'
import remarkDirective from 'remark-directive'

import { remarkDirectives } from './remark-directives.ts'

export const directivesPlugin = (): RspressPlugin => {
  return {
    name: 'doom-directives',
    markdown: {
      remarkPlugins: [remarkDirective, remarkDirectives],
    },
  }
}
