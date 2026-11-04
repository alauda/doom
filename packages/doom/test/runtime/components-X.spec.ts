import { describe, expect, test } from '@rstest/core'

import {
  isDownloadablePath,
  shouldDownload,
} from '#runtime/components/_download-link.ts'

describe('download links', () => {
  test.each([
    '.ipynb',
    '.zip',
    '.tgz',
    '.tar.gz',
    '.sh',
    '.py',
    '.sql',
    '.yaml',
    '.yml',
    '.json',
    '.tar',
  ])('adds download to %s links', (extension) => {
    expect(isDownloadablePath(`/files/example${extension}`)).toBe(true)
  })

  test('recognizes a new extension with uppercase letters, query, and hash', () => {
    expect(isDownloadablePath('/files/config.YAML?raw=1#example')).toBe(true)
  })

  test('keeps explicit download=false disabled', () => {
    expect(shouldDownload('/files/config.yaml', false)).toBe(false)
  })

  test('keeps external URLs unchanged while enabling download', () => {
    const href = 'https://example.com/files/config.json?raw=1#example'
    expect(shouldDownload(href, undefined)).toBe(true)
  })
})
