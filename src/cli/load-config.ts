import fs from 'node:fs'
import path from 'node:path'

import { nodeTypes } from '@mdx-js/mdx'
import {
  type LocaleConfig,
  addLeadingSlash,
  addTrailingSlash,
  normalizeSlash,
  removeLeadingSlash,
  removeTrailingSlash,
} from '@rspress/core'
import { logger } from '@rspress/shared/logger'
import {
  transformerMetaHighlight,
  transformerMetaWordHighlight,
  transformerNotationDiff,
  transformerNotationErrorLevel,
  transformerNotationFocus,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
  transformerRemoveNotationEscape,
} from '@shikijs/transformers'
import rehypeRaw from 'rehype-raw'

import {
  apiPlugin,
  autoSidebarPlugin,
  createTransformerCallouts,
  directivesPlugin,
  globalPlugin,
  mermaidPlugin,
  permissionPlugin,
  replacePlugin,
  shikiPlugin,
} from '../plugins/index.js'
import { type DoomSite, normalizeVersion } from '../shared/index.js'
import {
  type DoomConfig,
  type GlobalCliOptions,
  pkgResolve,
  resolveStaticConfig,
} from '../utils/index.js'
import {
  CWD,
  DEFAULT_CONFIG_NAME,
  DEFAULT_EXTENSIONS,
  I18N_FILE,
  SITES_FILE,
  YAML_EXTENSIONS,
} from './constants.js'

const DEFAULT_LOGO = '/logo.svg'

const zhLocaleConfig: Omit<LocaleConfig, 'lang' | 'label'> = {
  searchPlaceholderText: '搜索文档',
  searchNoResultsText: '未搜索到相关结果',
  searchSuggestedQueryText: '可更换不同的关键字后重试',
  outlineTitle: '本页概览',
  prevPageText: '上一页',
  nextPageText: '下一页',
}

const getCommonConfig = (
  config: DoomConfig,
  cliRoot?: string,
  configFilePath?: string,
  version?: string,
  ignore?: boolean,
  force?: boolean,
): DoomConfig => {
  const fallbackToZh = 'lang' in config && !config.lang
  const root = resolveDocRoot(CWD, cliRoot, config.root)
  const localBasePath = configFilePath ? path.dirname(configFilePath) : root
  const excludeRoutes = (ignore && config.internalRoutes) || []

  return {
    root,
    lang: fallbackToZh ? 'zh' : config.lang || 'en',
    title: '',
    route: {
      exclude: [
        'dist/**/*',
        'public/**/*',
        'shared/**/*',
        'doom.config.*',
        '**/assets/**/*',
        '**/*.d.ts',
        ...excludeRoutes,
      ],
    },
    markdown: {
      checkDeadLinks: true,
      highlightLanguages: [['jsonc', 'json']],
      mdxRs: false,
      rehypePlugins: [[rehypeRaw, { passThrough: nodeTypes }]],
    },
    ssg: {
      strict: true,
    },
    themeConfig: {
      enableScrollToTop: true,
      ...(fallbackToZh
        ? zhLocaleConfig
        : {
            locales: [
              { lang: 'zh', label: '简体中文', ...zhLocaleConfig },
              { lang: 'en', label: 'English' },
            ],
          }),
    },
    plugins: [
      apiPlugin({
        ...config.api,
        localBasePath,
      }),
      autoSidebarPlugin({
        ...config.sidebar,
        excludeRoutes,
      }),
      directivesPlugin(),
      globalPlugin({
        sites: config.sites,
        version,
      }),
      mermaidPlugin(),
      permissionPlugin({
        ...config.permission,
        localBasePath,
      }),
      replacePlugin({
        root,
        lang: fallbackToZh ? null : (config.lang ?? 'en'),
        localBasePath,
        items: config.reference,
        force,
        releaseNotes: config.releaseNotes,
      }),
      shikiPlugin({
        langs: ['dockerfile', 'dotenv', 'html', 'go', 'jsonc', 'mermaid'],
        transformers: [
          // builtin transformers
          transformerMetaHighlight(),
          transformerMetaWordHighlight(),
          transformerNotationDiff(),
          transformerNotationErrorLevel(),
          transformerNotationFocus(),
          transformerNotationHighlight(),
          transformerNotationWordHighlight(),
          transformerRemoveNotationEscape(),

          // custom transformers
          createTransformerCallouts(),
        ],
      }),
    ],
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
}

const findConfig = (basePath: string): string | undefined => {
  return DEFAULT_EXTENSIONS.map((ext) => basePath + ext).find(fs.existsSync)
}

export async function loadConfig(
  root?: string,
  {
    config: configFile,
    base,
    prefix,
    v: version,
    ignore,
    force,
  }: GlobalCliOptions = {},
): Promise<{
  config: DoomConfig
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

  let config: DoomConfig | undefined | null

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
        config = await resolveStaticConfig<DoomConfig>(configFilePath)
      } else {
        const { content } = await loadConfig({
          cwd: path.dirname(configFilePath),
          path: configFilePath,
        })
        config = content as DoomConfig
      }
    } catch {
      logger.error(`Failed to load config from ${configFilePath}`)
    }
  }

  config ??= {}

  if (config.sites) {
    logger.error('Use separate `sites.yaml` config in repository root instead')
  } else {
    const sitesConfigFilePath = path.resolve(SITES_FILE)
    if (fs.existsSync(sitesConfigFilePath)) {
      config.sites = await resolveStaticConfig<DoomSite[]>(sitesConfigFilePath)
    }
  }

  const normalizedVersion = normalizeVersion(version)

  const commonConfig = getCommonConfig(
    config,
    root,
    configFilePath,
    normalizedVersion,
    ignore,
    force,
  )

  const mergedConfig = mergeRsbuildConfig(commonConfig, config, {
    lang: commonConfig.lang,
    root: commonConfig.root,
  })

  base = addLeadingSlash(base || mergedConfig.base || '/')

  if (normalizedVersion && normalizedVersion !== 'unversioned') {
    base = removeTrailingSlash(base) + `/${normalizedVersion}`
  }

  mergedConfig.base = base = addTrailingSlash(base)

  if (prefix) {
    mergedConfig.base = normalizeSlash(prefix) + base
  }

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
    const publicPath = path.resolve(mergedConfig.root!, `public`)
    fs.mkdirSync(publicPath, { recursive: true })
    const logoPath = path.resolve(publicPath, removeLeadingSlash(DEFAULT_LOGO))

    if (!fs.existsSync(logoPath)) {
      fs.copyFileSync(pkgResolve(`assets${DEFAULT_LOGO}`), logoPath)
    }
  }

  if (mergedConfig.i18nSourcePath) {
    if (!path.isAbsolute(mergedConfig.i18nSourcePath)) {
      mergedConfig.i18nSourcePath = path.resolve(
        configFilePath ? path.dirname(configFilePath) : mergedConfig.root!,
        mergedConfig.i18nSourcePath,
      )
    }
  } else {
    mergedConfig.i18nSourcePath = path.resolve(mergedConfig.root!, I18N_FILE)
  }

  if (mergedConfig.outDir) {
    mergedConfig.outDir =
      addTrailingSlash(mergedConfig.outDir) + normalizedVersion
  } else {
    mergedConfig.outDir = `dist${normalizedVersion === 'unversioned' ? `/unversioned${base}` : base}`
  }

  if (mergedConfig.builderConfig?.server?.open === true) {
    mergedConfig.builderConfig.server.open = mergedConfig.base
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
