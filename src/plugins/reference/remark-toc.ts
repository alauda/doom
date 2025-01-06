import Slugger from 'github-slugger'
import type { Root } from 'mdast'
import type { Plugin } from 'unified'
import { visitChildren } from 'unist-util-visit-children'

import { extractTextAndId } from './utils.js'

export interface TocItem {
  id: string
  text: string
  depth: number
  index: number
}

export interface PageMeta {
  toc: TocItem[]
  title: string
  headingTitle: string
  frontmatter?: Record<string, unknown>
}

interface ChildNode {
  type: 'link' | 'text' | 'inlineCode' | 'strong'
  value: string
  children?: ChildNode[]
}

interface Heading {
  type: string
  depth?: number
  children?: ChildNode[]
}

export const parseToc = (tree: Root, allDepths?: boolean) => {
  let title = ''
  const toc: TocItem[] = []
  const slugger = new Slugger()
  visitChildren((node: Heading, index: number) => {
    if (node.type !== 'heading' || !node.depth || !node.children) {
      return
    }

    // Collect h1 ~ h4 by default
    if (allDepths || node.depth < 5) {
      let customId = ''
      const text = node.children
        .map((child: ChildNode) => {
          if (child.type === 'link') {
            return child.children?.map((item) => item.value).join('')
          }
          if (child.type === 'strong') {
            return `**${child.children?.map((item) => item.value).join('')}**`
          }
          if (child.type === 'text') {
            const [textPart, idPart] = extractTextAndId(child.value)
            customId = idPart
            return textPart
          }
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          if (child.type === 'inlineCode') {
            return `\`${child.value}\``
          }
          return ''
        })
        .join('')

      if (!allDepths && node.depth === 1) {
        if (!title) {
          title = text
        }
      } else {
        const id = customId ? customId : slugger.slug(text)
        const { depth } = node
        toc.push({ id, text, depth, index })
      }
    }
  })(tree)
  return {
    title,
    toc,
  }
}

export const remarkPluginToc: Plugin<[], Root> = function () {
  const data = this.data() as {
    pageMeta: PageMeta
  }
  return (tree: Root) => {
    const { toc, title } = parseToc(tree)
    data.pageMeta.toc = toc
    if (title) {
      data.pageMeta.title = title
    }
  }
}
