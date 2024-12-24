import fs from 'node:fs'
import path from 'node:path'
import type { RspressPlugin } from '@rspress/core'

import { baseResolve, DoomConfig, pkgResolve } from '../../utils/index.js'

const componentsDir = baseResolve('runtime/components')

export const globalPlugin = (version?: string): RspressPlugin => {
  let config: DoomConfig
  return {
    name: 'doom-global',
    globalStyles: pkgResolve('styles/global.scss'),
    globalUIComponents: [baseResolve('global/VersionsNav/index.tsx')],
    markdown: {
      globalComponents: fs
        .readdirSync(componentsDir)
        .filter((file) => {
          const basename = path.basename(file, path.extname(file))
          return (
            !basename.startsWith('_') &&
            !basename.endsWith('.d') &&
            basename !== 'index'
          )
        })
        .map((file) => path.resolve(componentsDir, file)),
    },
    beforeBuild(config_) {
      config = config_
    },
    extendPageData(pageData) {
      pageData.sites = config.sites
      pageData.v = version === 'unversioned' ? undefined : version
    },
  }
}
