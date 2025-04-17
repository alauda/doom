import { Tag } from '@rspress/core/theme'
import {
  isExternalUrl,
  withoutBase,
  type NavItem,
  type NavItemWithChildren,
  type NavItemWithLink,
  type NavItemWithLinkAndChildren,
} from '@rspress/shared'
import { useCallback, useState, type ReactNode } from 'react'

import { SvgDown } from './Down.js'
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
  // Currrnt pathname.
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
      className="rounded-2xl my-1 flex"
      style={{
        padding: '0.4rem 1.5rem 0.4rem 0.75rem',
      }}
    >
      {item.tag && <Tag tag={item.tag} />}
      <span className="text-brand">{item.text}</span>
    </div>
  )
}

function NormalGroupItem({ item }: { item: NavItemWithLink }) {
  return (
    <div key={item.link} className="font-medium my-1">
      <a
        href={item.link}
        target={isExternalUrl(item.link) ? '_blank' : undefined}
        rel="noopener noreferrer"
      >
        <div
          className="rounded-2xl hover:bg-mute"
          style={{
            padding: '0.4rem 1.5rem 0.4rem 0.75rem',
          }}
        >
          <div className="flex">
            {item.tag && <Tag tag={item.tag} />}
            <span>{item.text}</span>
          </div>
        </div>
      </a>
    </div>
  )
}

export function NavMenuGroup(item: NavMenuGroupItem) {
  const { activeValue, items: groupItems, base = '', pathname = '' } = item
  const [isOpen, setIsOpen] = useState(false)

  const onOpen = useCallback(() => {
    setIsOpen(true)
  }, [])

  const onClose = useCallback(() => {
    setIsOpen(false)
  }, [])

  const renderLinkItem = (item: NavItemWithLink) => {
    const isLinkActive = new RegExp(item.activeMatch || item.link).test(
      withoutBase(pathname, base),
    )
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
          <p className="font-bold text-gray-400 my-1 not:first:border">
            {item.text}
          </p>
        )}
        {item.items.map(renderLinkItem)}
      </div>
    )
  }

  const hasMultiItems = groupItems.length > 1

  const Content = hasMultiItems || item.link ? 'button' : 'span'

  const content = (
    <Content
      onMouseEnter={hasMultiItems ? onOpen : undefined}
      className={`${Content === 'button' ? 'rspress-nav-menu-group-button ' : ''}flex-center items-center font-medium text-sm text-text-1${hasMultiItems ? ' hover:text-text-2 transition-colors duration-200' : ''}`}
    >
      {item.link ? (
        <NavMenuSingleItem
          {...(item as NavMenuSingleItemProps)}
          rightIcon={<SvgWrapper icon={SvgDown} />}
        />
      ) : (
        <>
          <span
            className="text-sm font-medium flex"
            style={hasMultiItems ? { marginRight: '2px' } : undefined}
          >
            <Tag tag={item.tag} />
            {item.text}
          </span>
          {hasMultiItems && <SvgWrapper icon={SvgDown} />}
        </>
      )}
    </Content>
  )

  return hasMultiItems ? (
    <div className="relative flex-center h-14" onMouseLeave={onClose}>
      {content}
      <div
        className="rspress-nav-menu-group-content absolute mx-0.8 transition-opacity duration-300"
        style={{
          opacity: isOpen ? 1 : 0,
          visibility: isOpen ? 'visible' : 'hidden',
          right: 0,
          top: '52px',
        }}
      >
        <div
          className="p-3 pr-2 w-full h-full max-h-100vh whitespace-nowrap"
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
  ) : (
    content
  )
}
