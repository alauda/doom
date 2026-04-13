import { describe, expect, test } from '@rstest/core'

import { lint } from './_helper.ts'

import { noHeadingSupSub } from '#remark-lint/no-heading-sup-sub.ts'

describe('no-heading-sup-sub', () => {
  test('allows plain headings', async () => {
    const messages = await lint(noHeadingSupSub, '## Title\n')
    expect(messages).toHaveLength(0)
  })
  test('flags heading with sup', async () => {
    const messages = await lint(noHeadingSupSub, '## Title <sup>beta</sup>\n')
    expect(messages).toHaveLength(2)
    expect(String(messages[0])).toContain('<sup>')
    expect(String(messages[1])).toContain('</sup>')
  })
})
