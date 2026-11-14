import '@rspress/core/dist/theme/layout/DocLayout/index.css'

import { useSidebarMenu } from '@rspress/core/dist/theme/components/SidebarMenu/useSidebarMenu.js'
import { useFrontmatter } from '@rspress/core/runtime'
import {
  DocContent,
  DocFooter,
  Outline,
  Overview,
  useWatchToc,
} from '@rspress/core/theme'
import clsx from 'clsx'
import { Fragment, type FC, type ReactNode } from 'react'

import { DeferredSidebar } from './DeferredSidebar.tsx'

export interface DocLayoutProps {
  beforeSidebar?: ReactNode
  afterSidebar?: ReactNode
  beforeDocFooter?: ReactNode
  afterDocFooter?: ReactNode
  beforeDoc?: ReactNode
  afterDoc?: ReactNode
  beforeDocContent?: ReactNode
  afterDocContent?: ReactNode
  beforeOutline?: ReactNode
  afterOutline?: ReactNode
  navTitle?: ReactNode
  components?: Record<string, FC>
}

export const DocLayout = (props: DocLayoutProps) => {
  const {
    beforeDocFooter,
    afterDocFooter,
    beforeDoc,
    afterDoc,
    beforeDocContent,
    afterDocContent,
    beforeOutline,
    afterOutline,
    beforeSidebar,
    afterSidebar,
    components,
  } = props
  const { frontmatter } = useFrontmatter()
  const isOverviewPage = frontmatter.overview ?? false
  const sidebar = frontmatter.sidebar ?? true
  const showSidebar = true === sidebar
  const showSidebarPlaceholder = false === sidebar || 'placeholder' === sidebar
  const isLegacyPlaceholder = 'placeholder' === sidebar
  const {
    outline: showOutline = true,
    footer: showDocFooter = true,
    pageType,
  } = frontmatter

  const showSidebarMenu = showSidebar || (!isOverviewPage && showOutline)

  const {
    isOutlineOpen,
    isSidebarOpen,
    sidebarMenu,
    asideLayoutRef,
    sidebarLayoutRef,
  } = useSidebarMenu()
  const { rspressDocRef } = useWatchToc()

  if (process.env.__SSR_MD__) {
    return (
      <Fragment>
        {isOverviewPage ? (
          <Overview
            content={
              <DocContent components={components} isOverviewPage={true} />
            }
          />
        ) : (
          <DocContent components={components} />
        )}
      </Fragment>
    )
  }

  const isDocWide = 'doc-wide' === pageType

  return (
    <Fragment>
      {showSidebarMenu && (
        <div className="rp-doc-layout__menu">{sidebarMenu}</div>
      )}
      {beforeDoc}
      <div
        className={clsx(
          'rp-doc-layout__container',
          !showSidebarMenu && 'rp-doc-layout__container--no-menu',
        )}
      >
        {showSidebar ? (
          <aside
            className={clsx(
              'rp-doc-layout__sidebar',
              isSidebarOpen && 'rp-doc-layout__sidebar--open',
              'rp-scrollbar',
            )}
            ref={sidebarLayoutRef}
          >
            {beforeSidebar}
            <DeferredSidebar />
            {afterSidebar}
          </aside>
        ) : showSidebarPlaceholder ? (
          <aside
            className={clsx(
              'rp-doc-layout__sidebar-placeholder',
              isLegacyPlaceholder &&
                'rp-doc-layout__sidebar-placeholder--legacy',
            )}
            style={isDocWide ? { width: '0' } : {}}
          />
        ) : null}
        {isOverviewPage ? (
          <Fragment>
            <main className="rp-doc-layout__overview">
              {beforeDocContent}
              <Overview
                content={
                  <DocContent components={components} isOverviewPage={true} />
                }
              />
              {afterDocContent}
            </main>
          </Fragment>
        ) : (
          <div
            className={clsx(
              'rp-doc-layout__doc',
              isDocWide && 'rp-doc-layout__doc--wide',
            )}
          >
            <main className="rp-doc-layout__doc-container">
              {beforeDocContent}
              <div className="rp-doc rspress-doc" ref={rspressDocRef}>
                <DocContent components={components} />
              </div>
              {afterDocContent}
              {beforeDocFooter}
              {showDocFooter && <DocFooter />}
              {afterDocFooter}
            </main>
          </div>
        )}
        {isOverviewPage ? null : showOutline ? (
          <aside
            className={clsx(
              'rp-doc-layout__outline',
              isOutlineOpen && 'rp-doc-layout__outline--open',
              'rp-scrollbar',
            )}
            ref={asideLayoutRef}
          >
            {beforeOutline}
            <Outline />
            {afterOutline}
          </aside>
        ) : (
          <aside
            className="rp-doc-layout__outline-placeholder"
            style={isDocWide ? { width: '0' } : {}}
          />
        )}
      </div>
      {afterDoc}
    </Fragment>
  )
}
