import path from 'node:path'

import { describe, expect, test } from '@rstest/core'

import { baseResolve, pkgResolve } from '#utils/helpers.ts'

describe('baseResolve', () => {
  test('resolves path relative to BASE_DIR', () => {
    const result = baseResolve('..', '..')

    expect(result).toBeTruthy()
    expect(result).toContain('packages')
  })

  test('resolves single path segment', () => {
    const result = baseResolve('utils')

    expect(result).toContain('src')
    expect(result).toContain('utils')
  })

  test('resolves multiple path segments', () => {
    const result = baseResolve('utils', 'helpers.ts')

    expect(result).toContain('utils')
    expect(result).toContain('helpers.ts')
  })

  test('returns absolute path', () => {
    const result = baseResolve('test')

    expect(path.isAbsolute(result)).toBe(true)
  })

  test('resolves empty call to BASE_DIR', () => {
    const result = baseResolve()

    expect(path.isAbsolute(result)).toBe(true)
    expect(result).toContain('doom')
  })

  test('handles parent directory references', () => {
    const result = baseResolve('plugins', '..', 'utils')

    expect(result).toContain('utils')
    expect(result).not.toContain('plugins')
  })
})

describe('pkgResolve', () => {
  test('resolves path relative to PKG_DIR', () => {
    const result = pkgResolve('src')

    expect(result).toContain('src')
    expect(result).toContain('doom')
  })

  test('resolves single path segment', () => {
    const result = pkgResolve('package.json')

    expect(result).toContain('package.json')
  })

  test('resolves multiple path segments', () => {
    const result = pkgResolve('src', 'utils', 'helpers.ts')

    expect(result).toContain('src')
    expect(result).toContain('utils')
    expect(result).toContain('helpers.ts')
  })

  test('returns absolute path', () => {
    const result = pkgResolve('test')

    expect(path.isAbsolute(result)).toBe(true)
  })

  test('resolves empty call to PKG_DIR', () => {
    const result = pkgResolve()

    expect(path.isAbsolute(result)).toBe(true)
    expect(result).toContain('doom')
  })

  test('handles parent directory references', () => {
    const result = pkgResolve('src', '..', 'package.json')

    expect(result).toContain('package.json')
    expect(result).not.toContain('src')
  })

  test('pkgResolve is one level above baseResolve', () => {
    const pkg = pkgResolve()
    const base = baseResolve()

    expect(pkg).toBe(path.dirname(base))
  })
})
