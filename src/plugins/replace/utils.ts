import { logger } from '@rspress/shared/logger'
import type { Root, YAML } from 'mdast'
import remarkFrontmatter from 'remark-frontmatter'
import remarkGfm from 'remark-gfm'
import remarkMdx from 'remark-mdx'
import remarkParse from 'remark-parse'
import remarkStringify, { type Options } from 'remark-stringify'
import { unified } from 'unified'
import { red } from 'yoctocolors'

import type { NormalizedReferenceSource, ReferenceItem } from './types.js'

export const RELATIVE_URL_PATTERN = /^\.\.?\//

/**
 * hello world {#custom-id} -> { text: 'hello world', id: 'custom-id' }
 */
export const extractTextAndId = (title: string) => {
  const customIdReg = /\\?{#.*}/
  const text = title.replace(customIdReg, '').trimEnd()
  const customId = title.match(customIdReg)?.[0]?.slice(2, -1) || ''
  return [text, customId]
}

export const normalizeReferenceItems = (items: ReferenceItem[] = []) =>
  items.reduce<Record<string, NormalizedReferenceSource>>((acc, curr) => {
    for (const source of curr.sources) {
      if (source.name in acc) {
        logger.error(
          `Duplicate source name \`${red(source.name)}\` will be deduplicated`,
        )
      }
      const { repo, branch, publicBase } = curr
      const [path, anchor] = source.path.split('#')
      acc[source.name] = {
        ...source,
        repo,
        branch,
        publicBase,
        path,
        anchor,
      }
    }
    return acc
  }, {})

export const stringifySettings: Options = {
  bullet: '-',
  listItemIndent: 'one',
  rule: '-',
  tightDefinitions: true,
}

export const mdProcessor = unified()
  .use(remarkParse)
  .use(remarkFrontmatter)
  .use(remarkGfm)
  .use(remarkStringify, stringifySettings)
  .freeze()

export const mdxProcessor = mdProcessor().use(remarkMdx).freeze()

export const getFrontmatterNode = (ast: Root): YAML | undefined => {
  const firstNode = ast.children[0]
  return firstNode.type === 'yaml' ? firstNode : undefined
}

const { CI } = process.env

export const isCI = CI !== 'false' && !!CI
