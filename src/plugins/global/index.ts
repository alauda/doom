import fs from 'node:fs'
import path from 'node:path'

import { addTrailingSlash, type RspressPlugin } from '@rspress/core'

import { ACP_BASE, type DoomSite } from '../../shared/index.js'
import { baseResolve, pkgResolve } from '../../utils/index.js'

const globalComponentsDir = baseResolve('global')
const componentsDir = baseResolve('runtime/components')

export interface GlobalPluginOptions {
  version?: string
  download?: boolean
}

export interface GlobalVirtual extends GlobalPluginOptions {
  userBase?: string
  prefix?: string
  sites?: DoomSite[]
}

// @internal
declare module 'doom-@global-virtual' {
  const virtual: GlobalVirtual
}

export const globalPlugin = ({
  version,
  download,
}: GlobalPluginOptions): RspressPlugin => {
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
    addRuntimeModules(config, isProd) {
      return {
        'doom-@global-virtual': `export default ${JSON.stringify(
          {
            userBase: config.userBase,
            prefix: config.prefix,
            version,
            download,
            sites: config.sites?.map((site) => ({
              ...site,
              base: addTrailingSlash(
                site.base || (site.name === 'acp' ? ACP_BASE : ''),
              ),
              version: site.version,
            })),
          },
          null,
          isProd ? 0 : 2,
        )}`,
      }
    },
  }
}
