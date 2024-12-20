import { Tag } from '@rspress/core/theme'
import {
  type NavItemWithLink,
  type NavItemWithLinkAndChildren,
  withoutBase,
} from '@rspress/shared'

import styles from '../../../styles/versions-nav.module.scss'

interface Props {
  pathname: string
  langs?: string[]
  base: string
  rightIcon?: React.ReactNode
  compact?: boolean
}

export function NavMenuSingleItem(
  item: (NavItemWithLink | NavItemWithLinkAndChildren) & Props,
) {
  const { pathname, base } = item
  const isActive = new RegExp(item.activeMatch || item.link).test(
    withoutBase(pathname, base),
  )

  return (
    <a href={item.link}>
      <div
        key={item.text}
        className={`rspress-nav-menu-item ${styles.singleItem} ${
          isActive ? styles.activeItem : ''
        } text-sm font-medium ${item.compact ? 'mx-0.5' : 'mx-1.5'} px-3 py-2 flex items-center`}
      >
        <Tag tag={item.tag} />
        {item.text}
        {item.rightIcon}
      </div>
    </a>
  )
}
