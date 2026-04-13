import { describe, expect, test } from '@rstest/core'

import {
  getPdfName,
  getUnversionedVersion,
  isExplicitlyUnversioned,
  isUnversioned,
  matchNavbar,
  normalizeSlash,
  removeBothEndsSlashes,
  withoutBase,
} from '#shared/helpers.ts'

describe('removeBothEndsSlashes', () => {
  test('removes leading slash', () => {
    expect(removeBothEndsSlashes('/hello')).toBe('hello')
  })

  test('removes trailing slash', () => {
    expect(removeBothEndsSlashes('hello/')).toBe('hello')
  })

  test('removes both leading and trailing slashes', () => {
    expect(removeBothEndsSlashes('/hello/')).toBe('hello')
  })

  test('keeps internal slashes', () => {
    expect(removeBothEndsSlashes('/hello/world/')).toBe('hello/world')
  })

  test('returns empty string for undefined', () => {
    expect(removeBothEndsSlashes(undefined)).toBe('')
  })

  test('returns empty string for empty string', () => {
    expect(removeBothEndsSlashes('')).toBe('')
  })

  test('handles single slash', () => {
    expect(removeBothEndsSlashes('/')).toBe('')
  })
})

describe('getPdfName', () => {
  test('generates pdf name with base', () => {
    expect(getPdfName('en', '/docs')).toBe('/docs-en.pdf')
  })

  test('generates pdf name with title when no base', () => {
    expect(getPdfName('zh', undefined, 'my-docs')).toBe('/my-docs-zh.pdf')
  })

  test('uses exported as fallback', () => {
    expect(getPdfName('en')).toBe('/exported-en.pdf')
  })

  test('strips slashes from base', () => {
    expect(getPdfName('en', '/my/docs/')).toBe('/my/docs-en.pdf')
  })

  test('handles empty base', () => {
    expect(getPdfName('zh', '', 'title')).toBe('/title-zh.pdf')
  })
})

describe('isExplicitlyUnversioned', () => {
  test('returns true for unversioned', () => {
    expect(isExplicitlyUnversioned('unversioned')).toBe(true)
  })

  test('returns true for unversioned- prefix', () => {
    expect(isExplicitlyUnversioned('unversioned-foo')).toBe(true)
  })

  test('returns false for regular version', () => {
    expect(isExplicitlyUnversioned('v1.0.0')).toBe(false)
  })

  test('returns false for undefined', () => {
    expect(isExplicitlyUnversioned(undefined)).toBe(false)
  })
})

describe('isUnversioned', () => {
  test('returns true for undefined', () => {
    expect(isUnversioned(undefined)).toBe(true)
  })

  test('returns true for empty string', () => {
    expect(isUnversioned('')).toBe(true)
  })

  test('returns true for unversioned', () => {
    expect(isUnversioned('unversioned')).toBe(true)
  })

  test('returns true for unversioned- prefix', () => {
    expect(isUnversioned('unversioned-v2')).toBe(true)
  })

  test('returns false for regular version', () => {
    expect(isUnversioned('v1.0.0')).toBe(false)
  })
})

describe('getUnversionedVersion', () => {
  test('returns undefined for empty string', () => {
    expect(getUnversionedVersion('')).toBeUndefined()
  })

  test('returns undefined for unversioned', () => {
    expect(getUnversionedVersion('unversioned')).toBeUndefined()
  })

  test('extracts version from unversioned- prefix', () => {
    expect(getUnversionedVersion('unversioned-v2.0')).toBe('v2.0')
  })

  test('returns version as-is for regular versions', () => {
    expect(getUnversionedVersion('v1.0.0')).toBe('v1.0.0')
  })

  test('returns undefined for undefined input', () => {
    expect(getUnversionedVersion(undefined)).toBeUndefined()
  })
})

describe('normalizeSlash', () => {
  test('adds leading slash', () => {
    expect(normalizeSlash('path')).toBe('/path')
  })

  test('removes trailing slash', () => {
    expect(normalizeSlash('path/')).toBe('/path')
  })

  test('normalizes both', () => {
    expect(normalizeSlash('path/')).toBe('/path')
  })

  test('handles already normalized path', () => {
    expect(normalizeSlash('/path')).toBe('/path')
  })

  test('handles path with internal slashes', () => {
    expect(normalizeSlash('a/b/c/')).toBe('/a/b/c')
  })
})

describe('withoutBase', () => {
  test('removes base from path', () => {
    expect(withoutBase('/docs/page', '/docs')).toBe('/page')
  })

  test('handles paths without base', () => {
    expect(withoutBase('/page', '/other')).toBe('/page')
  })

  test('normalizes input path', () => {
    expect(withoutBase('docs/page', '/docs')).toBe('/page')
  })
})

describe('matchNavbar', () => {
  test('matches using link', () => {
    const item = { link: '/docs', text: 'Docs' }
    expect(matchNavbar(item, '/base/docs/page', '/base')).toBe(true)
  })

  test('does not match unrelated path', () => {
    const item = { link: '/docs', text: 'Docs' }
    expect(matchNavbar(item, '/base/other', '/base')).toBe(false)
  })

  test('uses activeMatch over link when provided', () => {
    const item = { link: '/docs', text: 'Docs', activeMatch: '^/guides' }
    expect(matchNavbar(item, '/base/guides/getting-started', '/base')).toBe(
      true,
    )
    expect(matchNavbar(item, '/base/docs/intro', '/base')).toBe(false)
  })

  test('supports regex patterns in activeMatch', () => {
    const item = { link: '/docs', text: 'Docs', activeMatch: '/docs/(api|ref)' }
    expect(matchNavbar(item, '/base/docs/api/v1', '/base')).toBe(true)
    expect(matchNavbar(item, '/base/docs/ref/class', '/base')).toBe(true)
    expect(matchNavbar(item, '/base/docs/intro', '/base')).toBe(false)
  })
})
