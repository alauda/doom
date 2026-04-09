import { describe, expect, test } from '@rstest/core'

import { unitCase } from '../../src/remark-lint/unit-case.ts'

import { lint } from './_helper.ts'

describe('unit-case', () => {
  test('allows correct unit casing', async () => {
    const messages = await lint(unitCase, 'Storage: 100Ki, Memory: 500M\n')
    expect(messages).toHaveLength(0)
  })
  test('flags incorrect ki', async () => {
    const messages = await lint(unitCase, 'Storage: 100ki\n')
    expect(messages).toHaveLength(1)
    expect(String(messages[0])).toContain('Ki')
  })
  test('flags incorrect gi', async () => {
    const messages = await lint(unitCase, 'Storage: 100gi\n')
    expect(messages).toHaveLength(1)
    expect(String(messages[0])).toContain('Gi')
  })
})
