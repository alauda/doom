import type { RspressPlugin } from '@rspress/core'

/**
 * Longest token kept in the search index, in characters.
 *
 * The browser-side search engine (FlexSearch) is configured by rspress with
 * `tokenize: 'full'`, which indexes *every substring* of every token. The cost
 * of a token therefore grows with the square of its length: a 12,000-character
 * token expands into ~70 million substrings and exhausts the tab's memory
 * before the index is finished.
 *
 * Real prose never reaches this length — the longest English words run about
 * 20-30 characters and long code identifiers about 40-50. Tokens above the
 * limit are invariably machine data that nobody searches for: base64 payloads,
 * hashes, JWTs.
 */
const DEFAULT_MAX_TOKEN_LENGTH = 64

/**
 * Stand-in for a stripped token. Must not be a letter or a digit, so that the
 * tokenizer treats it as a separator and no new token is produced.
 */
const PLACEHOLDER = '…'

/**
 * CJK characters are letters as far as `\p{L}` is concerned, so a long run of
 * Chinese/Japanese/Korean text with no punctuation matches the same pattern as
 * a base64 blob. Stripping it would silently make that text unsearchable, so
 * such runs are left alone — they are handled by the dedicated CJK index, which
 * splits them per character.
 */
const cjkRegExp =
  /[\u3131-\u314E\u314F-\u3163\uAC00-\uD7A3\u4E00-\u9FCC\u3400-\u4DB5\u3041-\u3096\u30A1-\u30FA]|[\uD840-\uD868][\uDC00-\uDFFF]/u

export interface SearchIndexPluginOptions {
  /** @default 64 */
  maxTokenLength?: number
}

interface Replacement {
  /** Offset of the replaced run in the original string. */
  at: number
  /** How many characters the string lost at that offset. */
  delta: number
}

const stripOversizedTokens = (
  text: string,
  pattern: RegExp,
  onHit: (length: number) => void,
) => {
  const replacements: Replacement[] = []
  let removed = 0

  const stripped = text.replace(pattern, (match, offset: number) => {
    if (cjkRegExp.test(match)) {
      return match
    }
    onHit(match.length)
    replacements.push({
      at: offset - removed,
      delta: match.length - PLACEHOLDER.length,
    })
    removed += match.length - PLACEHOLDER.length
    return PLACEHOLDER
  })

  return { stripped, replacements }
}

/**
 * `toc[].charIndex` points into `content`, and the search UI uses it to decide
 * which heading a hit belongs to. Shortening `content` without shifting these
 * offsets would attribute hits to the wrong section and link to the wrong
 * anchor, so every offset after a replacement moves back by the same amount.
 */
const shiftCharIndex = (charIndex: number, replacements: Replacement[]) => {
  if (charIndex < 0) {
    return charIndex
  }
  let shift = 0
  for (const { at, delta } of replacements) {
    if (at >= charIndex) {
      break
    }
    shift += delta
  }
  return charIndex - shift
}

/**
 * Keeps pathologically long tokens out of the browser-side search index.
 *
 * Without this, three pages of the connectors documentation — each embedding a
 * base64-encoded SVG icon inside a YAML sample — turned a 1.1 MB index file
 * into ~2 GB of browser memory and crashed the tab with `Out of Memory` as soon
 * as the user opened the search box. Stripping ~20,000 characters (2% of the
 * indexed text) brought that down to 72 MB.
 */
export const searchIndexPlugin = ({
  maxTokenLength = DEFAULT_MAX_TOKEN_LENGTH,
}: SearchIndexPluginOptions = {}): RspressPlugin => {
  // Mirrors FlexSearch's default word boundary: everything that is neither a
  // letter nor a digit separates tokens.
  const oversizedToken = new RegExp(
    String.raw`[\p{L}\p{N}]{${maxTokenLength + 1},}`,
    'gu',
  )

  return {
    name: 'doom-search-index',
    modifySearchIndexData(pages) {
      let strippedTokens = 0
      let strippedChars = 0
      let longest = 0
      let longestPage = ''
      const affectedPages: string[] = []

      for (const page of pages) {
        let pageTokens = 0
        const onHit = (length: number) => {
          pageTokens++
          strippedTokens++
          strippedChars += length
          if (length > longest) {
            longest = length
            longestPage = page.routePath
          }
        }

        if (page.content) {
          const { stripped, replacements } = stripOversizedTokens(
            page.content,
            oversizedToken,
            onHit,
          )
          if (replacements.length) {
            page.content = stripped
            page.toc = page.toc.map((header) => ({
              ...header,
              charIndex: shiftCharIndex(header.charIndex, replacements),
            }))
          }
        }

        if (page.title) {
          page.title = stripOversizedTokens(
            page.title,
            oversizedToken,
            onHit,
          ).stripped
        }

        if (pageTokens) {
          affectedPages.push(page.routePath)
        }
      }

      // Silence is the normal case. When something *was* stripped the author
      // should hear about it: it means machine data is sitting in the prose.
      if (strippedTokens) {
        console.warn(
          `[doom] search index: stripped ${strippedTokens} token(s) longer than ` +
            `${maxTokenLength} characters (${strippedChars} characters total) from ` +
            `${affectedPages.length} page(s). Longest was ${longest} characters in ` +
            `${longestPage}. Such tokens are usually base64 payloads or credentials ` +
            `pasted into code samples; they make the search index cost quadratic ` +
            `memory in the browser and are not searchable content.`,
        )
      }
    },
  }
}
