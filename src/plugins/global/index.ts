import fs from 'node:fs'
import path from 'node:path'
import type { RspressPlugin } from '@rspress/core'

import { baseResolve, pkgResolve } from '../../utils/index.js'

const componentsDir = baseResolve('runtime/components')

export const globalPlugin = (): RspressPlugin => {
  return {
    name: 'doom-global',
    globalStyles: pkgResolve('styles/global.scss'),
    markdown: {
      globalComponents: fs
        .readdirSync(componentsDir)
        .filter((file) => {
          const basename = path.basename(file, path.extname(file))
          return !basename.endsWith('.d') && basename !== 'index'
        })
        .map((file) => path.resolve(componentsDir, file)),
    },
  }
}
