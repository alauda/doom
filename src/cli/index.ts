#!/usr/bin/env node

/**
 * Adopted from @see https://github.com/web-infra-dev/rspress/blob/main/packages/cli/src/index.ts
 */

import module from 'node:module'
import path from 'node:path'

import { logger } from '@rsbuild/core'
import { build, dev, serve } from '@rspress/core'
import { type FSWatcher, watch } from 'chokidar'
import { type Command, program } from 'commander'
import { green } from 'yoctocolors'

import { FALSY_VALUES, TRUTHY_VALUES } from '../shared/index.js'
import type { GlobalCliOptions, ServeOptions } from '../types.js'
import { setNodeEnv } from '../utils/index.js'

import { CWD, DEFAULT_CONFIGS, I18N_FILE, SITES_FILE } from './constants.js'
import { exportCommand } from './export.js'
import { parseBoolean } from './helpers.js'
import { loadConfig } from './load-config.js'
import { newCommand } from './new.js'
import { translateCommand } from './translate.js'

const META_FILE = '_meta.json'

const CONFIG_FILES = [...DEFAULT_CONFIGS, I18N_FILE, SITES_FILE]

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
  .option('-c, --config <config>', 'Specify the path to the config file')
  .option(
    '-v <version>',
    'Specify the version of the documentation, can also be `unversioned` or `unversioned-x.y`',
  )
  .option('-b, --base <base>', 'Override the base of the documentation')
  .option(
    '-p, --prefix <prefix>',
    'Specify the prefix of the documentation base',
  )
  .option(
    '-f, --force [boolean]',
    `Force to
1. fetch latest reference remotes or scaffolding templates, otherwise use local cache
2. translate ignore hash equality check and original text`,
    parseBoolean,
    false,
  )
  .option(
    '-i, --ignore [boolean]',
    'Ignore internal routes',
    parseBoolean,
    false,
  )
  .option(
    '-d, --download [boolean]',
    'Display download pdf link on nav bar',
    parseBoolean,
    false,
  )
  .option(
    '-e, --export [boolean]',
    'Run or build in exporting PDF mode, `apis/**` and `*/apis/**` routes will be ignored automatically',
    parseBoolean,
    false,
  )
  .option(
    '-I, --include <language...>',
    'Include **only** the specific language(s), `en ru` for example',
  )
  .option(
    '-E, --exclude <language...>',
    'Include all languages except the specific language(s), `ru` for example',
  )
  .option(
    '-o, --out-dir <path>',
    'Override the `outDir` defined in the config file or the default `dist/{base}/{version}`, the resulting path will be `dist/{outDir}/{version}`',
  )
  .option(
    '-r, --redirect <enum>',
    'Whether to redirect to the locale closest to `navigator.language` when the user visits the site, could be `auto`, `never` or `only-default-lang`',
    'only-default-lang',
  )
  .option(
    '-R, --edit-repo [boolean|url]',
    'Whether to enable or override the `editRepoBaseUrl` config feature, `https://github.com/` prefix could be omitted',
    (value: string) =>
      FALSY_VALUES.has(value) ? false : TRUTHY_VALUES.has(value) || value,
    false,
  )
  .option(
    '-n, --no-open [boolean]',
    'Do not open the browser after starting the server',
  )
  .command('dev', { isDefault: true })
  .description('Start the development server')
  .argument('[root]', 'Root directory of the documentation')
  .option('-H, --host [host]', 'Dev server host name')
  .option('-P, --port [port]', 'Dev server port number')
  .option(
    '-l, --lazy [boolean]',
    'Whether to enable `lazyCompilation` which could improve the compilation performance',
    parseBoolean,
    false,
  )
  .action(async function (this: Command, root?: string) {
    setNodeEnv('development')

    let devServer: Awaited<ReturnType<typeof dev>> | undefined
    let cliWatcher: FSWatcher

    const { port, host, ...globalOptions } = this.optsWithGlobals<
      ServeOptions & GlobalCliOptions
    >()

    const startDevServer = async () => {
      const { config, filepath } = await loadConfig(root, globalOptions)

      const docDirectory = config.root!

      try {
        devServer = await dev({
          config,
          appDirectory: CWD,
          docDirectory,
          extraBuilderConfig: {
            server: { host, port },
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
  .action(async function (root?: string) {
    setNodeEnv('production')

    const { config } = await loadConfig(
      root,
      this.optsWithGlobals<GlobalCliOptions>(),
    )

    const docDirectory = config.root!

    const runBuild = () =>
      build({
        config,
        appDirectory: CWD,
        docDirectory,
      })

    await runBuild()

    if (process.env.__DOOM_REBUILD__ === 'true') {
      logger.info('Rebuilding...')
      await runBuild()
    }
  })

program
  .command('preview')
  .alias('serve')
  .description('Preview the built documentation')
  .argument('[root]', 'Root directory of the documentation')
  .option('-H, --host [host]', 'Serve host name')
  .option('-P, --port [port]', 'Serve port number', '4173')
  .action(async function (root?: string) {
    setNodeEnv('production')

    const { port, host, ...globalOptions } = this.optsWithGlobals<
      ServeOptions & GlobalCliOptions
    >()

    const { config } = await loadConfig(root, globalOptions)

    await serve({ config, host, port })
  })

program.addCommand(newCommand)
program.addCommand(translateCommand)
program.addCommand(exportCommand)

program.parseAsync().catch((err: unknown) => {
  if (err instanceof Error && err.name === 'ExitPromptError') {
    return
  }
  logger.error(err)
  process.exit(1)
})
