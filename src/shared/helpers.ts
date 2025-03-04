const PLAIN_VERSION_PATTERN = /^(\d+\.)*\d+$/

export const normalizeVersion = (version = '') =>
  PLAIN_VERSION_PATTERN.test(version) ? `v${version}` : version

export const removeBothEndsSlashes = (str?: string) =>
  str?.replace(/^\/|\/$/g, '') || ''

export const getPdfName = (lang: string, userBase?: string, title?: string) =>
  `${removeBothEndsSlashes(userBase) || title || 'exported'}-${lang}.pdf`
