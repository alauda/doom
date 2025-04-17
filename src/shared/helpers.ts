import { UNVERSIONED, UNVERSIONED_PREFIX } from './constants.js'
import type { UnversionedVersion } from './types.js'

export const removeBothEndsSlashes = (str?: string) =>
  str?.replace(/^\/|\/$/g, '') || ''

export const getPdfName = (lang: string, userBase?: string, title?: string) =>
  `${removeBothEndsSlashes(userBase) || title || 'exported'}-${lang}.pdf`

export const isExplicitlyUnversioned = (
  version?: string,
): version is UnversionedVersion =>
  version === UNVERSIONED || !!version?.startsWith(UNVERSIONED_PREFIX)

export const isUnversioned = (
  version?: string,
): version is undefined | '' | UnversionedVersion =>
  !version || isExplicitlyUnversioned(version)

export const getUnversionedVersion = (version?: string) => {
  if (!version || version === UNVERSIONED) {
    return
  }
  return version.startsWith(UNVERSIONED_PREFIX)
    ? version.slice(UNVERSIONED_PREFIX.length)
    : version
}
