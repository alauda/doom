import { logger } from '@rspress/shared/logger'
import { Command } from 'commander'
import { ESLint } from 'eslint'

import doom from '../eslint.js'
import type { GlobalCliOptions } from '../types.js'

import { loadConfig } from './load-config.js'

export const lintCommand = new Command('lint')
  .description('Lint the documentation')
  .argument('[root]', 'Root directory of the documentation')
  .action(async function (root?: string) {
    const globalOptions = this.optsWithGlobals<GlobalCliOptions>()

    const { config } = await loadConfig(root, globalOptions)

    const docsDir = config.root!

    const eslint = new ESLint({
      cwd: docsDir,
      overrideConfigFile: true,
      // @ts-expect-error -- stronger types
      overrideConfig: await doom(config.lint?.cspellOptions),
    })

    logger.start('Linting...')

    const results = await eslint.lintFiles('**/*.{js,jsx,ts,tsx,md,mdx}')

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
