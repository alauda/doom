// @ts-check

import eslint from '@eslint/js'
import { config, configs } from 'typescript-eslint'

export default config(
  {
    ignores: ['.yarn', 'dist', 'lib', 'node_modules', 'test'],
  },
  eslint.configs.recommended,
  configs.eslintRecommended,
  ...configs.strictTypeChecked,
  {
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
    files: ['**/*.js'],
    ...configs.disableTypeChecked,
  },
)
