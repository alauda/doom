import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { afterEach, beforeEach, describe, expect, test } from '@rstest/core'

import { writeFileSafe } from '#html-export-pdf/utils/fs.ts'

describe('writeFileSafe', () => {
  let tempDir: string

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'doom-export-test-'))
  })

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true })
  })

  test('writes string content to file', async () => {
    const filePath = path.join(tempDir, 'test.txt')
    const content = 'Hello, World!'

    const result = await writeFileSafe(filePath, content)

    expect(result).toBe(true)
    const written = await fs.readFile(filePath, 'utf-8')
    expect(written).toBe(content)
  })

  test('writes buffer content to file', async () => {
    const filePath = path.join(tempDir, 'test.bin')
    const content = Buffer.from([0x48, 0x65, 0x6c, 0x6c, 0x6f])

    const result = await writeFileSafe(filePath, content)

    expect(result).toBe(true)
    const written = await fs.readFile(filePath)
    expect(written).toEqual(content)
  })

  test('writes Uint8Array content to file', async () => {
    const filePath = path.join(tempDir, 'test.bin')
    const content = new Uint8Array([1, 2, 3, 4, 5])

    const result = await writeFileSafe(filePath, content)

    expect(result).toBe(true)
    const written = await fs.readFile(filePath)
    expect(new Uint8Array(written)).toEqual(content)
  })

  test('creates nested directories if they do not exist', async () => {
    const filePath = path.join(tempDir, 'nested', 'deep', 'folder', 'test.txt')
    const content = 'nested content'

    const result = await writeFileSafe(filePath, content)

    expect(result).toBe(true)
    const written = await fs.readFile(filePath, 'utf-8')
    expect(written).toBe(content)
  })

  test('writes empty content by default', async () => {
    const filePath = path.join(tempDir, 'empty.txt')

    const result = await writeFileSafe(filePath)

    expect(result).toBe(true)
    const written = await fs.readFile(filePath, 'utf-8')
    expect(written).toBe('')
  })

  test('overwrites existing file', async () => {
    const filePath = path.join(tempDir, 'existing.txt')
    await fs.writeFile(filePath, 'original content')

    const result = await writeFileSafe(filePath, 'new content')

    expect(result).toBe(true)
    const written = await fs.readFile(filePath, 'utf-8')
    expect(written).toBe('new content')
  })

  test('writes to existing directory without creating it again', async () => {
    const subDir = path.join(tempDir, 'existing-dir')
    await fs.mkdir(subDir)
    const filePath = path.join(subDir, 'test.txt')

    const result = await writeFileSafe(filePath, 'content')

    expect(result).toBe(true)
    const written = await fs.readFile(filePath, 'utf-8')
    expect(written).toBe('content')
  })
})
