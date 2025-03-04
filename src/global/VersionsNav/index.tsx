import { useTranslation } from '@alauda/doom/runtime'
import {
  isProduction,
  removeTrailingSlash,
  useLang,
  usePageData,
} from '@rspress/core/runtime'
import { noop } from 'es-toolkit'
import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { parse } from 'yaml'

import { getPdfName } from '../../shared/index.js'
import { NavMenuGroup } from './NavMenuGroup.js'
import { NavMenuSingleItem } from './NavMenuSingleItem.js'

import virtual from 'doom-@global-virtual'

const getNavMenu = () => {
  if (typeof document === 'undefined') {
    return null
  }
  return document.querySelector('.rspress-nav-menu')
}

export const VersionsNav = () => {
  const { siteData } = usePageData()

  const lang = useLang()

  const t = useTranslation()

  const downloadLink = useMemo(() => {
    if (!virtual.download) {
      return
    }

    return siteData.base + getPdfName(lang, virtual.userBase, siteData.title)
  }, [lang, siteData.base, siteData.title])

  const [versionsBase, version] = useMemo(() => {
    if (!virtual.version) {
      return []
    }

    return [
      removeTrailingSlash(siteData.base).slice(0, -virtual.version.length - 1),
      virtual.version,
    ]
  }, [siteData.base])

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

  const versionItems = useMemo(
    () =>
      versions?.map((v) => ({
        text: v,
        link: `${versionsBase}/${v}/`,
        activeMatch: v,
      })),
    [versionsBase, versions],
  )

  if (!versions?.length && !virtual.download) {
    return null
  }

  return createPortal(
    <>
      {downloadLink && (
        <NavMenuSingleItem text={t('download')} link={downloadLink} download />
      )}
      {!versionItems?.length || (
        <NavMenuGroup
          text={version}
          base={versionsBase}
          items={versionItems}
          pathname={siteData.base}
        />
      )}
    </>,
    getNavMenu()!,
  )
}

export default VersionsNav
