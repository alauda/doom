import { type ElementType } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { X } from './_X.js'

export const Markdown = ({ children }: { children?: string }) =>
  children && (
    <ReactMarkdown
      remarkPlugins={[[remarkGfm]]}
      components={X as Record<string, ElementType>}
      skipHtml={true}
    >
      {children}
    </ReactMarkdown>
  )
