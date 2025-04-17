import {
  isProduction,
  NoSSR,
  removeTrailingSlash,
  usePageData,
} from '@rspress/core/runtime'
import type { NavItem } from '@rspress/shared'
import virtual from 'doom-@global-virtual'
import { noop } from 'es-toolkit'
import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { parse } from 'yaml'

import {
  ACP_BASE,
  getPdfName,
  getUnversionedVersion,
  isExplicitlyUnversioned,
} from '../../shared/index.js'

import { NavMenuGroup } from './NavMenuGroup.js'
import { NavMenuSingleItem } from './NavMenuSingleItem.js'

import { useLang, useTranslation } from '@alauda/doom/runtime'

const getNavMenu = () => {
  if (typeof document === 'undefined') {
    return null
  }
  return document.querySelector('.rspress-nav-menu')
}

const LEGACY_VERSIONS = ['v3.18.1', 'v3.18.0', 'v3.16', 'v3.14']

const LEGACY_NAV_ITEMS = LEGACY_VERSIONS.map((v) => ({
  text: v,
  link: `https://docs.alauda.io/document/release-notes?version=${v}`,
}))

const ALLOW_LEGACY_DOMAINS = ['docs.alauda.cn', 'docs.alauda.io']

if (!isProduction()) {
  ALLOW_LEGACY_DOMAINS.push('localhost')
}

const VersionsNav_ = () => {
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
    const unversionedVersion = getUnversionedVersion(virtual.version)

    if (!unversionedVersion) {
      return []
    }

    return [
      isExplicitlyUnversioned(virtual.version)
        ? undefined
        : removeTrailingSlash(siteData.base).slice(
            0,
            -unversionedVersion.length - 1,
          ),
      unversionedVersion,
    ]
  }, [siteData.base])

  const [navMenu, setNavMenu] = useState(getNavMenu)

  const [versions, setVersions] = useState<string[]>(version ? [version] : [])

  useEffect(() => {
    const fetchVersions = async () => {
      if (versionsBase == null) {
        if (!version) {
          return
        }
      } else {
        const res = await fetch(
          `${isProduction() ? versionsBase : ''}/versions.yaml`,
        )
        if (!res.ok) {
          return
        }
        const text = await res.text()
        const versions = parse(text) as string[]
        if (version && !versions.includes(version)) {
          versions.unshift(version)
        }
        setVersions(versions)
      }
      setNavMenu(getNavMenu)
    }

    void fetchVersions().catch(noop)
  }, [])

  // hack way to detect nav menu recreation on theme change
  useEffect(() => {
    if (!navMenu?.parentNode) {
      return
    }
    const observer = new MutationObserver((mutations) => {
      if (mutations.some((m) => m.removedNodes.length)) {
        setNavMenu(getNavMenu)
      }
    })
    observer.observe(navMenu.parentNode, { childList: true })
    return () => {
      observer.disconnect()
    }
  }, [navMenu])

  console.log('versionsBase', versionsBase)

  const navItems = useMemo(() => {
    const versionItems: NavItem[] = versions.map((v) =>
      versionsBase == null
        ? { text: v, items: [] }
        : { text: v, link: `${versionsBase}/${v}/`, activeMatch: v },
    )
    if (
      versionsBase != null &&
      ALLOW_LEGACY_DOMAINS.includes(location.hostname) &&
      virtual.userBase === ACP_BASE
    ) {
      versionItems.push(...LEGACY_NAV_ITEMS)
    }
    return versionItems
  }, [versionsBase, versions])

  let finalNavMenu: Element | null

  if (
    (!navItems.length && !virtual.download) ||
    !(finalNavMenu = getNavMenu())
  ) {
    return
  }

  return createPortal(
    <>
      {downloadLink && (
        <NavMenuSingleItem
          text={t('download_pdf')}
          link={downloadLink}
          download
        />
      )}
      {!navItems.length || (
        <NavMenuGroup
          text={version}
          base={versionsBase}
          items={navItems}
          pathname={siteData.base}
        />
      )}
    </>,
    finalNavMenu,
  )
}

export const VersionsNav = () => (
  <NoSSR>
    <VersionsNav_ />
  </NoSSR>
)

export default VersionsNav
