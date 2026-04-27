import type { SmartDocDisplayReferenceDoc } from '@alauda/doc-stream-sdk'
import type { ReactNode } from 'react'

export interface ChatMessage {
  id: number
  role: 'user' | 'assistant'
  content: ReactNode
  refDocs?: SmartDocDisplayReferenceDoc[]
  thoughtProcess?: string | null
}
