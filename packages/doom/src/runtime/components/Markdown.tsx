import { type ElementType } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import remarkGfm from 'remark-gfm'

import { X } from './_X.js'

const remarkPlugins = [remarkGfm]
const rehypePlugins = [rehypeRaw, rehypeSanitize]

export const Markdown = ({ children }: { children?: string }) =>
  children && (
    <ReactMarkdown
      remarkPlugins={remarkPlugins}
      rehypePlugins={rehypePlugins}
      components={X as Record<string, ElementType>}
    >
      {children}
    </ReactMarkdown>
  )
