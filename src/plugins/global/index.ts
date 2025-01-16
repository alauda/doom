import fs from 'node:fs'
import path from 'node:path'

import type { RspressPlugin } from '@rspress/core'

import type { DoomSite } from '../../shared/types.js'
import { baseResolve, pkgResolve } from '../../utils/index.js'

const globalComponentsDir = baseResolve('global')
const componentsDir = baseResolve('runtime/components')

export interface GlobalPluginOptions {
  sites?: DoomSite[]
  version?: string
}

export const globalPlugin = ({
  sites,
  version,
}: GlobalPluginOptions = {}): RspressPlugin => {
  return {
    name: 'doom-global',
    globalStyles: pkgResolve('styles/global.scss'),
    globalUIComponents: fs
      .readdirSync(globalComponentsDir, 'utf8')
      .map((component) =>
        path.resolve(globalComponentsDir, component, 'index'),
      ),
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
    extendPageData(pageData) {
      pageData.sites = sites
      pageData.v = version === 'unversioned' ? undefined : version
    },
  }
}
