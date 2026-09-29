import { NoSSR, useLang, usePage } from '@rspress/core/runtime'
import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router'

import { referrerPath } from '../../analytics/shared.ts'
import {
  initAnalytics,
  isAnalyticsActive,
  resolveAnalyticsTarget,
  setAnalyticsLang,
  track,
  trackPageview,
} from '../../analytics/tracker.ts'

const Analytics = () => {
  const lang = useLang()
  const { page } = usePage()
  const { pathname } = useLocation()
  // The in-site page the reader came from; `document.referrer` only knows the
  // page that led to the first full load.
  const previousPathRef = useRef<string>(undefined)

  useEffect(() => {
    setAnalyticsLang(lang)
  }, [lang])

  useEffect(() => {
    const target = resolveAnalyticsTarget()
    if (target) {
      void initAnalytics(target)
    }
  }, [])

  // One pageview per route, including the first; the tracker queues it until
  // the SDK has loaded.
  useEffect(() => {
    trackPageview()
  }, [pathname])

  useEffect(() => {
    if (page.pageType === '404' && isAnalyticsActive()) {
      track({
        name: 'docs_404',
        referrer_path:
          previousPathRef.current ??
          referrerPath(document.referrer, location.origin),
      })
    }
    previousPathRef.current = pathname
  }, [page.pageType, pathname])

  return null
}

export default () =>
  process.env.DOOM_ANALYTICS ? (
    <NoSSR>
      <Analytics />
    </NoSSR>
  ) : null
