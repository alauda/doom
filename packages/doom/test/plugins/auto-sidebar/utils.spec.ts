import { describe, expect, test } from '@rstest/core'

import {
  combineWalkResult,
  type WalkResult,
} from '#plugins/auto-sidebar/utils.ts'

describe('combineWalkResult', () => {
  test('combines single walk result with default version', () => {
    const walks = [
      {
        nav: [{ text: 'Home', link: '/' }],
        sidebar: { '/': [{ text: 'Intro', link: '/intro' }] },
      },
    ]
    const versions: string[] = []

    const result = combineWalkResult(walks, versions)

    expect(result).toEqual({
      nav: { default: [{ text: 'Home', link: '/' }] },
      sidebar: { '/': [{ text: 'Intro', link: '/intro' }] },
    })
  })

  test('combines multiple walk results with versions', () => {
    const walks: WalkResult[] = [
      {
        nav: [{ text: 'Home v1', link: '/v1' }],
        sidebar: { '/v1': [{ text: 'Intro v1', link: '/v1/intro' }] },
      },
      {
        nav: [{ text: 'Home v2', link: '/v2' }],
        sidebar: { '/v2': [{ text: 'Intro v2', link: '/v2/intro' }] },
      },
    ]
    const versions = ['v1.0.0', 'v2.0.0']

    const result = combineWalkResult(walks, versions)

    expect(result).toEqual({
      nav: {
        'v1.0.0': [{ text: 'Home v1', link: '/v1' }],
        'v2.0.0': [{ text: 'Home v2', link: '/v2' }],
      },
      sidebar: {
        '/v1': [{ text: 'Intro v1', link: '/v1/intro' }],
        '/v2': [{ text: 'Intro v2', link: '/v2/intro' }],
      },
    })
  })

  test('handles empty walks array', () => {
    const walks: { nav: []; sidebar: Record<string, []> }[] = []
    const versions: string[] = []

    const result = combineWalkResult(walks, versions)

    expect(result).toEqual({
      nav: {},
      sidebar: {},
    })
  })

  test('merges sidebar entries from multiple walks', () => {
    const walks: WalkResult[] = [
      {
        nav: [{ text: 'Nav1', link: '/nav1' }],
        sidebar: {
          '/docs': [{ text: 'Doc1', link: '/docs/1' }],
        },
      },
      {
        nav: [{ text: 'Nav2', link: '/nav2' }],
        sidebar: {
          '/api': [{ text: 'API1', link: '/api/1' }],
        },
      },
    ]
    const versions = ['latest', 'next']

    const result = combineWalkResult(walks, versions)

    expect(result.sidebar).toEqual({
      '/docs': [{ text: 'Doc1', link: '/docs/1' }],
      '/api': [{ text: 'API1', link: '/api/1' }],
    })
    expect(result.nav).toEqual({
      latest: [{ text: 'Nav1', link: '/nav1' }],
      next: [{ text: 'Nav2', link: '/nav2' }],
    })
  })

  test('later walks override earlier sidebar entries with same key', () => {
    const walks: WalkResult[] = [
      {
        nav: [{ text: 'Nav1', link: '/nav1' }],
        sidebar: {
          '/shared': [{ text: 'Old', link: '/shared/old' }],
        },
      },
      {
        nav: [{ text: 'Nav2', link: '/nav2' }],
        sidebar: {
          '/shared': [{ text: 'New', link: '/shared/new' }],
        },
      },
    ]
    const versions = ['v1', 'v2']

    const result = combineWalkResult(walks, versions)

    expect(result.sidebar['/shared']).toEqual([
      { text: 'New', link: '/shared/new' },
    ])
  })
})
