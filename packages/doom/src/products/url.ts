import type { ProductsOverviewOptions } from '../types.ts'

const URL_BASE = 'https://doom.invalid'

const defaultProductsOverviewUrl = (prefix: string | undefined) => {
  const normalizedPrefix = prefix?.replace(/\/+$/, '') ?? ''
  return `${normalizedPrefix}/products`
}

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
  prefix?: string,
) => {
  const configuredUrl = options?.url ?? defaultProductsOverviewUrl(prefix)
  const isRelative = configuredUrl.startsWith('/')
  const url = parseOverviewUrl({ url: configuredUrl })
  url.searchParams.set('lang', lang)
  return serializeUrl(url, isRelative)
}

export const getProductsOverviewCanonical = (
  options: ProductsOverviewOptions | undefined,
  prefix?: string,
) => {
  const configuredUrl = options?.url ?? defaultProductsOverviewUrl(prefix)
  const isRelative = configuredUrl.startsWith('/')
  return serializeUrl(parseOverviewUrl({ url: configuredUrl }), isRelative)
}
