import { readFileSync } from 'node:fs'

import { describe, expect, test } from '@rstest/core'

const source = readFileSync(
  'packages/doom/src/theme/Breadcrumb/index.tsx',
  'utf8',
)

describe('Products breadcrumb link styling', () => {
  test('uses the shared link class for the full-page Products link', () => {
    expect(source).toContain(
      '<a className="rp-link" href={productsOverviewUrl}>',
    )
  })
})
