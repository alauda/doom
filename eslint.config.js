// @ts-check

import eslint from '@eslint/js'
import { config, configs } from 'typescript-eslint'

export default config(
  {
    ignores: ['.yarn', 'lib', 'node_modules'],
  },
  eslint.configs.recommended,
  configs.eslintRecommended,
  ...configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
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
