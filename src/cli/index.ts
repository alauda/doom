#!/usr/bin/env node

/**
 * Adopted from @see https://github.com/web-infra-dev/rspress/blob/main/packages/cli/src/index.ts
 */

import path from 'node:path'

import { ServerConfig, logger } from '@rsbuild/core'
import { build, dev, serve } from '@rspress/core'
import { type FSWatcher, watch } from 'chokidar'
import type { EventName } from 'chokidar/handler.js'
import { program } from 'commander'
import { green } from 'yoctocolors'
import module from 'node:module'

import { CWD, DEFAULT_CONFIGS, I18N_FILE } from './constants.js'
import { loadConfig } from './load-config.js'

const META_FILE = '_meta.json'

const CONFIG_FILES = [...DEFAULT_CONFIGS, I18N_FILE]

const setNodeEnv = (env: 'development' | 'production') => {
  process.env.NODE_ENV = env
}

const cjsRequire = module.createRequire(import.meta.url)

const pkg = cjsRequire('../../package.json') as {
  description: string
  version: string
}

program
  .name('doom')
  .description(pkg.description)
  .version(pkg.version)
  .option('-c, --config [config]', 'Specify the path to the config file')
  .command('dev', { isDefault: true })
  .description('Start the development server')
  .argument('[root]', 'Root directory of the documentation')
  .option('--port [port]', 'Port number')
  .option('--host [host]', 'Host name')
  .action(
    async (
      root: string,
      { config: configFile, ...server }: ServerConfig & { config?: string },
    ) => {
      setNodeEnv('development')

      let devServer: Awaited<ReturnType<typeof dev>> | undefined
      let cliWatcher: FSWatcher

      const startDevServer = async () => {
        const { config, filepath } = await loadConfig(root, configFile)

        const docDirectory = config.root!

        try {
          devServer = await dev({
            config,
            appDirectory: CWD,
            docDirectory,
            extraBuilderConfig: {
              server,
            },
          })
        } catch (err) {
          logger.error(err)
          devServer = undefined
        }

        cliWatcher = watch(
          filepath
            ? [filepath, docDirectory, config.i18nSourcePath!]
            : [...CONFIG_FILES, docDirectory],
          {
            ignoreInitial: true,
            ignored: ['**/node_modules/**', '**/.git/**', '**/.DS_Store/**'],
            cwd: CWD,
          },
        )

        let isRestarting = false

        cliWatcher.on('all', async (eventName: EventName, filepath: string) => {
          if (
            eventName === 'add' ||
            eventName === 'unlink' ||
            (eventName === 'change' &&
              (filepath === config.i18nSourcePath ||
                CONFIG_FILES.includes(path.basename(filepath)) ||
                path.basename(filepath) === META_FILE))
          ) {
            if (isRestarting) {
              return
            }

            isRestarting = true
            console.log(
              `\n✨ ${eventName} ${green(
                path.relative(CWD, filepath),
              )}, dev server will restart...\n`,
            )
            await devServer?.close()
            await cliWatcher.close()
            await startDevServer()
            isRestarting = false
          }
        })
      }

      await startDevServer()

      const exitProcess = async () => {
        try {
          await devServer?.close()
          await cliWatcher.close()
        } finally {
          process.exit(0)
        }
      }

      process.on('SIGINT', exitProcess)
      process.on('SIGTERM', exitProcess)
    },
  )
  .parent!.command('build [root]')
  .description('Build the documentation')
  .action(async (root: string, { config: configFile }: { config?: string }) => {
    setNodeEnv('production')

    const { config } = await loadConfig(root, configFile)

    const docDirectory = config.root!

    await build({
      config,
      appDirectory: CWD,
      docDirectory,
    })
  })
  .parent!.command('preview')
  .alias('serve')
  .description('Preview the built documentation')
  .argument('[root]', 'Root directory of the documentation')
  .option('--port [port]', 'Port number', '4173')
  .option('--host [host]', 'Host name')
  .action(
    async (
      root: string,
      { config: configFile, ...server }: ServerConfig & { config?: string },
    ) => {
      setNodeEnv('production')

      const { config } = await loadConfig(root, configFile)

      await serve({
        config,
        ...server,
      })
    },
  )
  .parent!.parse()
