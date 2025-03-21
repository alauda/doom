// @ts-check

import eslint from '@eslint/js'
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript'
import importX from 'eslint-plugin-import-x'
import { config, configs } from 'typescript-eslint'

export default config(
  {
    ignores: ['.yarn', 'dist', 'lib', 'node_modules', 'test', 'pyodide'],
  },
  eslint.configs.recommended,
  importX.flatConfigs.recommended,
  importX.flatConfigs.typescript,
  configs.eslintRecommended,
  ...configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    settings: {
      'import-x/resolver-next': [createTypeScriptImportResolver()],
    },
    rules: {
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        { allowNumber: true },
      ],
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
  {
    files: ['**/*.js'],
    ...configs.disableTypeChecked,
  },
  {
    files: ['**/html-export-pdf/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unnecessary-condition': 'off',
      curly: 'error',
    },
  },
)
