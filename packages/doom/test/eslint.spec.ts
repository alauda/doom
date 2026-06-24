import { describe, expect, test } from '@rstest/core'
import { ESLint } from 'eslint'

import doom from '#eslint.ts'

type ESLintOptions = NonNullable<ConstructorParameters<typeof ESLint>[0]>

const lintMdx = async (value: string) => {
  const overrideConfig = [
    ...(await doom(null)),
    {
      files: ['**/*.mdx'],
      languageOptions: {
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
          ignoreRemarkConfig: true,
        },
      },
      rules: {
        'mdx/remark': 'off',
      },
    },
  ] as unknown as ESLintOptions['overrideConfig']

  const eslint = new ESLint({
    cwd: process.cwd(),
    overrideConfigFile: true,
    overrideConfig,
  })

  const [result] = await eslint.lintText(value, {
    filePath: 'docs/en/test.mdx',
  })

  return result.messages
}

describe('doom eslint config', () => {
  test('allows doom global MDX components without local imports', async () => {
    const messages = await lintMdx(
      [
        '# Title',
        '',
        '<Overview />',
        '<Steps>',
        '  <Term name="product" />',
        '</Steps>',
        '',
      ].join('\n'),
    )

    expect(messages).not.toContainEqual(
      expect.objectContaining({ ruleId: 'no-undef' }),
    )
  })

  test('still reports unknown MDX component references', async () => {
    const messages = await lintMdx('# Title\n\n<UnknownComponent />\n')

    expect(messages).toContainEqual(
      expect.objectContaining({
        ruleId: 'no-undef',
        message: "'UnknownComponent' is not defined.",
      }),
    )
  })
})
