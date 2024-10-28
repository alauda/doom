import fs from 'node:fs'
import path from 'node:path'
import type { RspressPlugin } from '@rspress/core'

const componentsDir = path.resolve(
  import.meta.dirname,
  '../../runtime/components',
)

export const globalPlugin = (): RspressPlugin => {
  return {
    name: 'doom-global',
    globalStyles: path.resolve(
      import.meta.dirname,
      '../../../styles/global.scss',
    ),
    markdown: {
      globalComponents: fs
        .readdirSync(componentsDir)
        .filter((file) => path.basename(file, path.extname(file)) !== 'index')
        .map((file) => path.resolve(componentsDir, file)),
    },
  }
}
