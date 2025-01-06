import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { logger } from '@rspress/shared/logger'
import type { Content, HTML, Root } from 'mdast'
import remarkGfm from 'remark-gfm'
import remarkMdx from 'remark-mdx'
import remarkParse from 'remark-parse'
import { simpleGit } from 'simple-git'
import { unified, type Plugin } from 'unified'
import { cyan, red } from 'yoctocolors'

import { parseToc } from './remark-toc.js'
import { NormalizedReferenceSource } from './types.js'
import { flatMap } from './utils.js'

const remotesFolder = path.resolve(os.homedir(), '.doom/remotes')

const resolveReference = async (
  localBasePath: string,
  source: NormalizedReferenceSource,
  force?: boolean,
) => {
  let sourcePath = source.path
  if (source.repo) {
    const repoFolder = path.resolve(remotesFolder, source.slug!)

    let created = false

    try {
      const stat = await fs.stat(path.resolve(repoFolder, '.git'))
      if (stat.isDirectory()) {
        created = true
      }
    } catch {
      // ignore
    }

    if (!created) {
      await fs.mkdir(repoFolder, { recursive: true })
    }

    const git = simpleGit(repoFolder)

    if (!created) {
      logger.info(`Cloning remote \`${cyan(source.slug!)}\` repository...`)
      await git.clone(source.repo, repoFolder, ['--depth', '1'])
    }

    if (force) {
      logger.info(`Pulling latest changes for \`${cyan(source.slug!)}\`...`)
      await git.pull(['--depth', '1', '--force', '--rebase'])
    }

    sourcePath = path.resolve(repoFolder, sourcePath)
  } else {
    sourcePath = path.resolve(localBasePath, sourcePath)
  }

  let found = false

  try {
    const stat = await fs.stat(sourcePath)
    found = stat.isFile()
  } catch {
    //
  }

  if (!found) {
    logger.error(
      `Reference path \`${red(source.path)}\` for \`${red(source.name)}\` not found`,
    )
  }

  const processor = unified().use(remarkParse).use(remarkGfm)

  if (sourcePath.endsWith('.mdx')) {
    processor.use(remarkMdx)
  }

  const root = processor.parse(await fs.readFile(sourcePath))

  if (!source.anchor) {
    return root.children
  }

  const { toc } = parseToc(root, true)

  const active = toc.find((it) => it.id === source.anchor)

  if (!active) {
    logger.error(
      `Anchor \`${red(source.anchor)}\` not found in \`${red(source.name)}\``,
    )
    return
  }

  const nodes: Content[] = []

  for (let i = active.index, n = root.children.length; i < n; i++) {
    if (i === active.index && (source.ignoreHeading ?? active.depth === 1)) {
      continue
    }
    const node = root.children[i]
    if (
      node.type === 'heading' &&
      node.depth <= active.depth &&
      i > active.index
    ) {
      break
    }
    nodes.push(node)
  }

  return nodes
}

export const MD_REF_PATTERN = /<!-{2,} reference-include#(.*?) -{2,}>/
export const MDX_REF_PATTERN = /\/\*+ reference-include#(.*?) \*+\//

export const maybeHaveRef = (filepath: string, content: string) =>
  (filepath.endsWith('.mdx') ? MDX_REF_PATTERN : MD_REF_PATTERN).test(content)

export const refCache = new Map<string, Content[] | undefined>()

export const remarkReplace: Plugin<
  [
    {
      localBasePath: string
      items: Record<string, NormalizedReferenceSource>
      force?: boolean
    },
  ],
  Root
> = function ({ localBasePath, items, force }) {
  return async (root, vfile) => {
    const filepath = vfile.path
    const content = vfile.toString()

    if (!maybeHaveRef(filepath, content)) {
      return
    }

    return flatMap(root, async (node) => {
      let matched: RegExpMatchArray | null = null
      if (node.type === 'html') {
        matched = (node as HTML).value.match(MD_REF_PATTERN)
      } else if (node.type === 'mdxFlowExpression') {
        matched = (node as HTML).value.match(MDX_REF_PATTERN)
      }

      const name = matched?.[1]

      if (!name) {
        return
      }

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!items[name]) {
        logger.error(`Reference \`${red(name)}\` not found`)
        return
      }

      if (refCache.has(name)) {
        return refCache.get(name)
      }

      const resolved = await resolveReference(localBasePath, items[name], force)
      refCache.set(name, resolved)

      return resolved
    })
  }
}
