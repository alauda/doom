import fs from 'node:fs/promises'
import path from 'node:path'

import { logger } from '@rspress/core'
import { Command } from 'commander'
import { ESLint } from 'eslint'
import { cyan } from 'yoctocolors'

import doom from '../eslint.ts'
import type { GlobalCliOptions } from '../types.ts'
import { OPTIONS_FILE, STORAGE_DIR } from '../utils/index.ts'

import { loadConfig } from './load-config.ts'

export interface LintCommandOptions {
  cspell?: boolean
  glob: string | string[]
  debug?: boolean
}

export const lintCommand = new Command('lint')
  .description('Lint the documentation')
  .argument('[root]', 'Root directory of the documentation')
  .option(
    '-g, --glob <path...>',
    'Glob patterns of source dirs/files to lint',
    '**/*.{js,jsx,ts,tsx,md,mdx}',
  )
  .option('--no-cspell', 'Disable cspell linting')
  .option('--debug', 'Show debug logs', false)
  .action(async function (root?: string) {
    const {
      cspell,
      glob,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      debug,
      ...globalOptions
    } = this.optsWithGlobals<LintCommandOptions & GlobalCliOptions>()

    await fs.mkdir(STORAGE_DIR, { recursive: true })

    await fs.writeFile(
      OPTIONS_FILE,
      JSON.stringify({ root, globalOptions }, null, 2),
    )

    const { config } = await loadConfig(root, globalOptions)

    const docsDir = config.root!

    const eslint = new ESLint({
      cwd: docsDir,
      overrideConfigFile: true,
      ignorePatterns: globalOptions.ignore ? config.internalRoutes : undefined,
      // @ts-expect-error -- stronger types
      overrideConfig: await doom(cspell ? config : null),
    })

    logger.start(
      `Linting \`${cyan(path.relative(process.cwd(), docsDir))}\`...`,
    )

    const results = await eslint.lintFiles(glob)

    const { error, warning } = results.reduce(
      (count, result) => ({
        error: count.error + result.errorCount,
        warning: count.warning + result.warningCount,
      }),
      { error: 0, warning: 0 },
    )

    logger.info(
      `Linting completed with ${error} errors and ${warning} warnings`,
    )

    const formatter = await eslint.loadFormatter('stylish')

    const formatted = await formatter.format(results)

    if (formatted) {
      console.log(formatted)
    }

    if (error) {
      process.exitCode = 1
    }
  })
