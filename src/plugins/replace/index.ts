import fs from 'node:fs/promises'

import type { RspressPlugin, UserConfig } from '@rspress/core'
import { logger } from '@rspress/shared/logger'

import { rehypeNormalizeLink } from './rehype-normalize-link.js'
import { remarkExplicitJsx } from './remark-explicit-jsx.js'
import {
  MD_RELEASE_COMMENT_PATTERN,
  MDX_RELEASE_COMMENT_PATTERN,
  remarkReplace,
} from './remark-replace.js'
import type { NormalizedReferenceSource } from './types.js'
import { mdProcessor, mdxProcessor, normalizeReferenceItems } from './utils.js'

export * from './normalize-img-src.js'
export type * from './types.js'
export * from './utils.js'

export const replacePlugin = ({
  lang,
  localBasePath,
  force,
}: {
  lang: string | null
  localBasePath: string
  force?: boolean
}): RspressPlugin => {
  let userConfig: UserConfig
  let normalizedItems: Record<string, NormalizedReferenceSource>
  return {
    name: 'doom-replace',
    config(config) {
      config.markdown ??= {}
      config.markdown.remarkPlugins ??= []
      config.markdown.remarkPlugins.push(
        [
          remarkReplace,
          {
            lang,
            localBasePath,
            root: config.root,
            items: (normalizedItems = normalizeReferenceItems(
              config.reference,
            )),
            releaseNotes: config.releaseNotes,
            force,
          },
        ],
        remarkExplicitJsx,
      )
      config.markdown.rehypePlugins ??= []
      config.markdown.rehypePlugins.push(rehypeNormalizeLink)
      return (userConfig = config)
    },
    async modifySearchIndexData(pages) {
      const results = await Promise.allSettled(
        pages.map(async (page) => {
          const filepath = page._filepath

          if (!/\.mdx?$/.test(filepath)) {
            return
          }

          const isMdx = filepath.endsWith('.mdx')
          const content = await fs.readFile(filepath, 'utf8')

          if (
            !(
              isMdx ? MDX_RELEASE_COMMENT_PATTERN : MD_RELEASE_COMMENT_PATTERN
            ).test(content)
          ) {
            return
          }

          const processor = isMdx ? mdxProcessor : mdProcessor

          const compiler = processor().data('pageMeta', {}).use(remarkReplace, {
            lang,
            localBasePath,
            root: userConfig.root!,
            items: normalizedItems!,
            force,
            releaseNotes: userConfig.releaseNotes,
          })

          const vfile = await compiler.process({
            path: filepath,
            value: content,
            data: {
              original: true,
            },
          })

          page.content = vfile.toString()
        }),
      )

      for (const result of results) {
        if (result.status === 'rejected') {
          logger.error(result.reason)
        }
      }
    },
  }
}
