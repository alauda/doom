import { describe, expect, test } from '@rstest/core'

import { noHeadingPunctuation } from '../../src/remark-lint/no-heading-punctuation.ts'

import { lint } from './_helper.ts'

describe('no-heading-punctuation', () => {
  test('allows clean headings', async () => {
    const messages = await lint(noHeadingPunctuation, '## Title\n')
    expect(messages).toHaveLength(0)
  })
  test('flags trailing period', async () => {
    const messages = await lint(noHeadingPunctuation, '## Title.\n')
    expect(messages).toHaveLength(1)
    expect(String(messages[0])).toContain('.')
  })
  test('allows matched brackets', async () => {
    const messages = await lint(noHeadingPunctuation, '## Config (advanced)\n')
    expect(messages).toHaveLength(0)
  })
})
