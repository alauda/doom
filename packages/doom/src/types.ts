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
   * How many documents are translated at once, and how many model calls may be
   * in flight. Defaults to 2, or `ALAUDA_OPENAI_CONCURRENCY`.
   */
  concurrency?: number
  /**
   * The gateway's budget, in model requests a minute — calls, not documents, so
   * the extra turns a repair round takes count against it. Defaults to 25, or
   * `ALAUDA_OPENAI_REQUESTS_PER_MINUTE`.
   */
  requestsPerMinute?: number
  /**
   * The semantic check that reads both documents and says what the translation
   * lost, added or got wrong — the only check that can see a translation which
   * is well-formed and about something else.
   */
  judge?: {
    /**
     * Who reviews. Defaults to a model that is *not* the translator, because
     * two readings by one model share its blind spots and its preference for
     * its own output. Set it to the translator's own id to turn that off.
     */
    model?: string
    /** Defaults to `medium` — reading two documents against each other is the harder job. */
    reasoningEffort?: 'minimal' | 'low' | 'medium' | 'high' | 'xhigh' | 'max'
    /** How many independent readings must agree before a finding counts. Defaults to 2. */
    draws?: number
    /**
     * Turns the judge off.
     *
     * Not a way to make a build pass: a document that fails the judge fails,
     * and the escape hatch for one document is `i18n.disableAutoTranslation`
     * in its own frontmatter. This exists for measuring what the judge is
     * worth — running a corpus with and without it — and for a repository whose
     * gateway has no budget for a second reading.
     */
    enabled?: boolean
  }
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
