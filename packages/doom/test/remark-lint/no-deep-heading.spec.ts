import { describe, expect, test } from '@rstest/core'

import { lint } from './_helper.ts'

import { noDeepHeading } from '#remark-lint/no-deep-heading.ts'

describe('no-deep-heading', () => {
  test('allows h1-h5', async () => {
    const messages = await lint(
      noDeepHeading,
      '# h1\n## h2\n### h3\n#### h4\n##### h5\n',
    )
    expect(messages).toHaveLength(0)
  })
  test('flags h6', async () => {
    const messages = await lint(noDeepHeading, '###### h6\n')
    expect(messages).toHaveLength(1)
    expect(String(messages[0])).toContain('level 6')
  })
})
