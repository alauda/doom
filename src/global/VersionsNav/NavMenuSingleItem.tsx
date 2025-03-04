import { Tag } from '@rspress/core/theme'
import {
  isExternalUrl,
  withoutBase,
  type NavItemWithLink,
} from '@rspress/shared'
import { useMemo, type ReactNode } from 'react'

import styles from '../../../styles/versions-nav.module.scss'

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
  compact,
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
        } text-sm font-medium ${compact ? 'mx-0.5' : 'mx-1.5'} px-3 py-2 flex items-center`}
      >
        <Tag tag={tag} />
        {text}
        {rightIcon}
      </div>
    </a>
  )
}
