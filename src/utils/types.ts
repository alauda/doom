import { UserConfig } from '@rspress/core'

import type { ApiPluginOptions } from '../plugins/api/types.js'
import type { ReferenceItem } from '../plugins/reference/types.js'
import type { DoomSite } from '../shared/index.js'

export interface DoomConfig extends UserConfig {
  api?: ApiPluginOptions
  sites?: DoomSite[]
  reference?: ReferenceItem[]
}
