import { describe, expect, test } from '@rstest/core'

import { lintMdx } from './_helper.ts'

import { noMultiOpenAPIPaths } from '#remark-lint/no-multi-open-api-paths.ts'

describe('no-multi-open-api-paths', () => {
  test('allows single OpenAPIPath', async () => {
    const messages = await lintMdx(noMultiOpenAPIPaths, '<OpenAPIPath />\n')
    expect(messages).toHaveLength(0)
  })
  test('flags two OpenAPIPath components', async () => {
    const messages = await lintMdx(
      noMultiOpenAPIPaths,
      '<OpenAPIPath />\n\n<OpenAPIPath />\n',
    )
    expect(messages).toHaveLength(1)
    expect(String(messages[0])).toContain('Multiple')
  })
})
