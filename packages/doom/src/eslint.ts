import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

import type { Options } from '@cspell/eslint-plugin'
import cspellRecommended from '@cspell/eslint-plugin/recommended'
import js from '@eslint/js'
import react from '@eslint-react/eslint-plugin'
import type { UserConfig } from '@rspress/shared'
import { merge } from 'es-toolkit/compat'
import { defineConfig } from 'eslint/config'
import * as mdx from 'eslint-plugin-mdx'
import globals from 'globals'
import tseslint from 'typescript-eslint'

import { loadConfig } from './cli/load-config.js'

const cjsRequire = createRequire(import.meta.url)

let remarkConfigPath: string

try {
  remarkConfigPath = fileURLToPath(import.meta.resolve('./remarkrc.js'))
} catch {
  remarkConfigPath = cjsRequire.resolve('./remarkrc.js')
}

async function doom(
  userConfig?: UserConfig | null,
): Promise<tseslint.ConfigArray>
async function doom(root: string | URL): Promise<tseslint.ConfigArray>
async function doom(userConfigOrRoot?: UserConfig | string | null | URL) {
  let cspellOptions: Partial<Options> | null | undefined
  let config: UserConfig | undefined
  if (typeof userConfigOrRoot === 'string' || userConfigOrRoot instanceof URL) {
    ;({ config } = await loadConfig(userConfigOrRoot))
    cspellOptions = config.lint?.cspellOptions
  } else if (userConfigOrRoot) {
    config = userConfigOrRoot
    cspellOptions = userConfigOrRoot.lint?.cspellOptions
  }

  const cspellEnabled = userConfigOrRoot !== null

  return defineConfig([
    {
      ignores: ['**/.yarn', '**/dist', '**/lib', '**/node_modules'],
    },
    {
      ...mdx.configs.flat,
      rules: {
        ...mdx.configs.flat.rules,
        'mdx/remark': 'error',
      },
    },
    {
      extends: [js.configs.recommended, react.configs.recommended],
      languageOptions: {
        globals: globals.node,
      },
    },
    {
      files: [`**/${config?.lang ?? 'en'}/**/*.{js,jsx,md,mdx,ts,tsx}`],
      extends: cspellEnabled ? [cspellRecommended] : [],
      languageOptions: {
        globals: globals.browser,
        parserOptions: {
          remarkConfigPath,
        },
      },
      rules: cspellEnabled
        ? {
            '@cspell/spellchecker': [
              'error',
              merge(
                { autoFix: true } satisfies Partial<Options>,
                cspellOptions,
              ),
            ],
          }
        : {},
    },
    {
      files: ['**/*.mdx'],
      rules: {
        '@eslint-react/jsx-no-children-prop': 'off',
        '@eslint-react/rules-of-hooks': 'off',
        'no-unused-expressions': 'off',
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
