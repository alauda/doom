// @ts-check

import eslint from '@eslint/js'
import react from '@eslint-react/eslint-plugin'
import { defineConfig } from 'eslint/config'
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript'
import { importX } from 'eslint-plugin-import-x'
import reactHooks from 'eslint-plugin-react-hooks'
import * as regexp from 'eslint-plugin-regexp'
import { configs } from 'typescript-eslint'

import doom from '@alauda/doom/eslint'

export default defineConfig(
  {
    ignores: [
      'dist',
      '**/lib',
      '**/pyodide',
      // main language is en which is different with docs
      'fixture-docs/zh',
    ],
  },
  ...(await doom(new URL('docs', import.meta.url))),
  eslint.configs.recommended,
  importX.flatConfigs.recommended,
  importX.flatConfigs.typescript,
  reactHooks.configs.flat.recommended,
  react.configs.recommended,
  react.configs['disable-conflict-eslint-plugin-react-hooks'],
  regexp.configs['flat/recommended'],
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      configs.eslintRecommended,
      configs.strictTypeChecked,
      react.configs['recommended-type-checked'],
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    rules: {
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        { allowNumber: true },
      ],
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-floating-promises': 'off',
    },
  },
  {
    files: ['**/*.mdx'],
    rules: {
      '@eslint-react/jsx-no-children-prop': 'off',
      '@eslint-react/rules-of-hooks': 'off',
      'react-hooks/rules-of-hooks': 'off',
    },
  },
  {
    settings: {
      'import-x/resolver-next': createTypeScriptImportResolver(),
    },
    rules: {
      'import-x/default': 'off',
      'import-x/first': 'error',
      'import-x/newline-after-import': 'error',
      'import-x/no-duplicates': 'error',
      'import-x/no-named-as-default-member': 'off',
      'import-x/no-unresolved': [
        'error',
        {
          ignore: [
            'doom-@api-crdsMap',
            'doom-@api-openapisMap',
            'doom-@api-virtual',
            'doom-@global-virtual',
            'doom-@permission-functionResourcesMap',
            'doom-@permission-roleTemplatesMap',
            'virtual-site-data',
          ],
        },
      ],
      'import-x/namespace': 'off',
      'import-x/order': [
        'error',
        {
          alphabetize: {
            order: 'asc',
          },
          named: {
            types: 'types-first',
          },
          'newlines-between': 'always',
        },
      ],
      'prefer-const': ['error', { destructuring: 'all' }],
    },
  },
)
