import { Tag } from '@rspress/core/theme'
import {
  isExternalUrl,
  matchNavbar,
  type NavItem,
  type NavItemWithChildren,
  type NavItemWithLink,
  type NavItemWithLinkAndChildren,
} from '@rspress/shared'
import { useRef, useState, type ReactNode } from 'react'

import { Down } from './Down.js'
import {
  NavMenuSingleItem,
  type NavMenuSingleItemProps,
} from './NavMenuSingleItem.js'
import { SvgWrapper } from './SvgWrapper.js'

export interface NavMenuGroupItem {
  text?: string | ReactNode
  link?: string
  items: NavItem[]
  tag?: string
  // Design for i18n highlight.
  activeValue?: string
  // Current pathname.
  pathname?: string
  // Base path.
  base?: string
  // Locales
  langs?: string[]
}

function ActiveGroupItem({ item }: { item: NavItemWithLink }) {
  return (
    <div
      key={item.link}
      className="rp-rounded-2xl rp-my-1 rp-flex"
      style={{
        padding: '0.4rem 1.5rem 0.4rem 0.75rem',
      }}
    >
      {item.tag && <Tag tag={item.tag} />}
      <span className="rp-text-brand">{item.text}</span>
    </div>
  )
}

function NormalGroupItem({ item }: { item: NavItemWithLink }) {
  return (
    <div key={item.link} className="rp-font-medium rp-my-1">
      <a
        href={item.link}
        target={isExternalUrl(item.link) ? '_blank' : undefined}
        rel="noopener noreferrer"
      >
        <div
          className="rp-rounded-2xl hover:rp-bg-mute"
          style={{
            padding: '0.4rem 1.5rem 0.4rem 0.75rem',
          }}
        >
          <div className="rp-flex">
            {item.tag && <Tag tag={item.tag} />}
            <span>{item.text}</span>
          </div>
        </div>
      </a>
    </div>
  )
}

export function NavMenuGroup(item: NavMenuGroupItem) {
  const {
    activeValue,
    items: groupItems,
    base = '',
    link = '',
    pathname = '',
  } = item
  const [isOpen, setIsOpen] = useState(false)
  const closeTimerRef = useRef<number>(null)

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }

  /**
   * Handle mouse leave event for the dropdown menu
   * Closes the menu after a 150ms delay to allow diagonal mouse movement
   * to the dropdown content area
   */
  const handleMouseLeave = () => {
    closeTimerRef.current = window.setTimeout(() => {
      setIsOpen(false)
    }, 150)
  }

  const handleMouseEnter = () => {
    clearCloseTimer()
    setIsOpen(true)
  }

  const renderLinkItem = (item: NavItemWithLink) => {
    const isLinkActive = matchNavbar(item, pathname, base)
    if (activeValue === item.text || (!activeValue && isLinkActive)) {
      return <ActiveGroupItem key={item.link} item={item} />
    }
    return <NormalGroupItem key={item.link} item={item} />
  }

  const renderGroup = (
    item: NavItemWithChildren | NavItemWithLinkAndChildren,
  ) => {
    return (
      <div>
        {'link' in item ? (
          renderLinkItem(item)
        ) : (
          <p className="rp-font-bold rp-text-gray-400 rp-my-1 not:first:rp-border">
            {item.text}
          </p>
        )}
        {item.items.map(renderLinkItem)}
      </div>
    )
  }

  return (
    <div
      className="rp-relative rp-flex rp-items-center rp-justify-center rp-h-14"
      onMouseLeave={handleMouseLeave}
    >
      <div
        onMouseEnter={handleMouseEnter}
        className="rspress-nav-menu-group-button rp-flex rp-justify-center rp-items-center rp-font-medium rp-text-sm rp-text-text-1 hover:rp-text-text-2 rp-transition-colors rp-duration-200 rp-cursor-pointer"
      >
        {link ? (
          <NavMenuSingleItem
            {...(item as NavMenuSingleItemProps)}
            rightIcon={<SvgWrapper icon={Down} />}
          />
        ) : (
          <>
            <span
              className="rp-text-sm rp-font-medium rp-flex"
              style={{
                marginRight: '2px',
              }}
            >
              <Tag tag={item.tag} />
              {item.text}
            </span>
            <SvgWrapper icon={Down} />
          </>
        )}
      </div>
      <div
        className="rspress-nav-menu-group-content rp-absolute rp-mx-0.8 rp-transition-opacity rp-duration-300"
        style={{
          opacity: isOpen ? 1 : 0,
          visibility: isOpen ? 'visible' : 'hidden',
          right: 0,
          top: '52px',
        }}
        onMouseEnter={clearCloseTimer}
      >
        <div
          className="rp-p-3 rp-pr-2 rp-w-full rp-h-full rp-max-h-100vh rp-whitespace-nowrap"
          style={{
            boxShadow: 'var(--rp-shadow-3)',
            zIndex: 100,
            border: '1px solid var(--rp-c-divider-light)',
            borderRadius: 'var(--rp-radius-large)',
            background: 'var(--rp-c-bg)',
          }}
        >
          {/* The item could be a link or a sub group */}
          {groupItems.map((item) => (
            <div key={item.text}>
              {'items' in item ? renderGroup(item) : renderLinkItem(item)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
