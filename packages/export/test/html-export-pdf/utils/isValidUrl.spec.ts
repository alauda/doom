import { describe, test, expect } from '@rstest/core'

import { isValidUrl } from '#html-export-pdf/utils/isValidUrl.ts'

describe('isValidUrl', () => {
  test('returns true for http protocol', () => {
    expect(isValidUrl('http://example.com')).toBe(true)
  })

  test('returns true for https protocol', () => {
    expect(isValidUrl('https://example.com')).toBe(true)
  })

  test('returns true for file protocol', () => {
    expect(isValidUrl('file:///path/to/file.pdf')).toBe(true)
  })

  test('returns true for data protocol', () => {
    expect(isValidUrl('data:text/html,<h1>Hello</h1>')).toBe(true)
  })

  test('returns false for ftp protocol', () => {
    expect(isValidUrl('ftp://example.com')).toBe(false)
  })

  test('returns false for plain text', () => {
    expect(isValidUrl('example.com')).toBe(false)
  })

  test('returns false for relative path', () => {
    expect(isValidUrl('/path/to/file')).toBe(false)
  })

  test('handles case insensitive protocols', () => {
    expect(isValidUrl('HTTPS://example.com')).toBe(true)
    expect(isValidUrl('HTTP://example.com')).toBe(true)
    expect(isValidUrl('FILE:///path/to/file')).toBe(true)
    expect(isValidUrl('DATA:text/html,<h1>Hi</h1>')).toBe(true)
  })

  test('returns false for mixed case invalid protocol', () => {
    expect(isValidUrl('FtP://example.com')).toBe(false)
  })
})
