import type { serve, UserConfig } from '@rspress/core'

import type { ApiPluginOptions } from '../plugins/api/types.js'
import type { AutoSidebarPluginOptions } from '../plugins/index.js'
import type { PermissionPluginOptions } from '../plugins/permission/types.js'
import type {
  ReferenceItem,
  ReleaseNotesOptions,
} from '../plugins/replace/types.js'
import type { DoomSite } from '../shared/index.js'

export type BaseServeOptions = Parameters<typeof serve>[0]

export type ServeOptions = Omit<BaseServeOptions, 'config'>

export interface GlobalCliOptions {
  config?: string
  base?: string
  prefix?: string
  v?: string
  ignore?: boolean
  force?: boolean
}

export interface DoomConfig extends UserConfig {
  api?: ApiPluginOptions
  sites?: DoomSite[]
  permission?: PermissionPluginOptions
  reference?: ReferenceItem[]
  sidebar?: AutoSidebarPluginOptions
  releaseNotes?: ReleaseNotesOptions
  internalRoutes?: string[]
}

export type ContentProcessor = {
  type: 'ejsTemplate'
  data?: Record<string, unknown>
}
