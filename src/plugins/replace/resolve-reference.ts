import fs from 'node:fs/promises'
import path from 'node:path'

import { isProduction } from '@rspress/core'
import { logger } from '@rspress/shared/logger'
import { render } from 'ejs'
import type { Content } from 'mdast'
import { red } from 'yoctocolors'

import { parseToc } from './parse-toc.js'
import type { NormalizedReferenceSource } from './types.js'
import { getFrontmatterNode, mdProcessor, mdxProcessor } from './utils.js'
import { resolveRepo } from '../../utils/index.js'

export interface ResolveReferenceResult {
  publicBase: string
  sourceBase: string
  contents: Content[]
}

const refCache = new Map<string, Promise<ResolveReferenceResult | undefined>>()

const resolveReference_ = async (
  localBasePath: string,
  localPublicBase: string,
  items: Record<string, NormalizedReferenceSource>,
  refName: string,
  force?: boolean,
): Promise<ResolveReferenceResult | undefined> => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!items[refName]) {
    logger.error(`Reference \`${red(refName)}\` not found`)
    return
  }

  const source = items[refName]

  let publicBase
  let sourcePath = source.path
  if (source.repo) {
    const repoFolder = await resolveRepo(source.repo, force, source.branch)

    if (!repoFolder) {
      return
    }

    publicBase = path.resolve(repoFolder, source.publicBase ?? 'docs/public')
    sourcePath = path.resolve(repoFolder, sourcePath)
  } else {
    publicBase = localPublicBase
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
    return
  }

  let content = await fs.readFile(sourcePath, 'utf8')

  for (const processor of source.processors ?? []) {
    switch (processor.type) {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      case 'ejsTemplate': {
        content = await render(
          content,
          { data: processor.data },
          { async: true },
        )
        break
      }
    }
  }

  const processor = (sourcePath.endsWith('.ejs')
    ? sourcePath.slice(0, -4)
    : sourcePath
  ).endsWith('.mdx')
    ? mdxProcessor
    : mdProcessor

  const root = processor.parse(content)

  const sourceBase = path.dirname(sourcePath)

  if (!source.anchor) {
    return {
      publicBase,
      sourceBase,
      contents: root.children,
    }
  }

  const frontmatterNode = getFrontmatterNode(root)

  const { toc } = parseToc(root, true)

  const active =
    toc.find((it) => it.id === source.anchor) ??
    toc.find((it) => it.text === source.anchor)

  if (!active) {
    logger.error(
      `Anchor \`${red(source.anchor)}\` not found in \`${red(source.name)}\``,
    )
    return
  }

  const nodes: Content[] = frontmatterNode ? [frontmatterNode] : []

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

  return {
    publicBase,
    sourceBase,
    contents: nodes,
  }
}

export const resolveReference = async (
  localBasePath: string,
  localPublicBase: string,
  items: Record<string, NormalizedReferenceSource>,
  refName: string,
  force?: boolean,
) => {
  if (refCache.has(refName)) {
    return refCache.get(refName)
  }

  const resolving = resolveReference_(
    localBasePath,
    localPublicBase,
    items,
    refName,
    force,
  )
  refCache.set(refName, resolving)
  if (!isProduction()) {
    setTimeout(() => {
      refCache.delete(refName)
    }, 5_000)
  }
  return resolving
}
