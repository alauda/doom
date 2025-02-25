import { getCustomMDXComponent } from '@rspress/core/theme'
import { type ElementType, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export const Markdown = ({ children }: { children?: string }) => {
  const [components] = useState<Record<string, ElementType>>(
    getCustomMDXComponent,
  )
  return (
    children && (
      <ReactMarkdown
        remarkPlugins={[[remarkGfm]]}
        components={components}
        skipHtml={true}
      >
        {children}
      </ReactMarkdown>
    )
  )
}
