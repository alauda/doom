import path from 'node:path'

import { Command } from 'commander'
import { ESLint } from 'eslint'
import { logger } from 'rspress/core'
import { cyan } from 'yoctocolors'

import doom from '../eslint.js'
import type { GlobalCliOptions } from '../types.js'

import { loadConfig } from './load-config.js'

export interface LintCommandOptions {
  cspell?: boolean
  glob: string | string[]
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
  .action(async function (root?: string) {
    const { cspell, glob, ...globalOptions } = this.optsWithGlobals<
      LintCommandOptions & GlobalCliOptions
    >()

    const { config } = await loadConfig(root, globalOptions)

    const docsDir = config.root!

    const eslint = new ESLint({
      cwd: docsDir,
      overrideConfigFile: true,
      // @ts-expect-error -- stronger types
      overrideConfig: await doom(cspell ? config.lint?.cspellOptions : null),
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
