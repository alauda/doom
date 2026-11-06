import { isExternalUrl } from '@rspress/shared'
import { describe, expect, test } from '@rstest/core'

import { shouldDownload } from '#runtime/components/_download-link.ts'

const newExtensions = ['.yaml', '.yml', '.json', '.tar']
const legacyExtensions = [
  '.ipynb',
  '.zip',
  '.tgz',
  '.tar.gz',
  '.sh',
  '.py',
  '.sql',
]

const newCases = newExtensions.flatMap((extension) => [
  { kind: 'root', href: `/files/example${extension}`, expected: true },
  {
    kind: 'https',
    href: `https://example.com/files/example${extension}`,
    expected: false,
  },
  {
    kind: 'protocol-relative root rule',
    href: `//cdn.example.com/files/example${extension}`,
    expected: true,
  },
  { kind: 'relative', href: `./files/example${extension}`, expected: false },
  {
    kind: 'uppercase root',
    href: `/files/example${extension.toUpperCase()}`,
    expected: true,
  },
  {
    kind: 'root query',
    href: `/files/example${extension}?raw=1`,
    expected: true,
  },
  {
    kind: 'root hash',
    href: `/files/example${extension}#example`,
    expected: true,
  },
  {
    kind: 'https uppercase query hash',
    href: `https://example.com/example${extension.toUpperCase()}?raw=1#example`,
    expected: false,
  },
  {
    kind: 'relative uppercase query hash',
    href: `../example${extension.toUpperCase()}?raw=1#example`,
    expected: false,
  },
])

const legacyCases = legacyExtensions.flatMap((extension) => [
  `/files/example${extension}`,
  `https://example.com/files/example${extension}`,
  `./files/example${extension}`,
])

describe('download links', () => {
  test.each(newCases)('new extension $kind: $href', ({ href, expected }) => {
    expect(shouldDownload(href, undefined)).toBe(expected)
  })

  test('uses the shared external-URL classification for protocol-relative URLs', () => {
    expect(isExternalUrl('//cdn.example.com/x.yaml')).toBe(false)
    expect(shouldDownload('//cdn.example.com/x.yaml', undefined)).toBe(true)
  })

  test.each(legacyCases)('keeps legacy link behavior for %s', (href) => {
    expect(shouldDownload(href, undefined)).toBe(true)
  })

  test.each([...newCases.map(({ href }) => href), ...legacyCases])(
    'keeps explicit download=false disabled for %s',
    (href) => {
      expect(shouldDownload(href, false)).toBe(false)
    },
  )

  test.each(['/guide', '/guide.html', '#example', '/files/example.txt'])(
    'keeps non-download links on the normal Link path: %s',
    (href) => {
      expect(shouldDownload(href, undefined)).toBe(false)
    },
  )
})
