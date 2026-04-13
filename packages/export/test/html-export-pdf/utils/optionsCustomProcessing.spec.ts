import { describe, expect, test } from '@rstest/core'

import {
  collectParameters,
  commaSeparatedList,
} from '#html-export-pdf/utils/optionsCustomProcessing.ts'

describe('collectParameters', () => {
  test('adds value to empty array', () => {
    const result = collectParameters('first', [])
    expect(result).toEqual(['first'])
  })

  test('adds value to existing array', () => {
    const result = collectParameters('third', ['first', 'second'])
    expect(result).toEqual(['first', 'second', 'third'])
  })

  test('preserves order of existing elements', () => {
    let result = collectParameters('a', [])
    result = collectParameters('b', result)
    result = collectParameters('c', result)
    expect(result).toEqual(['a', 'b', 'c'])
  })

  test('handles empty string value', () => {
    const result = collectParameters('', ['existing'])
    expect(result).toEqual(['existing', ''])
  })

  test('does not modify original array', () => {
    const original = ['first', 'second']
    const result = collectParameters('third', original)
    expect(original).toEqual(['first', 'second'])
    expect(result).not.toBe(original)
  })
})

describe('commaSeparatedList', () => {
  test('splits single value', () => {
    const result = commaSeparatedList('item')
    expect(result).toEqual(['item'])
  })

  test('splits multiple comma-separated values', () => {
    const result = commaSeparatedList('a,b,c')
    expect(result).toEqual(['a', 'b', 'c'])
  })

  test('preserves whitespace around values', () => {
    const result = commaSeparatedList('a, b, c')
    expect(result).toEqual(['a', ' b', ' c'])
  })

  test('handles empty string', () => {
    const result = commaSeparatedList('')
    expect(result).toEqual([''])
  })

  test('handles consecutive commas', () => {
    const result = commaSeparatedList('a,,b')
    expect(result).toEqual(['a', '', 'b'])
  })

  test('handles trailing comma', () => {
    const result = commaSeparatedList('a,b,')
    expect(result).toEqual(['a', 'b', ''])
  })

  test('handles leading comma', () => {
    const result = commaSeparatedList(',a,b')
    expect(result).toEqual(['', 'a', 'b'])
  })
})
