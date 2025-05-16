import type { Options } from '@cspell/eslint-plugin'
import cspellRecommended from '@cspell/eslint-plugin/recommended'
import js from '@eslint/js'
import react from '@eslint-react/eslint-plugin'
import { logger } from '@rspress/shared/logger'
import { Command } from 'commander'
import { merge } from 'es-toolkit/compat'
import { ESLint } from 'eslint'
import * as mdx from 'eslint-plugin-mdx'
import tseslint from 'typescript-eslint'

import type { GlobalCliOptions } from '../types.js'

import { parseTerms } from './helpers.js'
import { loadConfig } from './load-config.js'

export const lintCommand = new Command('lint')
  .description('Lint the documentation')
  .argument('[root]', 'Root directory of the documentation')
  .action(async function (root?: string) {
    const globalOptions = this.optsWithGlobals<GlobalCliOptions>()

    const { config } = await loadConfig(root, globalOptions)

    const docsDir = config.root!

    const parsedTerms = await parseTerms()

    const eslint = new ESLint({
      cwd: docsDir,
      // @ts-expect-error -- stronger types
      baseConfig: tseslint.config([
        {
          extends: [
            js.configs.recommended,
            react.configs.recommended,
            mdx.configs.flat,
          ],
        },
        {
          files: ['**/en/**/*.{js,jsx,md,mdx,ts,tsx}'],
          extends: [cspellRecommended],
          rules: {
            '@cspell/spellchecker': [
              'error',
              merge(
                {
                  autoFix: true,
                  cspell: {
                    words: parsedTerms.map((it) => it.en),
                    flagWords: parsedTerms.flatMap(
                      ({ badCases }) => badCases?.en ?? [],
                    ),
                  },
                } satisfies Partial<Options>,
                config.lint?.cspellOptions,
              ),
            ],
          },
        },
        // https://github.com/eslint/eslint/issues/19722
        // {
        //   files: ['**/*.{ts,tsx}'],
        //   extends: [
        //     tseslint.configs.recommendedTypeChecked,
        //     react.configs['recommended-typescript'],
        //   ],
        //   rules: {
        //     '@typescript-eslint/no-misused-promises': 'off',
        //     '@typescript-eslint/no-non-null-assertion': 'off',
        //     '@typescript-eslint/restrict-template-expressions': [
        //       'error',
        //       { allowNumber: true },
        //     ],
        //     'prefer-const': ['error', { destructuring: 'all' }],
        //   },
        //   languageOptions: {
        //     parser: tseslint.parser,
        //     parserOptions: {
        //       projectService: true,
        //     },
        //   },
        // },
      ]),
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
