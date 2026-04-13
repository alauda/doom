import { describe, expect, test } from '@rstest/core'

import { noHeadingSupSub } from '../../src/remark-lint/no-heading-sup-sub.ts'

import { lint } from './_helper.ts'

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
