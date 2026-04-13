import { describe, test, expect } from '@rstest/core'

import { getUrlLink } from '../../../src/export-pdf-core/utils/getUrlLink.ts'

describe('getUrlLink', () => {
  test('extracts link and hash from URL with hash', () => {
    const result = getUrlLink('https://example.com/path#anchor')
    expect(result.link).toBe('https://example.com/path')
    expect(result.hash).toBe('anchor')
  })

  test('returns empty hash when URL has no hash', () => {
    const result = getUrlLink('https://example.com/path')
    expect(result.link).toBe('https://example.com/path')
    expect(result.hash).toBe('')
  })

  test('preserves pathname in link', () => {
    const result = getUrlLink('https://example.com/docs/api#section')
    expect(result.link).toBe('https://example.com/docs/api')
    expect(result.hash).toBe('section')
  })

  test('handles complex query strings', () => {
    const result = getUrlLink('https://example.com/path?query=1&other=2#anchor')
    expect(result.link).toBe('https://example.com/path')
    expect(result.hash).toBe('anchor')
  })

  test('handles file protocol URLs', () => {
    const result = getUrlLink('file:///home/user/document.html#section')
    expect(result.link).toBe('null/home/user/document.html')
    expect(result.hash).toBe('section')
  })

  test('throws TypeError for invalid URL', () => {
    expect(() => {
      getUrlLink('not a valid url')
    }).toThrow(TypeError)
  })

  test('throws TypeError for malformed URL', () => {
    expect(() => {
      getUrlLink('ht!tp://[invalid')
    }).toThrow(TypeError)
  })
})
