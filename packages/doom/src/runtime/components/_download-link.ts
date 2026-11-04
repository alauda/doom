import { parseUrl } from '@rspress/shared'

export const DOWNLOAD_EXTENSIONS = [
  '.ipynb',
  '.zip',
  '.tgz',
  '.tar.gz',
  '.sh',
  '.py',
  '.sql',
  '.yaml',
  '.yml',
  '.json',
  '.tar',
]

export const isDownloadablePath = (href: string) => {
  const { url } = parseUrl(href)
  const pathname = url.split('/').at(-1)!.toLowerCase()
  return DOWNLOAD_EXTENSIONS.some((ext) => pathname.endsWith(ext))
}

export const shouldDownload = (href: string, download: unknown) =>
  download !== false && isDownloadablePath(href)
