import { describe, expect, test } from '@rstest/core'

import { mermaidTheme } from '#runtime/components/mermaid-theme.ts'

describe('mermaidTheme', () => {
  test('uses redux-color in light mode', () => {
    expect(mermaidTheme(false)).toBe('redux-color')
  })

  test('uses redux-dark-color in dark mode', () => {
    expect(mermaidTheme(true)).toBe('redux-dark-color')
  })
})
