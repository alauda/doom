import fs from 'node:fs/promises'

import { glob } from 'tinyglobby'

import { FALSY_VALUES, isDoc } from '../shared/index.js'

export const parseBoolean = (value: string) =>
  !!value && !FALSY_VALUES.has(value)

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
