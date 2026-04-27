import type { SmartDocDisplayReferenceDoc } from '@yangxiaolang/smart-doc-sse-parser'
import type { ReactNode } from 'react'

export interface ChatMessage {
  id: number
  role: 'user' | 'assistant'
  content: ReactNode
  refDocs?: SmartDocDisplayReferenceDoc[]
  thoughtProcess?: string | null
}
