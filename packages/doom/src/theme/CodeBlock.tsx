import {
  CodeBlock as OriginalCodeBlock,
  type CodeBlockProps,
} from '@rspress/core/theme-original'

import { AutoExpandable } from './AutoExpandable.js'

export const CodeBlock = (props: CodeBlockProps) => (
  <AutoExpandable>
    <OriginalCodeBlock {...props} />
  </AutoExpandable>
)
