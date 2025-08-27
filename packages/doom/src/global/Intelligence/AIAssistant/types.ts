import type { ReactNode } from 'react'

export interface RefDoc {
  content: string
  cos_sim: number
  id: number
  path: string
}

export interface ChatMessage {
  id: number
  role: 'user' | 'assistant'
  content: ReactNode
  refDocs?: RefDoc[]
  thinkingProcess?: string | null
}
