import {
  getSidebarDataGroup,
  useLang,
  useLocation,
  useSidebar,
} from '@rspress/core/runtime'
import { SidebarList } from '@rspress/core/theme'
import type { NormalizedSidebar, SidebarData } from '@rspress/shared'
import virtual from 'doom-@global-virtual'
import { useEffect, useMemo, useState } from 'react'

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
  const [payload, setPayload] = useState<SharedSidebarPayload>()
  const [sidebarData, setSidebarData] = useState<SidebarData>(fallback)

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
        return fetch(new URL(value.fileName, virtual.sidebarManifestUrl), {
          cache: 'force-cache',
        })
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
        // The page keeps the embedded Rspress fallback when the shared asset is unavailable.
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
    setSidebarData(sharedSidebar)
  }, [sharedSidebar])

  if (typeof window === 'undefined') {
    return null
  }

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
