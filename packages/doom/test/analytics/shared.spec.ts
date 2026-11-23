import { describe, expect, test } from '@rstest/core'

import {
  countSearchResults,
  isOptedOut,
  normalizeQuery,
  referrerPath,
  resolveDimensions,
  resolveTarget,
  toPostHogProperties,
  toRumEvent,
} from '#analytics/shared.ts'

describe('resolveTarget', () => {
  test('sends the io site and its staging to PostHog', () => {
    expect(resolveTarget('docs.alauda.io', '/container_platform/4.4/')).toEqual(
      { provider: 'posthog', env: 'production' },
    )
    expect(resolveTarget('docs-io-staging.alauda.cn', '/')).toEqual({
      provider: 'posthog',
      env: 'staging',
    })
  })

  test('sends the cn site and its staging hosts to Tencent RUM', () => {
    expect(resolveTarget('docs.alauda.cn', '/')).toEqual({
      provider: 'rum',
      env: 'production',
    })
    expect(resolveTarget('docs-staging.alauda.cn', '/')?.env).toBe('staging')
    expect(resolveTarget('docs-dev.alauda.cn', '/')?.env).toBe('staging')
  })

  test('reports nothing from any other host', () => {
    // A customer's offline install, a PR preview, local development.
    for (const host of [
      'acp.customer.internal',
      'doom-pr-42.pages.dev',
      'localhost',
      'evil-docs.alauda.io',
    ]) {
      expect(resolveTarget(host, '/docs/container_platform/')).toBeUndefined()
    }
  })

  test('leaves the Russian site out even on a listed host', () => {
    expect(
      resolveTarget('docs.alauda.io', '/russian/container_platform/4.4/'),
    ).toBeUndefined()
  })
})

describe('isOptedOut', () => {
  test('honours Do Not Track and Global Privacy Control', () => {
    expect(isOptedOut({ doNotTrack: '1' })).toBe(true)
    expect(isOptedOut({ doNotTrack: 'yes' })).toBe(true)
    expect(isOptedOut({ windowDoNotTrack: '1' })).toBe(true)
    expect(isOptedOut({ globalPrivacyControl: true })).toBe(true)
  })

  test('tracks a reader who sent neither signal', () => {
    expect(isOptedOut({ doNotTrack: null })).toBe(false)
    expect(isOptedOut({ doNotTrack: '0', globalPrivacyControl: false })).toBe(
      false,
    )
  })
})

describe('resolveDimensions', () => {
  test('takes the site from the base and keeps the version as built', () => {
    expect(
      resolveDimensions({
        userBase: '/container_platform/',
        version: '4.4',
        lang: 'en',
        pathname: '/container_platform/4.4/install/',
      }),
    ).toEqual({
      site: 'container_platform',
      version: '4.4',
      lang: 'en',
      path: '/container_platform/4.4/install/',
    })
  })

  test('fills missing parts with explicit placeholders', () => {
    expect(resolveDimensions({ userBase: '/', pathname: '/' })).toEqual({
      site: 'root',
      version: 'unversioned',
      lang: 'unknown',
      path: '/',
    })
  })
})

describe('normalizeQuery', () => {
  test('trims, lowercases and collapses whitespace', () => {
    expect(normalizeQuery('  Ingress   NGINX ')).toBe('ingress nginx')
  })

  test('caps the length at 100 characters', () => {
    expect(normalizeQuery('a'.repeat(150))).toHaveLength(100)
  })
})

describe('countSearchResults', () => {
  test('adds up every group and ignores malformed ones', () => {
    expect(
      countSearchResults([
        { result: [1, 2] },
        { result: [3] },
        { result: 'custom' },
      ]),
    ).toBe(3)
    expect(countSearchResults([{ result: [] }])).toBe(0)
  })
})

describe('referrerPath', () => {
  const origin = 'https://docs.alauda.io'

  test('keeps only the path of a same-site referrer', () => {
    expect(
      referrerPath(
        'https://docs.alauda.io/container_platform/4.4/install/?q=x#a',
        origin,
      ),
    ).toBe('/container_platform/4.4/install/')
  })

  test('keeps only the host of another site', () => {
    expect(referrerPath('https://www.google.com/search?q=acp', origin)).toBe(
      'www.google.com',
    )
  })

  test('returns nothing for a missing or malformed referrer', () => {
    expect(referrerPath('', origin)).toBe('')
    expect(referrerPath('not a url', origin)).toBe('')
  })
})

const dimensions = {
  site: 'container_platform',
  version: '4.4',
  lang: 'en',
  path: '/container_platform/4.4/install/',
}

describe('toRumEvent', () => {
  test('puts the common dimensions in ext1–ext4', () => {
    expect(
      toRumEvent({ name: 'docs_404', referrer_path: '/a/' }, dimensions),
    ).toEqual({
      name: 'docs_404',
      ext1: 'container_platform',
      ext2: '4.4',
      ext3: 'en',
      ext4: '/container_platform/4.4/install/',
      ext5: '/a/',
    })
  })

  test('maps a search to query, count and zero-result flag', () => {
    const event = toRumEvent(
      {
        name: 'docs_search',
        query: 'zzqqxx',
        result_count: 0,
        zero_result: true,
      },
      dimensions,
    )
    expect([event.ext5, event.ext6, event.ext7]).toEqual([
      'zzqqxx',
      '0',
      'true',
    ])
  })

  test('maps feedback to the vote and a comma-separated reason list', () => {
    const event = toRumEvent(
      {
        name: 'docs_feedback',
        vote: 'down',
        reasons: ['steps_failed', 'outdated'],
      },
      dimensions,
    )
    expect([event.ext5, event.ext6]).toEqual(['down', 'steps_failed,outdated'])
  })
})

describe('toPostHogProperties', () => {
  test('carries the same fields as the RUM event, by name', () => {
    expect(
      toPostHogProperties(
        {
          name: 'docs_feedback',
          vote: 'down',
          reasons: ['steps_failed', 'outdated'],
        },
        dimensions,
      ),
    ).toEqual({
      ...dimensions,
      vote: 'down',
      reasons: 'steps_failed,outdated',
    })
  })
})
