import { useLang, usePageData } from '@rspress/core/runtime'
import { FC, useMemo } from 'react'

import { ExtendedPageData } from '../types.js'
import { handleCJKWhitespaces } from '../utils.js'
import { Directive } from './_Directive.js'
import { ExternalSiteLink } from './ExternalSiteLink.js'

export interface ExternalSiteProps {
  name: string
}

export interface ExternalSiteNoteProps {
  name: string
  displayName: string
}

const Notes: Partial<Record<string, FC<ExternalSiteNoteProps>>> = {
  en({ name, displayName }) {
    return (
      <>
        Because {displayName} releases on a different cadence from Alauda
        Container Platform, the {displayName} documentation is now available as
        a separate documentation set at{' '}
        <ExternalSiteLink name={name}>{displayName}</ExternalSiteLink>.
      </>
    )
  },
  zh({ name, displayName }) {
    const displayName_ = handleCJKWhitespaces(displayName)
    return (
      <>
        因为{displayName_}的发版周期与灵雀云容器平台不同，所以{displayName_}
        的文档现在作为独立的文档站点托管在
        {displayName_.startsWith(' ') ? ' ' : ''}
        <ExternalSiteLink name={name}>{displayName}</ExternalSiteLink>。
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
      <Note name={name} displayName={displayName} />
    </Directive>
  )
}

export default ExternalSite
