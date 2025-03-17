export const removeBothEndsSlashes = (str?: string) =>
  str?.replace(/^\/|\/$/g, '') || ''

export const getPdfName = (lang: string, userBase?: string, title?: string) =>
  `${removeBothEndsSlashes(userBase) || title || 'exported'}-${lang}.pdf`

export const DOC_PATTERN = /\.mdx?$/

export const isDoc = (filename: string) => DOC_PATTERN.test(filename)
