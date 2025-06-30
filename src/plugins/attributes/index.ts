import type { Plugin } from '@rspress/core'

import { remarkAttributes } from './remark-attributes/index.js'

export const attributesPlugin = (): Plugin => {
  return {
    name: 'doom-attributes',
    markdown: {
      remarkPlugins: [remarkAttributes],
    },
  }
}
