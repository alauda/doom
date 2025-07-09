// @ts-check

import eslint from '@eslint/js'
import react from '@eslint-react/eslint-plugin'
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript'
import { importX } from 'eslint-plugin-import-x'
import * as reactHooks from 'eslint-plugin-react-hooks'
import * as regexp from 'eslint-plugin-regexp'
import { config, configs } from 'typescript-eslint'

import doom from '@alauda/doom/eslint'

export default config(
  {
    ignores: ['pyodide'],
  },
  ...(await doom(new URL('docs', import.meta.url))),
  eslint.configs.recommended,
  importX.flatConfigs.recommended,
  importX.flatConfigs.typescript,
  react.configs.recommended,
  reactHooks.configs['recommended-latest'],
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
    files: ['**/*.mdx'],
    rules: {
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
            'virtual-runtime-config',
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
