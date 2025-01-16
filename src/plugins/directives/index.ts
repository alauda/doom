import type { Plugin } from '@rspress/core'
import remarkDirective from 'remark-directive'

import { remarkDirectives } from './remark-directives.js'

export const directivesPlugin = (): Plugin => {
  return {
    name: 'doom-directives',
    markdown: {
      remarkPlugins: [remarkDirective, remarkDirectives],
    },
  }
}
