import { describe, test, expect } from '@rstest/core'

import { formatDate } from '../../src/merge-pdfs/formatDate.ts'

describe('formatDate', () => {
  test("formats date in D:YYYYMMDDHHmmSS±HH'mm' pattern", () => {
    const date = new Date('2024-01-15T14:30:45Z')
    const result = formatDate(date)
    expect(result).toMatch(/^D:\d{14}[Z+-]\d{2}'\d{2}'$/)
  })

  test('starts with D: prefix', () => {
    const date = new Date()
    const result = formatDate(date)
    expect(result.startsWith('D:')).toBe(true)
  })

  test('contains year from local time', () => {
    const date = new Date(2024, 5, 15, 10, 30, 0)
    const result = formatDate(date)
    expect(result).toContain('2024')
  })

  test('zero-pads single-digit month', () => {
    const date = new Date(2024, 0, 5, 0, 0, 0)
    const result = formatDate(date)
    expect(result).toContain('D:202401')
  })

  test('zero-pads single-digit day', () => {
    const date = new Date(2024, 2, 8, 0, 0, 0)
    const result = formatDate(date)
    expect(result).toContain('20240308')
  })

  test('zero-pads single-digit hour', () => {
    const date = new Date(2024, 2, 15, 9, 0, 0)
    const result = formatDate(date)
    const hour = result.slice(10, 12)
    expect(hour).toBe('09')
  })

  test('zero-pads single-digit minute', () => {
    const date = new Date(2024, 2, 15, 14, 5, 30)
    const result = formatDate(date)
    const minute = result.slice(12, 14)
    expect(minute).toBe('05')
  })

  test('zero-pads single-digit second', () => {
    const date = new Date(2024, 2, 15, 14, 30, 3)
    const result = formatDate(date)
    const second = result.slice(14, 16)
    expect(second).toBe('03')
  })

  test('includes timezone offset', () => {
    const date = new Date()
    const result = formatDate(date)
    expect(result).toMatch(/[Z+-]\d{2}'\d{2}'$/)
  })

  test('uses local date components', () => {
    const date = new Date(2024, 11, 31, 23, 59, 59)
    const result = formatDate(date)
    expect(result).toContain('20241231')
    expect(result).toContain('235959')
  })

  test('handles year boundary correctly', () => {
    const date = new Date(2025, 0, 1, 0, 0, 0)
    const result = formatDate(date)
    expect(result).toContain('D:20250101')
  })
})
