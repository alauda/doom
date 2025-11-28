import type { NavItemWithLink } from '@rspress/core'
import { Tag } from '@rspress/core/theme'
import { isExternalUrl } from '@rspress/shared'
import { useMemo, type ReactNode } from 'react'

import { withoutBase } from '../../shared/index.ts'

import styles from '@alauda/doom/styles/versions-nav.module.scss'

export interface NavMenuSingleItemProps extends Omit<NavItemWithLink, 'text'> {
  base?: string
  compact?: boolean
  download?: string | boolean
  pathname?: string
  rightIcon?: ReactNode
  text?: ReactNode
}

export function NavMenuSingleItem({
  activeMatch,
  base,
  download,
  link,
  pathname,
  rightIcon,
  text,
  tag,
}: NavMenuSingleItemProps) {
  const isActive = useMemo(
    () =>
      !!base &&
      !!pathname &&
      new RegExp(activeMatch || link).test(withoutBase(pathname, base)),
    [activeMatch, base, link, pathname],
  )

  return (
    <a
      key={link}
      href={link}
      download={download}
      target={isExternalUrl(link) ? '_blank' : undefined}
      rel="noopener noreferrer"
    >
      <div
        className={`rspress-nav-menu-item ${styles.singleItem} ${
          isActive ? styles.activeItem : ''
        } rp-text-sm rp-font-medium rp-px-3 rp-py-2 rp-flex rp-items-center`}
      >
        <Tag tag={tag} />
        {text}
        {rightIcon}
      </div>
    </a>
  )
}
