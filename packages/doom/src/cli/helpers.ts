import fs from 'node:fs/promises'
import path from 'node:path'

import type { RootContent } from 'mdast'
import { glob } from 'tinyglobby'
import { visit } from 'unist-util-visit'
import { xfetch } from 'x-fetch'
import { parse } from 'yaml'

import { FALSY_VALUES, TRUTHY_VALUES } from '../shared/index.ts'
import type { NormalizedTermItem } from '../terms.ts'

export const parseBoolean = (value?: string) =>
  value === undefined || !FALSY_VALUES.has(value)

export const parseBooleanOrString = (value?: string) =>
  value === undefined ||
  (FALSY_VALUES.has(value) ? false : TRUTHY_VALUES.has(value) || value)

const DOC_PATTERN = /\.mdx?$/

export const isDoc = (filename: string) => DOC_PATTERN.test(filename)

export const getMatchedDocFilePaths = (matched: string[]) =>
  Promise.all(
    matched.map(async (it) => {
      const stat = await fs.stat(it)

      if (stat.isDirectory()) {
        return glob('**/*.md{,x}', {
          absolute: true,
          cwd: it,
        })
      }
      if (stat.isFile() && isDoc(it)) {
        return it
      }
      return []
    }),
  )

/**
 * Support custom id like `#hello world {#custom-id}`
 * Avoid https://mdxjs.com/docs/troubleshooting-mdx/#could-not-parse-expression-with-acorn-error
 * {@link https://github.com/web-infra-dev/rspress/blob/f3e6544780a371d7c629d8784f31dbcf28fb2b07/packages/core/src/node/utils/escapeHeadingIds.ts}
 */
export function escapeMarkdownHeadingIds(content: string): string {
  const markdownHeadingRegexp = /(?:^|\n)#{1,6}(?!#).*/g
  return content.replace(markdownHeadingRegexp, (substring) =>
    substring
      .replace('{#', '\\{#')
      // prevent duplicate escaping
      .replace('\\\\{#', '\\{#'),
  )
}

export const defaultGitHubUrl = (url: string) =>
  /^https?:\/\//.test(url)
    ? url
    : `https://github.com/${url.replace(/^(?:\/*github.com)?\/+/i, '')}`

const parseTerms_ = async () => {
  const terms = await xfetch(
    process.env.RAW_TERMS_URL ||
      'https://gitlab-ce.alauda.cn/alauda-public/product-doc-guide/-/raw/main/terms.yaml',
    { type: 'text' },
  )
  return parse(terms) as NormalizedTermItem[]
}

let parsedTermsCache: Promise<NormalizedTermItem[]> | undefined

export const parseTerms = () => (parsedTermsCache ??= parseTerms_())

const QUOTES = ['"', "'", '`']

export const translateCodeFile = (
  content: RootContent,
  { sourceBase, targetBase }: { sourceBase: string; targetBase: string },
) => {
  visit(content, 'code', (code) => {
    const meta = code.meta?.trim()
    if (!meta) {
      return
    }
    const list = meta.split(/\s+/)
    let changed = false
    for (const [index, item] of list.entries()) {
      let [key, value] = item.split('=')
      if (key !== 'file' || !value) {
        continue
      }
      let activeQuote = ''
      for (const quote of QUOTES) {
        if (value.startsWith(quote) && value.endsWith(quote)) {
          activeQuote = quote
          value = value.slice(1, -1)
          break
        }
      }
      // only translate relative paths, absolute paths should be kept unchanged
      if (!value.startsWith('./')) {
        break
      }
      list[index] =
        `file=${activeQuote}${path.relative(targetBase, path.resolve(sourceBase, value))}${activeQuote}`
      changed = true
    }
    if (changed) {
      code.meta = list.join(' ')
    }
  })
  return content
}
