import { UserConfig } from '@rspress/core'

import type { ApiPluginOptions } from '../plugins/api/types.js'
import type { AutoSidebarPluginOptions } from '../plugins/index.js'
import type {
  ReferenceItem,
  ReleaseNotesOptions,
} from '../plugins/reference/types.js'
import type { DoomSite } from '../shared/index.js'

export interface DoomConfig extends UserConfig {
  api?: ApiPluginOptions
  sites?: DoomSite[]
  reference?: ReferenceItem[]
  sidebar?: AutoSidebarPluginOptions
  releaseNotes?: ReleaseNotesOptions
}
