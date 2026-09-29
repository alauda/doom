// Pure helpers for site analytics. Nothing here touches the browser, so the
// rules that decide *whether* and *what* we report can be unit tested.

export type AnalyticsProvider = 'posthog' | 'rum'

export type AnalyticsEnv = 'production' | 'staging'

export interface AnalyticsTarget {
  provider: AnalyticsProvider
  env: AnalyticsEnv
}

// Only these hosts ever report. Anything else — a customer's offline install,
// a PR preview, localhost — gets nothing, even from an online build.
const TARGETS: Record<string, AnalyticsTarget> = {
  'docs.alauda.io': { provider: 'posthog', env: 'production' },
  'docs-io-staging.alauda.cn': { provider: 'posthog', env: 'staging' },
  'docs.alauda.cn': { provider: 'rum', env: 'production' },
  'docs-staging.alauda.cn': { provider: 'rum', env: 'staging' },
  'docs-dev.alauda.cn': { provider: 'rum', env: 'staging' },
}

// The Russian site sits behind a login and is out of scope for now.
const EXCLUDED_PATH_PREFIXES = ['/russian/']

export const resolveTarget = (
  hostname: string,
  pathname: string,
): AnalyticsTarget | undefined => {
  if (EXCLUDED_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return
  }
  return TARGETS[hostname]
}

export interface PrivacySignals {
  doNotTrack?: string | null
  windowDoNotTrack?: string | null
  globalPrivacyControl?: boolean
}

export const isOptedOut = ({
  doNotTrack,
  windowDoNotTrack,
  globalPrivacyControl,
}: PrivacySignals) =>
  doNotTrack === '1' ||
  doNotTrack === 'yes' ||
  windowDoNotTrack === '1' ||
  globalPrivacyControl === true

export interface Dimensions {
  site: string
  version: string
  lang: string
  path: string
}

export const resolveDimensions = ({
  userBase,
  version,
  lang,
  pathname,
}: {
  userBase?: string
  version?: string
  lang?: string
  pathname: string
}): Dimensions => ({
  site: userBase?.replaceAll(/^\/+|\/+$/g, '') || 'root',
  version: version || 'unversioned',
  lang: lang || 'unknown',
  path: pathname,
})

export const MAX_QUERY_LENGTH = 100

export const MIN_QUERY_LENGTH = 2

export const normalizeQuery = (query: string) =>
  query.trim().toLowerCase().replaceAll(/\s+/g, ' ').slice(0, MAX_QUERY_LENGTH)

// rspress groups search results; each default group carries a `result` array.
export const countSearchResults = (groups: readonly { result: unknown }[]) =>
  groups.reduce(
    (count, group) =>
      count + (Array.isArray(group.result) ? group.result.length : 0),
    0,
  )

// Keep only the path of a same-site referrer; for another site keep only its
// host, never its full URL.
export const referrerPath = (referrer: string, origin: string) => {
  if (!referrer) {
    return ''
  }
  try {
    const url = new URL(referrer)
    return url.origin === origin ? url.pathname : url.host
  } catch {
    return ''
  }
}

export const FEEDBACK_REASONS = [
  'steps_failed',
  'outdated',
  'missing_info',
  'unclear',
  'other',
] as const

export type FeedbackReason = (typeof FEEDBACK_REASONS)[number]

export type AnalyticsEvent =
  | {
      name: 'docs_search'
      query: string
      result_count: number
      zero_result: boolean
    }
  | { name: 'docs_404'; referrer_path: string }
  | {
      name: 'docs_feedback'
      vote: 'up' | 'down'
      reasons: FeedbackReason[]
    }

export const toPostHogProperties = (
  event: AnalyticsEvent,
  dimensions: Dimensions,
) => {
  switch (event.name) {
    case 'docs_search': {
      const { query, result_count, zero_result } = event
      return { ...dimensions, query, result_count, zero_result }
    }
    case 'docs_404': {
      return { ...dimensions, referrer_path: event.referrer_path }
    }
    case 'docs_feedback': {
      return {
        ...dimensions,
        vote: event.vote,
        reasons: event.reasons.join(','),
      }
    }
  }
}

export interface RumEvent {
  name: string
  ext1: string
  ext2: string
  ext3: string
  ext4: string
  ext5?: string
  ext6?: string
  ext7?: string
}

// Tencent RUM custom events only carry the string fields ext1–ext10, so every
// field has a fixed slot: ext1–ext4 are the common dimensions, ext5 onwards
// are per event. Keep this table in step with the plan's event schema.
export const toRumEvent = (
  event: AnalyticsEvent,
  { site, version, lang, path }: Dimensions,
): RumEvent => {
  const common = {
    name: event.name,
    ext1: site,
    ext2: version,
    ext3: lang,
    ext4: path,
  }
  switch (event.name) {
    case 'docs_search': {
      return {
        ...common,
        ext5: event.query,
        ext6: String(event.result_count),
        ext7: String(event.zero_result),
      }
    }
    case 'docs_404': {
      return { ...common, ext5: event.referrer_path }
    }
    case 'docs_feedback': {
      return { ...common, ext5: event.vote, ext6: event.reasons.join(',') }
    }
  }
}
