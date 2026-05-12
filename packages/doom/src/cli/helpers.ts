import fs from 'node:fs/promises'
import path from 'node:path'

import type { RootContent } from 'mdast'
import { glob } from 'tinyglobby'
import { visit } from 'unist-util-visit'
import { xfetch } from 'x-fetch'
import { parse, stringify } from 'yaml'

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

export const stringifyMatter = (frontmatter: object, content: string) =>
  '---\n' +
  stringify(frontmatter) +
  '---\n' +
  (content.startsWith('\n') ? content : '\n' + content)

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

const RELATIVE_FILE_META_REGEX =
  /(^|\s)(file)(\s*=\s*)(['"`]?)(\.\.?\/[^\s'"`]+)\4/g

export const translateCodeFile = (
  content: RootContent,
  { sourceBase, targetBase }: { sourceBase: string; targetBase: string },
) => {
  visit(content, 'code', (code) => {
    const nextMeta = code.meta?.replace(
      RELATIVE_FILE_META_REGEX,
      (
        _match: string,
        prefix: string,
        key: string,
        equals: string,
        quote: string,
        value: string,
      ) =>
        `${prefix}${key}${equals}${quote}${path.relative(targetBase, path.resolve(sourceBase, value))}${quote}`,
    )
    if (nextMeta !== code.meta) {
      code.meta = nextMeta
    }
  })
  return content
}
