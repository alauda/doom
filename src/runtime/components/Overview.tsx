import { Link, renderInlineMarkdown, useSidebarData } from '@rspress/core/theme'
import {
  isEqualPath,
  normalizeHrefInRuntime as normalizeHref,
  usePageData,
  withBase,
} from '@rspress/runtime'
import type {
  Header,
  NormalizedSidebarGroup,
  SidebarDivider,
  SidebarItem,
} from '@rspress/shared'
import { Fragment, useMemo } from 'react'

import classes from '../../../styles/overview.module.scss'

import { findItemByRoutePath } from './_utils.js'

interface GroupItem {
  text: string
  description?: string
  link: string
  headers?: Header[]
}

interface Group {
  name: string
  items: GroupItem[]
}

// The sidebar data include two types: sidebar item and sidebar group.
// In overpage page, we select all the related sidebar groups and show the groups in the page.
// In the meantime, some sidebar items also should be shown in the page, we collect them in the group named 'Others' and show them in the page.

export function Overview(props: {
  content?: React.ReactNode
  groups?: Group[]
  defaultGroupTitle?: string
  overviewHeaders?: number[]
}) {
  const {
    siteData,
    page: { routePath, frontmatter, title },
  } = usePageData()
  const { content, groups: customGroups, defaultGroupTitle = 'Others' } = props
  const subFilter = (link: string) =>
    // sidebar items link without base path
    // pages route path with base path
    withBase(link).startsWith(routePath.replace(/overview$/, '')) &&
    !isEqualPath(withBase(link), routePath)
  const getChildLink = (
    traverseItem: SidebarDivider | SidebarItem | NormalizedSidebarGroup,
  ): string => {
    if ('link' in traverseItem && traverseItem.link) {
      return traverseItem.link
    }
    if ('items' in traverseItem && traverseItem.items.length) {
      return getChildLink(traverseItem.items[0])
    }
    return ''
  }

  const { pages } = siteData
  const overviewModules = pages.filter((page) => subFilter(page.routePath))
  let overviewSidebarGroups = useSidebarData()

  if (
    overviewSidebarGroups[0] &&
    'link' in overviewSidebarGroups[0] &&
    overviewSidebarGroups[0]?.link !== routePath
  ) {
    overviewSidebarGroups = findItemByRoutePath(
      overviewSidebarGroups,
      routePath,
    )
  }

  function normalizeSidebarItem(
    item: SidebarItem | SidebarDivider | NormalizedSidebarGroup,
    sidebarGroup?: NormalizedSidebarGroup,
    frontmatter?: Record<string, unknown>,
  ) {
    if ('dividerType' in item) {
      return item
    }
    // do not display overview title in sub pages overview
    if (
      withBase(item.link) === `${routePath}index` &&
      frontmatter?.overview === true
    ) {
      return false
    }
    // props > frontmatter in single file > _meta.json config in a file > frontmatter in overview page > _meta.json config in sidebar
    const overviewHeaders = props.overviewHeaders ??
      item.overviewHeaders ??
      (frontmatter?.overviewHeaders as number[] | undefined) ??
      sidebarGroup?.overviewHeaders ?? [2]
    // sidebar items link without base path
    const pageModule = overviewModules.find((m) =>
      isEqualPath(m.routePath, withBase(item.link || '')),
    )
    const link = getChildLink(item)
    return {
      ...item,
      description: pageModule?.frontmatter.description,
      link,
      headers:
        pageModule?.toc.filter((header) =>
          overviewHeaders.some((depth) => header.depth === depth),
        ) || [],
    } as GroupItem
  }

  const isSingleFile = (
    item: SidebarItem | SidebarDivider | NormalizedSidebarGroup,
  ): item is SidebarItem | (NormalizedSidebarGroup & { link: string }) =>
    !('items' in item) && 'link' in item

  const getGroup = (
    sidebarGroups: (NormalizedSidebarGroup | SidebarItem | SidebarDivider)[],
  ) => {
    const group = sidebarGroups
      .filter((sidebarGroup) => {
        if ('items' in sidebarGroup) {
          return (
            sidebarGroup.items.filter((item) => subFilter(getChildLink(item)))
              .length > 0
          )
        }
        if (
          isSingleFile(sidebarGroup) &&
          subFilter(getChildLink(sidebarGroup))
        ) {
          return true
        }
        return false
      })
      .map((sidebarGroup) => {
        let items: (GroupItem | SidebarDivider)[] = []
        if ('items' in sidebarGroup) {
          items = sidebarGroup.items
            .map((item) =>
              normalizeSidebarItem(item, sidebarGroup, frontmatter),
            )
            .filter((_): _ is GroupItem | SidebarDivider => !!_)
        } else if (isSingleFile(sidebarGroup)) {
          items = [
            normalizeSidebarItem(
              {
                link: sidebarGroup.link,
                text: sidebarGroup.text || '',
                tag: sidebarGroup.tag,
                _fileKey: sidebarGroup._fileKey,
                overviewHeaders: sidebarGroup.overviewHeaders,
              },
              undefined,
              frontmatter,
            ),
          ].filter((_): _ is GroupItem | SidebarDivider => !!_)
        }
        return {
          name: ('text' in sidebarGroup && sidebarGroup.text) || '',
          items,
        }
      }) as Group[]
    return group
  }

  const groups =
    customGroups ??
    useMemo(() => {
      const group = getGroup(overviewSidebarGroups)
      if (group.length) {
        return group
      }
      for (const sidebarGroup of overviewSidebarGroups) {
        if (!('items' in sidebarGroup)) {
          continue
        }
        const group = getGroup(sidebarGroup.items)
        if (group.length) {
          return group
        }
      }
      return []
    }, [overviewSidebarGroups, routePath, frontmatter])

  return (
    <div className="overview-index doom-overview-index mx-auto">
      {content}
      {groups.map((group) => (
        <Fragment key={group.name}>
          {/* If there is no sidebar group, we show the sidebar items directly and hide the group name */}
          {(!title || [title, defaultGroupTitle].includes(group.name)) &&
          groups.length === 1 ? (
            <h2 style={{ paddingTop: 0 }}></h2>
          ) : (
            <h2>{renderInlineMarkdown(group.name)}</h2>
          )}

          <div className={classes.overviewGroups}>
            {group.items.map((item) => (
              <div className={classes.overviewGroup} key={item.link}>
                <h3 style={{ marginBottom: 8 }}>
                  <Link href={normalizeHref(item.link)}>
                    {renderInlineMarkdown(item.text)}
                  </Link>
                </h3>
                <div className={classes.overviewDescription}>
                  {item.description}
                </div>
                <ul className="list-none">
                  {item.headers?.map((header) => (
                    <li
                      key={header.id}
                      className={`${classes.overviewGroupLi} ${
                        classes[`level${header.depth}`]
                      } first:mt-2`}
                    >
                      <Link href={`${normalizeHref(item.link)}#${header.id}`}>
                        {renderInlineMarkdown(header.text)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Fragment>
      ))}
    </div>
  )
}

export default Overview
