import { useLang, usePageData } from '@rspress/core/runtime'
import { addTrailingSlash } from '@rspress/shared'

import { FC, useMemo } from 'react'
import { ExtendedPageData } from '../types.js'
import { handleCJKWhitespaces } from '../utils.js'
import { Directive } from './_Directive.js'

export interface ExternalSiteProps {
  name: string
}

export interface ExternalSiteNoteProps {
  name: string
  href: string
}

const Notes: Partial<Record<string, FC<ExternalSiteNoteProps>>> = {
  en({ name, href }) {
    return (
      <>
        Because {name} releases on a different cadence from Alauda Container
        Platform, the {name} documentation is now available as a separate
        documentation set at{' '}
        <a href={href} target="_blank" rel="noopener noreferrer">
          {name}
        </a>
        .
      </>
    )
  },
  zh({ name, href }) {
    const name_ = handleCJKWhitespaces(name)
    return (
      <>
        因为{name_}的发版周期与灵雀云容器平台不同，所以{name_}
        的文档现在作为独立的文档站点托管在{name_.startsWith(' ') ? ' ' : ''}
        <a href={href} target="_blank" rel="noopener noreferrer">
          {name}
        </a>
        。
      </>
    )
  },
}

export const ExternalSite = ({ name }: ExternalSiteProps) => {
  const { siteData, page } = usePageData() as ExtendedPageData
  const site = useMemo(() => page.sites?.find((s) => s.name === name), [])
  const fallbackLang = siteData.lang || 'zh'
  const lang = useLang() || fallbackLang
  const displayName = useMemo(
    () =>
      site?.displayName?.[lang] || site?.displayName?.[fallbackLang] || name,
    [],
  )
  if (!site) {
    return (
      <Directive type="danger">
        No site with name `{name}` found, please ensure it's already defined at
        `sites.yaml`
      </Directive>
    )
  }
  const Note = Notes[lang] || Notes[fallbackLang] || Notes.en!
  return (
    <Directive title="Note">
      <Note name={displayName} href={addTrailingSlash(site.base)} />
    </Directive>
  )
}

export default ExternalSite
