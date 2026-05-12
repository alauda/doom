import type { Root } from 'hast'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import remarkGfm from 'remark-gfm'
import type { Plugin } from 'unified'

import { X } from './_X.js'

const remarkPlugins = [remarkGfm]
const rehypePlugins = [rehypeRaw, rehypeSanitize]

const rehypeUnwrap: Plugin<[], Root> = () => (tree) => {
  if (tree.children.length !== 1) {
    return
  }
  const child = tree.children[0]
  if (child.type === 'element' && child.tagName === 'p') {
    tree.children = child.children
  }
}

const inlineRehypePlugins = [rehypeRaw, rehypeUnwrap, rehypeSanitize]

export const Markdown = ({
  children,
  inline,
}: {
  children?: string
  inline?: boolean
}) =>
  children && (
    <ReactMarkdown
      remarkPlugins={remarkPlugins}
      rehypePlugins={inline ? inlineRehypePlugins : rehypePlugins}
      components={X}
    >
      {children}
    </ReactMarkdown>
  )
