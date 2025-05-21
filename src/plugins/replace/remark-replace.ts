import fs from 'node:fs/promises'
import path from 'node:path'

import { isProduction } from '@rspress/core'
import { logger } from '@rspress/shared/logger'
import type { Root, RootContent } from 'mdast'
import type { Plugin } from 'unified'
import { parse, stringify } from 'yaml'
import { cyan, red } from 'yoctocolors'

import { normalizeImgSrc } from './normalize-img-src.js'
import { resolveReference } from './resolve-reference.js'
import { resolveRelease } from './resolve-release.js'
import type { NormalizedReferenceSource, ReleaseNotesOptions } from './types.js'
import { getFrontmatterNode, isCI, mdProcessor, mdxProcessor } from './utils.js'

const MD_REF_START_COMMENT_PATTERN = /<!-{2,} *reference-start#(.+) *-{2,}>/
const MDX_REF_START_COMMENT_PATTERN = /{\/\*+ *reference-start#(.+) *\*+\/}/
const MDX_REF_START_PATTERN = /\/\*+ *reference-start#(.+) *\*+\//

const MD_REF_END_COMMENT_PATTERN = /<!-{2,} *reference-end *-{2,}>/
const MDX_REF_END_PATTERN = /\/\*+ *reference-end *\*+\//

export const MD_RELEASE_COMMENT_PATTERN =
  /<!-{2,} *release-notes-for-bugs\?(.+) *-{2,}>/
export const MDX_RELEASE_COMMENT_PATTERN =
  /{\/\*+ *release-notes-for-bugs\?(.+) *\*+\/}/
const MDX_RELEASE_PATTERN = /\/\*+ *release-notes-for-bugs\?(.+) *\*+\//

export const maybeHaveRef = (filepath: string, content: string) => {
  if (!/\.mdx?$/.test(filepath)) {
    return
  }
  return (
    filepath.endsWith('.mdx')
      ? [MDX_REF_START_COMMENT_PATTERN, MDX_RELEASE_COMMENT_PATTERN]
      : [MD_REF_START_COMMENT_PATTERN, MD_RELEASE_COMMENT_PATTERN]
  ).some((p) => p.test(content))
}

export const remarkReplace: Plugin<
  [
    {
      lang: string | null
      localBasePath: string
      root: string
      items: Record<string, NormalizedReferenceSource>
      force?: boolean
      releaseNotes?: ReleaseNotesOptions
    },
  ],
  Root
> = function ({ lang, localBasePath, root, items, force, releaseNotes }) {
  return async (ast, vfile) => {
    const filepath = vfile.path

    let content = vfile.toString()

    if (!maybeHaveRef(filepath, content)) {
      return
    }

    const localPublicBase = path.resolve(root, 'public')
    const targetBase = path.dirname(filepath)

    const isMdx = filepath.endsWith('.mdx')

    const processor = isMdx ? mdxProcessor : mdProcessor

    const originalAst = vfile.data.original
      ? ast
      : processor.parse((content = await fs.readFile(filepath, 'utf8')))

    const frontmatterNode = getFrontmatterNode(originalAst)

    let frontmatter =
      frontmatterNode &&
      (parse(frontmatterNode.value) as Record<string, unknown> | null)

    const newContentChildren: Array<RootContent | RootContent[]> = []

    let start = false
    let refName = ''
    let matched: RegExpMatchArray | null
    let checkContent = false

    const relativePath = path.relative(root, filepath)

    for (const node of originalAst.children) {
      if (node.type !== (isMdx ? 'mdxFlowExpression' : 'html')) {
        if (node.type === 'yaml') {
          continue
        }

        if (!start) {
          newContentChildren.push(node)
        }
        continue
      }

      if (
        (matched = node.value.match(
          isMdx ? MDX_REF_START_PATTERN : MD_REF_START_COMMENT_PATTERN,
        ))
      ) {
        if (start) {
          logger.warn(
            `Invalid reference start block ${red(node.value)}, nested reference blocks are not allowed`,
          )
        } else {
          checkContent = true
          start = true
          refName = matched[1].trim()
        }

        newContentChildren.push(node)

        continue
      }

      if (
        (isMdx ? MDX_REF_END_PATTERN : MD_REF_END_COMMENT_PATTERN).test(
          node.value,
        )
      ) {
        if (start) {
          start = false
        } else {
          logger.warn(
            `Invalid reference end block ${red(node.value)}, no matching start block found`,
          )
        }

        const resolved = await resolveReference(
          localBasePath,
          localPublicBase,
          items,
          refName,
          force,
        )

        if (resolved) {
          const refSource = items[refName]
          const { frontmatterMode } = refSource
          for (const nodeItem of resolved.contents) {
            if (nodeItem.type !== 'yaml') {
              newContentChildren.push(
                normalizeImgSrc(nodeItem, {
                  refSource,
                  localPublicBase,
                  targetBase,
                  publicBase: resolved.publicBase,
                  sourceBase: resolved.sourceBase,
                  force,
                }),
              )
              continue
            }

            if (!frontmatterMode || frontmatterMode === 'ignore') {
              continue
            }

            if (frontmatterMode === 'remove') {
              frontmatter = null
              continue
            }

            const data = parse(nodeItem.value) as Record<string, unknown> | null

            if (frontmatterMode === 'merge') {
              if (data) {
                frontmatter = {
                  ...frontmatter,
                  ...data,
                }
              }
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            } else if (frontmatterMode === 'replace') {
              frontmatter = data
            }
          }
        }

        newContentChildren.push(node)

        continue
      }

      if (!start) {
        newContentChildren.push(node)
      }
    }

    if (start) {
      logger.warn(
        `Invalid reference start block ${red(refName)}, no matching end block found, adding for you`,
      )
      newContentChildren.push({
        type: isMdx ? 'mdxFlowExpression' : 'html',
        value: isMdx ? '/* reference-end */' : '<!-- reference-end -->',
      })
    }

    if (frontmatter) {
      newContentChildren.unshift({
        type: 'yaml',
        value: stringify(frontmatter).trim(),
      })
    }

    if (checkContent) {
      const newContent = processor.stringify({
        ...ast,
        children: newContentChildren.flat(),
      })

      if (content !== newContent) {
        await fs.writeFile(filepath, newContent)

        if (!vfile.data.original && isProduction()) {
          const message = `Reference block in \`${cyan(relativePath)}\` has been updated, please commit the changes`

          if (isCI) {
            process.env.__DOOM_REBUILD__ = 'true'
          }

          logger.warn(message)
        }
        return
      }
    }

    const newAstChildren: Array<RootContent | RootContent[]> = []

    const currLang = lang === null ? 'zh' : relativePath.split(/[\\/]/)[0]

    for (const node of ast.children) {
      if (node.type !== (isMdx ? 'mdxFlowExpression' : 'html')) {
        newAstChildren.push(node)
        continue
      }

      if (
        (matched = node.value.match(
          isMdx ? MDX_RELEASE_PATTERN : MD_RELEASE_COMMENT_PATTERN,
        ))
      ) {
        const releaseContent = await resolveRelease(
          releaseNotes?.queryTemplates ?? {},
          matched[1].trim(),
          currLang,
        )
        newAstChildren.push(releaseContent ?? node)
        continue
      }

      newAstChildren.push(node)
    }

    ast.children = newAstChildren.flat()
  }
}
