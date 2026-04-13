import { describe, expect, test } from '@rstest/core'

import { getAbsFileName } from '#html-export-pdf/utils/getAbsFileName.ts'

describe('getAbsFileName', () => {
  test('converts file URL to path', () => {
    const fileUrl = 'file:///Users/test/project/file.ts'
    const result = getAbsFileName(fileUrl)

    expect(result).toBe('/Users/test/project/file.ts')
  })

  test('handles Windows-style file URL', () => {
    const fileUrl = 'file:///C:/Users/test/project/file.ts'
    const result = getAbsFileName(fileUrl)

    // On POSIX systems, this will keep the /C: prefix
    expect(result).toContain('Users/test/project/file.ts')
  })

  test('handles URL with spaces', () => {
    const fileUrl = 'file:///Users/test/my%20project/file.ts'
    const result = getAbsFileName(fileUrl)

    expect(result).toContain('my project')
  })

  test('returns absolute path', () => {
    const fileUrl = 'file:///absolute/path/file.js'
    const result = getAbsFileName(fileUrl)

    expect(result.startsWith('/')).toBe(true)
  })
})
