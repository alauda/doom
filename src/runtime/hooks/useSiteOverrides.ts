import { isProduction, useLang, usePageData } from '@rspress/core/runtime'
import { useEffect, useMemo, useState } from 'react'
import { parse } from 'yaml'

import { SiteBrand } from '../types.js'
import { DoomSite } from '../../shared/types.js'

import virtual from 'doom-@global-virtual'

export interface SiteOverrides {
  brand?: SiteBrand
  title?: string
  logoText?: string
}

export type SiteOverridesWithLangs = {
  [K in keyof SiteOverrides]: Record<string, SiteOverrides[K]>
}

const DEFAULT_SITE_BRAND: Record<'en' | 'zh', SiteBrand> = {
  en: {
    company: 'Alauda',
    product: 'Alauda Container Platform',
    productShort: 'ACP',
  },
  zh: {
    company: '灵雀云',
    product: '灵雀云容器平台',
    productShort: 'ACP',
  },
}

let siteOverrides: SiteOverridesWithLangs | undefined
let promise: Promise<SiteOverridesWithLangs> | undefined

const fetchSiteOverrides = async (
  base: string,
  version?: string,
  acpSite?: DoomSite,
): Promise<SiteOverridesWithLangs> => {
  if (promise) {
    return promise
  }

  const acpSiteOverridesUrl =
    acpSite && isProduction()
      ? `${acpSite.base}${version ? acpSite.version + '/' : ''}overrides.yaml`
      : null
  const siteOverridesUrl = `${isProduction() ? base : '/'}overrides.yaml`

  const urls = [acpSiteOverridesUrl]
  if (acpSiteOverridesUrl !== siteOverridesUrl) {
    urls.push(siteOverridesUrl)
  }

  return (promise = Promise.all(
    urls.map(async (url) => {
      if (!url) {
        return
      }
      const res = await fetch(url)
      if (!res.ok) {
        return
      }
      try {
        return parse(await res.text()) as SiteOverridesWithLangs
      } catch {
        //
      }
    }),
  ).then(
    ([acpSiteOverrides, siteOverrides]) =>
      (siteOverrides = {
        brand: acpSiteOverrides?.brand ?? DEFAULT_SITE_BRAND,
        ...siteOverrides,
      }),
  )).catch(() => ({}))
}

export const useSiteOverrides = (): SiteOverrides => {
  const { siteData } = usePageData()

  const [siteOverridesWithLangs, setSiteOverridesWithLangs] =
    useState(siteOverrides)

  const lang = useLang() || 'zh'

  const acpSite = useMemo(
    () => virtual.sites?.find((s) => s.name === 'acp'),
    [],
  )

  useEffect(() => {
    if (siteOverrides) {
      return
    }
    void fetchSiteOverrides(siteData.base, virtual.version, acpSite).then(
      setSiteOverridesWithLangs,
    )
  }, [])

  return useMemo(() => {
    if (!siteOverridesWithLangs) {
      return {}
    }

    return Object.entries(siteOverridesWithLangs).reduce<SiteOverrides>(
      (acc, [key, value]) => {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!value) {
          return acc
        }
        // @ts-expect-error - don't waste time on typing
        acc[key] = value[lang] || value.en
        return acc
      },
      {},
    )
  }, [siteOverridesWithLangs, lang])
}
