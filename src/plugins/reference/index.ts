import fs from 'node:fs/promises'

import type { RspressPlugin } from '@rspress/core'
import remarkGfm from 'remark-gfm'
import remarkMdx from 'remark-mdx'
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'
import { unified } from 'unified'

import { remarkPluginNormalizeLink } from './remark-normalize-link.js'
import { maybeHaveRef, refCache, remarkReplace } from './remark-replace.js'
import { remarkPluginToc } from './remark-toc.js'
import type { ReferenceItem } from './types.js'
import { normalizeReferenceItems } from './utils.js'

const mdProcessor = unified().use(remarkParse).use(remarkGfm)

const mdxProcessor = mdProcessor().use(remarkMdx)

export const referencePlugin = ({
  base,
  root,
  localBasePath,
  items = [],
  force,
}: {
  base: string
  root: string
  localBasePath: string
  items?: ReferenceItem[]
  force?: boolean
}): RspressPlugin => {
  const normalizedItems = normalizeReferenceItems(items)
  return {
    name: 'doom-reference',
    markdown: {
      remarkPlugins: [
        [
          remarkReplace,
          {
            localBasePath,
            items: normalizedItems,
            force,
          },
        ],
        remarkPluginToc,
        [remarkPluginNormalizeLink, { base, root }],
      ],
    },
    async modifySearchIndexData(pages) {
      refCache.clear()

      for (const page of pages) {
        const filepath = page._filepath

        if (!/\.mdx?$/.test(filepath)) {
          continue
        }

        const content = await fs.readFile(filepath, 'utf8')

        if (!maybeHaveRef(filepath, content)) {
          continue
        }

        const processor = filepath.endsWith('.mdx') ? mdxProcessor : mdProcessor

        const vfile = await processor()
          .use(remarkReplace, { localBasePath, items: normalizedItems, force })
          .use(remarkStringify)
          .process({
            path: filepath,
            value: content,
          })

        page.content = vfile.toString()
      }
    },
  }
}
