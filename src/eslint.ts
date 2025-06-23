import type { Options } from '@cspell/eslint-plugin'
import cspellRecommended from '@cspell/eslint-plugin/recommended'
import js from '@eslint/js'
import react from '@eslint-react/eslint-plugin'
import { merge } from 'es-toolkit/compat'
import * as mdx from 'eslint-plugin-mdx'
import globals from 'globals'
import tseslint from 'typescript-eslint'

import { loadConfig } from './cli/load-config.js'

async function doom(cspellOptions?: Options): Promise<tseslint.ConfigArray>
async function doom(root: string | URL): Promise<tseslint.ConfigArray>
async function doom(cspellOptionsOrRoot?: Partial<Options> | string | URL) {
  let cspellOptions: Partial<Options> | undefined
  if (
    typeof cspellOptionsOrRoot === 'string' ||
    cspellOptionsOrRoot instanceof URL
  ) {
    const { config } = await loadConfig(cspellOptionsOrRoot)
    cspellOptions = config.lint?.cspellOptions
  } else {
    cspellOptions = cspellOptionsOrRoot
  }

  return tseslint.config([
    {
      extends: [
        js.configs.recommended,
        react.configs.recommended,
        mdx.configs.flat,
      ],
      languageOptions: {
        globals: globals.node,
      },
    },
    {
      files: ['**/en/**/*.{js,jsx,md,mdx,ts,tsx}'],
      extends: [cspellRecommended],
      languageOptions: {
        globals: globals.browser,
      },
      rules: {
        '@cspell/spellchecker': [
          'error',
          merge({ autoFix: true } satisfies Partial<Options>, cspellOptions),
        ],
      },
    },
    {
      files: ['**/*.{ts,tsx}'],
      extends: [
        tseslint.configs.recommendedTypeChecked,
        react.configs['recommended-typescript'],
      ],
      rules: {
        '@typescript-eslint/no-misused-promises': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/restrict-template-expressions': [
          'error',
          { allowNumber: true },
        ],
        'prefer-const': ['error', { destructuring: 'all' }],
      },
      languageOptions: {
        parser: tseslint.parser,
        parserOptions: {
          projectService: true,
        },
      },
    },
  ])
}

export default doom
