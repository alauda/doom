import { useLang } from '@rspress/core/runtime'
import { type FC, useMemo } from 'react'

import { handleCJKWhitespaces } from '../utils.js'
import Directive from './Directive.js'
import ExternalSiteLink from './ExternalSiteLink.js'

import virtual from 'doom-@global-virtual'

export interface ExternalSiteBaseProps {
  name: string
  template?: 'apisOverview'
}

export interface ExternalSiteNoteProps {
  name: string
  displayName: string
}

export type Notes = Partial<Record<string, FC<ExternalSiteNoteProps>>>

const SiteNotes: Notes = {
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

const ApisOverviewNotes: Notes = {
  en({ name, displayName }) {
    return (
      <>
        For the introduction to the usage methods of {displayName} APIs, please
        refer to{' '}
        <ExternalSiteLink name={name} href="apis/overview/">
          {displayName} APIs Guide
        </ExternalSiteLink>
        .
      </>
    )
  },
  zh({ name, displayName }) {
    const displayName_ = handleCJKWhitespaces(displayName)
    return (
      <>
        关于{displayName_} APIs 的使用方法介绍请参考
        {displayName_.startsWith(' ') ? ' ' : ''}
        <ExternalSiteLink name={name} href="apis/overview/">
          {displayName} APIs 指南
        </ExternalSiteLink>
        。
      </>
    )
  },
}

export const ExternalSiteBase = ({ name, template }: ExternalSiteBaseProps) => {
  const site = useMemo(() => virtual.sites?.find((s) => s.name === name), [])
  const lang = useLang()

  const displayName = useMemo(
    () =>
      site?.displayName?.[lang] || site?.displayName?.en || name.toUpperCase(),
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

  const Notes = template === 'apisOverview' ? ApisOverviewNotes : SiteNotes

  const Note = Notes[lang] || Notes.en!

  return (
    <Directive title="Note">
      <Note name={name} displayName={displayName} />
    </Directive>
  )
}
