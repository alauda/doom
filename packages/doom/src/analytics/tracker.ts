// Client-side analytics. Everything that loads an SDK or carries a key sits
// behind `process.env.DOOM_ANALYTICS`, which is only non-empty when a build
// runs with `--analytics`. Without it the bundler drops these branches, so
// offline and preview builds contain neither the SDKs nor the keys.

import virtual from 'doom-@global-virtual'

import {
  type AnalyticsEvent,
  type AnalyticsTarget,
  type Dimensions,
  isOptedOut,
  resolveDimensions,
  resolveTarget,
  toPostHogProperties,
  toRumEvent,
} from './shared.ts'

interface Sink {
  event: (event: AnalyticsEvent, dimensions: Dimensions) => void
  // Only PostHog needs this: Tencent RUM records route changes itself.
  pageview?: () => void
}

let target: AnalyticsTarget | undefined
let sink: Sink | undefined
let lang: string | undefined
const pending: (() => void)[] = []

export const isAnalyticsActive = () => target != null

export const setAnalyticsLang = (value: string) => {
  lang = value
}

const currentDimensions = () =>
  resolveDimensions({
    userBase: virtual.userBase,
    version: virtual.version,
    lang,
    pathname: location.pathname,
  })

// A random id that lives only as long as the page does, so Tencent RUM never
// reads or writes its own id in localStorage.
const pageScopedId = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(12)), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('')

const createSink = async ({
  provider,
  env,
}: AnalyticsTarget): Promise<Sink | undefined> => {
  if (!process.env.DOOM_ANALYTICS) {
    return
  }

  if (provider === 'posthog') {
    const { posthog } =
      await import('posthog-js/dist/module.slim.no-external.js')
    posthog.init('phc_z4dh5vzyhobNVdNAuV5ot7ETqkCcuS6mXj6KtRvEFbCR', {
      api_host: 'https://eu.i.posthog.com',
      // No cookie and no browser storage: PostHog identifies a visitor for one
      // day from a server-side hash whose salt it deletes daily.
      cookieless_mode: 'always',
      person_profiles: 'never',
      // The slim build has no history listener, so the Analytics component
      // reports each route change itself through `trackPageview`.
      capture_pageview: false,
      capture_pageleave: false,
      autocapture: false,
      rageclick: false,
      capture_dead_clicks: false,
      capture_exceptions: false,
      capture_performance: false,
      disable_session_recording: true,
      disable_surveys: true,
      disable_product_tours: true,
      disable_web_experiments: true,
      disable_external_dependency_loading: true,
      advanced_disable_flags: true,
      respect_dnt: true,
      // Registered in `loaded`, before anything is captured, so every event
      // including the first pageview can be split by site and version.
      loaded(instance) {
        const { site, version } = currentDimensions()
        instance.register({ env, site, version })
      },
    })
    return {
      // Sent at once rather than batched: these are few, and a reader who
      // leaves right after answering must not lose the answer.
      event: (event, dimensions) => {
        posthog.capture(event.name, toPostHogProperties(event, dimensions), {
          send_instantly: true,
        })
      },
      pageview: () => {
        posthog.capture('$pageview', undefined, { send_instantly: true })
      },
    }
  }

  // aegis-web-sdk is a UMD bundle: at runtime the default import is the class
  // itself, while its typings (read as CommonJS) nest it one level deeper.
  const { default: aegisModule } = await import('aegis-web-sdk')
  const Aegis = 'default' in aegisModule ? aegisModule.default : aegisModule
  const aegis = new Aegis({
    id: 'wlEaXFzOY4ZzrGnEE4',
    aid: pageScopedId(),
    env,
    spa: true,
    device: false,
    onError: false,
    pagePerformance: false,
    webVitals: false,
    reportApiSpeed: false,
    reportAssetSpeed: false,
  })
  return {
    event: (event, dimensions) => {
      aegis.reportEvent(toRumEvent(event, dimensions))
    },
  }
}

export const initAnalytics = async (resolved: AnalyticsTarget) => {
  if (!process.env.DOOM_ANALYTICS || target) {
    return
  }
  target = resolved
  try {
    sink = await createSink(resolved)
  } catch {
    // The SDK chunk failed to load. Statistics are not worth an error in the
    // reader's console: drop what was queued and stay silent.
    pending.length = 0
    return
  }
  for (const send of pending.splice(0)) {
    send()
  }
}

const whenReady = (send: () => void) => {
  if (sink) {
    send()
  } else {
    pending.push(send)
  }
}

export const trackPageview = () => {
  if (!process.env.DOOM_ANALYTICS || !target) {
    return
  }
  whenReady(() => sink?.pageview?.())
}

export const track = (event: AnalyticsEvent) => {
  if (!process.env.DOOM_ANALYTICS || !target) {
    return
  }
  // Dimensions are taken when the event happens, not when the SDK is ready.
  const dimensions = currentDimensions()
  whenReady(() => sink?.event(event, dimensions))
}

// Whether this page view should report at all: an online build, a listed host,
// and a reader who has not asked browsers not to track them.
export const resolveAnalyticsTarget = () => {
  if (!process.env.DOOM_ANALYTICS) {
    return
  }
  const navigatorWithGpc = navigator as Navigator & {
    globalPrivacyControl?: boolean
  }
  const windowWithDnt = window as Window & { doNotTrack?: string | null }
  if (
    isOptedOut({
      doNotTrack: navigator.doNotTrack,
      windowDoNotTrack: windowWithDnt.doNotTrack,
      globalPrivacyControl: navigatorWithGpc.globalPrivacyControl,
    })
  ) {
    return
  }
  return resolveTarget(location.hostname, location.pathname)
}
