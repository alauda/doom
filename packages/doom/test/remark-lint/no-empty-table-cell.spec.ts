import { describe, expect, test } from '@rstest/core'

import { noEmptyTableCell } from '../../src/remark-lint/no-empty-table-cell.ts'

import { lint } from './_helper.ts'

describe('no-empty-table-cell', () => {
  test('allows filled cells', async () => {
    const messages = await lint(
      noEmptyTableCell,
      '| A | B |\n|---|---|\n| C | D |',
    )
    expect(messages).toHaveLength(0)
  })
  test('flags empty cells', async () => {
    const messages = await lint(noEmptyTableCell, '| A | |\n|---|---|\n| B | |')
    expect(messages.length).toBeGreaterThan(0)
    expect(String(messages[0])).toContain('empty')
  })
})
