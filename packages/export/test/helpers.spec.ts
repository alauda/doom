import path from 'node:path'

import { describe, expect, test } from '@rstest/core'

import { pkgResolve } from '#helpers.ts'

describe('pkgResolve', () => {
  test('resolves to package root', () => {
    const result = pkgResolve()
    expect(path.isAbsolute(result)).toBe(true)
    expect(result).toContain('export')
  })

  test('resolves single path segment', () => {
    const result = pkgResolve('src')
    expect(result).toContain('src')
    expect(result).toContain('export')
  })

  test('resolves multiple path segments', () => {
    const result = pkgResolve('src', 'helpers.ts')
    expect(result).toContain('src')
    expect(result).toContain('helpers.ts')
  })

  test('resolves pyodide directory', () => {
    const result = pkgResolve('pyodide')
    expect(result).toContain('pyodide')
    expect(path.isAbsolute(result)).toBe(true)
  })

  test('handles parent directory references', () => {
    const result = pkgResolve('src', '..', 'package.json')
    expect(result).toContain('package.json')
    expect(result).not.toContain('src')
  })
})
