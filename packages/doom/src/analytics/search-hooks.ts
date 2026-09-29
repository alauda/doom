// rspress `search.searchHooks` module, only configured for `--analytics`
// builds. rspress calls `afterSearch` on every keystroke; the reporter turns
// that into one event per settled query.

import { createSearchReporter } from './search-reporter.ts'
import { track } from './tracker.ts'

const reporter = createSearchReporter({
  report: ({ query, resultCount }) => {
    track({
      name: 'docs_search',
      query,
      result_count: resultCount,
      zero_result: resultCount === 0,
    })
  },
  setTimer: (callback, ms) => setTimeout(callback, ms),
  clearTimer: (handle) => {
    clearTimeout(handle)
  },
})

if (process.env.DOOM_ANALYTICS && typeof window !== 'undefined') {
  // A reader who searches and then leaves the page still counts.
  window.addEventListener('pagehide', reporter.flush)
}

export const afterSearch = (
  query: string,
  results: readonly { result: unknown }[],
) => {
  if (!process.env.DOOM_ANALYTICS) {
    return
  }
  reporter.onSearch(query, results)
}
