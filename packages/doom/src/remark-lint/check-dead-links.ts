import fs from 'node:fs/promises'

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

let pluginDriver: PluginDriver | undefined

export const checkDeadLinks = lintRule<Root>(
  'doom-lint:check-dead-links',
  async (tree, vfile) => {
    if (!config || !configFilePath) {
      const { root, globalOptions } = JSON.parse(
        await fs.readFile(OPTIONS_FILE, 'utf8'),
      ) as {
        root?: string
        globalOptions: GlobalCliOptions
      }

      ;({ config, configFilePath } = await loadConfig(root, globalOptions))
    }

    if (!pluginDriver) {
      pluginDriver = await PluginDriver.create(
        config,
        configFilePath,
        isProduction(),
      )
    }

    let routeService = RouteService.getInstance()

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!routeService) {
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
