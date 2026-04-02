import {
  isProduction,
  NoSSR,
  useLocaleSiteData,
  useSite,
} from '@rspress/core/runtime'
import { type NavItem, type NavItemWithLink } from '@rspress/shared'
import virtual from 'doom-@global-virtual'
import { noop } from 'es-toolkit'
import { useEffect, useMemo, useState } from 'react'
import siteData from 'virtual-site-data'
import { parse } from 'yaml'

import {
  ACP_BASE,
  getPdfName,
  getUnversionedVersion,
  isExplicitlyUnversioned,
} from '../../shared/index.ts'

import { useForceRender } from './context.tsx'

import { useLang, useTranslation } from '@alauda/doom/runtime'

type HackNavItem = NavItem & {
  _hacked: true
}

const LEGACY_VERSIONS = ['3.18.1', '3.18.0', '3.16', '3.14']

const LEGACY_NAV_ITEMS = LEGACY_VERSIONS.map((v) => ({
  text: v,
  link: `https://cloud.alauda.cn/v3/document/navigation?version=v${v}&language=true`,
}))

const ALLOWED_LEGACY_DOMAINS = new Set(['docs.alauda.cn'])

if (!isProduction()) {
  ALLOWED_LEGACY_DOMAINS.add('localhost')
}

const VersionsNav_ = () => {
  const { site } = useSite()
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  const { nav } = useLocaleSiteData()

  const configNav = useMemo(
    () => (Array.isArray(nav) ? nav : nav!.default),
    [nav],
  )

  // hack to rerender nav when configNav is changed
  const forceRender = useForceRender()

  const lang = useLang()

  const t = useTranslation()

  const siteTitle = site.originalTitle ?? site.title

  const downloadLink = useMemo(() => {
    if (!virtual.download) {
      return
    }

    return getPdfName(lang, virtual.userBase, siteTitle)
  }, [lang, siteTitle])

  const [versionsBase, version] = useMemo(() => {
    const unversionedVersion = getUnversionedVersion(virtual.version)

    if (!unversionedVersion) {
      return []
    }

    return [
      isExplicitlyUnversioned(virtual.version)
        ? undefined
        : siteData.base.slice(0, -unversionedVersion.length - 1),
      unversionedVersion,
    ]
  }, [])

  const [versions, setVersions] = useState<string[]>(version ? [version] : [])

  useEffect(() => {
    const fetchVersions = async () => {
      if (versionsBase == null) {
        return
      }
      const res = await fetch(
        `${isProduction() ? versionsBase : siteData.base}versions.yaml`,
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

    void fetchVersions().catch(noop)
  }, [version, versionsBase])

  const navList = useMemo(() => {
    const navList: HackNavItem[] = []
    if (downloadLink) {
      navList.push({
        text: t('download_pdf'),
        link: downloadLink,
        _hacked: true,
      })
    }

    if (versionsBase == null) {
      if (version) {
        navList.push({ text: version, items: [], _hacked: true })
      }
    } else {
      const versionItems: NavItem[] = versions.map((v) => ({
        text: v,
        link: `${location.protocol}//${location.host}${versionsBase}${v}/`,
        activeMatch: v === version ? '.' : undefined,
      }))
      if (
        ALLOWED_LEGACY_DOMAINS.has(location.hostname) &&
        virtual.userBase === ACP_BASE
      ) {
        versionItems.push(...LEGACY_NAV_ITEMS)
      }
      navList.push({
        text: version,
        items: versionItems as NavItemWithLink[],
        _hacked: true,
      })
    }
    return navList
  }, [downloadLink, t, version, versionsBase, versions])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    configNav.length = configNav.filter(
      (item) => !('_hacked' in item && item._hacked === true),
    ).length
    configNav.push(...navList)
    forceRender()
  }, [configNav, forceRender, navList])

  return null
}

export const VersionsNav = () => (
  <NoSSR>
    <VersionsNav_ />
  </NoSSR>
)

export default VersionsNav
