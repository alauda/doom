import type { Root } from 'mdast'
import remarkFrontmatter from 'remark-frontmatter'
import remarkGfm from 'remark-gfm'
import remarkMdx from 'remark-mdx'
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'
import type { Plugin } from 'unified'
import { unified } from 'unified'
import { VFile } from 'vfile'

import doomLint from '#remark-lint/index.ts'

const processor = unified().use(remarkParse).use(remarkStringify)

export async function lint(rule: Plugin<[], Root, Root>, markdown: string) {
  const file = await processor()
    .use(remarkGfm)
    .use(remarkFrontmatter)
    .use(rule)
    .process(new VFile({ value: markdown, path: 'test.md' }))
  return file.messages
}

export async function lintMdx(rule: Plugin<[], Root, Root>, markdown: string) {
  const file = await processor()
    .use(remarkGfm)
    .use(remarkFrontmatter)
    .use(remarkMdx)
    .use(rule)
    .process(new VFile({ value: markdown, path: 'test.mdx' }))
  return file.messages
}

/**
 * Lints the way the real pipeline does — with `doomLint` (message control)
 * attached, which is what makes `<!-- lint disable -->` work.
 *
 * Rules behave identically either way; message control does not. It drops
 * messages that fall in a "gap", and a rule tested without it can pass every
 * case here while reporting nothing at all in production. Any rule whose
 * messages can land on a self-closing element, or at the end of a document,
 * wants a case run through this.
 */
export async function lintMdxPipeline(
  rule: Plugin<[], Root, Root>,
  markdown: string,
) {
  const file = await processor()
    .use(remarkGfm)
    .use(remarkFrontmatter)
    .use(remarkMdx)
    .use(doomLint)
    .use(rule)
    .process(new VFile({ value: markdown, path: 'test.mdx' }))
  return file.messages
}
