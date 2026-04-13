import { describe, expect, test } from '@rstest/core'

import { lint } from './_helper.ts'

import { noParagraphIndent } from '#remark-lint/no-paragraph-indent.ts'

describe('no-paragraph-indent', () => {
  test('allows unindented paragraph', async () => {
    const messages = await lint(
      noParagraphIndent,
      'This is a normal paragraph.\n',
    )
    expect(messages).toHaveLength(0)
  })
  test('flags indented paragraph', async () => {
    const messages = await lint(
      noParagraphIndent,
      '  This is an indented paragraph.\n',
    )
    expect(messages).toHaveLength(1)
    expect(String(messages[0])).toContain('spaces')
  })
})
