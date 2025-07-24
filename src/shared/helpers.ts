import type { NavItemWithLink } from '@rspress/core'
import { addLeadingSlash, normalizeSlash } from '@rspress/shared'

import { UNVERSIONED, UNVERSIONED_PREFIX } from './constants.ts'
import type { UnversionedVersion } from './types.ts'

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

/**
 * hello world {#custom-id} -> { text: 'hello world', id: 'custom-id' }
 */
export const extractTextAndId = (title: string) => {
  const customIdReg = /\\?\{#[^}]*\}/
  const text = title.replace(customIdReg, '').trimEnd()
  const customId = title.match(customIdReg)?.[0]?.slice(2, -1) || ''
  return [
    text.replace(/\\{2}/g, '').replace(/(^|[^\\])\\([[\]])/g, '$1$2'),
    customId,
  ]
}

export const withoutBase = (path: string, base: string) =>
  addLeadingSlash(path).replace(normalizeSlash(base), '')

export const matchNavbar = (
  item: NavItemWithLink,
  currentPathname: string,
  base: string,
): boolean =>
  new RegExp(item.activeMatch || item.link).test(
    withoutBase(currentPathname, base),
  )
