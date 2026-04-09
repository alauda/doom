import { Root } from 'mdast'
import remarkFrontmatter from 'remark-frontmatter'
import remarkGfm from 'remark-gfm'
import remarkMdx from 'remark-mdx'
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'
import type { Plugin } from 'unified'
import { unified } from 'unified'
import { VFile } from 'vfile'

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
