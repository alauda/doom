import { afterEach, beforeEach, describe, expect, test } from '@rstest/core'

import {
  CONCURRENCY_ENV,
  DEFAULT_CONCURRENCY,
  DEFAULT_REQUESTS_PER_MINUTE,
  REQUESTS_PER_MINUTE_ENV,
  createLimits,
  positiveIntFromEnv,
} from '#cli/translate.ts'

const NAME = CONCURRENCY_ENV

describe('positiveIntFromEnv', () => {
  const saved = process.env[NAME]
  // A block body on purpose: an arrow that *returns* something makes the
  // runner treat the value as a teardown callback, and a boolean is not one.
  beforeEach(() => {
    Reflect.deleteProperty(process.env, NAME)
  })
  afterEach(() => {
    if (saved === undefined) {
      Reflect.deleteProperty(process.env, NAME)
    } else {
      process.env[NAME] = saved
    }
  })

  test('unset means the default', () => {
    expect(positiveIntFromEnv(NAME, 7)).toBe(7)
  })

  test('empty means the default — an unset variable often arrives this way', () => {
    process.env[NAME] = ''
    expect(positiveIntFromEnv(NAME, 7)).toBe(7)
  })

  test('a whole number is used', () => {
    process.env[NAME] = '4'
    expect(positiveIntFromEnv(NAME, 7)).toBe(4)
  })

  // Falling back on a malformed value would run something other than what was
  // asked for, and say nothing — the worst of the three outcomes.
  test.each(['twenty', '0', '-1', '2.5', 'NaN'])(
    '`%s` fails, naming the variable',
    (value) => {
      process.env[NAME] = value
      expect(() => positiveIntFromEnv(NAME, 7)).toThrow(NAME)
    },
  )
})

describe('the defaults', () => {
  test('are the ones the gateway was asked for', () => {
    expect(DEFAULT_CONCURRENCY).toBe(2)
    expect(DEFAULT_REQUESTS_PER_MINUTE).toBe(25)
  })

  test('name both variables', () => {
    expect(CONCURRENCY_ENV).toBe('ALAUDA_OPENAI_CONCURRENCY')
    expect(REQUESTS_PER_MINUTE_ENV).toBe('ALAUDA_OPENAI_REQUESTS_PER_MINUTE')
  })
})

describe('createLimits', () => {
  test('never lets more than `concurrency` documents run at once', async () => {
    const { documentLimit } = createLimits({
      concurrency: 2,
      requestsPerMinute: DEFAULT_REQUESTS_PER_MINUTE,
    })
    let inFlight = 0
    let peak = 0
    await Promise.all(
      Array.from({ length: 8 }, () =>
        documentLimit(async () => {
          inFlight++
          peak = Math.max(peak, inFlight)
          await new Promise((resolve) => globalThis.setTimeout(resolve, 5))
          inFlight--
        }),
      ),
    )
    expect(peak).toBe(2)
  })

  test('bounds model calls by the same number', async () => {
    const { modelCallLimit } = createLimits({
      concurrency: 1,
      requestsPerMinute: DEFAULT_REQUESTS_PER_MINUTE,
    })
    let inFlight = 0
    let peak = 0
    await Promise.all(
      Array.from({ length: 4 }, () =>
        modelCallLimit(async () => {
          inFlight++
          peak = Math.max(peak, inFlight)
          await new Promise((resolve) => globalThis.setTimeout(resolve, 5))
          inFlight--
        }),
      ),
    )
    expect(peak).toBe(1)
  })
})
