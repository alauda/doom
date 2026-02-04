import {
  NoSSR,
  useLang,
  useLocation,
  useNavigate,
  useSite,
} from '@rspress/core/runtime'
import { useEffect, useMemo, useRef } from 'react'
import siteData from 'virtual-site-data'
import { createXFetch } from 'x-fetch'

import { useCloudAuth } from '../../login/store.ts'
import { isLoggedIn } from '../../login/utils.ts'

import { useMemoizedFn } from '@alauda/doom/runtime'

const { xfetch } = createXFetch()

const AuthCheck = () => {
  const { pathname, search, hash } = useLocation()
  const navigate = useNavigate()

  const lang = useLang()

  const { site } = useSite()

  const { authInfo, setAuthBasic } = useCloudAuth()

  const pathname_ = useMemo(() => pathname.replace(/\.html$/, ''), [pathname])

  const login = useMemoizedFn(() => {
    if (
      pathname_ === '/login' ||
      site.themeConfig.locales.some((l) => pathname_ === `/${l.lang}/login`)
    ) {
      return
    }
    void navigate(
      `${lang === site.lang ? '' : `/${lang}`}/login.html?from=${encodeURIComponent(`${pathname}${search}${hash}`)}`,
    )
  })

  const abortControllerRef = useRef<AbortController>(null)

  const authCheck = useMemoizedFn(async () => {
    if (!siteData.base.startsWith('/russian/')) {
      return
    }

    if (!isLoggedIn(authInfo)) {
      login()
      return
    }

    abortControllerRef.current?.abort()

    abortControllerRef.current = new AbortController()

    const signal = abortControllerRef.current.signal

    try {
      await xfetch('https://cloud.alauda.io/api/v1/tenant/info', {
        headers: {
          Authorization: `Bearer ${authInfo.token}`,
        },
        signal,
      })
    } catch {
      if (signal.aborted) {
        return
      }
      setAuthBasic()
      login()
    }
  })

  useEffect(() => {
    void authCheck()
  }, [authCheck, pathname])

  useEffect(() => {
    if (!isLoggedIn(authInfo)) {
      void authCheck()
    }
  }, [authCheck, authInfo])

  return null
}

export default () => (
  <NoSSR>
    <AuthCheck />
  </NoSSR>
)
