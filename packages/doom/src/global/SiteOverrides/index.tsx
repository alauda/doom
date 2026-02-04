import { usePage, useSite } from '@rspress/core/runtime'
import { useEffect } from 'react'

import { useSiteOverrides } from '@alauda/doom/runtime'

const setNavBarSpans = (logoText: string) => {
  const navBarLinks = document.querySelectorAll('.rp-nav__title__link')

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
  const { page } = usePage()
  const { site } = useSite()
  const {
    pageType,
    // Inject by remark-plugin-toc
    title: articleTitle,
    // eslint-disable-next-line @typescript-eslint/no-useless-default-assignment
    frontmatter = {},
  } = page

  const { title, logoText } = useSiteOverrides()

  useEffect(() => {
    if (!title) {
      return
    }

    site.originalTitle ??= site.title
    site.title = title

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

    const timeoutId = setTimeout(() => {
      document.title = newTitle
    }, 1)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [
    articleTitle,
    frontmatter.title,
    frontmatter.titleSuffix,
    pageType,
    site,
    title,
  ])

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
