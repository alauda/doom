import fs_ from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { pluginReact } from '@rsbuild/plugin-react'
import { pluginSass } from '@rsbuild/plugin-sass'
import { pluginSvgr } from '@rsbuild/plugin-svgr'
import { pluginYaml } from '@rsbuild/plugin-yaml'
import { logger, type UserConfig } from '@rspress/core'
import { pluginAlgolia } from '@rspress/plugin-algolia'
import { pluginSitemap } from '@rspress/plugin-sitemap'
import {
  addLeadingSlash,
  addTrailingSlash,
  removeLeadingSlash,
  type LocaleConfig,
} from '@rspress/shared'
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
import { difference } from 'es-toolkit'
import { glob } from 'tinyglobby'
import { cyan } from 'yoctocolors'

import {
  apiPlugin,
  autoSidebarPlugin,
  autoTocPlugin,
  createTransformerCallouts,
  directivesPlugin,
  globalPlugin,
  mermaidPlugin,
  permissionPlugin,
  replacePlugin,
} from '../plugins/index.ts'
import {
  isExplicitlyUnversioned,
  normalizeSlash,
  UNVERSIONED,
  type DoomSite,
} from '../shared/index.ts'
import type { AlgoliaOptions, ExportItem, GlobalCliOptions } from '../types.ts'
import { pathExists, pkgResolve, resolveStaticConfig } from '../utils/index.ts'

import {
  DEFAULT_CONFIG_NAME,
  DEFAULT_EXTENSIONS,
  I18N_FILE,
  SITES_FILE,
  YAML_EXTENSIONS,
} from './constants.ts'
import { defaultGitHubUrl, isDoc } from './helpers.ts'

const DEFAULT_LOGO = '/logo.svg'

const KNOWN_LOCALE_CONFIGS: Partial<
  Record<string, Omit<LocaleConfig, 'lang'>>
> = {
  en: {
    label: 'English',
  },
  zh: {
    label: '简体中文',
  },
  ru: {
    label: 'Русский',
  },
}

const ALAUDA_ALGOLIA_OPTIONS: AlgoliaOptions = {
  appId: 'XN35Q5JLSV',
  apiKey: '487fb969bdcda09dd4950468d7d8b61e',
  indexName: 'docs_alauda_io_xn35q5jlsv_pages',
}

const ALAUDA_RU_ALGOLIA_OPTIONS: AlgoliaOptions = {
  appId: 'GBNIJIGQ50',
  apiKey: '786fa6da36fe76777d688387c0520c5b',
  indexName: 'docs_alauda_io_gbnijigq50_pages',
}

const getCommonConfig = async ({
  config,
  root,
  configFilePath,
  base,
  version,
  download,
  export: export_,
  ignore,
  force,
  open,
  lazy,
  include,
  exclude,
  redirect,
  editRepo,
  algolia,
  siteUrl,
  lang,
}: {
  config: UserConfig
  configFilePath?: string
  root?: string
  base?: string
  version?: string
  download?: boolean
  export?: boolean
  ignore?: boolean
  force?: boolean
  open?: boolean
  lazy?: boolean
  include?: string[]
  exclude?: string[]
  redirect?: 'auto' | 'never' | 'only-default-lang'
  editRepo?: boolean | string
  algolia?: boolean | 'alauda' | 'alauda-ru'
  siteUrl?: boolean
  lang?: string
}): Promise<UserConfig> => {
  if (lang != null) {
    config.lang = lang
  }

  const fallbackToZh = 'lang' in config && !config.lang
  root = resolveDocRoot(root, config.root)
  const localBasePath = configFilePath ? path.dirname(configFilePath) : root

  const userBase = (base = addLeadingSlash(
    addTrailingSlash(base || config.base || '/'),
  ))

  if (version && !isExplicitlyUnversioned(version)) {
    base = userBase + `${version}/`
  }

  let { editRepoBaseUrl } = config

  const editRepoEnabled = !!editRepo

  if (typeof editRepo === 'string') {
    if (editRepo.includes('/')) {
      editRepoBaseUrl = editRepo
    } else if (editRepoBaseUrl) {
      editRepoBaseUrl = addTrailingSlash(editRepoBaseUrl)
      if (!editRepoBaseUrl.endsWith(`/${editRepo}/`)) {
        editRepoBaseUrl += editRepo
      }
    }
  }

  if (editRepoEnabled) {
    if (editRepoBaseUrl) {
      editRepoBaseUrl = defaultGitHubUrl(editRepoBaseUrl)
    } else {
      logger.error(
        `The \`${cyan('-R, --edit-repo')}\` flag is enabled specifically, but no \`${cyan('editRepoBaseUrl')}\` found, it will take no effect`,
      )
    }
  }

  const allLanguages: string[] = []

  const locales: LocaleConfig[] = []

  if (!fallbackToZh) {
    const dirents = await fs.readdir(root, { withFileTypes: true })
    for (const dirent of dirents) {
      const { name } = dirent
      if (
        !dirent.isDirectory() ||
        ['dist', 'node_modules', 'public', 'shared'].includes(name)
      ) {
        continue
      }
      allLanguages.push(name)
      if (include?.length) {
        if (!include.includes(name)) {
          continue
        }
      } else if (exclude?.length) {
        if (exclude.includes(name)) {
          continue
        }
      }
      locales.push({
        lang: name,
        label: name,
        ...KNOWN_LOCALE_CONFIGS[name],
      })
    }
  }

  const unusedLanguages = difference(
    allLanguages,
    locales.map(({ lang }) => lang),
  )

  const zhLocale = KNOWN_LOCALE_CONFIGS.zh!

  const algoliaOptions =
    ((algolia && config.algolia) ??
      (algolia === 'alauda'
        ? ALAUDA_ALGOLIA_OPTIONS
        : algolia === 'alauda-ru' && ALAUDA_RU_ALGOLIA_OPTIONS)) ||
    null

  const publicPath = path.resolve(root, 'public')

  return {
    userBase,
    root,
    base: addTrailingSlash(base),
    lang: fallbackToZh ? 'zh' : config.lang || 'en',
    title: '',
    route: {
      include: ignore ? config.onlyIncludeRoutes : undefined,
      exclude: [
        'dist/**/*',
        'public/**/*',
        'shared/**/*',
        'doom.config.*',
        '**/assets/**/*',
        '**/*.d.ts',
        ...((ignore && config.internalRoutes) || []),
        ...unusedLanguages.map((lang) => `${lang}/**/*`),
      ],
    },
    markdown: {
      defaultWrapCode: export_,
      link: {
        checkDeadLinks: {
          excludes(url) {
            if (!url.startsWith('/')) {
              return false
            }
            const { pathname } = new URL(url, 'https://example.com')
            return fs_.existsSync(path.resolve(publicPath, pathname.slice(1)))
          },
        },
      },
      shiki: {
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
      },
    },
    themeConfig: {
      enableScrollToTop: true,
      localeRedirect: redirect,
      ...(editRepoEnabled &&
        editRepoBaseUrl && {
          editLink: { docRepoBaseUrl: editRepoBaseUrl },
        }),
      ...(fallbackToZh ? zhLocale : { locales }),
    },
    plugins: [
      algoliaOptions && pluginAlgolia(),
      siteUrl &&
        config.siteUrl &&
        pluginSitemap({
          siteUrl: config.siteUrl,
        }),

      apiPlugin({
        localBasePath,
      }),
      autoSidebarPlugin({ export: export_, ignore }),
      autoTocPlugin(),
      directivesPlugin(),
      globalPlugin({ version, download }),
      mermaidPlugin(),
      permissionPlugin({
        localBasePath,
      }),
      replacePlugin({
        lang: fallbackToZh ? null : (config.lang ?? 'en'),
        localBasePath,
        force,
      }),
    ].filter(Boolean),
    search: algoliaOptions ? false : undefined,
    builderConfig: {
      dev: {
        lazyCompilation: lazy,
      },
      performance: {
        buildCache: false,
      },
      plugins: [pluginReact(), pluginSass(), pluginSvgr(), pluginYaml()],
      resolve: {
        alias: {
          classnames$: 'clsx',
        },
      },
      server: {
        open,
        proxy: {
          '/smart/api': 'https://docs-dev.alauda.cn',
        },
      },
      tools: {
        rspack(rspackConfig, { mergeConfig, rspack }) {
          return mergeConfig(rspackConfig, {
            ignoreWarnings: [
              {
                module: /\bflexsearch\b/,
              },
            ],
            resolve: {
              extensionAlias: {
                '.js': ['.ts', '.tsx', '.js'],
              },
            },
            plugins: [
              new rspack.DefinePlugin({
                'process.env.ALGOLIA_APP_ID': JSON.stringify(
                  algoliaOptions?.appId,
                ),
                'process.env.ALGOLIA_API_KEY': JSON.stringify(
                  algoliaOptions?.apiKey,
                ),
                'process.env.ALGOLIA_INDEX_NAME': JSON.stringify(
                  algoliaOptions?.indexName,
                ),
              }),
            ],
          })
        },
      },
    },
    ssg: {
      experimentalWorker: true,
    },
    llms: true,
  }
}

const findConfig = async (basePath: string) => {
  for (const configFile of DEFAULT_EXTENSIONS.map((ext) => basePath + ext)) {
    if (await pathExists(configFile, 'file')) {
      return configFile
    }
  }
}

export async function loadConfig(
  root?: string | URL,
  {
    config: configFile,
    base,
    prefix,
    v: version,
    download,
    export: export_,
    ignore,
    force,
    open,
    lazy,
    include,
    exclude,
    outDir,
    redirect,
    editRepo,
    algolia,
    siteUrl,
    lang,
  }: GlobalCliOptions = {},
): Promise<{
  config: UserConfig
  configFilePath: string
}> {
  let configFilePath: string | undefined

  if (configFile) {
    configFilePath = path.resolve(configFile)
  } else {
    if (root) {
      root = root.toString()
      if (root.startsWith('file:')) {
        root = fileURLToPath(root)
      }
      configFilePath = await findConfig(path.resolve(root, DEFAULT_CONFIG_NAME))
    }
    if (!configFilePath) {
      configFilePath = await findConfig(path.resolve(DEFAULT_CONFIG_NAME))
    }
    // when root is not specified, try to find config in docs folder
    if (!root && !configFilePath) {
      configFilePath = await findConfig(
        path.resolve('docs', DEFAULT_CONFIG_NAME),
      )
    }
  }

  let config: UserConfig | undefined | null

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
        config = await resolveStaticConfig<UserConfig>(configFilePath)
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

  config ??= {}

  if (config.sites) {
    logger.error('Use separate `sites.yaml` config in repository root instead')
  } else {
    const sitesConfigFilePath = path.resolve(SITES_FILE)
    if (await pathExists(sitesConfigFilePath, 'file')) {
      config.sites = await resolveStaticConfig<DoomSite[]>(sitesConfigFilePath)
    }
  }

  version ||= ''

  const commonConfig = await getCommonConfig({
    config,
    configFilePath,
    root: root as string | undefined,
    base,
    version,
    download,
    export: export_,
    ignore,
    force,
    open,
    lazy,
    include,
    exclude,
    redirect,
    editRepo,
    algolia,
    siteUrl,
    lang,
  })

  base = commonConfig.base!

  const mergedConfig = mergeRsbuildConfig(commonConfig, config, {
    base,
    lang: commonConfig.lang,
    root: commonConfig.root,
  })

  mergedConfig.export =
    config.export &&
    (await Promise.all(
      config.export.map(
        async (item) =>
          ({
            ...item,
            scope: Array.isArray(item.scope) ? item.scope : [item.scope],
            flattenScope: (
              await glob(item.scope, { cwd: commonConfig.root })
            ).filter(isDoc),
          }) satisfies ExportItem,
      ),
    ))

  if (base && prefix) {
    mergedConfig.base = (mergedConfig.prefix = normalizeSlash(prefix)) + base
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
    const publicPath = path.resolve(mergedConfig.root!, 'public')
    await fs.mkdir(publicPath, { recursive: true })
    const logoPath = path.resolve(publicPath, removeLeadingSlash(DEFAULT_LOGO))

    if (!(await pathExists(logoPath))) {
      await fs.copyFile(pkgResolve(`assets${DEFAULT_LOGO}`), logoPath)
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

  outDir ||= mergedConfig.outDir

  mergedConfig.outDir = `dist${
    (outDir ? addLeadingSlash(addTrailingSlash(outDir)) : base) +
    (isExplicitlyUnversioned(version) ? UNVERSIONED : outDir ? version : '')
  }`

  return {
    config: mergedConfig,
    configFilePath: configFilePath || '',
  }
}

export function resolveDocRoot(cliRoot?: string, configRoot?: string): string {
  // CLI root has highest priority
  if (cliRoot) {
    return path.resolve(cliRoot)
  }

  // Config root is next in priority
  if (configRoot) {
    return path.isAbsolute(configRoot) ? configRoot : path.resolve(configRoot)
  }

  // Default to 'docs' if no root is specified
  return path.resolve('docs')
}
