import { getCustomMDXComponent } from '@rspress/core/theme'
import { ElementType } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const components = getCustomMDXComponent() as Record<string, ElementType>

export const Markdown = ({ children }: { children?: string }) =>
  children && (
    <ReactMarkdown
      remarkPlugins={[[remarkGfm]]}
      components={components}
      skipHtml={true}
      className="rspress-plugin-api-docgen"
    >
      {children}
    </ReactMarkdown>
  )
