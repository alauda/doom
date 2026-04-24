import {
  formatSmartDocMarkdown,
  parseSmartDocMessage,
  SmartDocSseParser,
  type SmartDocMarkdownDocumentOptions,
  type SmartDocMessage,
} from '@yangxiaolang/smart-doc-sse-parser'

import type { RefDoc } from './types.js'

export { formatSmartDocMarkdown, parseSmartDocMessage, SmartDocSseParser }
export type { SmartDocMarkdownDocumentOptions, SmartDocMessage }

export type ParseStreamContentOptions = SmartDocMarkdownDocumentOptions

const normalizeRefDocs = (refDocs: SmartDocMessage['refDocs']): RefDoc[] =>
  refDocs.map((doc, index) => ({
    id: doc.id ?? index + 1,
    path: doc.path ?? '',
    content: doc.content ?? doc.path ?? `Reference ${index + 1}`,
    cos_sim: doc.cos_sim ?? 0,
  }))

const getThinkingProcess = (text: string, message: SmartDocMessage) => {
  if (message.thoughtProcess) {
    return message.thoughtProcess
  }

  const openThinkMatch = text.match(/<think>([\s\S]*)$/)
  return openThinkMatch?.[1] || undefined
}

const getDisplayResult = (text: string, message: SmartDocMessage) => {
  const strippedText = text
    .replace(/<docs>[\s\S]*?<\/docs>/g, '')
    .replace(/<think>[\s\S]*?<\/think>/g, '')
    .replace(/<error>[\s\S]*?<\/error>/g, '')
    .replace(/<docs>[\s\S]*$/g, '')
    .replace(/<think>[\s\S]*$/g, '')
    .replace(/<error>[\s\S]*$/g, '')
    .trim()

  return strippedText || message.result
}

export function parseStreamContent(text: string) {
  const message = parseSmartDocMessage(text)
  const thinkingProcess = getThinkingProcess(text, message)
  const result = getDisplayResult(text, message)
  const normalizedMessage = {
    ...message,
    result,
    thoughtProcess: thinkingProcess ?? '',
  }
  return {
    refDocs: normalizeRefDocs(normalizedMessage.refDocs),
    thinkingProcess,
    content: formatSmartDocMarkdown(normalizedMessage.result),
  }
}
