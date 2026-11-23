import { describe, expect, test } from '@rstest/core'

import {
  createSearchReporter,
  SEARCH_SETTLE_MS,
  type SearchReport,
} from '#analytics/search-reporter.ts'

// A hand-driven clock: `settle()` fires whatever timer is pending.
const setup = () => {
  const reports: SearchReport[] = []
  let pending: (() => void) | undefined
  const delays: number[] = []
  const reporter = createSearchReporter<number>({
    report: (search) => reports.push(search),
    setTimer: (callback, ms) => {
      pending = callback
      delays.push(ms)
      return delays.length
    },
    clearTimer: () => {
      pending = undefined
    },
  })
  const settle = () => {
    const callback = pending
    pending = undefined
    callback?.()
  }
  return { reporter, reports, settle, delays }
}

const hits = (count: number) => [{ result: Array.from({ length: count }) }]

describe('createSearchReporter', () => {
  test('reports only the query the reader settled on', () => {
    const { reporter, reports, settle, delays } = setup()
    reporter.onSearch('in', hits(40))
    reporter.onSearch('ingr', hits(9))
    reporter.onSearch('Ingress', hits(7))
    settle()
    expect(reports).toEqual([{ query: 'ingress', resultCount: 7 }])
    expect(delays.every((ms) => ms === SEARCH_SETTLE_MS)).toBe(true)
  })

  test('reports a zero-result search with a count of 0', () => {
    const { reporter, reports, settle } = setup()
    reporter.onSearch('zzqqxx', hits(0))
    settle()
    expect(reports).toEqual([{ query: 'zzqqxx', resultCount: 0 }])
  })

  test('ignores queries shorter than two characters', () => {
    const { reporter, reports, settle } = setup()
    reporter.onSearch('i', hits(100))
    settle()
    expect(reports).toEqual([])
  })

  test('does not report the same settled query twice in a row', () => {
    const { reporter, reports, settle } = setup()
    reporter.onSearch('ingress', hits(7))
    settle()
    reporter.onSearch('ingress ', hits(7))
    settle()
    reporter.onSearch('etcd', hits(3))
    settle()
    expect(reports.map(({ query }) => query)).toEqual(['ingress', 'etcd'])
  })

  test('flush reports the pending query before the timer fires', () => {
    // The reader types and leaves the page at once.
    const { reporter, reports } = setup()
    reporter.onSearch('upgrade', hits(12))
    reporter.flush()
    expect(reports).toEqual([{ query: 'upgrade', resultCount: 12 }])
    reporter.flush()
    expect(reports).toHaveLength(1)
  })
})
