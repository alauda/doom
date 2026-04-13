import { describe, expect, test } from '@rstest/core'

import {
  defaultGitHubUrl,
  escapeMarkdownHeadingIds,
  isDoc,
  parseBoolean,
  parseBooleanOrString,
} from '#cli/helpers.ts'

describe('parseBoolean', () => {
  test('returns true for undefined', () => {
    expect(parseBoolean(undefined)).toBe(true)
  })

  test('returns false for "false"', () => {
    expect(parseBoolean('false')).toBe(false)
  })

  test('returns false for "0"', () => {
    expect(parseBoolean('0')).toBe(false)
  })

  test('returns false for "no"', () => {
    expect(parseBoolean('no')).toBe(false)
  })

  test('returns false for "off"', () => {
    expect(parseBoolean('off')).toBe(false)
  })

  test('returns false for "n"', () => {
    expect(parseBoolean('n')).toBe(false)
  })

  test('returns false for "f"', () => {
    expect(parseBoolean('f')).toBe(false)
  })

  test('returns true for "true"', () => {
    expect(parseBoolean('true')).toBe(true)
  })

  test('returns true for "1"', () => {
    expect(parseBoolean('1')).toBe(true)
  })

  test('returns true for arbitrary non-falsy string', () => {
    expect(parseBoolean('anything')).toBe(true)
  })
})

describe('parseBooleanOrString', () => {
  test('returns true for undefined', () => {
    expect(parseBooleanOrString(undefined)).toBe(true)
  })

  test('returns false for falsy values', () => {
    expect(parseBooleanOrString('false')).toBe(false)
    expect(parseBooleanOrString('0')).toBe(false)
    expect(parseBooleanOrString('no')).toBe(false)
  })

  test('returns true for truthy values', () => {
    expect(parseBooleanOrString('true')).toBe(true)
    expect(parseBooleanOrString('1')).toBe(true)
    expect(parseBooleanOrString('yes')).toBe(true)
    expect(parseBooleanOrString('on')).toBe(true)
    expect(parseBooleanOrString('y')).toBe(true)
    expect(parseBooleanOrString('t')).toBe(true)
  })

  test('returns string value for non-boolean strings', () => {
    expect(parseBooleanOrString('custom-value')).toBe('custom-value')
    expect(parseBooleanOrString('path/to/file')).toBe('path/to/file')
  })
})

describe('isDoc', () => {
  test('returns true for .md files', () => {
    expect(isDoc('file.md')).toBe(true)
    expect(isDoc('path/to/file.md')).toBe(true)
  })

  test('returns true for .mdx files', () => {
    expect(isDoc('file.mdx')).toBe(true)
    expect(isDoc('path/to/file.mdx')).toBe(true)
  })

  test('returns false for non-doc files', () => {
    expect(isDoc('file.ts')).toBe(false)
    expect(isDoc('file.js')).toBe(false)
    expect(isDoc('file.txt')).toBe(false)
    expect(isDoc('file.json')).toBe(false)
  })

  test('returns false for files with md in the name but different extension', () => {
    expect(isDoc('markdown.txt')).toBe(false)
    expect(isDoc('mdx-file.js')).toBe(false)
  })
})

describe('escapeMarkdownHeadingIds', () => {
  test('escapes custom heading IDs', () => {
    const input = '# Hello World {#custom-id}'
    const expected = '# Hello World \\{#custom-id}'
    expect(escapeMarkdownHeadingIds(input)).toBe(expected)
  })

  test('escapes multiple heading IDs', () => {
    const input = '# First {#first-id}\n## Second {#second-id}'
    const expected = '# First \\{#first-id}\n## Second \\{#second-id}'
    expect(escapeMarkdownHeadingIds(input)).toBe(expected)
  })

  test('does not double escape already escaped IDs', () => {
    const input = '# Hello \\{#already-escaped}'
    const expected = '# Hello \\{#already-escaped}'
    expect(escapeMarkdownHeadingIds(input)).toBe(expected)
  })

  test('preserves content without heading IDs', () => {
    const input = '# Regular Heading\n\nSome content.'
    expect(escapeMarkdownHeadingIds(input)).toBe(input)
  })

  test('handles all heading levels', () => {
    const input =
      '# H1 {#h1}\n## H2 {#h2}\n### H3 {#h3}\n#### H4 {#h4}\n##### H5 {#h5}\n###### H6 {#h6}'
    const expected =
      '# H1 \\{#h1}\n## H2 \\{#h2}\n### H3 \\{#h3}\n#### H4 \\{#h4}\n##### H5 \\{#h5}\n###### H6 \\{#h6}'
    expect(escapeMarkdownHeadingIds(input)).toBe(expected)
  })
})

describe('defaultGitHubUrl', () => {
  test('returns url as-is if already has protocol', () => {
    expect(defaultGitHubUrl('https://github.com/user/repo')).toBe(
      'https://github.com/user/repo',
    )
    expect(defaultGitHubUrl('http://github.com/user/repo')).toBe(
      'http://github.com/user/repo',
    )
  })

  test('adds https://github.com/ prefix for short paths', () => {
    expect(defaultGitHubUrl('user/repo')).toBe('https://github.com/user/repo')
  })

  test('handles leading slashes', () => {
    expect(defaultGitHubUrl('/user/repo')).toBe('https://github.com/user/repo')
    expect(defaultGitHubUrl('//user/repo')).toBe('https://github.com/user/repo')
  })

  test('handles github.com prefix without protocol', () => {
    expect(defaultGitHubUrl('github.com/user/repo')).toBe(
      'https://github.com/user/repo',
    )
    expect(defaultGitHubUrl('/github.com/user/repo')).toBe(
      'https://github.com/user/repo',
    )
  })
})
