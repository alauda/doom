import { usePageData } from '@rspress/core/runtime'
import { useEffect } from 'react'

import { useSiteOverrides } from '@alauda/doom/runtime'

const setNavBarSpans = (logoText: string) => {
  const navBarLinks = document.querySelectorAll('[class^=navBarTitle] > a')

  if (!navBarLinks.length) {
    return
  }

  for (const navBarLink of navBarLinks) {
    const navBarSpan =
      navBarLink.querySelector('span') ||
      navBarLink.appendChild(document.createElement('span'))
    navBarSpan.innerText = logoText
  }
}

const concatTitle = (title: string, suffix?: string) => {
  if (!suffix) {
    return title
  }

  title = title.trim()
  suffix = suffix.trim()

  if (!suffix.startsWith('-') && !suffix.startsWith('|')) {
    return `${title} - ${suffix}`
  }

  return `${title} ${suffix}`
}

export const SiteOverrides = () => {
  const { siteData, page } = usePageData()
  const {
    pageType,
    // Inject by remark-plugin-toc
    title: articleTitle,
    frontmatter = {},
  } = page

  const { title, logoText } = useSiteOverrides()

  useEffect(() => {
    if (!title) {
      return
    }

    siteData.originalTitle ??= siteData.title
    siteData.title = title

    let newTitle = (frontmatter.title as string) || articleTitle

    if (newTitle && pageType === 'doc') {
      // append main title as a suffix
      newTitle = concatTitle(
        newTitle,
        (frontmatter.titleSuffix as string) || title,
      )
    } else if (pageType === 'home') {
      newTitle = concatTitle(title, frontmatter.titleSuffix as string)
    } else if (pageType === '404') {
      newTitle = concatTitle('404', title)
    } else {
      newTitle = title
    }

    requestAnimationFrame(() => {
      document.title = newTitle
    })
  }, [title])

  useEffect(() => {
    if (!logoText) {
      return
    }

    requestAnimationFrame(() => {
      setNavBarSpans(logoText)
    })
  }, [logoText])
}

export default SiteOverrides
