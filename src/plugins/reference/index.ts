import fs from 'node:fs/promises'

import type { Header, RspressPlugin } from '@rspress/core'
import { logger } from '@rspress/shared/logger'
import remarkStringify from 'remark-stringify'

import { remarkPluginNormalizeLink } from './remark-normalize-link.js'
import { maybeHaveRef, remarkReplace } from './remark-replace.js'
import { PageMeta, remarkPluginToc } from './remark-toc.js'
import type { ReferenceItem, ReleaseNotesOptions } from './types.js'
import { mdProcessor, mdxProcessor, normalizeReferenceItems } from './utils.js'

export const referencePlugin = ({
  base,
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
        remarkPluginToc,
        [remarkPluginNormalizeLink, { base, root }],
      ],
    },
    async modifySearchIndexData(pages) {
      const results = await Promise.allSettled(
        pages.map(async (page) => {
          const filepath = page._filepath

          if (!/\.mdx?$/.test(filepath)) {
            return
          }

          const content = await fs.readFile(filepath, 'utf8')

          if (!maybeHaveRef(filepath, content)) {
            return
          }

          const processor = filepath.endsWith('.mdx')
            ? mdxProcessor
            : mdProcessor

          const compiler = processor()
            .use(remarkReplace, {
              lang,
              localBasePath,
              root,
              items: normalizedItems,
              force,
              releaseNotes,
            })
            .use(remarkPluginToc)
            .use(remarkStringify)

          compiler.data('pageMeta', {})

          const vfile = await compiler.process({
            path: filepath,
            value: content,
          })

          const { toc, title } = compiler.data('pageMeta') as PageMeta

          page.title = title
          page.toc = toc as unknown as Header[]
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
