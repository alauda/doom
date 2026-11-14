import fs from 'node:fs'
import path from 'node:path'

import type { Rspack } from '@rsbuild/core'
import { type RspressPlugin, type UserConfig } from '@rspress/core'
import { addTrailingSlash } from '@rspress/shared'
import type { NormalizedSidebar } from '@rspress/shared'

import { ACP_BASE, type DoomSite } from '../../shared/index.ts'
import type { ExportItem } from '../../types.ts'
import { baseResolve, pkgResolve } from '../../utils/index.ts'

import { getGlobalComponentFiles } from './components.ts'
import { createSidebarAsset, type SidebarAsset } from './sidebar.ts'

const globalComponentsDir = baseResolve('global')

const stableEntryFilename: Rspack.Filename = (pathData) =>
  pathData.chunk?.name === 'index' ? '[name].js' : '[name].[contenthash:10].js'

export interface GlobalPluginOptions {
  version?: string
  download?: boolean
}

export interface GlobalVirtual extends GlobalPluginOptions {
  userBase: string
  prefix?: string
  sites?: DoomSite[]
  export?: ExportItem[]
  sidebarManifestUrl?: string
}

// @internal
declare module 'doom-@global-virtual' {
  const virtual: GlobalVirtual
}

export const globalPlugin = ({
  version,
  download,
}: GlobalPluginOptions): RspressPlugin => {
  let sidebarAsset: SidebarAsset | undefined

  const updateSidebarAsset = (config: UserConfig) => {
    const themeConfig = config.themeConfig
    const payload = {
      sidebar: themeConfig?.sidebar as NormalizedSidebar | undefined,
      locales: themeConfig?.locales?.map(({ lang, sidebar }) => ({
        lang,
        sidebar: sidebar as NormalizedSidebar | undefined,
      })),
    }
    sidebarAsset = createSidebarAsset(payload)
  }

  return {
    name: 'doom-global',
    globalStyles: pkgResolve('styles/global.scss'),
    globalUIComponents: fs
      .readdirSync(globalComponentsDir, 'utf8')
      .map((component) => path.resolve(globalComponentsDir, component)),
    markdown: {
      globalComponents: getGlobalComponentFiles(),
    },
    builderConfig: {
      output: {
        filename: {
          js: stableEntryFilename,
        },
      },
    },
    config(config) {
      updateSidebarAsset(config)
      return config
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
            sidebarManifestUrl: sidebarAsset
              ? `${addTrailingSlash(config.base || '/')}static/${sidebarAsset.manifestFileName}`
              : undefined,
          },
          null,
          isProd ? 0 : 2,
        )}`,
      }
    },
    afterBuild(config) {
      if (!sidebarAsset) {
        updateSidebarAsset(config)
      }
      if (!sidebarAsset) {
        return
      }
      const staticDir = path.resolve(config.outDir || 'dist', 'static')
      fs.mkdirSync(staticDir, { recursive: true })
      fs.writeFileSync(
        path.join(staticDir, sidebarAsset.fileName),
        sidebarAsset.content,
      )
      fs.writeFileSync(
        path.join(staticDir, sidebarAsset.manifestFileName),
        sidebarAsset.manifestContent,
      )
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
