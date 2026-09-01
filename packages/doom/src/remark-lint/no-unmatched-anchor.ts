import fs from 'node:fs'
import path from 'node:path'

import { isExternalUrl, parseUrl } from '@rspress/shared'
import { extractTextAndId } from '@rspress/shared/node-utils'
import type { Root } from 'mdast'
import { lintRule } from 'unified-lint-rule'
import { visit } from 'unist-util-visit'
import { visitParents } from 'unist-util-visit-parents'

import { isDoc } from '../cli/helpers.ts'

import { syntaxProcessor } from './syntax-plugins.ts'
import { getConfig } from './utils.ts'

const anchorsCache = new Map<string, Set<string>>()

const astCache = new Map<string, Root>()

/**
 * Forget what this document looked like the last time it was linted.
 *
 * Both caches key on a path and assume a path names one fixed document, which
 * holds for a lint run over a directory. The translator breaks that assumption:
 * it checks the same target path once per repair turn, with different content
 * each time. Without this, turn 2 is judged against turn 1's anchors — a red
 * that no amount of repairing can clear, because the repair is invisible.
 */
export const forgetDocumentAnchors = (filepath: string) => {
  anchorsCache.delete(filepath)
  astCache.delete(filepath)
}

const getAnchors = (filepath: string) => {
  if (anchorsCache.has(filepath)) {
    return anchorsCache.get(filepath)!
  }

  const anchors: Set<string> = new Set()

  let ast = astCache.get(filepath)
  if (!ast) {
    // The same stack the lint pipeline uses, so a document's anchors do not
    // depend on whether this run happened to lint it before reading it.
    const processor = filepath.endsWith('.mdx')
      ? syntaxProcessor.mdx
      : syntaxProcessor.md
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
    const configLang = config.lang!

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

      let refFilepath = filepath

      if (parsedUrl.startsWith('/')) {
        refFilepath = path.resolve(configRoot, configLang + parsedUrl)
      } else if (parsedUrl) {
        refFilepath = path.resolve(dirpath, parsedUrl)
      }

      let ext = path.extname(refFilepath)

      if (ext === '.html') {
        refFilepath = refFilepath.slice(0, -ext.length)
        ext = ''
      }

      if (!ext) {
        for (const ext of ['.md', '.mdx'] as const) {
          if (fs.existsSync(refFilepath + ext)) {
            refFilepath += ext
            break
          }
        }
      }

      if (!isDoc(refFilepath)) {
        return
      }

      // If the referenced file does not exist, we ignore it here and let the `check-dead-links` rule handle it
      if (filepath !== refFilepath && !fs.existsSync(refFilepath)) {
        return
      }

      const relativeRefPath = path.relative(configRoot, refFilepath)

      // We ignore API docs because their anchors are generated dynamically and may not be present in the source files
      if (relativeRefPath.startsWith(`${configLang}/apis/`)) {
        return
      }

      const anchors = getAnchors(refFilepath)

      if (!anchors.has(hash)) {
        vfile.message(
          `Unmatched anchor \`${hash}\` in link \`${url}\`, make sure the target has the correct id with \`{#${hash}}\` in heading or \`<a id="${hash}"></a>\` element.`,
          { ancestors: [...parents, node], place: node.position },
        )
      }
    })
  },
)
