import { describe, expect, test } from '@rstest/core'

import { maximumLinkContentLength } from '../../src/remark-lint/maximum-link-content-length.ts'

import { lint } from './_helper.ts'

describe('maximum-link-content-length', () => {
  test('allows short link text', async () => {
    const messages = await lint(maximumLinkContentLength, '[short link](url)')
    expect(messages).toHaveLength(0)
  })
  test('flags long link text', async () => {
    const messages = await lint(
      maximumLinkContentLength,
      '[This is a very long link text that exceeds forty characters](url)',
    )
    expect(messages).toHaveLength(1)
    expect(String(messages[0])).toContain('40')
  })
  test('skips URL-like text', async () => {
    const messages = await lint(
      maximumLinkContentLength,
      '[https://example.com/very/long/path/that/exceeds/forty/characters](url)',
    )
    expect(messages).toHaveLength(0)
  })
})
