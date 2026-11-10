import { createHash } from 'node:crypto'

import type { NormalizedSidebar } from '@rspress/shared'

export interface SharedSidebarLocale {
  lang: string
  sidebar?: NormalizedSidebar
}

export interface SharedSidebarPayload {
  sidebar?: NormalizedSidebar
  locales?: SharedSidebarLocale[]
}

export interface SidebarAsset {
  content: string
  fileName: string
  manifestContent: string
  manifestFileName: string
}

export const createSidebarAsset = (
  payload: SharedSidebarPayload,
): SidebarAsset => {
  const content = JSON.stringify(payload)
  const hash = createHash('sha256').update(content).digest('hex')
  return {
    content,
    fileName: `sidebar.${hash}.json`,
    manifestContent: JSON.stringify({ fileName: `sidebar.${hash}.json` }),
    manifestFileName: 'sidebar.json',
  }
}
