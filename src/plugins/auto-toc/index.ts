import type { RspressPlugin } from '@rspress/core'

import { remarkAutoToc } from './remark-auto-toc.js'

export const autoTocPlugin = (): RspressPlugin => {
  return {
    name: 'doom-auto-toc',
    markdown: {
      remarkPlugins: [remarkAutoToc],
    },
  }
}
