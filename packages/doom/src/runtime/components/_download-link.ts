import { isExternalUrl, parseUrl } from '@rspress/shared'

const LEGACY_DOWNLOAD_EXTENSIONS = [
  '.ipynb',
  '.zip',
  '.tgz',
  '.tar.gz',
  '.sh',
  '.py',
  '.sql',
]

const ROOT_DOWNLOAD_EXTENSIONS = ['.yaml', '.yml', '.json', '.tar']

export const isDownloadablePath = (href: string) => {
  const { url } = parseUrl(href)
  const pathname = url.split('/').at(-1)!.toLowerCase()
  return (
    LEGACY_DOWNLOAD_EXTENSIONS.some((ext) => pathname.endsWith(ext)) ||
    (href.startsWith('/') &&
      !isExternalUrl(href) &&
      ROOT_DOWNLOAD_EXTENSIONS.some((ext) => pathname.endsWith(ext)))
  )
}

export const shouldDownload = (href: string, download: unknown) =>
  download !== false && isDownloadablePath(href)
