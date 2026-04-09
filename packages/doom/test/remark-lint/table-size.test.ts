import { describe, expect, test } from '@rstest/core'

import { tableSize } from '../../src/remark-lint/table-size.ts'

import { lint } from './_helper.ts'

describe('table-size', () => {
  test('allows table with 2+ rows and columns', async () => {
    const messages = await lint(tableSize, '| A | B |\n|---|---|\n| C | D |')
    expect(messages).toHaveLength(0)
  })
  test('flags single-row table', async () => {
    const messages = await lint(tableSize, '| A |\n|---|')
    expect(messages).toHaveLength(1)
    expect(String(messages[0])).toContain('row')
  })
  test('flags single-column table', async () => {
    const messages = await lint(tableSize, '| A |\n|---|\n| B |')
    expect(messages).toHaveLength(1)
    expect(String(messages[0])).toContain('column')
  })
})
