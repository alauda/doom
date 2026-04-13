import { afterEach, describe, expect, rstest, test } from '@rstest/core'
import type { Root } from 'mdast'
import remarkFrontmatter from 'remark-frontmatter'
import remarkParse from 'remark-parse'
import { unified } from 'unified'
import { red } from 'yoctocolors'

import type { ReferenceItem } from '#plugins/replace/types.ts'
import {
  getFrontmatterNode,
  normalizeReferenceItems,
  RELATIVE_URL_PATTERN,
} from '#plugins/replace/utils.ts'

const parser = unified().use(remarkParse).use(remarkFrontmatter, ['yaml'])

const parseMarkdownWithFrontmatter = (markdown: string): Root => {
  return parser.parse(markdown)
}

describe('normalizeReferenceItems', () => {
  const consoleError = console.error

  afterEach(() => {
    console.error = consoleError
  })

  test('returns empty object for empty array', () => {
    const result = normalizeReferenceItems([])

    expect(result).toEqual({})
  })

  test('normalizes single source with path only', () => {
    const items: ReferenceItem[] = [
      {
        sources: [
          {
            name: 'api-docs',
            path: '/path/to/file.md',
          },
        ],
      },
    ]

    const result = normalizeReferenceItems(items)

    expect(result['api-docs']).toBeDefined()
    expect(result['api-docs'].path).toBe('/path/to/file.md')
    expect(result['api-docs'].anchor).toBeUndefined()
  })

  test('splits path and anchor when present', () => {
    const items: ReferenceItem[] = [
      {
        sources: [
          {
            name: 'api-section',
            path: '/path/to/file.md#section-id',
          },
        ],
      },
    ]

    const result = normalizeReferenceItems(items)

    expect(result['api-section'].path).toBe('/path/to/file.md')
    expect(result['api-section'].anchor).toBe('section-id')
  })

  test('includes remote metadata (repo, branch, publicBase)', () => {
    const items: ReferenceItem[] = [
      {
        repo: 'alauda/doom',
        branch: 'main',
        publicBase: 'https://example.com',
        sources: [
          {
            name: 'remote-api',
            path: '/api.md',
          },
        ],
      },
    ]

    const result = normalizeReferenceItems(items)

    expect(result['remote-api'].repo).toBe('alauda/doom')
    expect(result['remote-api'].branch).toBe('main')
    expect(result['remote-api'].publicBase).toBe('https://example.com')
  })

  test('preserves source properties (ignoreHeading, frontmatterMode)', () => {
    const items: ReferenceItem[] = [
      {
        sources: [
          {
            name: 'config-api',
            path: '/config.md',
            ignoreHeading: true,
            frontmatterMode: 'merge',
          },
        ],
      },
    ]

    const result = normalizeReferenceItems(items)

    expect(result['config-api'].ignoreHeading).toBe(true)
    expect(result['config-api'].frontmatterMode).toBe('merge')
  })

  test('handles multiple sources from single item', () => {
    const items: ReferenceItem[] = [
      {
        repo: 'test/repo',
        sources: [
          {
            name: 'api-v1',
            path: '/v1/api.md',
          },
          {
            name: 'api-v2',
            path: '/v2/api.md#features',
          },
        ],
      },
    ]

    const result = normalizeReferenceItems(items)

    expect(result['api-v1']).toBeDefined()
    expect(result['api-v2']).toBeDefined()
    expect(result['api-v2'].anchor).toBe('features')
  })

  test('overwrites earlier entry on duplicate source name', () => {
    const items: ReferenceItem[] = [
      {
        sources: [
          {
            name: 'config',
            path: '/first.md',
          },
          {
            name: 'config',
            path: '/second.md#anchor',
          },
        ],
      },
    ]

    console.error = rstest.fn()

    const result = normalizeReferenceItems(items)

    expect(result['config'].path).toBe('/second.md')
    expect(result['config'].anchor).toBe('anchor')

    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining(
        `Duplicate source name \`${red('config')}\` will be deduplicated`,
      ),
    )
  })

  test('handles multiple items with different repos', () => {
    const items: ReferenceItem[] = [
      {
        repo: 'repo1',
        sources: [{ name: 'api1', path: '/api.md' }],
      },
      {
        repo: 'repo2',
        sources: [{ name: 'api2', path: '/api.md' }],
      },
    ]

    const result = normalizeReferenceItems(items)

    expect(result['api1'].repo).toBe('repo1')
    expect(result['api2'].repo).toBe('repo2')
  })
})

describe('getFrontmatterNode', () => {
  test('returns frontmatter node when present at start', () => {
    const markdown = '---\ntitle: Test\n---\n\n# Content'
    const tree = parseMarkdownWithFrontmatter(markdown)

    const frontmatter = getFrontmatterNode(tree)

    expect(frontmatter).toBeDefined()
    expect(frontmatter?.type).toBe('yaml')
  })

  test('returns undefined when no frontmatter at start', () => {
    const markdown = '# Content\n\nSome text'
    const tree = parseMarkdownWithFrontmatter(markdown)

    const frontmatter = getFrontmatterNode(tree)

    expect(frontmatter).toBeUndefined()
  })

  test('returns undefined when frontmatter not first child', () => {
    const markdown = '# Heading\n\n---\ntitle: Test\n---'
    const tree = parseMarkdownWithFrontmatter(markdown)

    const frontmatter = getFrontmatterNode(tree)

    expect(frontmatter).toBeUndefined()
  })

  test('returns frontmatter with content preserved', () => {
    const markdown =
      '---\nkey: value\nlist:\n  - item1\n  - item2\n---\n\nContent'
    const tree = parseMarkdownWithFrontmatter(markdown)

    const frontmatter = getFrontmatterNode(tree)

    expect(frontmatter).toBeDefined()
    expect(frontmatter?.type).toBe('yaml')
    expect(frontmatter?.value).toBeTruthy()
  })

  test('returns undefined when content is empty', () => {
    const markdown = ''
    const tree = parseMarkdownWithFrontmatter(markdown)

    const frontmatter = getFrontmatterNode(tree)

    expect(frontmatter).toBeUndefined()
  })
})

describe('RELATIVE_URL_PATTERN', () => {
  test('matches paths starting with ./', () => {
    expect(RELATIVE_URL_PATTERN.test('./file.md')).toBe(true)
    expect(RELATIVE_URL_PATTERN.test('./path/to/file.md')).toBe(true)
  })

  test('matches paths starting with ../', () => {
    expect(RELATIVE_URL_PATTERN.test('../file.md')).toBe(true)
    expect(RELATIVE_URL_PATTERN.test('../parent/file.md')).toBe(true)
    expect(RELATIVE_URL_PATTERN.test('../../grandparent/file.md')).toBe(true)
  })

  test('does not match absolute paths', () => {
    expect(RELATIVE_URL_PATTERN.test('/absolute/path.md')).toBe(false)
  })

  test('does not match paths without leading dot', () => {
    expect(RELATIVE_URL_PATTERN.test('path/to/file.md')).toBe(false)
    expect(RELATIVE_URL_PATTERN.test('file.md')).toBe(false)
  })

  test('does not match URLs', () => {
    expect(RELATIVE_URL_PATTERN.test('https://example.com/file.md')).toBe(false)
    expect(RELATIVE_URL_PATTERN.test('http://example.com/file.md')).toBe(false)
  })

  test('does not match standalone dots', () => {
    expect(RELATIVE_URL_PATTERN.test('.')).toBe(false)
    expect(RELATIVE_URL_PATTERN.test('..')).toBe(false)
  })
})

describe('RELATIVE_URL_PATTERN', () => {
  test('matches paths starting with ./', () => {
    expect(RELATIVE_URL_PATTERN.test('./file.md')).toBe(true)
    expect(RELATIVE_URL_PATTERN.test('./path/to/file.md')).toBe(true)
  })

  test('matches paths starting with ../', () => {
    expect(RELATIVE_URL_PATTERN.test('../file.md')).toBe(true)
    expect(RELATIVE_URL_PATTERN.test('../parent/file.md')).toBe(true)
    expect(RELATIVE_URL_PATTERN.test('../../grandparent/file.md')).toBe(true)
  })

  test('does not match absolute paths', () => {
    expect(RELATIVE_URL_PATTERN.test('/absolute/path.md')).toBe(false)
  })

  test('does not match paths without leading dot', () => {
    expect(RELATIVE_URL_PATTERN.test('path/to/file.md')).toBe(false)
    expect(RELATIVE_URL_PATTERN.test('file.md')).toBe(false)
  })

  test('does not match URLs', () => {
    expect(RELATIVE_URL_PATTERN.test('https://example.com/file.md')).toBe(false)
    expect(RELATIVE_URL_PATTERN.test('http://example.com/file.md')).toBe(false)
  })

  test('does not match standalone dots', () => {
    expect(RELATIVE_URL_PATTERN.test('.')).toBe(false)
    expect(RELATIVE_URL_PATTERN.test('..')).toBe(false)
  })
})
