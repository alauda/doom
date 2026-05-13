import {
  addTrailingSlash,
  isActive,
  useLocation,
  useSidebar,
  useSite,
} from '@rspress/core/runtime'
import { IconArrowRight, SvgWrapper } from '@rspress/core/theme'
import type { NormalizedSidebarGroup, SidebarData } from '@rspress/shared'
import virtual from 'doom-@global-virtual'
import { use, useEffect, useMemo } from 'react'
import { xfetch } from 'x-fetch'
import { parse } from 'yaml'

import type { BuildInfoGroup, BuildInfoItem } from '../../products/index.tsx'
import { BuildInfoContext } from '../../shared/context.ts'
import { X } from '../_X.ts'

import { useLang, useSiteOverrides, useTranslation } from '@alauda/doom/runtime'

export interface BreadcrumbItem {
  text: string
  link?: string
}

const isBuildInfoItem = (obj: object): obj is BuildInfoItem =>
  'base' in obj && 'version' in obj

export const BreadCrumb = () => {
  const lang = useLang()

  const t = useTranslation()

  const { pathname } = useLocation()

  const sidebar = useSidebar()

  const site = useSiteOverrides()

  const { site: siteData } = useSite()

  const breadcrumbItems = useMemo(() => {
    function walk(
      sidebarItems: SidebarData,
      parents: NormalizedSidebarGroup[] = [],
    ): BreadcrumbItem[] | undefined {
      for (const sidebarItem of sidebarItems) {
        if (
          'link' in sidebarItem &&
          sidebarItem.link &&
          isActive(sidebarItem.link, pathname)
        ) {
          return [
            ...parents.map((p) => ({
              text: p.text,
              link: p.link,
            })),
            {
              text: sidebarItem.text,
            },
          ]
        }
        if ('items' in sidebarItem && sidebarItem.items.length) {
          const found = walk(sidebarItem.items, [...parents, sidebarItem])
          if (found) {
            return found
          }
        }
      }
    }
    return walk(sidebar)
  }, [pathname, sidebar])

  const prefix = addTrailingSlash(`/${lang === siteData.lang ? '' : lang}`)

  const { groups, setGroups: setBuildInfoGroups } = use(BuildInfoContext)

  const hasGroups = !!groups.length

  useEffect(() => {
    const fetchBuildInfo = async () => {
      let rawBuildInfo: Record<
        string,
        Record<string, BuildInfoItem> | BuildInfoItem
      >

      try {
        rawBuildInfo = parse(
          await xfetch((virtual.prefix || '') + '/build-info.yaml', {
            type: 'text',
          }),
        ) as Record<string, Record<string, BuildInfoItem> | BuildInfoItem>
      } catch {
        return
      }

      const buildInfoGroups: BuildInfoGroup[] = []
      for (const [base, items] of Object.entries(rawBuildInfo)) {
        let buildInfo: BuildInfoItem | undefined
        if (isBuildInfoItem(items)) {
          buildInfo = items
        } else {
          const latest = Object.values(items).at(-1)
          if (latest) {
            buildInfo = latest
          }
        }
        if (!buildInfo) {
          continue
        }
        const id = (buildInfo.displayName?.en || base)
          .toLowerCase()
          .replace(/^alauda[\s-]+/, '')
          .replace(/^build[\s-]+of[\s-]+/, '')[0]
        let group = buildInfoGroups.find((g) => g.id === id)
        if (!group) {
          group = { id, items: [] }
          buildInfoGroups.push(group)
        }
        group.items.push(buildInfo)
      }
      setBuildInfoGroups(
        buildInfoGroups.sort((a, b) => a.id.localeCompare(b.id)),
      )
    }

    void fetchBuildInfo()
  }, [setBuildInfoGroups])

  return (
    <div className="breadcrumb-container">
      <ul className="breadcrumb-content">
        {hasGroups && (
          <li className="breadcrumb-item rp-doc">
            <X.a href={prefix + 'products'}>{t('products')}</X.a>
          </li>
        )}
        <li className="breadcrumb-item rp-doc">
          {hasGroups && <SvgWrapper icon={IconArrowRight} />}
          <X.a href={prefix}>{site.title || siteData.title}</X.a>
        </li>
        {breadcrumbItems?.map((item, index) => (
          // eslint-disable-next-line @eslint-react/no-array-index-key
          <li key={index} className="breadcrumb-item rp-doc">
            <SvgWrapper icon={IconArrowRight} />
            {item.link ? (
              <X.a href={item.link}>{item.text}</X.a>
            ) : (
              <span className="breadcrumb-item-text">{item.text}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default BreadCrumb
