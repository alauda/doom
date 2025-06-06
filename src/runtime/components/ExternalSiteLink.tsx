import { NoSSR, useLang } from '@rspress/core/runtime'
import {
  addTrailingSlash,
  isExternalUrl,
  normalizeHref,
  parseUrl,
  removeLeadingSlash,
} from '@rspress/shared'
import { DEFAULT_PAGE_EXTENSIONS } from '@rspress/shared/constants'
import { clsx } from 'clsx'
import virtual from 'doom-@global-virtual'
import { type AnchorHTMLAttributes, type ReactNode, useMemo } from 'react'

import classes from '../../../styles/link.module.scss'
import { isUnversioned } from '../../shared/helpers.js'
import { useIsPrint } from '../hooks/index.js'

import { Directive } from './Directive.js'

export interface ExternalSiteLinkProps
  extends AnchorHTMLAttributes<HTMLAnchorElement> {
  name: string
  children: ReactNode
}

const ExternalSiteLink_ = ({
  name,
  href = '',
  className,
  ...props
}: ExternalSiteLinkProps) => {
  const isPrint = useIsPrint()

  const site = useMemo(
    () => virtual.sites?.find((s) => s.name === name),
    [name],
  )
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

  let { url, hash } = parseUrl(href)

  const extname = url.split('.').pop()

  if (extname) {
    if (DEFAULT_PAGE_EXTENSIONS.includes(`.${extname}`)) {
      url = url.replace(new RegExp(`\\.${extname}$`), '')
    }
  }

  url = removeLeadingSlash(normalizeHref(url))

  return (
    <a
      href={
        (isPrint ? 'https://docs.alauda.io' : '') +
        (virtual.prefix || '') +
        (isUnversioned(virtual.version)
          ? site.base
          : addTrailingSlash(site.base + site.version)) +
        (lang ? addTrailingSlash(lang) : '') +
        (hash ? `${url}#${hash}` : url)
      }
      target="_blank"
      rel="noopener noreferrer"
      className={clsx(classes.link, 'rp-cursor-pointer', className)}
      {...props}
    />
  )
}

export const ExternalSiteLink = (props: ExternalSiteLinkProps) => (
  <NoSSR>
    <ExternalSiteLink_ {...props} />
  </NoSSR>
)

export default ExternalSiteLink
