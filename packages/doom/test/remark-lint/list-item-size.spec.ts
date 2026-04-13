import { describe, expect, test } from '@rstest/core'

import { listItemSize } from '../../src/remark-lint/list-item-size.ts'

import { lint } from './_helper.ts'

describe('list-item-size', () => {
  test('allows 10 items', async () => {
    const items = Array.from({ length: 10 }, (_, i) => `- item ${i + 1}`).join(
      '\n',
    )
    const messages = await lint(listItemSize, items)
    expect(messages).toHaveLength(0)
  })
  test('flags 11 items', async () => {
    const items = Array.from({ length: 11 }, (_, i) => `- item ${i + 1}`).join(
      '\n',
    )
    const messages = await lint(listItemSize, items)
    expect(messages).toHaveLength(1)
    expect(String(messages[0])).toContain('10')
  })
})
