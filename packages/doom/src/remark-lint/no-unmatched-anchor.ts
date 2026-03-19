import fs from 'node:fs'
import path from 'node:path'

import { isExternalUrl, parseUrl } from '@rspress/shared'
import { extractTextAndId } from '@rspress/shared/node-utils'
import type { Root } from 'mdast'
import { lintRule } from 'unified-lint-rule'
import { visit } from 'unist-util-visit'
import { visitParents } from 'unist-util-visit-parents'

import { isDoc } from '../cli/helpers.ts'
import { mdProcessor, mdxProcessor } from '../plugins/index.ts'

import { getConfig } from './utils.ts'

const anchorsCache = new Map<string, Set<string>>()

const astCache = new Map<string, Root>()

const getAnchors = (filepath: string) => {
  if (anchorsCache.has(filepath)) {
    return anchorsCache.get(filepath)!
  }

  const anchors: Set<string> = new Set()

  let ast = astCache.get(filepath)
  if (!ast) {
    const processor = filepath.endsWith('.mdx') ? mdxProcessor : mdProcessor
    ast = processor.parse(fs.readFileSync(filepath, 'utf-8'))
    astCache.set(filepath, ast)
  }

  visit(ast, (node) => {
    if (node.type === 'heading') {
      visit(node, 'text', (text) => {
        const [, id] = extractTextAndId(text.value)
        if (id) {
          anchors.add(id)
        }
      })
    } else if (
      node.type === 'mdxJsxFlowElement' ||
      node.type === 'mdxJsxTextElement'
    ) {
      for (const attr of node.attributes) {
        if (attr.type === 'mdxJsxAttribute' && attr.name === 'id') {
          if (typeof attr.value === 'string') {
            anchors.add(attr.value)
          }
          break
        }
      }
    } else if (node.type === 'html') {
      const matched = node.value.match(
        // eslint-disable-next-line regexp/no-super-linear-backtracking
        /<[a-z]+(?:\s+[^>]*?)?\sid=(["'])([\s\S]*?)\1/iu,
      )
      if (matched) {
        anchors.add(matched[2])
      }
    }
  })

  anchorsCache.set(filepath, anchors)
  return anchors
}

export const noUnmatchedAnchor = lintRule<Root>(
  'doom-lint:no-unmatched-anchor',
  async (root, vfile) => {
    const { config } = await getConfig()

    const filepath = vfile.path
    const dirpath = path.dirname(filepath)
    const configRoot = config.root!

    const relativePath = path.relative(configRoot, filepath)

    // Ignore files outside the root directory
    if (relativePath.startsWith('..')) {
      return
    }

    astCache.set(filepath, root)

    visitParents(root, (node, parents) => {
      let url: string | undefined
      if (node.type === 'link' || node.type === 'definition') {
        url = node.url
      } else if (
        (node.type === 'mdxJsxFlowElement' ||
          node.type === 'mdxJsxTextElement') &&
        node.name === 'a'
      ) {
        for (const attr of node.attributes) {
          if (attr.type === 'mdxJsxAttribute' && attr.name === 'href') {
            if (typeof attr.value === 'string') {
              url = attr.value
            }
            break
          }
        }
      } else if (node.type === 'html') {
        const matched = node.value.match(
          // eslint-disable-next-line regexp/no-super-linear-backtracking
          /<a\s+(?:[^>]*?\s)?href=(["'])([\s\S]*?)\1/iu,
        )
        if (matched) {
          url = matched[2]
        }
      }

      if (!url || isExternalUrl(url) || !url.includes('#')) {
        return
      }

      const { url: parsedUrl, hash } = parseUrl(url)

      let referencedFilepath = filepath

      if (parsedUrl.startsWith('/')) {
        referencedFilepath = path.resolve(configRoot, config.lang! + parsedUrl)
      } else if (parsedUrl) {
        referencedFilepath = path.resolve(dirpath, parsedUrl)
      }

      let ext = path.extname(referencedFilepath)

      if (ext === '.html') {
        referencedFilepath = referencedFilepath.slice(0, -ext.length)
        ext = ''
      }

      if (!ext) {
        for (const ext of ['.md', '.mdx'] as const) {
          if (fs.existsSync(referencedFilepath + ext)) {
            referencedFilepath += ext
            break
          }
        }
      }

      if (!isDoc(referencedFilepath)) {
        return
      }

      // If the referenced file does not exist, we ignore it here and let the `check-dead-links` rule handle it
      if (
        filepath !== referencedFilepath &&
        !fs.existsSync(referencedFilepath)
      ) {
        return
      }

      const anchors = getAnchors(referencedFilepath)

      if (!anchors.has(hash)) {
        vfile.message(
          `Unmatched anchor \`${hash}\` in link \`${url}\`, expected one of [${[
            ...anchors,
          ]
            .map((a) => `\`${a}\``)
            .join(', ')}] in file \`${path.relative(
            configRoot,
            referencedFilepath,
          )}\``,
          { ancestors: [...parents, node], place: node.position },
        )
      }
    })
  },
)
