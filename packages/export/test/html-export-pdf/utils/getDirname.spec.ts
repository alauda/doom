import { describe, expect, test } from '@rstest/core'

import { getDirname } from '#html-export-pdf/utils/getDirname.ts'

describe('getDirname', () => {
  test('returns directory name from file URL', () => {
    const fileUrl = 'file:///Users/test/project/file.ts'
    const result = getDirname(fileUrl)

    expect(result).toBe('/Users/test/project')
  })

  test('handles nested paths', () => {
    const fileUrl = 'file:///a/b/c/d/file.js'
    const result = getDirname(fileUrl)

    expect(result).toBe('/a/b/c/d')
  })

  test('handles URL with spaces', () => {
    const fileUrl = 'file:///Users/test/my%20project/file.ts'
    const result = getDirname(fileUrl)

    expect(result).toContain('my project')
    expect(result).not.toContain('file.ts')
  })

  test('returns parent directory', () => {
    const fileUrl = 'file:///single/file.txt'
    const result = getDirname(fileUrl)

    expect(result).toBe('/single')
  })
})
