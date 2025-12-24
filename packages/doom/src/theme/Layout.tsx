import { useLang, useSite } from '@rspress/core/runtime'
import {
  Link,
  Layout as OriginalLayout,
  getCustomMDXComponent,
} from '@rspress/core/theme-original'
import virtual from 'doom-@global-virtual'
import { useCallback, useMemo, useState } from 'react'
import { useLocation } from 'react-router'

import type {
  DoomSidebar,
  DoomSidebarGroup,
  DoomSidebarItem,
} from '../plugins/index.ts'
import { useTranslation } from '../runtime/index.ts'
import type { ExportItem } from '../types.ts'

import { ForceRenderContext } from './VersionsNav/context.tsx'
import { VersionsNav } from './VersionsNav/index.tsx'

const X = getCustomMDXComponent()

export interface MatchedSidebar {
  sidebar: DoomSidebarGroup | DoomSidebarItem
  exportItem: ExportItem
  depth: number
}

const cleanupUrlPath = (urlPath: string) => {
  if (urlPath.endsWith('.html')) {
    urlPath = urlPath.slice(0, -5)
  }
  if (urlPath.endsWith('/index')) {
    urlPath = urlPath.slice(0, -5)
  }
  return urlPath
}

const getClosestSidebar_ = (
  sidebarItems: DoomSidebar[],
  pathname: string,
  exportItem: ExportItem,
  matched?: MatchedSidebar,
  depth = 0,
): MatchedSidebar | undefined => {
  pathname = cleanupUrlPath(pathname)
  for (const sidebar of sidebarItems) {
    if ('_fileKey' in sidebar && sidebar._fileKey) {
      if (depth === 0) {
        matched = undefined
      }

      if (exportItem.flattenScope!.includes(sidebar._fileKey)) {
        matched = {
          sidebar,
          exportItem,
          depth,
        }
      }

      const sidebarLink = cleanupUrlPath(sidebar.link || '')
      if (sidebarLink === pathname) {
        return matched
      }
    }

    if ('items' in sidebar) {
      const found = getClosestSidebar_(
        sidebar.items,
        pathname,
        exportItem,
        matched,
        depth + 1,
      )
      if (found) {
        return found
      }
    }
  }
}

const getClosestSidebar = (sidebarItems: DoomSidebar[], pathname: string) => {
  let found: MatchedSidebar | undefined
  for (const item of virtual.export!) {
    const matched = getClosestSidebar_(sidebarItems, pathname, item)
    if (matched) {
      if (!found || matched.depth >= found.depth) {
        found = matched
      }
    }
  }
  return found
}

export const Layout = () => {
  const {
    site: { lang: siteLang, themeConfig },
  } = useSite()

  const lang = useLang()

  const t = useTranslation()

  const { pathname } = useLocation()

  const found = useMemo(() => {
    if (!virtual.download || !virtual.export?.length) {
      return
    }

    if (themeConfig.locales.length) {
      let found: MatchedSidebar | undefined

      for (const { lang, sidebar } of themeConfig.locales) {
        const sidebarItems = sidebar[
          siteLang === lang ? '/' : `/${lang}`
        ] as DoomSidebar[]

        found ??= getClosestSidebar(sidebarItems, pathname)

        if (found) {
          return found
        }
      }
    } else {
      const sidebarItems = themeConfig.sidebar['/'] as DoomSidebar[]
      return getClosestSidebar(sidebarItems, pathname)
    }
  }, [pathname, siteLang, themeConfig])

  const pdfLink = useMemo(
    () =>
      found && `/${found.exportItem.name ?? found.sidebar.text}-${lang}.pdf`,
    [found, lang],
  )

  const [render, setRender] = useState(false)
  const forceRender = useCallback(() => {
    setRender((v) => !v)
  }, [])

  return (
    <ForceRenderContext
      value={useMemo(
        () => ({ value: render, setValue: forceRender }),
        [forceRender, render],
      )}
    >
      <VersionsNav />
      <OriginalLayout
        beforeOutline={
          <X.p className="rp-doc" style={{ marginBottom: 16 }}>
            <Link href={pdfLink} target="_blank" rel="noopener noreferrer">
              {t('view_docs_as_pdf')}
            </Link>
          </X.p>
        }
      />
    </ForceRenderContext>
  )
}
