import { isProduction, NoSSR, useSite, withBase } from '@rspress/core/runtime'
import { type NavItem } from '@rspress/shared'
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
} from '../../shared/index.js'

import { NavMenuGroup } from './NavMenuGroup.js'
import { NavMenuSingleItem } from './NavMenuSingleItem.js'

import { useLang, useTranslation } from '@alauda/doom/runtime'

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

  const lang = useLang()

  const t = useTranslation()

  const siteTitle = site.originalTitle ?? site.title

  const downloadLink = useMemo(() => {
    if (!virtual.download) {
      return
    }

    return withBase(getPdfName(lang, virtual.userBase, siteTitle))
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
        if (!version) {
          return
        }
      } else {
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
    }

    void fetchVersions().catch(noop)
  }, [version, versionsBase])

  const navItems = useMemo(() => {
    const versionItems: NavItem[] = versions.map((v) =>
      versionsBase == null
        ? { text: v, items: [] }
        : { text: v, link: `${versionsBase}${v}/`, activeMatch: v },
    )
    if (
      versionsBase != null &&
      ALLOWED_LEGACY_DOMAINS.has(location.hostname) &&
      virtual.userBase === ACP_BASE
    ) {
      versionItems.push(...LEGACY_NAV_ITEMS)
    }
    return versionItems
  }, [versionsBase, versions])

  return (
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
    </>
  )
}

export const VersionsNav = () => (
  <NoSSR>
    <VersionsNav_ />
  </NoSSR>
)

export default VersionsNav
