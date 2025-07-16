import type { RspressPlugin } from 'rspress/core'

import { remarkAttributes } from './remark-attributes/index.js'

export const attributesPlugin = (): RspressPlugin => {
  return {
    name: 'doom-attributes',
    markdown: {
      remarkPlugins: [remarkAttributes],
    },
  }
}
