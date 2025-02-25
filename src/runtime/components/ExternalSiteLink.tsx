import { useLang } from '@rspress/core/runtime'
import {
  addTrailingSlash,
  isExternalUrl,
  removeLeadingSlash,
} from '@rspress/shared'
import clsx from 'clsx'
import { type AnchorHTMLAttributes, type ReactNode, useMemo } from 'react'

import { Directive } from './Directive.js'

import virtual from 'doom-@global-virtual'

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
  const site = useMemo(() => virtual.sites?.find((s) => s.name === name), [])
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

  return (
    <a
      href={
        (virtual.version
          ? addTrailingSlash(site.base + site.version)
          : site.base) +
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
