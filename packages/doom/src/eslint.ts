import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
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
import { getGlobalComponentNames } from './plugins/global/components.js'
import { SUPPORTED_LANGUAGES } from './shared/index.js'
import { pkgResolve } from './utils/index.js'

const cjsRequire = createRequire(import.meta.url)

let remarkConfigPath: string | undefined

const isLoadableRemarkConfigPath = (filepath: string) =>
  ['.cjs', '.js', '.mjs'].includes(path.extname(filepath))

try {
  const resolvedRemarkConfigPath = fileURLToPath(
    import.meta.resolve('./remarkrc.js'),
  )
  if (isLoadableRemarkConfigPath(resolvedRemarkConfigPath)) {
    remarkConfigPath = resolvedRemarkConfigPath
  }
} catch {
  try {
    const resolvedRemarkConfigPath = cjsRequire.resolve('./remarkrc.js')
    if (isLoadableRemarkConfigPath(resolvedRemarkConfigPath)) {
      remarkConfigPath = resolvedRemarkConfigPath
    }
  } catch {
    remarkConfigPath = undefined
  }
}

const builtRemarkConfigPath = pkgResolve('lib/remarkrc.js')
if (!remarkConfigPath && fs.existsSync(builtRemarkConfigPath)) {
  remarkConfigPath = builtRemarkConfigPath
}

const globalComponentGlobals = Object.fromEntries(
  getGlobalComponentNames().map((name) => [name, 'readonly']),
) as Record<string, 'readonly'>

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
      // Every language directory, not just the one documents are written in.
      // The remark config is what carries doom's lint rules, so scoping it to
      // the source language meant a translated document was parsed and then
      // checked against nothing: a lint run over `zh/` reported success having
      // applied no rule at all.
      //
      // Still scoped to language directories rather than to every markdown file
      // in the repository — changesets, READMEs and design notes are not
      // documentation pages and do not want documentation rules.
      files: [
        `**/{${SUPPORTED_LANGUAGES.join(',')}}/**/*.{js,jsx,md,mdx,ts,tsx}`,
      ],
      languageOptions: {
        parserOptions: {
          ...(remarkConfigPath && { remarkConfigPath }),
        },
      },
    },
    {
      // Spell checking stays scoped to the source language: the dictionaries
      // are for it, and running them over a translation is noise.
      files: [`**/${config?.lang ?? 'en'}/**/*.{js,jsx,md,mdx,ts,tsx}`],
      extends: cspellEnabled ? [cspellRecommended] : [],
      languageOptions: {
        globals: globals.browser,
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
      languageOptions: {
        globals: globalComponentGlobals,
      },
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
