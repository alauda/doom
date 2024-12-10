import { UserConfig } from '@rspress/core'

export interface DoomConfig extends UserConfig {
  api?: {
    crds?: string[]
    openapis?: string[]
    references?: Record<string, string>
    pathPrefix?: string
  }
}
