import { PageData } from '@rspress/core'

import type { DoomSite } from '../shared/types.js'

export interface SiteBrand {
  company: string
  product: string
  productShort: string
}

export interface ExtendedPage {
  references?: Record<string, string>
  pathPrefix?: string
  sites?: DoomSite[]
  v?: string
}

export interface ExtendedPageData extends PageData {
  page: PageData['page'] & ExtendedPage
}
