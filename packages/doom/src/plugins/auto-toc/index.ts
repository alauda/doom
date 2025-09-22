import type { RspressPlugin } from '@rspress/core'

import { remarkAutoToc } from './remark-auto-toc.ts'

export const autoTocPlugin = (): RspressPlugin => {
  return {
    name: 'doom-auto-toc',
    markdown: {
      remarkPlugins: [remarkAutoToc],
    },
  }
}
