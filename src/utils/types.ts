import { UserConfig } from '@rspress/core'

import type { ApiPluginOptions } from '../plugins/api/types.js'
import type { AutoSidebarPluginOptions } from '../plugins/index.js'
import type {
  ReferenceItem,
  ReleaseNotesOptions,
} from '../plugins/replace/types.js'
import type { DoomSite } from '../shared/index.js'

export interface GlobalCliOptions {
  config?: string
  prefix?: string
  v?: string
  ignore?: boolean
  force?: boolean
}

export interface DoomConfig extends UserConfig {
  api?: ApiPluginOptions
  sites?: DoomSite[]
  reference?: ReferenceItem[]
  sidebar?: AutoSidebarPluginOptions
  releaseNotes?: ReleaseNotesOptions
  internalRoutes?: string[]
}

export type ContentProcessor = {
  type: 'ejsTemplate'
  data?: Record<string, unknown>
}
