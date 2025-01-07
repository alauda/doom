import { logger } from '@rspress/shared/logger'
import type { Content, Parent, Root } from 'mdast'
import type { MdxjsEsm } from 'mdast-util-mdxjs-esm'
import remarkFrontmatter from 'remark-frontmatter'
import remarkGfm from 'remark-gfm'
import remarkMdx from 'remark-mdx'
import remarkParse from 'remark-parse'
import { unified } from 'unified'
import type { Node } from 'unist'
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
        path,
        anchor,
      }
    }
    return acc
  }, {})

export const flatMap = async (
  root: Root,
  fn: (
    node: Node,
    index: number,
    parent: Parent | null,
  ) => Promise<Node | Node[] | undefined> | Node | Node[] | undefined,
) => {
  const transformed = await transform(root, 0, null)

  if (!transformed) {
    return root
  }

  return (Array.isArray(transformed) ? transformed[0] : transformed) as Root

  async function transform(
    node: Node | Parent,
    index: number,
    parent: Parent | null,
  ) {
    if ('children' in node && node.children.length) {
      const out: Content[] = []
      for (let i = 0, n = node.children.length; i < n; i++) {
        const child = node.children[i]
        let xs = await transform(child, i, node)
        if (xs) {
          xs = Array.isArray(xs) ? xs : [xs]
          for (let j = 0, m = xs.length; j < m; j++) {
            out.push(xs[j] as Content)
          }
        } else {
          out.push(child)
        }
      }
      node.children = out
    }
    return fn(node, index, parent)
  }
}

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

export const mdProcessor = unified()
  .use(remarkParse)
  .use(remarkFrontmatter)
  .use(remarkGfm)
  .freeze()

export const mdxProcessor = mdProcessor().use(remarkMdx).freeze()
