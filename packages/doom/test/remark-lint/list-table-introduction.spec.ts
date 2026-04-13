import { describe, expect, test } from '@rstest/core'

import { lint } from './_helper.ts'

import { listTableIntroduction } from '#remark-lint/list-table-introduction.ts'

describe('list-table-introduction', () => {
  test('allows list after paragraph', async () => {
    const messages = await lint(
      listTableIntroduction,
      '# Heading\n\nIntroduction paragraph.\n\n- list item\n',
    )
    expect(messages).toHaveLength(0)
  })
  test('flags list right after heading', async () => {
    const messages = await lint(
      listTableIntroduction,
      '# Heading\n\n- list item\n',
    )
    expect(messages).toHaveLength(1)
    expect(String(messages[0])).toContain('introduct')
  })
})
