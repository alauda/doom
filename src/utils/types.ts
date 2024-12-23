import { UserConfig } from '@rspress/core'

export interface DoomSite {
  name: string
  displayName?: Record<string, string>
  repo: string
  base: string
  defaultVersion?: string
}

export interface DoomConfig extends UserConfig {
  api?: {
    crds?: string[]
    openapis?: string[]
    references?: Record<string, string>
    pathPrefix?: string
  }
  sites?: DoomSite[]
}
