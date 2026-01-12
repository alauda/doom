import { useI18n, usePageData } from '@rspress/core/runtime'

export function useEditLink() {
  const { siteData, page } = usePageData()
  const editLink = siteData.themeConfig.editLink

  const t = useI18n()
  const text = t('editLinkText')

  if (!editLink?.docRepoBaseUrl || !text) {
    return null
  }

  let { docRepoBaseUrl } = editLink

  if (!docRepoBaseUrl.endsWith('/')) {
    docRepoBaseUrl += '/'
  }

  const lastSegment = docRepoBaseUrl.split('/').at(-2)

  const fixedLang = siteData.themeConfig.locales.some(
    ({ lang }) => lang === lastSegment,
  )

  const relativePagePath = (page._relativePath as string).replace(/\\/g, '/')
  const link = `${docRepoBaseUrl}${fixedLang ? relativePagePath.split('/').slice(1).join('/') : relativePagePath}`

  return {
    text,
    link,
  }
}
