import fs from 'node:fs/promises'
import path from 'node:path'

import {
  PluginDriver,
  RouteService,
  remarkLink,
  type UserConfig,
} from '@rspress/core'
import { isProduction } from '@rspress/shared'
import type { Root } from 'mdast'
import { lintRule } from 'unified-lint-rule'

import { loadConfig } from '../cli/load-config.ts'
import type { GlobalCliOptions } from '../types.ts'
import { OPTIONS_FILE } from '../utils/index.ts'

let config: UserConfig | undefined
let configFilePath: string | undefined

export const checkDeadLinks = lintRule<Root>(
  'doom-lint:check-dead-links',
  async (tree, vfile) => {
    if (!config || !configFilePath) {
      let optionsText: string | undefined

      try {
        optionsText = await fs.readFile(OPTIONS_FILE, 'utf8')
      } catch {
        //
      }

      const { root, globalOptions } = (
        optionsText ? JSON.parse(optionsText) : {}
      ) as {
        root?: string
        globalOptions: GlobalCliOptions
      }

      ;({ config, configFilePath } = await loadConfig(root, globalOptions))
    }

    const relativePath = path.relative(config.root!, vfile.path)

    // Ignore files outside the root directory
    if (relativePath.startsWith('..')) {
      return
    }

    let routeService = RouteService.getInstance()

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!routeService) {
      const pluginDriver = await PluginDriver.create(
        config,
        configFilePath,
        isProduction(),
      )
      routeService = await RouteService.create({
        config,
        scanDir: config.root!,
        externalPages: await pluginDriver.addPages(),
      })
    }

    remarkLink({
      cleanUrls: false,
      routeService,
      remarkLinkOptions: config.markdown?.link,
      lint: true,
    })(tree, vfile)
  },
)
