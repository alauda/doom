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
  /**
   * Reasoning effort for translating a segment. Defaults to `low`.
   *
   * The main path is deliberately cheap: a segment is a small, well-specified
   * job, and the reasoning is spent where it earns something — on repairing a
   * segment that three attempts could not fix, and on explaining a failure.
   */
  reasoningEffort?: 'minimal' | 'low' | 'medium' | 'high' | 'xhigh' | 'max'
  /**
   * Largest segment sent to the model, in masked characters. Defaults to 16000.
   *
   * The single most important number here: it bounds how much has to be right
   * at once. Raising it trades a lower chance of any one segment passing for
   * fewer calls; lowering it costs context and coherence.
   */
  segmentCap?: number
  /**
   * Size at which an indivisible block fails the document. Defaults to 48000.
   *
   * A block over `segmentCap` that cannot be divided — a huge table or list —
   * becomes an oversized segment of its own. This is where that stops being
   * reasonable, and the document has to be edited instead.
   */
  segmentHardCap?: number
  /**
   * Size a segment must reach before a heading may end it. Defaults to 2000.
   *
   * Without it, a page of one-line sections becomes a page of one-line
   * segments, each its own model call and judge reading for no benefit.
   */
  segmentFloor?: number
  /**
   * How many times a segment is asked for before it is escalated to the repair
   * agent. Defaults to 3 — the first go plus two with the findings attached.
   */
  maxSegmentAttempts?: number
  /**
   * How many times the assembled document may send segments back to be redone.
   * Defaults to 2.
   */
  maxAssemblyRounds?: number
  /**
   * Lines of the previous segment's translation shown to the next one, so the
   * voice and the wording carry across a boundary. Defaults to 20; `0` turns it
   * off.
   */
  contextTail?: number
  /**
   * Reuse the segments whose source has not changed, from the translation
   * already on disk. Defaults to `true`.
   *
   * Turning it off makes every changed document a full retranslation. Nothing
   * is trusted unverified either way: a reused segment has to still account for
   * exactly the content the current source expects, or it is retranslated.
   */
  segmentCache?: boolean
  /**
   * Read the assembled page as a whole, after the segments have passed.
   * Defaults to `true`.
   *
   * Never blocking. It is there for what a segment cannot see — a term that
   * drifted between sections, a join that reads badly — and those belong in a
   * report, not in a gate.
   */
  fullDocJudge?: boolean
  /**
   * The last resort for a segment that repeated attempts could not fix.
   *
   * An agent with `read`, `edit` and `check` and deliberately no way to replace
   * a file: it works inside one segment, and the reason it cannot rewrite
   * everything is the tools it has rather than the instructions it is given.
   */
  repairAgent?: {
    /** Defaults to `true`. */
    enabled?: boolean
    /** Defaults to the translator's model. Set it to the strongest one available. */
    model?: string
    /** Defaults to `high` — this path is rare and hard, which is what reasoning is for. */
    reasoningEffort?: 'minimal' | 'low' | 'medium' | 'high' | 'xhigh' | 'max'
    /**
     * Runaway guard, in agent turns. Defaults to 40.
     *
     * A fixed number works here and did not for whole documents: a segment's
     * size has an upper bound, so the ratio of budget to work is a constant.
     */
    maxTurns?: number
  }
  /**
   * The failure analysis attached to a document that could not be translated.
   *
   * One model call over the evidence already collected, written for whoever
   * reads the build log. Purely advisory: it never changes whether the build
   * passes.
   */
  diagnose?: {
    /** Defaults to `true`. */
    enabled?: boolean
    /** Defaults to `high`. */
    reasoningEffort?: 'minimal' | 'low' | 'medium' | 'high' | 'xhigh' | 'max'
  }
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
    /** Readings taken of a single segment. Defaults to 3. */
    segmentDraws?: number
    /** How many of those must agree before a segment finding counts. Defaults to 2. */
    segmentVotes?: number
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
