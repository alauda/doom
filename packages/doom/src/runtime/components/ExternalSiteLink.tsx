import { useSite } from '@rspress/core/runtime'
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

import { isUnversioned } from '../../shared/helpers.js'
import { useIsPrint } from '../hooks/index.js'

import { useLang } from '@alauda/doom/runtime'

export interface ExternalSiteLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
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

  const { site: siteData } = useSite()

  const site = useMemo(
    () => virtual.sites?.find((s) => s.name === name),
    [name],
  )
  const lang = useLang()

  if (!site) {
    throw new Error(
      `No site with name \`${name}\` found, please ensure it's already defined at \`sites.yaml\``,
    )
  }

  if (isExternalUrl(href)) {
    throw new Error(`Invalid href \`${href}\` found`)
  }

  let { url, hash } = parseUrl(href)

  const extname = url.split('.').at(-1)

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
        (lang !== siteData.lang ? addTrailingSlash(lang) : '') +
        (hash ? `${url}#${hash}` : url)
      }
      target="_blank"
      rel="noopener noreferrer"
      className={clsx('rp-link', className)}
      {...props}
    />
  )
}

export const ExternalSiteLink = (props: ExternalSiteLinkProps) => (
  <ExternalSiteLink_ {...props} />
)

export default ExternalSiteLink
