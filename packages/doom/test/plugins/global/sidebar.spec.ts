import { createHash } from 'node:crypto'

import { describe, expect, test } from '@rstest/core'

import { createSidebarAsset } from '#plugins/global/sidebar.ts'

describe('createSidebarAsset', () => {
  test('serializes the payload and uses its sha256 in the filename', () => {
    const payload = {
      sidebar: {
        '/': [{ text: 'Home', link: '/home' }],
      },
    }
    const asset = createSidebarAsset(payload)

    expect(asset.content).toBe(JSON.stringify(payload))
    expect(asset.fileName).toBe(
      `sidebar.${createHash('sha256').update(asset.content).digest('hex')}.json`,
    )
    expect(asset.fileName).toMatch(/^sidebar\.[0-9a-f]{64}\.json$/)
    expect(asset.manifestFileName).toBe('sidebar.json')
    expect(JSON.parse(asset.manifestContent)).toEqual({
      fileName: asset.fileName,
    })
  })

  test('keeps locale sidebars in the shared payload', () => {
    const payload = {
      locales: [
        {
          lang: 'en',
          sidebar: { '/': [{ text: 'Home', link: '/home' }] },
        },
        {
          lang: 'zh',
          sidebar: { '/': [{ text: '首页', link: '/zh/home' }] },
        },
      ],
    }

    expect(JSON.parse(createSidebarAsset(payload).content)).toEqual(payload)
  })
})
