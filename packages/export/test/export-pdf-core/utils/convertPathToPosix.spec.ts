import { describe, test, expect } from '@rstest/core'

import { convertPathToPosix } from '#export-pdf-core/utils/convertPathToPosix.ts'

describe('convertPathToPosix', () => {
  test('returns path unchanged on non-Windows platform', () => {
    const path = '/home/user/document.pdf'
    const result = convertPathToPosix(path)
    expect(result).toBe(path)
  })

  test('returns relative path unchanged on non-Windows platform', () => {
    const path = 'docs/file.pdf'
    const result = convertPathToPosix(path)
    expect(result).toBe(path)
  })

  test('returns current directory path unchanged on non-Windows platform', () => {
    const path = './file.pdf'
    const result = convertPathToPosix(path)
    expect(result).toBe(path)
  })

  test('returns absolute path with multiple segments unchanged on non-Windows', () => {
    const path = '/home/user/docs/file.pdf'
    const result = convertPathToPosix(path)
    expect(result).toBe(path)
  })

  test('handles empty string', () => {
    const result = convertPathToPosix('')
    expect(result).toBe('')
  })

  test('handles path with dots', () => {
    const path = '../docs/file.pdf'
    const result = convertPathToPosix(path)
    expect(result).toBe(path)
  })

  test('handles path with trailing slash', () => {
    const path = '/home/user/docs/'
    const result = convertPathToPosix(path)
    expect(result).toBe(path)
  })
})
