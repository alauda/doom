// based on https://gitlab-ce.alauda.cn/aml/smart-doc/-/blob/master/frontend/src/app/utils/unicode.ts

import { isObject } from 'es-toolkit/compat'

import type { RefDoc } from './types.js'

export interface SSEEvent {
  data: string
  event?: string
}

export interface SSEConsumeResult {
  event?: string
  events: SSEEvent[]
  remainder: string
}

const IGNORED_SSE_EVENT_TYPES =
  /(?:^|[._-])(?:metadata|trace|updates?)(?:$|[._-])/i

const STREAM_TEXT_KEYS = ['delta', 'text', 'content', 'answer', 'message']

export const unicodeToString = (unicodeStr: string) =>
  unicodeStr.replace(/\\u([0-9a-fA-F]{4})/g, (_match, p1: string) =>
    String.fromCharCode(Number.parseInt(p1, 16)),
  )

const isRecord = (value: unknown): value is Record<string, unknown> =>
  isObject(value) && !Array.isArray(value)

export const removePrefix = (
  prefix: string | null | undefined,
  text: string,
) => (prefix && text.startsWith(prefix) ? text.slice(prefix.length) : text)

const parseSSEFieldValue = (line: string, field: string) => {
  const value = line.slice(field.length + 1)
  return value.startsWith(' ') ? value.slice(1) : value
}

const getStringValue = (value: unknown): string | undefined => {
  if (typeof value === 'string') {
    return value
  }

  if (Array.isArray(value)) {
    const text = value.map((item) => getStringValue(item) || '').join('')
    return text || undefined
  }

  if (!isRecord(value)) {
    return
  }

  for (const key of STREAM_TEXT_KEYS) {
    const text = getStringValue(value[key])
    if (text) {
      return text
    }
  }
}

const getChoicesDelta = (choices: unknown): string | undefined => {
  if (!Array.isArray(choices)) {
    return
  }

  const text = choices.map((choice) => getStringValue(choice) || '').join('')

  return text || undefined
}

export const consumeSSEEvents = (
  buffer: string,
  event?: string,
): SSEConsumeResult => {
  const events: SSEEvent[] = []

  let remaining = buffer
  let currentEvent = event

  let lineBoundary = remaining.match(/\r?\n/)

  while (lineBoundary?.index != null) {
    const line = remaining.slice(0, lineBoundary.index)
    remaining = remaining.slice(lineBoundary.index + lineBoundary[0].length)

    if (!line) {
      currentEvent = undefined
    } else if (line.startsWith(':')) {
      //
    } else if (line.startsWith('event:')) {
      currentEvent = parseSSEFieldValue(line, 'event')
    } else if (line.startsWith('data:')) {
      events.push({
        event: currentEvent,
        data: parseSSEFieldValue(line, 'data'),
      })
    }

    lineBoundary = remaining.match(/\r?\n/)
  }

  return {
    event: currentEvent,
    events,
    remainder: remaining,
  }
}

export const getAnswerDelta = ({ event, data }: SSEEvent) => {
  if (!data || data === '[DONE]') {
    return ''
  }

  if (event && IGNORED_SSE_EVENT_TYPES.test(event)) {
    return ''
  }

  try {
    const payload = JSON.parse(data)

    if (typeof payload === 'string') {
      return payload
    }

    if (!isRecord(payload)) {
      return ''
    }

    const type = typeof payload.type === 'string' ? payload.type : undefined

    if (type && IGNORED_SSE_EVENT_TYPES.test(type)) {
      return ''
    }

    const choiceDelta = getChoicesDelta(payload.choices)

    if (choiceDelta) {
      return choiceDelta
    }

    for (const key of STREAM_TEXT_KEYS) {
      const text = getStringValue(payload[key])
      if (text) {
        return text
      }
    }

    return ''
  } catch {
    return data
  }
}

export function parseStreamContent(text: string) {
  const docsMatches = [...text.matchAll(/<docs>([\s\S]*?)<\/docs>/g)]
  const docsReferences = docsMatches.length
    ? unicodeToString(docsMatches.at(-1)![1])
    : '[]'

  let refDocs: RefDoc[] = []
  try {
    refDocs = (JSON.parse(docsReferences) as RefDoc[]).filter((r) =>
      isObject(r),
    )
  } catch {
    //
  }

  const thinkMatches = [...text.matchAll(/<think>([\s\S]*?)<\/think>/g)]
  let thinkingProcess = thinkMatches.at(-1)?.[1]

  if (!thinkingProcess) {
    const openThinkMatch = text.match(/<think>([\s\S]*)$/)
    thinkingProcess = openThinkMatch?.[1]
  }

  const content = text
    .replace(/<docs>[\s\S]*?<\/docs>/g, '')
    .replace(/<think>[\s\S]*?<\/think>/g, '')
    .replace(/<docs>[\s\S]*$/g, '')
    .replace(/<think>[\s\S]*$/g, '')

  return {
    refDocs,
    thinkingProcess: thinkingProcess && unicodeToString(thinkingProcess),
    content: unicodeToString(content),
  }
}
