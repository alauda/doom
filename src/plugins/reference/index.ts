import fs from 'node:fs/promises'

import type { RspressPlugin } from '@rspress/core'
import { logger } from '@rspress/shared/logger'

import {
  MD_RELEASE_COMMENT_PATTERN,
  MDX_RELEASE_COMMENT_PATTERN,
  refCache,
  releaseCache,
  remarkReplace,
} from './remark-replace.js'
import type { ReferenceItem, ReleaseNotesOptions } from './types.js'
import { mdProcessor, mdxProcessor, normalizeReferenceItems } from './utils.js'

export const referencePlugin = ({
  root,
  lang,
  localBasePath,
  items = [],
  force,
  releaseNotes,
}: {
  base: string
  root: string
  lang: string | null
  localBasePath: string
  items?: ReferenceItem[]
  force?: boolean
  releaseNotes?: ReleaseNotesOptions
}): RspressPlugin => {
  const normalizedItems = normalizeReferenceItems(items)
  return {
    name: 'doom-reference',
    markdown: {
      remarkPlugins: [
        [
          remarkReplace,
          {
            lang,
            localBasePath,
            root,
            items: normalizedItems,
            releaseNotes,
            force,
          },
        ],
      ],
    },
    async modifySearchIndexData(pages, isProd) {
      if (!isProd) {
        refCache.clear()
        releaseCache.clear()
      }

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
            root,
            items: normalizedItems,
            force,
            releaseNotes,
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
