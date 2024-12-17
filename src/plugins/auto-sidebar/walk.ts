import {
  isExternalUrl,
  type NavItem,
  removeLeadingSlash,
  removeTrailingSlash,
  type SidebarDivider,
  type SidebarGroup,
  type SidebarItem,
  type SidebarSectionHeader,
  slash,
  withBase,
} from '@rspress/shared'
import fs from '@rspress/shared/fs-extra'
import { logger } from '@rspress/shared/logger'
import path from 'node:path'

import type { NavMeta, SideMeta } from './type.js'
import { detectFilePath, extractInfoFromFrontmatter } from './utils.js'

export interface DoomSidebarItem extends SidebarItem {
  weight?: number
}

export type DoomSidebar =
  | DoomSidebarGroup
  | DoomSidebarItem
  | SidebarDivider
  | SidebarSectionHeader

export interface DoomSidebarGroup extends Omit<SidebarGroup, 'items'> {
  items: DoomSidebar[]
  weight?: number
}

const sidebarSorter = (a: DoomSidebar, b: DoomSidebar) => {
  if ('weight' in a && 'weight' in b) {
    return a.weight! - b.weight!
  }
  return 0
}

/**
 * Split sideMeta into two parts: `index` and `others` and sort `others` by weight
 */
const splitSideMeta = (sideMeta: DoomSidebar[], extensions: string[]) => {
  const result = sideMeta.reduce<{
    index?: DoomSidebarItem
    others: DoomSidebar[]
  }>(
    (acc, curr) => {
      let fileParts: string[] | undefined
      if (
        '_fileKey' in curr &&
        !('items' in curr) &&
        !acc.index &&
        (fileParts = curr._fileKey?.split('/')) &&
        extensions.some((ext) => fileParts!.at(-1) === `index${ext}`)
      ) {
        acc.index = curr
      } else {
        acc.others.push(curr)
      }
      return acc
    },
    { others: [] },
  )

  result.others.sort(sidebarSorter)

  return result
}

export async function scanSideMeta(
  workDir: string,
  rootDir: string,
  docsDir: string,
  routePrefix: string,
  extensions: string[],
  ignoredDirs: string[],
) {
  if (!(await fs.exists(workDir))) {
    logger.error(
      '[plugin-auto-sidebar]',
      `Generate sidebar meta error: ${workDir} not exists`,
    )
  }
  const addRoutePrefix = (link: string) =>
    `${routePrefix}${removeLeadingSlash(link)}`
  // find the `_meta.json` file
  const metaFile = path.resolve(workDir, '_meta.json')
  // Fix the windows path
  const relativePath = slash(path.relative(rootDir, workDir))
  let sideMeta: SideMeta | undefined
  // Get the sidebar config from the `_meta.json` file
  try {
    // Don't use require to avoid require cache, which make hmr not work.
    sideMeta = (await fs.readJSON(metaFile, 'utf8')) as SideMeta
  } catch {
    // If the `_meta.json` file doesn't exist, we will generate the sidebar config from the directory structure.
    let subItems = await fs.readdir(workDir)
    // If there exists a file with the same name of the directory folder
    // we don't need to generate SideMeta for this single file
    subItems = subItems.filter((item) => {
      const hasExtension = extensions.some((ext) => item.endsWith(ext))
      const hasSameBaseName = subItems.some((elem) => {
        const baseName = elem.replace(/\.[^/.]+$/, '')
        return baseName === item.replace(/\.[^/.]+$/, '') && elem !== item
      })
      return !(hasExtension && hasSameBaseName)
    })
    sideMeta = (
      await Promise.all(
        subItems.map(async (item) => {
          // Fix https://github.com/web-infra-dev/rspress/issues/346
          if (item === '_meta.json') {
            return null
          }
          const stat = await fs.stat(path.join(workDir, item))
          // If the item is a directory, we will transform it to a object with `type` and `name` property.
          if (stat.isDirectory()) {
            if (ignoredDirs.includes(item)) {
              return null
            }

            // set H1 title to sidebar label when have same name md/mdx file
            const mdFilePath = path.join(workDir, `${item}.md`)
            const mdxFilePath = path.join(workDir, `${item}.mdx`)
            let label = item

            const setLabelFromFilePath = async (filePath: string) => {
              const { title } = await extractInfoFromFrontmatter(
                filePath,
                rootDir,
                extensions,
              )
              label = title
            }

            if (fs.existsSync(mdxFilePath)) {
              await setLabelFromFilePath(mdxFilePath)
            } else if (fs.existsSync(mdFilePath)) {
              await setLabelFromFilePath(mdFilePath)
            }

            return {
              type: 'dir',
              name: item,
              label,
            }
          }
          return extensions.some((ext) => item.endsWith(ext)) ? item : null
        }),
      )
    ).filter(Boolean) as SideMeta
  }

  const sidebarFromMeta: DoomSidebar[] = await Promise.all(
    sideMeta.map(async (metaItem) => {
      if (typeof metaItem === 'string') {
        const { title, overviewHeaders, context, weight } =
          await extractInfoFromFrontmatter(
            path.resolve(workDir, metaItem),
            rootDir,
            extensions,
          )
        const pureLink = `${relativePath}/${metaItem.replace(/\.mdx?$/, '')}`
        return {
          text: title,
          link: addRoutePrefix(pureLink),
          overviewHeaders,
          context,
          weight,
          _fileKey: path.relative(docsDir, path.join(workDir, metaItem)),
        }
      }

      const {
        type = 'file',
        name,
        label = '',
        collapsible,
        collapsed = true,
        link,
        tag,
        dashed,
        overviewHeaders,
        context,
      } = metaItem
      // when type is divider, name maybe undefined, and link is not used
      const pureLink = `${relativePath}/${name.replace(/\.mdx?$/, '')}`
      if (type === 'file') {
        const info = await extractInfoFromFrontmatter(
          path.resolve(workDir, name),
          rootDir,
          extensions,
        )
        const title = label || info.title
        const realPath = info.realPath
        return {
          text: title,
          link: addRoutePrefix(pureLink),
          tag,
          overviewHeaders: info.overviewHeaders
            ? info.overviewHeaders
            : overviewHeaders,
          context: info.context ? info.context : context,
          weight: info.weight,
          _fileKey: realPath ? path.relative(docsDir, realPath) : '',
        }
      }

      if (type === 'dir') {
        const subDir = path.resolve(workDir, name)
        const { index, others: subSidebar } = await scanSideMeta(
          subDir,
          rootDir,
          docsDir,
          routePrefix,
          extensions,
          ['assets'],
        )
        const realPath = await detectFilePath(subDir, extensions)
        const group = {
          text: label,
          collapsible,
          collapsed,
          items: subSidebar,
          link: realPath ? addRoutePrefix(pureLink) : '',
          tag,
          overviewHeaders,
          context,
          _fileKey: realPath ? path.relative(docsDir, realPath) : '',
        }
        return index ? { ...group, ...index } : group
      }

      if (type === 'divider') {
        return {
          dividerType: dashed ? 'dashed' : 'solid',
        }
      }

      if (type === 'section-header') {
        return {
          sectionHeaderText: label,
          tag,
        }
      }
      return {
        text: label,
        link: isExternalUrl(link) ? link! : withBase(link!, routePrefix),
        tag,
      }
    }),
  )

  return splitSideMeta(sidebarFromMeta, extensions)
}

// Start walking from the doc directory, scan the `_meta.json` file in each subdirectory
// and generate the nav and sidebar config
export async function walk(
  workDir: string,
  routePrefix = '/',
  docsDir: string,
  extensions: string[],
) {
  // find the `_meta.json` file
  const rootMetaFile = path.resolve(workDir, '_meta.json')
  let navConfig: NavMeta | undefined
  // Get the nav config from the `_meta.json` file
  try {
    navConfig = (await fs.readJSON(rootMetaFile, 'utf8')) as NavItem[]
  } catch {
    navConfig = []
  }

  navConfig.forEach((navItem) => {
    if ('items' in navItem) {
      navItem.items.forEach((item) => {
        if ('link' in item && !isExternalUrl(item.link)) {
          item.link = withBase(item.link, routePrefix)
        }
      })
    }
    if ('link' in navItem && !isExternalUrl(navItem.link)) {
      navItem.link = withBase(navItem.link, routePrefix)
    }
  })

  const { index, others } = await scanSideMeta(
    workDir,
    workDir,
    docsDir,
    routePrefix,
    extensions,
    ['assets', 'public', 'shared'],
  )

  const sidebars = index ? [index, ...others] : others

  for (const sidebarItem of sidebars) {
    if ('items' in sidebarItem && sidebarItem.items.length) {
      sidebarItem.collapsed = false
    }
  }

  // Every sub dir will represent a group of sidebar
  const sidebarConfig = {
    [routePrefix]: sidebars,
  }

  if (removeTrailingSlash(routePrefix)) {
    sidebarConfig[removeTrailingSlash(routePrefix)] = sidebars
  }

  return {
    nav: navConfig as NavItem[],
    sidebar: sidebarConfig,
  }
}
