import fs from 'node:fs/promises'
import path from 'node:path'

import type { Code, Root, RootContent } from 'mdast'
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

export interface CodeBlockPlaceholder {
  node: Code
  placeholder: string
}

const CODE_BLOCK_PLACEHOLDER_PREFIX = '__DOOM_TRANSLATE_CODE_BLOCK_'
const CODE_BLOCK_PLACEHOLDER_PATTERN = new RegExp(
  `^${CODE_BLOCK_PLACEHOLDER_PREFIX}(\\d+)__$`,
)

const getCodeBlockPlaceholderIndex = (value: string) => {
  const match = CODE_BLOCK_PLACEHOLDER_PATTERN.exec(value)
  if (!match) {
    return
  }
  return +match[1]
}

export const replaceCodeBlocksWithPlaceholders = (
  content: Root | RootContent,
) => {
  const placeholders: CodeBlockPlaceholder[] = []

  visit(content, 'code', (code) => {
    if (code.value.length <= 50) {
      return
    }

    const placeholder = `${CODE_BLOCK_PLACEHOLDER_PREFIX}${placeholders.length}__`
    placeholders.push({
      node: { ...code },
      placeholder,
    })

    code.value = placeholder
    delete code.lang
    delete code.meta
  })

  return placeholders
}

export const restoreCodeBlockPlaceholders = (
  content: Root | RootContent,
  placeholders: readonly CodeBlockPlaceholder[],
) => {
  visit(content, 'code', (code) => {
    const value = code.value.trim()
    const index = getCodeBlockPlaceholderIndex(value)
    if (index == null) {
      return
    }

    const placeholder = placeholders.at(index)
    if (!placeholder || placeholder.placeholder !== value) {
      throw new Error(`Unmatched code block placeholder: ${value}`)
    }

    Object.assign(code, placeholder.node)
  })

  return content
}
