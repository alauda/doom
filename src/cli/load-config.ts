import { nodeTypes } from '@mdx-js/mdx'
import {
  addLeadingSlash,
  addTrailingSlash,
  removeLeadingSlash,
  type UserConfig,
} from '@rspress/core'
import { logger } from '@rspress/shared/logger'
import fs from 'node:fs'
import path from 'node:path'
import rehypeRaw from 'rehype-raw'
import { parse } from 'yaml'

import { autoSidebarPlugin, globalPlugin } from '../plugins/index.js'
import {
  CWD,
  DEFAULT_CONFIG_NAME,
  DEFAULT_EXTENSIONS,
  I18N_FILE,
  YAML_EXTENSIONS,
} from './constants.js'
import { pkgResolve } from '../utils/helpers.js'

const DEFAULT_LOGO = '/logo.svg'

const COMMON_CONFIG: UserConfig = {
  lang: 'en',
  route: {
    exclude: ['shared/**/*', 'components/**/*', 'doom.config.*'],
  },
  markdown: {
    checkDeadLinks: true,
    mdxRs: false,
    rehypePlugins: [[rehypeRaw, { passThrough: nodeTypes }]],
  },
  ssg: {
    strict: true,
  },
  themeConfig: {
    locales: [
      {
        lang: 'zh',
        label: '简体中文',
        searchPlaceholderText: '搜索文档',
        searchNoResultsText: '未搜索到相关结果',
        searchSuggestedQueryText: '可更换不同的关键字后重试',
        outlineTitle: '本页概览',
      },
      {
        lang: 'en',
        label: 'English',
      },
    ],
  },
  plugins: [autoSidebarPlugin(), globalPlugin()],
  builderConfig: {
    server: {
      open: true,
    },
    tools: {
      rspack: {
        resolve: {
          extensionAlias: {
            '.js': ['.ts', '.tsx', '.js'],
          },
        },
      },
    },
  },
}

const findConfig = (basePath: string): string | undefined => {
  return DEFAULT_EXTENSIONS.map((ext) => basePath + ext).find(fs.existsSync)
}

export async function loadConfig(
  root?: string,
  configFile?: string,
): Promise<{
  config: UserConfig
  filepath?: string
}> {
  let configFilePath: string | undefined

  if (configFile) {
    configFilePath = path.resolve(configFile)
  } else {
    if (root) {
      configFilePath = findConfig(path.resolve(root, DEFAULT_CONFIG_NAME))
    }
    if (!configFilePath) {
      configFilePath = findConfig(path.resolve(DEFAULT_CONFIG_NAME))
    }
    // when root is not specified, try to find config in docs folder
    if (!root && !configFilePath) {
      configFilePath = findConfig(path.resolve('docs', DEFAULT_CONFIG_NAME))
    }
  }

  let config: UserConfig | null | undefined

  const { loadConfig, mergeRsbuildConfig } = await import('@rsbuild/core')

  if (!configFilePath) {
    logger.info(`No doom config file found in ${process.cwd()}`)
  } else {
    try {
      if (
        (YAML_EXTENSIONS as readonly string[]).includes(
          path.extname(configFilePath),
        )
      ) {
        config = parse(fs.readFileSync(configFilePath, 'utf-8')) as UserConfig
      } else {
        const { content } = await loadConfig({
          cwd: path.dirname(configFilePath),
          path: configFilePath,
        })
        config = content as UserConfig
      }
    } catch {
      logger.error(`Failed to load config from ${configFilePath}`)
    }
  }

  const mergedConfig = mergeRsbuildConfig(COMMON_CONFIG, config ?? {})

  const base = addLeadingSlash(mergedConfig.base || '/')

  mergedConfig.base = base

  mergedConfig.root = resolveDocRoot(CWD, root, mergedConfig.root)

  let ensureDefaultLogo = false

  if (!mergedConfig.logo) {
    mergedConfig.logo = DEFAULT_LOGO
    ensureDefaultLogo = true
  }

  if (!mergedConfig.icon) {
    mergedConfig.icon = DEFAULT_LOGO
    ensureDefaultLogo = true
  }

  if (ensureDefaultLogo) {
    const publicPath = path.resolve(mergedConfig.root, `public`)
    fs.mkdirSync(publicPath, { recursive: true })
    const logoPath = path.resolve(publicPath, removeLeadingSlash(DEFAULT_LOGO))

    if (!fs.existsSync(logoPath)) {
      fs.copyFileSync(pkgResolve(`assets${DEFAULT_LOGO}`), logoPath)
    }
  }

  if (mergedConfig.i18nSourcePath) {
    if (!path.isAbsolute(mergedConfig.i18nSourcePath)) {
      mergedConfig.i18nSourcePath = path.resolve(
        configFilePath ?? mergedConfig.root,
        mergedConfig.i18nSourcePath,
      )
    }
  } else {
    mergedConfig.i18nSourcePath = path.resolve(mergedConfig.root, I18N_FILE)
  }

  if (!mergedConfig.outDir) {
    mergedConfig.outDir = `dist${base}`
  }

  if (mergedConfig.builderConfig?.server?.open === true) {
    mergedConfig.builderConfig.server.open = addTrailingSlash(base)
  }

  return {
    config: mergedConfig,
    filepath: configFilePath,
  }
}

export function resolveDocRoot(
  cwd: string,
  cliRoot?: string,
  configRoot?: string,
): string {
  // CLI root has highest priority
  if (cliRoot) {
    return path.join(cwd, cliRoot)
  }

  // Config root is next in priority
  if (configRoot) {
    return path.isAbsolute(configRoot) ? configRoot : path.join(cwd, configRoot)
  }

  // Default to 'docs' if no root is specified
  return path.join(cwd, 'docs')
}
