#!/usr/bin/env node

/**
 * Adopted from @see https://github.com/web-infra-dev/rspress/blob/main/packages/cli/src/index.ts
 */

import module from 'node:module'
import path from 'node:path'

import { ServerConfig, logger } from '@rsbuild/core'
import { build, dev, serve } from '@rspress/core'
import { type FSWatcher, watch } from 'chokidar'
import { program, type Command } from 'commander'
import { green } from 'yoctocolors'

import { CWD, DEFAULT_CONFIGS, I18N_FILE, SITES_FILE } from './constants.js'
import { loadConfig } from './load-config.js'

const META_FILE = '_meta.json'

const CONFIG_FILES = [...DEFAULT_CONFIGS, I18N_FILE, SITES_FILE]

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
  .configureHelp({
    showGlobalOptions: true,
  })
  .option('-c, --config [config]', 'Specify the path to the config file')
  .option('-v <version>', 'Specify the version of the documentation')
  .command('dev', { isDefault: true })
  .description('Start the development server')
  .argument('[root]', 'Root directory of the documentation')
  .option('--port [port]', 'Port number')
  .option('--host [host]', 'Host name')
  .action(async function (this: Command, root: string) {
    setNodeEnv('development')

    let devServer: Awaited<ReturnType<typeof dev>> | undefined
    let cliWatcher: FSWatcher

    const {
      config: configFile,
      v: version,
      ...server
    } = this.optsWithGlobals<ServerConfig & { config?: string; v?: string }>()

    const startDevServer = async () => {
      const { config, filepath } = await loadConfig(root, configFile, version)

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
          ? [filepath, config.i18nSourcePath!, docDirectory, SITES_FILE]
          : [...CONFIG_FILES, docDirectory],
        {
          ignoreInitial: true,
          ignored: ['**/node_modules/**', '**/.git/**', '**/.DS_Store/**'],
          cwd: CWD,
        },
      )

      let isRestarting = false

      cliWatcher.on('all', async (eventName, filepath) => {
        console.log(eventName, filepath)
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
  })

program
  .command('build')
  .description('Build the documentation')
  .argument('[root]', 'Root directory of the documentation')
  .action(async function (this: Command, root: string) {
    setNodeEnv('production')

    const { config: configFile, v: version } = this.optsWithGlobals<{
      config?: string
      v?: string
    }>()

    const { config } = await loadConfig(root, configFile, version)

    const docDirectory = config.root!

    await build({
      config,
      appDirectory: CWD,
      docDirectory,
    })
  })

program
  .command('preview')
  .alias('serve')
  .description('Preview the built documentation')
  .argument('[root]', 'Root directory of the documentation')
  .option('--port [port]', 'Port number', '4173')
  .option('--host [host]', 'Host name')
  .action(async function (this: Command, root: string) {
    setNodeEnv('production')

    const {
      config: configFile,
      v: version,
      ...server
    } = this.optsWithGlobals<ServerConfig & { config?: string; v?: string }>()

    const { config } = await loadConfig(root, configFile, version)

    await serve({
      config,
      ...server,
    })
  })

program.command('new', 'Create a new documentation site/module/page', {
  executableFile: 'new',
})

program.parseAsync().catch(console.error)
