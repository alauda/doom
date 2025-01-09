import {
  isProduction,
  removeTrailingSlash,
  usePageData,
} from '@rspress/core/runtime'
import { noop } from 'es-toolkit'
import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { parse } from 'yaml'

import { ExtendedPageData } from '../../runtime/types.js'
import { NavMenuGroup } from './NavMenuGroup.js'

export const VersionsNav = () => {
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

  const [navMenu, setNavMenu] = useState<Element | null>()

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
      setNavMenu(document.querySelector('.rspress-nav-menu'))
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
        setNavMenu(document.querySelector('.rspress-nav-menu'))
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
    document.querySelector('.rspress-nav-menu')!,
  )
}

export default VersionsNav
