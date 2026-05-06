import type {
  SidebarDivider,
  SidebarItem,
  SidebarSectionHeader,
} from '@rspress/core'
import {
  isEqualPath,
  usePage,
  usePages,
  useSidebar,
} from '@rspress/core/runtime'
import {
  FallbackHeading,
  Link,
  renderInlineMarkdown,
} from '@rspress/core/theme-original'
import type { Header, NormalizedSidebarGroup } from '@rspress/shared'
import { Fragment, useCallback, useMemo } from 'react'

import classes from '../../../styles/overview.module.scss'

import { Masonry } from './Masonry.js'
import {
  findItemByRoutePath,
  isSidebarDivider,
  isSidebarSectionHeader,
  isSingleFile,
} from './_utils.js'

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

const getChildLink = (
  traverseItem:
    | SidebarDivider
    | SidebarSectionHeader
    | SidebarItem
    | NormalizedSidebarGroup,
): string => {
  if ('link' in traverseItem && traverseItem.link) {
    return traverseItem.link
  }
  if ('items' in traverseItem && traverseItem.items.length) {
    return getChildLink(traverseItem.items[0])
  }
  return ''
}

const masonryOptions = {
  itemSelector: `.masonry-item`,
  gutter: 16,
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
  const { pages } = usePages()
  const {
    page: { routePath, frontmatter, title },
  } = usePage()
  const { content, groups: customGroups, defaultGroupTitle = 'Others' } = props

  const subFilter = useCallback(
    (link: string) =>
      link.startsWith(routePath.replace(/overview$/, '')) &&
      !isEqualPath(link, routePath),
    [routePath],
  )

  const overviewModules = useMemo(
    () => pages.filter((page) => subFilter(page.routePath)),
    [pages, subFilter],
  )

  let overviewSidebarGroups = useSidebar()

  if (
    overviewSidebarGroups[0] &&
    'link' in overviewSidebarGroups[0] &&
    overviewSidebarGroups[0].link !== routePath
  ) {
    overviewSidebarGroups = findItemByRoutePath(
      overviewSidebarGroups,
      routePath,
    )
  }

  const normalizeSidebarItem = useCallback(
    (
      item:
        | SidebarItem
        | SidebarSectionHeader
        | SidebarDivider
        | NormalizedSidebarGroup,
      sidebarGroup?: NormalizedSidebarGroup,
      frontmatter?: Record<string, unknown>,
    ): false | GroupItem => {
      if (isSidebarDivider(item) || isSidebarSectionHeader(item)) {
        return false
      }

      // do not display overview title in sub pages overview
      if (item.link === `${routePath}index` && frontmatter?.overview === true) {
        return false
      }

      // props > frontmatter in single file > _meta.json config in a file > frontmatter in overview page > _meta.json config in sidebar
      const overviewHeaders = props.overviewHeaders ??
        item.overviewHeaders ??
        (frontmatter?.overviewHeaders as number[] | undefined) ??
        sidebarGroup?.overviewHeaders ?? [2]
      // sidebar items link without base path
      const pageModule = overviewModules.find((m) =>
        isEqualPath(m.routePath, item.link || ''),
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
      }
    },
    [overviewModules, props.overviewHeaders, routePath],
  )

  const getGroup = useCallback(
    (
      sidebarGroups: (
        | NormalizedSidebarGroup
        | SidebarSectionHeader
        | SidebarItem
        | SidebarDivider
      )[],
    ): Group[] => {
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
          let items: GroupItem[] = []
          if ('items' in sidebarGroup) {
            items = sidebarGroup.items
              .map((item) =>
                normalizeSidebarItem(item, sidebarGroup, frontmatter),
              )
              .filter(Boolean)
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
            ].filter(Boolean)
          }
          return {
            name: ('text' in sidebarGroup && sidebarGroup.text) || '',
            items,
          }
        })
      return group
    },
    [frontmatter, normalizeSidebarItem, subFilter],
  )

  const defaultGroups = useMemo(() => {
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
  }, [getGroup, overviewSidebarGroups])

  const groups = customGroups ?? defaultGroups

  return (
    <div className="overview-index doom-overview-index">
      {content}
      {groups.map((group) => (
        <Fragment key={group.name}>
          {/* If there is no sidebar group, we show the sidebar items directly and hide the group name */}
          {(!title || [title, defaultGroupTitle].includes(group.name)) &&
          groups.length === 1 ? (
            <h2 style={{ paddingTop: 0 }} />
          ) : (
            <FallbackHeading level={2} title={group.name} />
          )}

          <Masonry className={classes.overviewGroups} options={masonryOptions}>
            {group.items.map((item) => (
              <div
                className={`${classes.overviewGroup} masonry-item`}
                key={item.link}
              >
                <h3>
                  <Link href={item.link} {...renderInlineMarkdown(item.text)} />
                </h3>
                {item.description && (
                  <div className={classes.overviewDescription}>
                    {item.description}
                  </div>
                )}
                {!item.headers?.length || (
                  <ul className={classes.overviewList}>
                    {item.headers.map((header) => (
                      <li
                        key={header.id}
                        className={`${classes.overviewGroupLi} ${
                          classes[`level${header.depth}`]
                        }`}
                      >
                        <Link
                          href={`${item.link}#${header.id}`}
                          {...renderInlineMarkdown(header.text)}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </Masonry>
        </Fragment>
      ))}
    </div>
  )
}

export default Overview
