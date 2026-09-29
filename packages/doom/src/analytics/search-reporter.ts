// Turns rspress's per-keystroke `afterSearch` calls into one report per
// settled query. Timers are injected so the rule can be tested without a
// browser: typing `i`, `in`, `ingress` reports `ingress` alone.

import {
  countSearchResults,
  MIN_QUERY_LENGTH,
  normalizeQuery,
} from './shared.ts'

export const SEARCH_SETTLE_MS = 1500

export interface SearchReport {
  query: string
  resultCount: number
}

export interface SearchReporterOptions<Handle> {
  report: (search: SearchReport) => void
  setTimer: (callback: () => void, ms: number) => Handle
  clearTimer: (handle: Handle | undefined) => void
}

export const createSearchReporter = <Handle>({
  report,
  setTimer,
  clearTimer,
}: SearchReporterOptions<Handle>) => {
  let latest: SearchReport | undefined
  let timer: Handle | undefined
  let lastReported: string | undefined

  const flush = () => {
    clearTimer(timer)
    timer = undefined
    if (!latest) {
      return
    }
    const search = latest
    latest = undefined
    // The same query settling twice in a row is one search, not two.
    if (search.query === lastReported) {
      return
    }
    lastReported = search.query
    report(search)
  }

  const onSearch = (query: string, results: readonly { result: unknown }[]) => {
    const normalized = normalizeQuery(query)
    if (normalized.length < MIN_QUERY_LENGTH) {
      return
    }
    latest = { query: normalized, resultCount: countSearchResults(results) }
    clearTimer(timer)
    timer = setTimer(flush, SEARCH_SETTLE_MS)
  }

  return { onSearch, flush }
}
