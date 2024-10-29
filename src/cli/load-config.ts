import { nodeTypes } from '@mdx-js/mdx'
import type { UserConfig } from '@rspress/core'
import { logger } from '@rspress/shared/logger'
import fs from 'node:fs'
import path from 'node:path'
import rehypeRaw from 'rehype-raw'
import { parse } from 'yaml'

import { autoSidebarPlugin, globalPlugin } from '../plugins/index.js'
import {
  DEFAULT_CONFIG_NAME,
  DEFAULT_EXTENSIONS,
  YAML_EXTENSIONS,
} from './constants.js'

const COMMON_CONFIG: UserConfig = {
  base: 'docs',
  lang: 'en',
  logo: '/logo.svg',
  icon: '/logo.svg',
  outDir: 'dist',
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
    dev: {
      lazyCompilation: true,
    },
    server: {
      open: true,
    },
  },
}

const findConfig = (basePath: string): string | undefined => {
  return DEFAULT_EXTENSIONS.map((ext) => basePath + ext).find(fs.existsSync)
}

export async function loadConfig(configFile?: string): Promise<{
  config: UserConfig
  filepath?: string
}> {
  let configFilePath: string

  if (configFile) {
    configFilePath = path.resolve(configFile)
  } else {
    configFilePath = findConfig(path.resolve(DEFAULT_CONFIG_NAME))!
  }

  if (!configFilePath) {
    logger.info(`No doom config file found in ${process.cwd()}`)
    return {
      config: {},
    }
  }

  const { loadConfig, mergeRsbuildConfig } = await import('@rsbuild/core')

  let config: UserConfig | null | undefined

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

  return {
    config: mergeRsbuildConfig(COMMON_CONFIG, config ?? {}),
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
