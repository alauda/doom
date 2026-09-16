import type { PageIndexInfo } from '@rspress/core'
import { describe, expect, test } from '@rstest/core'

import { searchIndexPlugin } from '#plugins/search-index/index.ts'

const page = (overrides: Partial<PageIndexInfo> = {}) =>
  ({
    title: 'Page',
    content: '',
    toc: [],
    routePath: '/page',
    lang: 'en',
    version: '',
    frontmatter: {},
    ...overrides,
  }) as PageIndexInfo

const run = (pages: PageIndexInfo[], maxTokenLength?: number) => {
  const plugin = searchIndexPlugin(
    maxTokenLength == null ? undefined : { maxTokenLength },
  )
  plugin.modifySearchIndexData!(pages, true)
  return pages
}

/** A token long enough to trip the default limit of 64. */
const base64Blob =
  'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2Zw'.repeat(3)

describe('searchIndexPlugin', () => {
  describe('stripping oversized tokens', () => {
    test('replaces a token longer than the limit', () => {
      const [result] = run([page({ content: `icon: ${base64Blob} end` })])

      expect(result.content).not.toContain(base64Blob)
      expect(result.content).toBe('icon: … end')
    })

    test('leaves ordinary prose untouched', () => {
      const content =
        'The connector reconciles credentials and writes them to a Secret.'
      const [result] = run([page({ content })])

      expect(result.content).toBe(content)
    })

    test('keeps tokens exactly at the limit', () => {
      const exactly64 = 'a'.repeat(64)
      const [result] = run([page({ content: exactly64 })])

      expect(result.content).toBe(exactly64)
    })

    test('strips tokens one character over the limit', () => {
      const [result] = run([page({ content: 'a'.repeat(65) })])

      expect(result.content).toBe('…')
    })

    test('honours a custom limit', () => {
      const token = 'a'.repeat(20)
      const [kept] = run([page({ content: token })], 32)
      const [stripped] = run([page({ content: token })], 8)

      expect(kept.content).toBe(token)
      expect(stripped.content).toBe('…')
    })

    test('splits on non-alphanumerics the way the tokenizer does', () => {
      // Each run is short on its own; the whole string is long. Nothing should
      // be stripped, because no single *token* exceeds the limit.
      const content = Array.from({ length: 40 }, (_, i) => `word${i}`).join('-')
      const [result] = run([page({ content })])

      expect(result.content).toBe(content)
    })

    test('strips oversized tokens from the title too', () => {
      const [result] = run([page({ title: `Title ${base64Blob}` })])

      expect(result.title).toBe('Title …')
    })

    test('handles several tokens across several pages', () => {
      const pages = [
        page({ routePath: '/a', content: `a ${base64Blob} b ${base64Blob} c` }),
        page({ routePath: '/b', content: 'nothing to strip here' }),
      ]
      const [first, second] = run(pages)

      expect(first.content).toBe('a … b … c')
      expect(second.content).toBe('nothing to strip here')
    })
  })

  describe('CJK text is never stripped', () => {
    test('leaves a long unpunctuated Chinese run alone', () => {
      // 100 characters, no punctuation: matches \p{L}{65,} but must survive,
      // otherwise the text silently becomes unsearchable.
      const chinese = '连接器'.repeat(34)
      const [result] = run([page({ content: chinese })])

      expect(result.content).toBe(chinese)
    })

    test('leaves long Japanese and Korean runs alone', () => {
      const japanese = 'コネクタ'.repeat(20)
      const korean = '커넥터'.repeat(25)
      const [result] = run([page({ content: `${japanese} ${korean}` })])

      expect(result.content).toBe(`${japanese} ${korean}`)
    })

    test('still strips an ASCII blob sitting next to CJK text', () => {
      const [result] = run([page({ content: `连接器配置 ${base64Blob} 说明` })])

      expect(result.content).toBe('连接器配置 … 说明')
    })
  })

  describe('toc charIndex stays aligned with the shortened content', () => {
    test('shifts offsets that follow a stripped token', () => {
      const prefix = 'intro '
      const content = `${prefix}${base64Blob} Heading body`
      const headingAt = content.indexOf('Heading')
      const [result] = run([
        page({
          content,
          toc: [{ id: 'h', text: 'Heading', depth: 2, charIndex: headingAt }],
        }),
      ])

      // The heading must still sit where charIndex says it does.
      expect(result.toc[0].charIndex).toBe(result.content.indexOf('Heading'))
    })

    test('leaves offsets before the stripped token alone', () => {
      const content = `Early heading text ${base64Blob} tail`
      const [result] = run([
        page({
          content,
          toc: [{ id: 'e', text: 'Early', depth: 2, charIndex: 0 }],
        }),
      ])

      expect(result.toc[0].charIndex).toBe(0)
    })

    test('accumulates the shift across several stripped tokens', () => {
      const content = `a ${base64Blob} b ${base64Blob} Target`
      const targetAt = content.indexOf('Target')
      const [result] = run([
        page({
          content,
          toc: [{ id: 't', text: 'Target', depth: 2, charIndex: targetAt }],
        }),
      ])

      expect(result.toc[0].charIndex).toBe(result.content.indexOf('Target'))
    })

    test('preserves the -1 sentinel for headings with no known offset', () => {
      const [result] = run([
        page({
          content: `x ${base64Blob} y`,
          toc: [{ id: 'u', text: 'Unknown', depth: 2, charIndex: -1 }],
        }),
      ])

      expect(result.toc[0].charIndex).toBe(-1)
    })

    test('does not touch toc when nothing was stripped', () => {
      const toc = [{ id: 'k', text: 'Kept', depth: 2, charIndex: 7 }]
      const [result] = run([page({ content: 'plain content', toc })])

      expect(result.toc[0].charIndex).toBe(7)
    })
  })

  describe('edge cases', () => {
    test('tolerates a page with no content', () => {
      expect(() => run([page({ content: '' })])).not.toThrow()
    })

    test('tolerates a page with an empty toc', () => {
      const pages = [page({ content: `x ${base64Blob}`, toc: [] })]

      expect(() => run(pages)).not.toThrow()
      expect(pages[0].content).toBe('x …')
    })
  })
})
