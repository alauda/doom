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

describe('doom eslint config: which files carry the remark rules', () => {
  /**
   * doom's lint rules live in a remark config, and eslint-plugin-mdx only
   * applies it to files whose config entry declares `remarkConfigPath`. That
   * declaration used to sit on the entry scoped to the source language, so
   * `zh/` and `ru/` documents were parsed and then checked against nothing —
   * a lint run over a translation reported success having applied no rule.
   */
  const remarkConfigPathFor = async (filePath: string) => {
    const eslint = new ESLint({
      cwd: process.cwd(),
      overrideConfigFile: true,
      overrideConfig: (await doom(
        null,
      )) as unknown as ESLintOptions['overrideConfig'],
    })
    const config = (await eslint.calculateConfigForFile(filePath)) as {
      languageOptions?: { parserOptions?: { remarkConfigPath?: string } }
    }
    return config.languageOptions?.parserOptions?.remarkConfigPath
  }

  test('applies the remark config to translations, not only to the source language', async () => {
    const forSource = await remarkConfigPathFor('docs/en/install/a.mdx')
    expect(forSource).toBeTruthy()

    for (const translated of [
      'docs/zh/install/a.mdx',
      'docs/ru/install/a.mdx',
    ]) {
      expect(await remarkConfigPathFor(translated)).toBe(forSource)
    }
  })
})
