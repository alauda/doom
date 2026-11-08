import { describe, expect, test } from '@rstest/core'
import { ESLint, type Rule } from 'eslint'
import { configs } from 'eslint-plugin-mdx'

import { lintMdxPipeline } from './_helper.ts'

import { createTranslationChecker } from '#cli/translate-checker.ts'
import { maskAst, restoreMaskedContent } from '#cli/translate-mask.ts'
import { mdxProcessor } from '#plugins/index.ts'
import { noLegacyOSNames } from '#remark-lint/index.ts'

const legacyPage = (body: string) =>
  ['# Title', '', body, '', '<Term name="kubeOS" />'].join('\n')

describe('ESLint MDX remark controls in the remark pipeline', () => {
  test('maps disable and enable to a wide remark range', async () => {
    const messages = await lintMdxPipeline(
      noLegacyOSNames,
      [
        '{/* eslint-disable mdx/remark */}',
        '',
        '<Term name="kubeOS" />',
        '',
        '{/* eslint-enable mdx/remark */}',
        '',
        '<Term name="kubeOS" />',
      ].join('\n'),
    )

    expect(messages).toHaveLength(1)
  })

  test('maps disable-next-line to only the next physical line', async () => {
    const messages = await lintMdxPipeline(
      noLegacyOSNames,
      [
        '{/* eslint-disable-next-line mdx/remark */}',
        '<Term name="kubeOS" />',
        '',
        '<Term name="kubeOS" />',
      ].join('\n'),
    )

    expect(messages).toHaveLength(1)
    expect(messages[0].line).toBe(4)
  })

  test('a blank line consumes disable-next-line without hiding the next node', async () => {
    const messages = await lintMdxPipeline(
      noLegacyOSNames,
      '{/* eslint-disable-next-line mdx/remark */}\n\n<Term name="kubeOS" />',
    )
    expect(messages).toHaveLength(1)
    expect(messages[0].line).toBe(3)
  })

  test('does not let a lint enable cancel an ESLint disable', async () => {
    const messages = await lintMdxPipeline(
      noLegacyOSNames,
      '{/* eslint-disable mdx/remark */}\n\n{/* lint enable */}\n\n<Term name="kubeOS" />',
    )
    expect(messages).toHaveLength(0)
  })

  test('does not let an ESLint enable cancel a lint disable', async () => {
    const messages = await lintMdxPipeline(
      noLegacyOSNames,
      '{/* lint disable no-legacy-os-names */}\n\n{/* eslint-enable mdx/remark */}\n\n<Term name="kubeOS" />',
    )
    expect(messages).toHaveLength(0)
  })

  test.each([
    'eslint-disable mdx/remark -- legacy field name',
    'eslint-disable no-undef, mdx/remark -- legacy field name',
    'eslint-disable',
    'eslint-disable -- legacy field name',
  ])('accepts ESLint rule lists and descriptions: %s', async (directive) => {
    expect(
      await lintMdxPipeline(
        noLegacyOSNames,
        legacyPage(`{/* ${directive} */}`),
      ),
    ).toHaveLength(0)
  })

  test('ignores unrelated ESLint directive kinds', async () => {
    expect(
      await lintMdxPipeline(
        noLegacyOSNames,
        legacyPage('{/* eslint-unknown mdx/remark */}'),
      ),
    ).toHaveLength(1)
  })

  test('keeps a disable without enable active through the file end', async () => {
    const messages = await lintMdxPipeline(
      noLegacyOSNames,
      legacyPage('{/* eslint-disable mdx/remark */}'),
    )

    expect(messages).toHaveLength(0)
  })

  test('keeps the existing lint syntax and mixed controls working', async () => {
    const messages = await lintMdxPipeline(
      noLegacyOSNames,
      [
        '{/* lint disable no-legacy-os-names */}',
        '',
        '<Term name="kubeOS" />',
        '',
        '{/* lint enable no-legacy-os-names */}',
        '',
        '{/* eslint-disable mdx/remark */}',
        '',
        '<Term name="kubeOS" />',
        '',
        '{/* eslint-enable mdx/remark */}',
        '',
        '<Term name="kubeOS" />',
      ].join('\n'),
    )

    expect(messages).toHaveLength(1)
  })

  test('does not treat an eslint rule other than mdx/remark as a remark control', async () => {
    const messages = await lintMdxPipeline(
      noLegacyOSNames,
      legacyPage('{/* eslint-disable no-legacy-os-names */}'),
    )

    expect(messages).toHaveLength(1)
  })

  test('keeps the control range after mask and restore without leaking', async () => {
    const source = [
      '{/* eslint-disable mdx/remark */}',
      '',
      '<Term name="kubeOS" />',
      '',
      '{/* eslint-enable mdx/remark */}',
      '',
      '<Term name="kubeOS" />',
    ].join('\n')
    const tree = mdxProcessor.parse(source)
    const entries = maskAst(tree)
    const restored = restoreMaskedContent(
      mdxProcessor.stringify(tree),
      entries,
      mdxProcessor,
    )
    const messages = await lintMdxPipeline(noLegacyOSNames, restored)

    expect(restored).toContain('eslint-disable mdx/remark')
    expect(messages).toHaveLength(1)
  })

  test('applies the broad exemption to multiple assembled translation rules', async () => {
    const checker = createTranslationChecker()
    const body = '# 标题\n\n###### kubeOS\n'
    const unprotected = await checker.check('/tmp/ops019/zh/test.mdx', body)
    expect(unprotected.map((finding) => finding.rule)).toContain(
      'no-legacy-os-names',
    )
    expect(unprotected.map((finding) => finding.rule)).toContain(
      'no-deep-heading',
    )
    const protectedFindings = await checker.check(
      '/tmp/ops019/zh/test.mdx',
      `{/* eslint-disable mdx/remark */}\n\n${body}`,
    )
    expect(protectedFindings).toHaveLength(0)
  })
})

// An actual ESLint instance interprets directives independently of our adapter.
// A diagnostic at each legacy word gives the two engines identical locations.
const diagnosticRule: Rule.RuleModule = {
  create(context) {
    return {
      Program() {
        for (const match of context.sourceCode.text.matchAll(/kubeOS/g)) {
          context.report({
            message: 'Legacy name',
            loc: context.sourceCode.getLocFromIndex(match.index),
          })
        }
      },
    }
  },
}

describe('agreement with native ESLint directive scopes', () => {
  test.each([
    'eslint-disable mdx/remark',
    'eslint-disable no-undef, mdx/remark -- field name',
    'eslint-disable',
    'eslint-disable no-undef',
    'eslint-disable-next-line mdx/remark',
    'eslint-disable-next-line mdx/remark -- field name',
  ])(
    '%s agrees with native ESLint including blank lines',
    async (directive) => {
      const eslint = new ESLint({
        overrideConfigFile: true,
        overrideConfig: [
          {
            ...configs.flat,
            processor: {
              preprocess: (text) => [text],
              postprocess: (messages) => messages.flat(),
            },
            plugins: { mdx: { rules: { remark: diagnosticRule } } },
            rules: { 'mdx/remark': 'error' },
          },
        ],
      })
      for (const gap of ['', '\n']) {
        const content = `{/* ${directive} */}\n${gap}kubeOS\n\n{/* eslint-enable mdx/remark */}\n\nkubeOS\n`
        const [result] = await eslint.lintText(content, {
          filePath: 'scope.mdx',
        })
        const messages = await lintMdxPipeline(noLegacyOSNames, content)
        const native = result.messages.filter(
          (message) => message.ruleId === 'mdx/remark',
        )
        expect(messages.map((message) => message.line)).toEqual(
          native.map((message) => message.line),
        )
      }
    },
  )
})
