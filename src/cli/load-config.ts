import fs from 'node:fs/promises'
import path from 'node:path'

import { nodeTypes } from '@mdx-js/mdx'
import { pluginYaml } from '@rsbuild/plugin-yaml'
import {
  addLeadingSlash,
  addTrailingSlash,
  normalizeSlash,
  removeLeadingSlash,
  type LocaleConfig,
  type UserConfig,
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
import { difference } from 'es-toolkit'
import rehypeRaw from 'rehype-raw'
import { cyan } from 'yoctocolors'

import { autoTocPlugin } from '../plugins/auto-toc/index.js'
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
import {
  isExplicitlyUnversioned,
  UNVERSIONED,
  type DoomSite,
} from '../shared/index.js'
import type { GlobalCliOptions } from '../types.js'
import { pathExists, pkgResolve, resolveStaticConfig } from '../utils/index.js'

import {
  CWD,
  DEFAULT_CONFIG_NAME,
  DEFAULT_EXTENSIONS,
  I18N_FILE,
  SITES_FILE,
  YAML_EXTENSIONS,
} from './constants.js'
import { defaultGitHubUrl } from './helpers.js'

const DEFAULT_LOGO = '/logo.svg'

const KNOWN_LOCALE_CONFIGS: Partial<
  Record<
    string,
    Omit<LocaleConfig, 'lang' | 'editLink'> & { editLink: { text: string } }
  >
> = {
  en: {
    label: 'English',
    editLink: {
      text: '📝 Edit this page on GitHub',
    },
  },
  zh: {
    label: '简体中文',
    searchPlaceholderText: '搜索文档',
    searchNoResultsText: '未搜索到相关结果',
    searchSuggestedQueryText: '可更换不同的关键字后重试',
    outlineTitle: '本页概览',
    prevPageText: '上一页',
    nextPageText: '下一页',
    editLink: {
      text: '📝 在 GitHub 上编辑此页',
    },
  },
  ru: {
    label: 'Русский',
    searchPlaceholderText: 'Поиск документов',
    searchNoResultsText: 'Не найдено соответствующих результатов',
    searchSuggestedQueryText:
      'Попробуйте изменить ключевые слова и повторить поиск',
    outlineTitle: 'Обзор страницы',
    prevPageText: 'Предыдущая страница',
    nextPageText: 'Следующая страница',
    editLink: {
      text: '📝 Редактировать эту страницу на GitHub',
    },
  },
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
}): Promise<UserConfig> => {
  const fallbackToZh = 'lang' in config && !config.lang
  root = resolveDocRoot(CWD, root, config.root)
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
    editRepoBaseUrl = editRepo
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
      if (!dirent.isDirectory() || ['public', 'shared'].includes(name)) {
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
        editLink:
          editRepoEnabled && editRepoBaseUrl
            ? {
                docRepoBaseUrl: editRepoBaseUrl,
                ...KNOWN_LOCALE_CONFIGS.en!.editLink,
                ...KNOWN_LOCALE_CONFIGS[name]?.editLink,
              }
            : undefined,
      })
    }
  }

  const unusedLanguages = difference(
    allLanguages,
    locales.map(({ lang }) => lang),
  )

  const { editLink, ...zhLocale } = KNOWN_LOCALE_CONFIGS.zh!

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
      // https://github.com/web-infra-dev/rspress/issues/2011
      outline: true,
      localeRedirect: redirect,
      ...(fallbackToZh
        ? editRepoEnabled && editRepoBaseUrl
          ? {
              ...zhLocale,
              editLink: { ...editLink, docRepoBaseUrl: editRepoBaseUrl },
            }
          : zhLocale
        : { locales }),
    },
    plugins: [
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
      shikiPlugin({
        theme: config.shiki?.theme,
        langs: [
          'dockerfile',
          'dotenv',
          'html',
          'go',
          'jsonc',
          'mermaid',
          'java',
          'python',
          'toml',
          ...(config.shiki?.langs ?? []),
        ],
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

          ...(config.shiki?.transformers ?? []),
        ],
      }),
    ],
    builderConfig: {
      dev: {
        lazyCompilation: lazy,
      },
      plugins: [pluginYaml()],
      server: {
        open,
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

const findConfig = async (basePath: string) => {
  for (const configFile of DEFAULT_EXTENSIONS.map((ext) => basePath + ext)) {
    if (await pathExists(configFile, 'file')) {
      return configFile
    }
  }
}

export async function loadConfig(
  root?: string,
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
  }: GlobalCliOptions = {},
): Promise<{
  config: UserConfig
  filepath?: string
}> {
  let configFilePath: string | undefined

  if (configFile) {
    configFilePath = path.resolve(configFile)
  } else {
    if (root) {
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
    root,
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
  })

  base = commonConfig.base!

  const mergedConfig = mergeRsbuildConfig(commonConfig, config, {
    base,
    lang: commonConfig.lang,
    root: commonConfig.root,
  })

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
    const publicPath = path.resolve(mergedConfig.root!, `public`)
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
