import type { ProductsOverviewOptions } from '../types.ts'

const URL_BASE = 'https://doom.invalid'

const parseOverviewUrl = (options: ProductsOverviewOptions) => {
  const { url } = options
  const parsed = new URL(url, URL_BASE)
  if (parsed.origin === URL_BASE && !url.startsWith('/')) {
    throw new Error(
      '`productsOverview.url` must be an absolute URL or a root-relative path',
    )
  }
  return parsed
}

const serializeUrl = (url: URL, isRelative: boolean) =>
  isRelative ? `${url.pathname}${url.search}${url.hash}` : url.toString()

export const getProductsOverviewUrl = (
  options: ProductsOverviewOptions | undefined,
  lang: string,
) => {
  if (!options) {
    return undefined
  }

  const isRelative = options.url.startsWith('/')
  const url = parseOverviewUrl(options)
  url.searchParams.set('lang', lang)
  return serializeUrl(url, isRelative)
}

export const getProductsOverviewCanonical = (
  options: ProductsOverviewOptions | undefined,
) => {
  if (!options) {
    return undefined
  }

  const isRelative = options.url.startsWith('/')
  return serializeUrl(parseOverviewUrl(options), isRelative)
}
