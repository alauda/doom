// based on https://gitlab-ce.alauda.cn/aml/smart-doc/-/blob/master/frontend/src/app/utils/unicode.ts

import { isObject } from 'es-toolkit/compat'

import type { RefDoc } from './types.js'

export const unicodeToString = (unicodeStr: string) =>
  unicodeStr.replace(/\\u([0-9a-fA-F]{4})/g, (_match, p1: string) =>
    String.fromCharCode(Number.parseInt(p1, 16)),
  )

export const removePrefix = (
  prefix: string | null | undefined,
  text: string,
) => (prefix && text.startsWith(prefix) ? text.slice(prefix.length) : text)

export function parseStreamContent(text: string) {
  const matchDocs = text.match(/<docs>([\s\S]*?)<\/docs>/)
  const docsReferences = matchDocs?.length
    ? unicodeToString(matchDocs[1])
    : '[]'
  let refDocs: RefDoc[] = []
  try {
    refDocs = (JSON.parse(docsReferences) as RefDoc[]).filter((r) =>
      isObject(r),
    )
  } catch {
    //
  }

  const matchThinks = text.match(/<think>[\s\S]*?<\/think>|^[\s\S]*?<\/think>/g)
  const firstMatched = matchThinks?.[0]
  let matched = firstMatched || matchThinks?.[1]
  if (matched) {
    matched = removePrefix(firstMatched || '', matched)
  }
  const thinkingProcess = matchThinks && matched

  return {
    refDocs,
    thinkingProcess,
    content: unicodeToString(
      removePrefix(thinkingProcess, removePrefix(matchDocs?.[0], text)),
    ),
  }
}
