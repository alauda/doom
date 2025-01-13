import { logger } from '@rspress/shared/logger'
import type { Root, YAML } from 'mdast'
import type { MdxjsEsm } from 'mdast-util-mdxjs-esm'
import remarkFrontmatter from 'remark-frontmatter'
import remarkGfm from 'remark-gfm'
import remarkMdx from 'remark-mdx'
import remarkParse from 'remark-parse'
import remarkStringify, { type Options } from 'remark-stringify'
import { unified } from 'unified'
import { red } from 'yoctocolors'

import type { NormalizedReferenceSource, ReferenceItem } from './types.js'

/**
 * hello world {#custom-id} -> { text: 'hello world', id: 'custom-id' }
 */
export const extractTextAndId = (title: string) => {
  const customIdReg = /{#.*}/
  const text = title.replace(customIdReg, '').trimEnd()
  const customId = title.match(customIdReg)?.[0]?.slice(2, -1) || ''
  return [text, customId]
}

export const normalizeReferenceItems = (items: ReferenceItem[]) =>
  items.reduce<Record<string, NormalizedReferenceSource>>((acc, curr) => {
    for (const source of curr.sources) {
      if (source.name in acc) {
        logger.error(
          `Duplicate source name \`${red(source.name)}\` will be deduplicated`,
        )
      }
      const repo = curr.repo
      const extra: { repo?: string; slug?: string } = {}
      if (repo) {
        const url = new URL(repo, 'https://gitlab-ce.alauda.cn')
        extra.repo = url.toString()
        extra.slug = url.pathname.slice(1)
      }
      const [path, anchor] = source.path.split('#')
      acc[source.name] = {
        ...source,
        ...extra,
        publicBase: curr.publicBase,
        path,
        anchor,
      }
    }
    return acc
  }, {})

// Construct import statement for AST
// Such as: import image1 from './test.png'
export const getASTNodeImport = (name: string, from: string) =>
  ({
    type: 'mdxjsEsm',
    value: `import ${name} from ${JSON.stringify(from)}`,
    data: {
      estree: {
        type: 'Program',
        sourceType: 'module',
        body: [
          {
            type: 'ImportDeclaration',
            specifiers: [
              {
                type: 'ImportDefaultSpecifier',
                local: { type: 'Identifier', name },
              },
            ],
            source: {
              type: 'Literal',
              value: from,
              raw: JSON.stringify(from),
            },
          },
        ],
      },
    },
  }) as MdxjsEsm

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
