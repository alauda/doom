import {
  getSidebarDataGroup,
  useActiveMatcher,
  useLang,
  useLocation,
  useSidebar,
} from '@rspress/core/runtime'
import { SidebarList } from '@rspress/core/theme'
import type { NormalizedSidebar, SidebarData } from '@rspress/shared'
import virtual from 'doom-@global-virtual'
import { useEffect, useMemo, useState } from 'react'

import { expandActiveSidebar } from './sidebar.ts'

interface SharedSidebarLocale {
  lang: string
  sidebar?: NormalizedSidebar
}

interface SharedSidebarPayload {
  sidebar?: NormalizedSidebar
  locales?: SharedSidebarLocale[]
}

interface SharedSidebarManifest {
  fileName: string
}

const isSidebarPayload = (value: unknown): value is SharedSidebarPayload =>
  typeof value === 'object' && value !== null

export const DeferredSidebar = () => {
  const fallback = useSidebar()
  const lang = useLang()
  const { pathname } = useLocation()
  const activeMatcher = useActiveMatcher()
  const [payload, setPayload] = useState<SharedSidebarPayload>()
  const [sidebarData, setSidebarData] = useState<SidebarData>([])

  useEffect(() => {
    if (!virtual.sidebarManifestUrl) {
      return
    }

    let active = true
    void fetch(virtual.sidebarManifestUrl, { cache: 'no-store' })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`sidebar request failed: ${response.status}`)
        }
        return response.json()
      })
      .then((value: unknown) => {
        if (!isSidebarManifest(value) || !virtual.sidebarManifestUrl) {
          throw new Error('invalid sidebar manifest')
        }
        return fetch(
          new URL(
            value.fileName,
            new URL(virtual.sidebarManifestUrl, window.location.href),
          ),
          {
            cache: 'force-cache',
          },
        )
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`sidebar asset request failed: ${response.status}`)
        }
        return response.json()
      })
      .then((value: unknown) => {
        if (active && isSidebarPayload(value)) {
          setPayload(value)
        }
      })
      .catch(() => {
        // Keep the Rspress fallback when the shared asset is unavailable.
      })

    return () => {
      active = false
    }
  }, [])

  const sharedSidebar = useMemo(() => {
    const localeSidebar = payload?.locales?.find(
      (item) => item.lang === lang,
    )?.sidebar
    const sidebar = localeSidebar ?? payload?.sidebar
    return sidebar ? getSidebarDataGroup(sidebar, pathname) : fallback
  }, [fallback, lang, pathname, payload])

  useEffect(() => {
    setSidebarData(expandActiveSidebar(sharedSidebar, activeMatcher))
  }, [activeMatcher, sharedSidebar])

  return (
    <SidebarList sidebarData={sidebarData} setSidebarData={setSidebarData} />
  )
}

const isSidebarManifest = (value: unknown): value is SharedSidebarManifest =>
  typeof value === 'object' &&
  value !== null &&
  'fileName' in value &&
  typeof value.fileName === 'string' &&
  /^sidebar\.[0-9a-f]{64}\.json$/.test(value.fileName)
