import fs from 'node:fs'
import path from 'node:path'

import type { RspressPlugin } from '@rspress/core'
import { addTrailingSlash } from '@rspress/shared'

import { ACP_BASE, type DoomSite } from '../../shared/index.ts'
import type { ExportItem } from '../../types.ts'
import { baseResolve, pkgResolve } from '../../utils/index.ts'

const globalComponentsDir = baseResolve('global')
const componentsDir = baseResolve('runtime/components')

export interface GlobalPluginOptions {
  version?: string
  download?: boolean
}

export interface GlobalVirtual extends GlobalPluginOptions {
  userBase: string
  prefix?: string
  sites?: DoomSite[]
  export?: ExportItem[]
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
      .map((component) => path.resolve(globalComponentsDir, component)),
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
            export: config.export,
          },
          null,
          isProd ? 0 : 2,
        )}`,
      }
    },
    addPages(config) {
      let loginPath: string | undefined
      let productsPath: string | undefined
      for (const ext of ['.js', '.tsx']) {
        loginPath = baseResolve(`login/index${ext}`)
        productsPath = baseResolve(`products/index${ext}`)
        if (fs.existsSync(loginPath) && fs.existsSync(productsPath)) {
          break
        }
      }
      if ((config.themeConfig?.locales?.length ?? 0) < 1) {
        return [
          {
            routePath: '/login',
            filepath: loginPath,
          },
          {
            routePath: '/products',
            filepath: productsPath,
          },
        ]
      }
      const lang = config.lang
      return config.themeConfig!.locales!.flatMap((l) => {
        const prefix = l.lang && l.lang !== lang ? `/${l.lang}` : ''
        return [
          {
            routePath: `${prefix}/login`,
            filepath: loginPath,
          },
          {
            routePath: `${prefix}/products`,
            filepath: productsPath,
          },
        ]
      })
    },
  }
}
