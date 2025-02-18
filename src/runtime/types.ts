import { PageData } from '@rspress/core'
import { OpenAPIV3_1 } from 'openapi-types'

import type { CustomResourceDefinition } from '../plugins/api/types.js'
import type { DoomSite } from '../shared/types.js'
import { FunctionResource, RoleTemplate } from '../plugins/permission/types.js'

export interface SiteBrand {
  company: string
  product: string
  productShort: string
}

export interface ExtendedPage {
  crdsMap?: Record<string, CustomResourceDefinition>
  openapisMap?: Record<string, OpenAPIV3_1.Document>
  references?: Record<string, string>
  pathPrefix?: string
  functionResourcesMap?: Record<string, FunctionResource[]>
  roleTemplatesMap?: Record<string, RoleTemplate[]>
  sites?: DoomSite[]
  v?: string
}

export interface ExtendedPageData extends PageData {
  page: PageData['page'] & ExtendedPage
}
