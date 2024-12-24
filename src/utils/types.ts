import { UserConfig } from '@rspress/core'

import { DoomSite } from '../shared/index.js'

export interface DoomConfig extends UserConfig {
  api?: {
    crds?: string[]
    openapis?: string[]
    references?: Record<string, string>
    pathPrefix?: string
  }
  sites?: DoomSite[]
}
