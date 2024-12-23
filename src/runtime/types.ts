import { PageData } from '@rspress/core'
import { OpenAPIV3_1 } from 'openapi-types'

import type { CustomResourceDefinition } from '../plugins/api/types.js'
import { DoomSite } from '../utils/types.js'

export interface ExtendedPage {
  crdsMap?: Record<string, CustomResourceDefinition>
  openapisMap?: Record<string, OpenAPIV3_1.Document>
  references?: Record<string, string>
  pathPrefix?: string
  sites?: DoomSite[]
}

export interface ExtendedPageData extends PageData {
  page: PageData['page'] & ExtendedPage
}
