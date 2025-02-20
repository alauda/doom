import fs from 'node:fs'
import path from 'node:path'

import { addTrailingSlash, type RspressPlugin } from '@rspress/core'

import type { DoomSite } from '../../shared/types.js'
import { baseResolve, pkgResolve } from '../../utils/index.js'
import { normalizeVersion } from '../../shared/helpers.js'

const globalComponentsDir = baseResolve('global')
const componentsDir = baseResolve('runtime/components')

export interface GlobalPluginOptions {
  sites?: DoomSite[]
  version?: string
}

// @internal
declare module 'doom-@global-virtual' {
  const virtual: GlobalPluginOptions
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
    addRuntimeModules(_, isProd) {
      return {
        'doom-@global-virtual': `export default ${JSON.stringify(
          {
            sites: sites?.map((site) => ({
              ...site,
              base: addTrailingSlash(
                site.base || (site.name === 'acp' ? '/container-platform' : ''),
              ),
              version: normalizeVersion(site.version),
            })),
            version: version === 'unversioned' ? undefined : version,
          },
          null,
          isProd ? 0 : 2,
        )}`,
      }
    },
  }
}
