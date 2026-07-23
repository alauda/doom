import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { afterAll, beforeAll, describe, expect, test } from '@rstest/core'

import {
  baseResolve,
  generateRuntimeModule,
  pkgResolve,
} from '#utils/helpers.ts'

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
    expect(result).toBe(pkgResolve('package.json'))
  })

  test('pkgResolve is one level above baseResolve', () => {
    const pkg = pkgResolve()
    const base = baseResolve()

    expect(pkg).toBe(path.dirname(base))
  })
})

describe('generateRuntimeModule', () => {
  let dir: string

  const mapKeys = (mods: Record<string, string>) =>
    [...mods['doom-@testMap'].matchAll(/'([^']+)':_\d+/g)].map((m) => m[1])

  beforeAll(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'doom-grm-'))
    // Written out of alphabetical order on purpose.
    fs.writeFileSync(path.join(dir, 'c.json'), JSON.stringify({ n: 'c' }))
    fs.writeFileSync(path.join(dir, 'a.json'), JSON.stringify({ n: 'a' }))
    fs.writeFileSync(path.join(dir, 'b.json'), JSON.stringify({ n: 'b' }))
  })

  afterAll(() => {
    fs.rmSync(dir, { recursive: true, force: true })
  })

  test('map keys are deterministically sorted', async () => {
    const mods = await generateRuntimeModule(['*.json'], 'test', dir, dir, true)

    expect(mapKeys(mods)).toEqual(['a.json', 'b.json', 'c.json'])
  })

  test('map key is relative to root, independent of process.cwd()', async () => {
    // `root === cwd === dir`, but `process.cwd()` is the repo root. The buggy
    // `path.relative(root, file)` would measure the relative file from
    // `process.cwd()` and produce a `../…` path; the key must stay `a.json`.
    const mods = await generateRuntimeModule(['a.json'], 'test', dir, dir, true)

    expect(mapKeys(mods)).toEqual(['a.json'])
    expect(mods['doom-@testMap']).not.toContain('..')
  })

  test('key stays relative to root when root is a parent of cwd', async () => {
    const parent = path.dirname(dir)
    const mods = await generateRuntimeModule(
      ['a.json'],
      'test',
      parent,
      dir,
      true,
    )

    expect(mapKeys(mods)).toEqual([path.join(path.basename(dir), 'a.json')])
  })

  test('empty patterns produce an empty map', async () => {
    const mods = await generateRuntimeModule([], 'test', dir, dir, true)

    expect(mods['doom-@testMap']).toBe('\nexport default {}')
  })

  test('mapper transforms each entry', async () => {
    const mods = await generateRuntimeModule<{ n: string }, { upper: string }>(
      ['a.json'],
      'test',
      dir,
      dir,
      true,
      (input) => ({ upper: input.n.toUpperCase() }),
    )

    expect(mods['doom-@test/a.json.mjs']).toContain('"upper":"A"')
  })
})
