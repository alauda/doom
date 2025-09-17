import { useLocaleSiteData, usePageData } from '@rspress/runtime'

export function useEditLink() {
  const { siteData, page } = usePageData()
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  const locales = useLocaleSiteData()

  const editLink = locales.editLink ?? siteData.themeConfig.editLink

  if (!editLink?.docRepoBaseUrl || !editLink.text) {
    return null
  }

  let { docRepoBaseUrl } = editLink

  if (!docRepoBaseUrl.endsWith('/')) {
    docRepoBaseUrl += '/'
  }

  const lastSegment = docRepoBaseUrl.split('/').at(-2)

  const fixedLang = siteData.themeConfig.locales?.some(
    ({ lang }) => lang === lastSegment,
  )

  const relativePagePath = (page._relativePath as string).replace(/\\/g, '/')
  const link = `${docRepoBaseUrl}${fixedLang ? relativePagePath.split('/').slice(1).join('/') : relativePagePath}`

  return {
    text: editLink.text,
    link,
  }
}
