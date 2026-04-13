import { describe, expect, test } from '@rstest/core'

import { lint } from './_helper.ts'

import { listItemPunctuation } from '#remark-lint/list-item-punctuation.ts'

describe('list-item-punctuation', () => {
  test('allows consistent punctuation', async () => {
    const messages = await lint(
      listItemPunctuation,
      '- item one;\n- item two;\n- item three.',
    )
    expect(messages).toHaveLength(0)
  })
  test('flags inconsistent punctuation', async () => {
    const messages = await lint(
      listItemPunctuation,
      '- item one\n- item two;\n- item three.',
    )
    expect(messages.length).toBeGreaterThan(0)
  })
  test('last item should end with period', async () => {
    const messages = await lint(listItemPunctuation, '- item one;\n- item two;')
    expect(messages.length).toBeGreaterThan(0)
    expect(String(messages[0])).toContain('.')
  })
  test('skips single-item lists', async () => {
    const messages = await lint(listItemPunctuation, '- single item')
    expect(messages).toHaveLength(0)
  })
})
