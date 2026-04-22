import { isProduction, withBase } from '@rspress/core/runtime'
import virtual from 'doom-@global-virtual'
import { merge } from 'es-toolkit/compat'
import { useEffect, useMemo, useState } from 'react'
import { xfetch } from 'x-fetch'
import { parse } from 'yaml'

import { isUnversioned, type Language } from '../../shared/index.js'
import type { DoomSite } from '../../shared/types.js'
import { namedTerms, type NamedTerms, type TermName } from '../../terms.js'

import { useLang } from './useTranslation.js'

export type SiteOverridesTerms = Record<TermName, string>

export interface SiteOverridesItem {
  title?: string
  logoText?: string
  terms?: SiteOverridesTerms
}

export type SiteOverrides = {
  [K in Exclude<keyof SiteOverridesItem, 'terms'>]?: Partial<
    Record<Language, SiteOverridesItem[K]>
  >
} & {
  terms?: NamedTerms
}

export type NormalizedSiteOverrides = Record<Language, SiteOverridesItem>

const normalizeOverrides = <K extends string, T>(
  origin: Partial<Record<K, Partial<Record<Language, T>>>>,
) =>
  Object.keys(origin).reduce(
    (acc, key_) => {
      const key = key_ as K
      const term = origin[key]
      if (!term) {
        return acc
      }
      const en = (acc.en[key] = term.en!)
      acc.zh[key] = term.zh || en
      acc.ru[key] = term.ru || en
      return acc
    },
    { en: {}, zh: {}, ru: {} } as Record<Language, Record<K, T>>,
  )

let normalizedSiteOverrides: NormalizedSiteOverrides | undefined
let promise: Promise<NormalizedSiteOverrides> | undefined

const fetchSiteOverrides = async (
  version?: string,
  acpSite?: DoomSite,
): Promise<NormalizedSiteOverrides> => {
  if (promise) {
    return promise
  }

  const acpSiteOverridesUrl =
    acpSite && isProduction()
      ? `${(virtual.prefix || '') + acpSite.base}${isUnversioned(version) ? '' : acpSite.version + '/'}overrides.yaml`
      : null
  const siteOverridesUrl = withBase('overrides.yaml')

  const urls = [acpSiteOverridesUrl]
  if (acpSiteOverridesUrl !== siteOverridesUrl) {
    urls.push(siteOverridesUrl)
  }

  return (promise = Promise.all(
    urls.map(async (url) => {
      if (!url) {
        return
      }
      try {
        return parse(await xfetch(url, { type: 'text' })) as SiteOverrides
      } catch {
        //
      }
    }),
  )
    .then(([acpSiteOverrides, siteOverrides]) => ({
      ...(urls.length === 1 ? acpSiteOverrides : siteOverrides),
      terms: merge(
        {},
        namedTerms,
        acpSiteOverrides?.terms,
        siteOverrides?.terms,
      ),
    }))
    .catch(() => ({ terms: namedTerms }))
    .then(({ terms, ...siteOverrides }) => {
      const overrides = normalizeOverrides(siteOverrides)
      const normalizedTerms = normalizeOverrides(terms)
      return (normalizedSiteOverrides = {
        en: { ...overrides.en, terms: normalizedTerms.en },
        zh: { ...overrides.zh, terms: normalizedTerms.zh },
        ru: { ...overrides.ru, terms: normalizedTerms.ru },
      })
    }))
}

export const useSiteOverrides = (): SiteOverridesItem => {
  const [siteOverrides, setSiteOverrides] = useState(normalizedSiteOverrides)

  const lang = useLang()

  const acpSite = useMemo(
    () => virtual.sites?.find((s) => s.name === 'acp'),
    [],
  )

  useEffect(() => {
    if (normalizedSiteOverrides) {
      return
    }
    void fetchSiteOverrides(virtual.version, acpSite).then(setSiteOverrides)
  }, [acpSite])

  return siteOverrides?.[lang] || {}
}
