import {
  isProduction,
  removeTrailingSlash,
  usePageData,
} from '@rspress/core/runtime'
import { noop } from 'es-toolkit'
import { type FC, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { parse } from 'yaml'

import { ExtendedPageData } from '../../runtime/types.js'
import { NavMenuGroup } from './NavMenuGroup.js'

const getNavMenu = () => {
  if (typeof document === 'undefined') {
    return null
  }
  return document.querySelector('.rspress-nav-menu')
}

export const VersionsNav: FC = () => {
  const { siteData, page } = usePageData() as ExtendedPageData

  const [versionsBase, version] = useMemo(() => {
    if (!page.v) {
      return []
    }

    return [
      removeTrailingSlash(siteData.base).slice(0, -page.v.length - 1),
      page.v,
    ]
  }, [siteData.base, page.v])

  const [navMenu, setNavMenu] = useState(getNavMenu)

  const [versions, setVersions] = useState<string[]>()

  useEffect(() => {
    const fetchVersions = async () => {
      if (versionsBase == null) {
        return
      }
      const res = await fetch(
        `${isProduction() ? versionsBase : ''}/versions.yaml`,
      )
      const text = await res.text()
      setNavMenu(getNavMenu())
      const versions = parse(text) as string[]
      if (version && !versions.includes(version)) {
        versions.unshift(version)
      }
      setVersions(versions)
    }

    fetchVersions().catch(noop)
  }, [])

  // hack way to detect nav menu recreation on theme change
  useEffect(() => {
    if (!navMenu) {
      return
    }
    const observer = new MutationObserver((mutations) => {
      if (mutations.some((m) => m.removedNodes.length)) {
        setNavMenu(getNavMenu)
      }
    })
    observer.observe(navMenu, { childList: true })
    return () => {
      observer.disconnect()
    }
  }, [navMenu])

  if (!versions?.length) {
    return null
  }

  return createPortal(
    <NavMenuGroup
      text={version}
      base={versionsBase}
      items={versions.map((v) => ({
        text: v,
        link: `${versionsBase}/${v}/`,
        activeMatch: v,
      }))}
      pathname={siteData.base}
    />,
    getNavMenu()!,
  )
}

export default VersionsNav
