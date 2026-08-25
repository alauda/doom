import type { Options } from '@cspell/eslint-plugin'
import type { serve } from '@rspress/core'

import type {
  ApiPluginOptions,
  AutoSidebarPluginOptions,
  PermissionPluginOptions,
  ReferenceItem,
  ReleaseNotesOptions,
} from './plugins/index.ts'
import type { DoomSite } from './shared/index.ts'

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
  algolia?: boolean | 'alauda'
  siteUrl?: boolean
  lang?: string
}

export interface TranslateOptions {
  systemPrompt?: string
  userPrompt?: string
  /**
   * Model id on the translation gateway. Defaults to `ALAUDA_OPENAI_MODEL`, and
   * then to the version this was measured against.
   */
  model?: string
  /** Reasoning effort for the translator. Defaults to `low`. */
  reasoningEffort?: 'minimal' | 'low' | 'medium' | 'high' | 'xhigh' | 'max'
  /**
   * How many times a document's findings are fed back before it is failed.
   * Exhausting them fails the document — it never ships what it could not fix.
   */
  maxRepairRounds?: number
  /** Runaway guard: total model turns for one document, tool calls included. */
  maxTurns?: number
  /**
   * Context the translator plans for, in tokens. Deliberately lower than what
   * the gateway offers: planning for less costs a re-read, planning for more
   * loses content.
   */
  contextWindow?: number
  /** Cap on a single model response, in tokens. */
  maxOutputTokens?: number
  /**
   * Glob patterns (relative to each language directory) whose files are copied
   * verbatim to the target language instead of being translated. Defaults to
   * the generated API directories (`apis/advanced_apis/**`, `apis/crds/**`,
   * `apis/kubernetes_apis/**`, `apis/references/**`) — override to change which
   * content is copy-only. To keep a hand-maintained translation inside a
   * copy-only directory, set `i18n.disableAutoTranslation: true` in that file's
   * frontmatter.
   */
  copyOnlyDirectories?: string[]
}

export interface LintOptions {
  cspellOptions?: Partial<Options>
}

export interface AlgoliaOptions {
  appId: string
  apiKey: string
  indexName: string
}

export interface ExportItem {
  name?: string
  scope: string | string[]
  flattenScope?: string[]
  onlyInclude?: string[]
  exclude?: string[]
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
    onlyIncludeRoutes?: string[]
    internalRoutes?: string[]
    translate?: TranslateOptions
    editRepoBaseUrl?: string
    lint?: LintOptions
    algolia?: AlgoliaOptions
    siteUrl?: string
    export?: ExportItem[]
  }

  interface SiteData {
    originalTitle?: string
  }
}

export type ContentProcessor = {
  type: 'ejsTemplate'
  data?: Record<string, unknown>
}
