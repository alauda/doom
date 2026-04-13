import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { afterEach, beforeEach, describe, expect, test } from '@rstest/core'

import { pathExists, readJson } from '#utils/fs.ts'

describe('pathExists', () => {
  let tempDir: string

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'doom-test-'))
  })

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true })
  })

  test('returns true for existing file', async () => {
    const filePath = path.join(tempDir, 'test.txt')
    await fs.writeFile(filePath, 'test')

    expect(await pathExists(filePath)).toBe(true)
  })

  test('returns true for existing directory', async () => {
    const dirPath = path.join(tempDir, 'subdir')
    await fs.mkdir(dirPath)

    expect(await pathExists(dirPath)).toBe(true)
  })

  test('returns false for non-existing path', async () => {
    const fakePath = path.join(tempDir, 'nonexistent')

    expect(await pathExists(fakePath)).toBe(false)
  })

  test('returns true when file matches type "file"', async () => {
    const filePath = path.join(tempDir, 'test.txt')
    await fs.writeFile(filePath, 'test')

    expect(await pathExists(filePath, 'file')).toBe(true)
  })

  test('returns false when directory does not match type "file"', async () => {
    const dirPath = path.join(tempDir, 'subdir')
    await fs.mkdir(dirPath)

    expect(await pathExists(dirPath, 'file')).toBe(false)
  })

  test('returns true when directory matches type "directory"', async () => {
    const dirPath = path.join(tempDir, 'subdir')
    await fs.mkdir(dirPath)

    expect(await pathExists(dirPath, 'directory')).toBe(true)
  })

  test('returns false when file does not match type "directory"', async () => {
    const filePath = path.join(tempDir, 'test.txt')
    await fs.writeFile(filePath, 'test')

    expect(await pathExists(filePath, 'directory')).toBe(false)
  })
})

describe('readJson', () => {
  let tempDir: string

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'doom-test-'))
  })

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true })
  })

  test('reads and parses JSON file', async () => {
    const filePath = path.join(tempDir, 'test.json')
    const data = { name: 'test', version: '1.0.0' }
    await fs.writeFile(filePath, JSON.stringify(data))

    const result = await readJson<typeof data>(filePath)
    expect(result).toEqual(data)
  })

  test('reads JSON with nested objects', async () => {
    const filePath = path.join(tempDir, 'nested.json')
    const data = {
      level1: {
        level2: {
          value: 42,
        },
      },
    }
    await fs.writeFile(filePath, JSON.stringify(data))

    const result = await readJson<typeof data>(filePath)
    expect(result.level1.level2.value).toBe(42)
  })

  test('reads JSON array', async () => {
    const filePath = path.join(tempDir, 'array.json')
    const data = [1, 2, 3, 'test']
    await fs.writeFile(filePath, JSON.stringify(data))

    const result = await readJson<typeof data>(filePath)
    expect(result).toEqual(data)
  })

  test('throws error for invalid JSON', async () => {
    const filePath = path.join(tempDir, 'invalid.json')
    await fs.writeFile(filePath, 'not valid json')

    await expect(readJson(filePath)).rejects.toThrow()
  })

  test('throws error for non-existing file', async () => {
    const filePath = path.join(tempDir, 'nonexistent.json')

    await expect(readJson(filePath)).rejects.toThrow()
  })
})
