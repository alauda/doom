import { describe, expect, test } from '@rstest/core'
import { VFile } from 'vfile'

import { dropChineseTypographyMessages } from '#remark-lint/index.ts'

/**
 * `remark-lint-match-punctuation` and `remark-lint-no-chinese-punctuation-in-number`
 * pair and place CJK punctuation. Applied to Russian they read `pod’ами` — which
 * is how Russian declines a Latin word — as an unmatched quotation mark, and
 * report every page that does it. That went unnoticed for as long as
 * translations were not linted at all: 17 of the 19 findings on a real corpus
 * were this, and none of them was a defect.
 */
const survivingRuleIds = (path?: string) => {
  const file = new VFile(path == null ? {} : { path })
  for (const ruleId of [
    'match-punctuation',
    'no-chinese-punctuation-in-number',
    'check-dead-links',
  ]) {
    const message = file.message('anything')
    message.ruleId = ruleId
  }

  dropChineseTypographyMessages(file)

  return file.messages.map((message) => message.ruleId)
}

describe('Chinese typography rules stay on Chinese documents', () => {
  test('drops them on a Russian document, keeping everything else', () => {
    expect(survivingRuleIds('docs/ru/install/a.md')).toEqual([
      'check-dead-links',
    ])
  })

  test('drops them on an English document too', () => {
    expect(survivingRuleIds('docs/en/install/a.md')).toEqual([
      'check-dead-links',
    ])
  })

  test('keeps them on a Chinese document', () => {
    expect(survivingRuleIds('docs/zh/install/a.md')).toEqual([
      'match-punctuation',
      'no-chinese-punctuation-in-number',
      'check-dead-links',
    ])
  })

  test('keeps them when the path says nothing about a language', () => {
    expect(survivingRuleIds()).toEqual([
      'match-punctuation',
      'no-chinese-punctuation-in-number',
      'check-dead-links',
    ])
  })
})
