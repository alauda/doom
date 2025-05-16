import fs from 'node:fs/promises'

import { glob } from 'tinyglobby'
import { xfetch } from 'x-fetch'
import { parse } from 'yaml'

import { FALSY_VALUES } from '../shared/index.js'
import type { NormalizedTermItem } from '../terms.js'

export const parseBoolean = (value: string) =>
  !!value && !FALSY_VALUES.has(value)

const DOC_PATTERN = /\.mdx?$/

const isDoc = (filename: string) => DOC_PATTERN.test(filename)

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
    : `https://github.com/${url.replace(/^(\/*github.com)?\/+/i, '')}`

const parseTerms_ = async () => {
  const terms = await xfetch(
    'https://gitlab-ce.alauda.cn/alauda-public/product-doc-guide/-/raw/main/terms.yaml',
    { type: 'text' },
  )
  return parse(terms) as NormalizedTermItem[]
}

let parsedTermsCache: Promise<NormalizedTermItem[]> | undefined

export const parseTerms = () => (parsedTermsCache ??= parseTerms_())
