import {
  Content,
  Head,
  useFrontmatter,
  useHead,
  useLang,
  usePage,
  useSite,
} from '@rspress/core/runtime'
import {
  HomeLayout,
  Nav,
  NotFoundLayout,
  useRedirect4FirstVisit,
  useScrollReset,
  useSetup,
} from '@rspress/core/theme'
import type { FrontMatterMeta } from '@rspress/shared'
import virtual from 'doom-@global-virtual'
import {
  createElement,
  Fragment,
  memo,
  useCallback,
  useMemo,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import { useLocation } from 'react-router'

import type {
  DoomSidebar,
  DoomSidebarGroup,
  DoomSidebarItem,
} from '../plugins/index.ts'
import type { BuildInfoGroup } from '../products/index.tsx'
import { useTranslation } from '../runtime/index.ts'
import { BuildInfoContext } from '../shared/context.ts'
import type { ExportItem } from '../types.ts'

import { BreadCrumb } from './Breadcrumb/index.tsx'
import { DocLayout } from './DocLayout.tsx'
import { ForceRenderContext } from './VersionsNav/context.tsx'
import { VersionsNav } from './VersionsNav/index.tsx'
import { X } from './_X.ts'

export interface MatchedSidebar {
  sidebar: DoomSidebarGroup | DoomSidebarItem
  exportItem: ExportItem
  depth: number
}

const cleanupUrlPath = (urlPath: string) => {
  if (urlPath.endsWith('.html')) {
    urlPath = urlPath.slice(0, -5)
  }
  if (urlPath.endsWith('/index')) {
    urlPath = urlPath.slice(0, -5)
  }
  return urlPath
}

const getClosestSidebar_ = (
  sidebarItems: DoomSidebar[],
  pathname: string,
  exportItem: ExportItem,
  matched?: MatchedSidebar,
  depth = 0,
): MatchedSidebar | undefined => {
  pathname = cleanupUrlPath(pathname)
  for (const sidebar of sidebarItems) {
    if ('_fileKey' in sidebar && sidebar._fileKey) {
      if (depth === 0) {
        matched = undefined
      }

      if (exportItem.flattenScope!.includes(sidebar._fileKey)) {
        matched = {
          sidebar,
          exportItem,
          depth,
        }
      }

      const sidebarLink = cleanupUrlPath(sidebar.link || '')
      if (sidebarLink === pathname) {
        return matched
      }
    }

    if ('items' in sidebar) {
      const found = getClosestSidebar_(
        sidebar.items,
        pathname,
        exportItem,
        matched,
        depth + 1,
      )
      if (found) {
        return found
      }
    }
  }
}

const getClosestSidebar = (sidebarItems: DoomSidebar[], pathname: string) => {
  let found: MatchedSidebar | undefined
  for (const item of virtual.export!) {
    const matched = getClosestSidebar_(sidebarItems, pathname, item)
    if (matched) {
      if (!found || matched.depth >= found.depth) {
        found = matched
      }
    }
  }
  return found
}

const concatTitle = (title: string, suffix?: string) => {
  if (!suffix) return title
  title = title.trim()
  suffix = suffix.trim()
  if (!suffix.startsWith('-') && !suffix.startsWith('|')) {
    return `${title} - ${suffix}`
  }
  return `${title} ${suffix}`
}

interface HeadTagsProps {
  lang?: string
  frontmatter: FrontMatterMeta
  description?: string
  title?: string
}

const HeadTags = memo(
  ({ lang, frontmatter, description, title }: HeadTagsProps) => {
    const head = frontmatter.head
    const frontmatterTags = useMemo(
      () =>
        head?.map(([tagName, attrs]) =>
          tagName ? createElement(tagName, attrs) : null,
        ),
      [head],
    )
    const frontmatterMetaProperties = useMemo(() => {
      const properties = new Set<string>()
      for (const [tagName, attrs] of head || []) {
        if (tagName === 'meta' && attrs.property) {
          properties.add(attrs.property)
        }
        if (tagName === 'meta' && attrs.name) {
          properties.add(attrs.name)
        }
      }
      return properties
    }, [head])

    useHead({
      htmlAttrs: { lang: lang || 'en' },
      title: title || undefined,
      meta: [
        frontmatterMetaProperties.has('og:type')
          ? undefined
          : { property: 'og:type', content: 'website' },
        title && !frontmatterMetaProperties.has('og:title')
          ? { property: 'og:title', content: title }
          : undefined,
        ...(description
          ? [
              frontmatterMetaProperties.has('description')
                ? undefined
                : { name: 'description', content: description },
              frontmatterMetaProperties.has('og:description')
                ? undefined
                : { property: 'og:description', content: description },
            ]
          : []),
      ],
    })

    return <Head>{frontmatterTags ?? null}</Head>
  },
)

interface CoreLayoutProps {
  afterNav?: ReactNode
  beforeOutline?: ReactNode
}

const CoreLayout = ({ afterNav, beforeOutline }: CoreLayoutProps) => {
  const { page } = usePage()
  const { site } = useSite()
  const { frontmatter } = useFrontmatter()
  const { pageType, lang: currentLang, title: articleTitle } = page
  const localeData = site.themeConfig.locales.find(
    (locale) => locale.lang === currentLang,
  )
  let title = frontmatter.title ?? articleTitle
  const mainTitle = site.title || localeData?.title || ''
  title =
    pageType === 'doc' || pageType === 'doc-wide'
      ? concatTitle(title || '', frontmatter.titleSuffix || mainTitle)
      : pageType === 'home'
        ? concatTitle(mainTitle, frontmatter.titleSuffix)
        : pageType === '404'
          ? concatTitle('404', mainTitle)
          : mainTitle
  const description =
    page.description || site.description || localeData?.description

  useSetup()
  useScrollReset()
  useRedirect4FirstVisit()
  const { navbar: showNavbar = true } = frontmatter

  const getContentLayout = () => {
    switch (pageType) {
      case 'home':
        return <HomeLayout />
      case 'doc':
      case 'doc-wide':
        return <DocLayout beforeOutline={beforeOutline} />
      case '404':
        return <NotFoundLayout />
      case 'custom':
      case 'blank':
        return <Content />
      default:
        return <DocLayout beforeOutline={beforeOutline} />
    }
  }

  if (process.env.__SSR_MD__) {
    return <Fragment>{getContentLayout()}</Fragment>
  }

  return (
    <Fragment>
      <HeadTags
        lang={currentLang}
        title={title}
        description={description}
        frontmatter={frontmatter}
      />
      {'blank' !== pageType && showNavbar && (
        <Fragment>
          <Nav />
          {afterNav}
        </Fragment>
      )}
      {getContentLayout()}
    </Fragment>
  )
}

export const Layout = () => {
  const {
    site: { lang: siteLang, themeConfig },
  } = useSite()
  const lang = useLang()
  const t = useTranslation()
  const { pathname } = useLocation()

  const found = useMemo(() => {
    if (!virtual.download || !virtual.export?.length) {
      return
    }

    if (themeConfig.locales.length) {
      let found: MatchedSidebar | undefined
      for (const { lang, sidebar } of themeConfig.locales) {
        const sidebarItems = sidebar[
          siteLang === lang ? '/' : `/${lang}`
        ] as DoomSidebar[]
        found ??= getClosestSidebar(sidebarItems, pathname)
        if (found) {
          return found
        }
      }
    } else {
      const sidebarItems = themeConfig.sidebar['/'] as DoomSidebar[]
      return getClosestSidebar(sidebarItems, pathname)
    }
  }, [pathname, siteLang, themeConfig])

  const pdfLink = useMemo(
    () =>
      found && `/${found.exportItem.name ?? found.sidebar.text}-${lang}.pdf`,
    [found, lang],
  )
  const [render, setRender] = useState(false)
  const forceRender = useCallback(() => {
    setRender((value) => !value)
  }, [])
  const [buildInfoGroups, setBuildInfoGroups] = useState<BuildInfoGroup[]>([])

  return (
    <ForceRenderContext
      value={useMemo(
        () => ({ value: render, setValue: forceRender }),
        [forceRender, render],
      )}
    >
      <VersionsNav />
      <BuildInfoContext
        value={useMemo(
          () => ({ groups: buildInfoGroups, setGroups: setBuildInfoGroups }),
          [buildInfoGroups, setBuildInfoGroups],
        )}
      >
        <CoreLayout
          afterNav={<BreadCrumb />}
          beforeOutline={
            pdfLink && (
              <X.p className="rp-doc" style={{ marginBottom: 16 }}>
                <X.a href={pdfLink} target="_blank" rel="noopener noreferrer">
                  {t('view_docs_as_pdf')}
                </X.a>
              </X.p>
            )
          }
        />
      </BuildInfoContext>
    </ForceRenderContext>
  )
}
