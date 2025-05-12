import type { serve } from '@rspress/core'

import type {
  ApiPluginOptions,
  AutoSidebarPluginOptions,
  PermissionPluginOptions,
  PluginShikiOptions,
  ReferenceItem,
  ReleaseNotesOptions,
} from './plugins/index.js'
import type { DoomSite } from './shared/index.js'

export type BaseServeOptions = Parameters<typeof serve>[0]

export type ServeOptions = Omit<BaseServeOptions, 'config'>

export interface GlobalCliOptions {
  config?: string
  base?: string
  prefix?: string
  v?: string
  download?: boolean
  export?: boolean
  ignore?: boolean
  force?: boolean
  open?: boolean
  lazy?: boolean
  include?: string[]
  exclude?: string[]
  outDir?: string
  redirect?: 'auto' | 'never' | 'only-default-lang'
  editRepo?: boolean | string
}

export interface TranslateOptions {
  systemPrompt?: string
  userPrompt?: string
}

declare module '@rspress/shared' {
  interface UserConfig {
    prefix?: string
    userBase?: string
    api?: Omit<ApiPluginOptions, 'localBasePath'>
    sites?: DoomSite[]
    permission?: Omit<PermissionPluginOptions, 'localBasePath'>
    reference?: ReferenceItem[]
    sidebar?: Omit<AutoSidebarPluginOptions, 'download' | 'excludeRoutes'>
    releaseNotes?: ReleaseNotesOptions
    internalRoutes?: string[]
    translate?: TranslateOptions
    shiki?: PluginShikiOptions
    editRepoBaseUrl?: string
  }
}

export type ContentProcessor = {
  type: 'ejsTemplate'
  data?: Record<string, unknown>
}
