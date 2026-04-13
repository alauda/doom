import { describe, expect, test } from '@rstest/core'

import { lint } from './_helper.ts'

import { noHeadingSpecialCharacters } from '#remark-lint/no-heading-special-characters.ts'

describe('no-heading-special-characters', () => {
  test('allows normal heading', async () => {
    const messages = await lint(
      noHeadingSpecialCharacters,
      '## Normal Heading\n',
    )
    expect(messages).toHaveLength(0)
  })
  test('flags heading with /', async () => {
    const messages = await lint(noHeadingSpecialCharacters, '## Input/Output\n')
    expect(messages).toHaveLength(1)
    expect(String(messages[0])).toContain('/')
  })
})
