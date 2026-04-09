import { describe, test, expect } from '@rstest/core'

import { replaceExt } from '../../../src/html-export-pdf/utils/replaceExt.ts'

describe('replaceExt', () => {
  test('replaces extension with new one', () => {
    const result = replaceExt('file.md', '.html')
    expect(result).toBe('file.html')
  })

  test('handles path with directories', () => {
    const result = replaceExt('dir/file.md', '.html')
    expect(result.endsWith('file.html')).toBe(true)
  })

  test('preserves leading dot-slash', () => {
    const result = replaceExt('./file.md', '.html')
    expect(result).toMatch(/^\.[\\/].*\.html$/)
  })

  test('preserves leading dot-slash in nested paths', () => {
    const result = replaceExt('./dir/file.md', '.html')
    expect(result).toMatch(/^\.[\\/]/)
    expect(result.endsWith('file.html')).toBe(true)
  })

  test('handles empty string', () => {
    expect(replaceExt('', '.html')).toBe('')
  })

  test('handles non-string input', () => {
    expect(replaceExt(null as unknown as string, '.html')).toBe(null)
  })

  test('handles file without extension', () => {
    const result = replaceExt('file', '.html')
    expect(result).toBe('file.html')
  })

  test('handles file with multiple dots', () => {
    const result = replaceExt('file.tar.gz', '.zip')
    expect(result).toBe('file.tar.zip')
  })

  test('preserves directory structure', () => {
    const result = replaceExt('path/to/dir/file.md', '.pdf')
    expect(result).toContain('path')
    expect(result.endsWith('file.pdf')).toBe(true)
  })

  test('replaces extension without adding extra dot', () => {
    const result = replaceExt('file.md', 'html')
    expect(result).toBe('filehtml')
  })

  test('handles extension with dot in new extension', () => {
    const result = replaceExt('file.md', '.tar.gz')
    expect(result).toBe('file.tar.gz')
  })
})
