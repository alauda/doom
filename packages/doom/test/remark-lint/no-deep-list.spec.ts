import { describe, expect, test } from '@rstest/core'

import { lint } from './_helper.ts'

import { noDeepList } from '#remark-lint/no-deep-list.ts'

describe('no-deep-list', () => {
  test('allows depth 4', async () => {
    const messages = await lint(
      noDeepList,
      '- level 1\n  - level 2\n    - level 3\n      - level 4\n',
    )
    expect(messages).toHaveLength(0)
  })
  test('flags depth 5', async () => {
    const messages = await lint(
      noDeepList,
      '- level 1\n  - level 2\n    - level 3\n      - level 4\n        - level 5\n',
    )
    expect(messages).toHaveLength(1)
    expect(String(messages[0])).toContain('4')
  })
})
