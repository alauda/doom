import { describe, expect, test } from '@rstest/core'

import { PUNCTUATION_REGEX } from '#remark-lint/utils.ts'

describe('PUNCTUATION_REGEX', () => {
  test('matches common punctuation marks', () => {
    expect(PUNCTUATION_REGEX.test('.')).toBe(true)
    expect(PUNCTUATION_REGEX.test(',')).toBe(true)
    expect(PUNCTUATION_REGEX.test(';')).toBe(true)
    expect(PUNCTUATION_REGEX.test(':')).toBe(true)
    expect(PUNCTUATION_REGEX.test('!')).toBe(true)
    expect(PUNCTUATION_REGEX.test('?')).toBe(true)
  })

  test('matches quotation marks', () => {
    expect(PUNCTUATION_REGEX.test('"')).toBe(true)
    expect(PUNCTUATION_REGEX.test("'")).toBe(true)
  })

  test('matches brackets and parentheses', () => {
    expect(PUNCTUATION_REGEX.test('(')).toBe(true)
    expect(PUNCTUATION_REGEX.test(')')).toBe(true)
    expect(PUNCTUATION_REGEX.test('[')).toBe(true)
    expect(PUNCTUATION_REGEX.test(']')).toBe(true)
    expect(PUNCTUATION_REGEX.test('{')).toBe(true)
    expect(PUNCTUATION_REGEX.test('}')).toBe(true)
  })

  test('matches dashes and hyphens', () => {
    expect(PUNCTUATION_REGEX.test('-')).toBe(true)
    expect(PUNCTUATION_REGEX.test('—')).toBe(true) // em dash
    expect(PUNCTUATION_REGEX.test('–')).toBe(true) // en dash
  })

  test('matches Chinese punctuation', () => {
    expect(PUNCTUATION_REGEX.test('。')).toBe(true) // Chinese period
    expect(PUNCTUATION_REGEX.test('，')).toBe(true) // Chinese comma
    expect(PUNCTUATION_REGEX.test('！')).toBe(true) // Chinese exclamation
    expect(PUNCTUATION_REGEX.test('？')).toBe(true) // Chinese question
    expect(PUNCTUATION_REGEX.test('；')).toBe(true) // Chinese semicolon
    expect(PUNCTUATION_REGEX.test('：')).toBe(true) // Chinese colon
    expect(PUNCTUATION_REGEX.test('、')).toBe(true) // Chinese enumeration comma
  })

  test('matches Chinese brackets', () => {
    expect(PUNCTUATION_REGEX.test('（')).toBe(true)
    expect(PUNCTUATION_REGEX.test('）')).toBe(true)
    expect(PUNCTUATION_REGEX.test('【')).toBe(true)
    expect(PUNCTUATION_REGEX.test('】')).toBe(true)
    expect(PUNCTUATION_REGEX.test('「')).toBe(true)
    expect(PUNCTUATION_REGEX.test('」')).toBe(true)
  })

  test('does not match letters', () => {
    expect(PUNCTUATION_REGEX.test('a')).toBe(false)
    expect(PUNCTUATION_REGEX.test('Z')).toBe(false)
    expect(PUNCTUATION_REGEX.test('中')).toBe(false)
  })

  test('does not match numbers', () => {
    expect(PUNCTUATION_REGEX.test('0')).toBe(false)
    expect(PUNCTUATION_REGEX.test('9')).toBe(false)
  })

  test('does not match spaces', () => {
    expect(PUNCTUATION_REGEX.test(' ')).toBe(false)
    expect(PUNCTUATION_REGEX.test('\t')).toBe(false)
    expect(PUNCTUATION_REGEX.test('\n')).toBe(false)
  })

  test('matches special symbols', () => {
    expect(PUNCTUATION_REGEX.test('@')).toBe(true)
    expect(PUNCTUATION_REGEX.test('#')).toBe(true)
    expect(PUNCTUATION_REGEX.test('&')).toBe(true)
    expect(PUNCTUATION_REGEX.test('*')).toBe(true)
    expect(PUNCTUATION_REGEX.test('/')).toBe(true)
  })

  test('matches ellipsis', () => {
    expect(PUNCTUATION_REGEX.test('…')).toBe(true)
  })

  test('can be used to find first punctuation in string', () => {
    const match = '你好，世界！'.match(PUNCTUATION_REGEX)
    expect(match).toBeTruthy()
    expect(match![0]).toBe('，')
  })
})
