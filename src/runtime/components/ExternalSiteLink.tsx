import { useLang, usePageData } from '@rspress/core/runtime'
import {
  addTrailingSlash,
  isExternalUrl,
  removeLeadingSlash,
} from '@rspress/shared'
import clsx from 'clsx'
import { AnchorHTMLAttributes, ReactNode, useMemo } from 'react'

import { normalizeVersion } from '../../shared/index.js'
import { ExtendedPageData } from '../types.js'
import { Directive } from './Directive.js'

import classes from '../../../styles/link.module.scss'

export interface ExternalSiteLinkProps
  extends AnchorHTMLAttributes<HTMLAnchorElement> {
  name: string
  children: ReactNode
}

export const ExternalSiteLink = ({
  name,
  href = '',
  className,
  ...props
}: ExternalSiteLinkProps) => {
  const { page } = usePageData() as ExtendedPageData
  const site = useMemo(() => page.sites?.find((s) => s.name === name), [])
  const lang = useLang()

  if (!site) {
    return (
      <Directive type="danger">
        No site with name `{name}` found, please ensure it's already defined at
        `sites.yaml`
      </Directive>
    )
  }

  if (isExternalUrl(href)) {
    return <Directive type="danger">Invalid href `{href}` found</Directive>
  }

  const siteBase = addTrailingSlash(site.base)

  return (
    <a
      href={
        (page.v
          ? addTrailingSlash(siteBase + normalizeVersion(site.version))
          : siteBase) +
        (lang ? `${lang}/` : '') +
        removeLeadingSlash(href)
      }
      target="_blank"
      rel="noopener noreferrer"
      className={clsx(classes.link, 'cursor-pointer', className)}
      {...props}
    />
  )
}

export default ExternalSiteLink
