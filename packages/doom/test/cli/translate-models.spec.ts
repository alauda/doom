import { afterEach, beforeEach, describe, expect, test } from '@rstest/core'

import {
  API_KEY_ENV,
  DEFAULT_JUDGE_MODEL,
  BASE_URL_ENV,
  DEFAULT_TRANSLATE_MODEL,
  JUDGE_MODEL_ENV,
  createGateway,
  gatewayModel,
  thinkingLevelsFor,
} from '#cli/translate-models.ts'

const GROK_IDS = ['grok-4.6', 'grok/grok-4.6', 'x-ai/grok-4.6', 'xai/grok-4.6']
const GPT_IDS = ['gpt-5.6', 'gpt-5.6-sol', 'gpt-5.4-mini']

describe('thinkingLevelsFor', () => {
  test.each(GROK_IDS)('`%s` speaks the grok vocabulary', (id) => {
    const levels = thinkingLevelsFor(id)
    // Measured against the real gateway: grok 400s on `none` and accepts
    // `minimal`. Sending `none` to it is the failure this map exists to avoid.
    expect(levels.off).toBe(null)
    expect(levels.minimal).toBe('minimal')
  })

  test.each(GPT_IDS)('`%s` speaks the gpt vocabulary', (id) => {
    const levels = thinkingLevelsFor(id)
    expect(levels.off).toBe('none')
    expect(levels.minimal).toBe(null)
  })

  test('an unknown model falls back to the gpt vocabulary', () => {
    expect(thinkingLevelsFor('something-nobody-has-measured')).toEqual(
      thinkingLevelsFor(DEFAULT_TRANSLATE_MODEL),
    )
  })

  test('the two families disagree only at the ends of the scale', () => {
    const gpt = thinkingLevelsFor('gpt-5.6')
    const grok = thinkingLevelsFor('grok-4.6')
    const differing = Object.keys(gpt).filter(
      (level) =>
        gpt[level as keyof typeof gpt] !== grok[level as keyof typeof grok],
    )
    expect(differing.sort()).toEqual(['minimal', 'off'])
  })

  test.each(['low', 'medium', 'high', 'xhigh', 'max'] as const)(
    '`%s` means itself on both families',
    (level) => {
      expect(thinkingLevelsFor('gpt-5.6')[level]).toBe(level)
      expect(thinkingLevelsFor('grok-4.6')[level]).toBe(level)
    },
  )
})

describe('gatewayModel', () => {
  test('carries the vocabulary of the model it names, not of the gateway', () => {
    const baseUrl = 'https://gateway.invalid/v1'
    expect(
      gatewayModel({ id: 'grok-4.6', baseUrl }).thinkingLevelMap!.off,
    ).toBe(null)
    expect(gatewayModel({ id: 'gpt-5.6', baseUrl }).thinkingLevelMap!.off).toBe(
      'none',
    )
  })
})

describe('createGateway — which model reviews', () => {
  const saved = {
    key: process.env[API_KEY_ENV],
    base: process.env[BASE_URL_ENV],
    judge: process.env[JUDGE_MODEL_ENV],
    model: process.env.ALAUDA_OPENAI_MODEL,
  }

  beforeEach(() => {
    process.env[API_KEY_ENV] = 'test-key'
    process.env[BASE_URL_ENV] = 'https://gateway.invalid/v1'
    Reflect.deleteProperty(process.env, JUDGE_MODEL_ENV)
    delete process.env.ALAUDA_OPENAI_MODEL
  })

  afterEach(() => {
    for (const [name, value] of [
      [API_KEY_ENV, saved.key],
      [BASE_URL_ENV, saved.base],
      [JUDGE_MODEL_ENV, saved.judge],
      ['ALAUDA_OPENAI_MODEL', saved.model],
    ] as const) {
      if (value === undefined) {
        Reflect.deleteProperty(process.env, name)
      } else {
        process.env[name] = value
      }
    }
  })

  test('reviews with something other than the translator by default', async () => {
    const gateway = await createGateway({ modelId: 'gpt-5.6' })
    expect(gateway.judgeModel.id).toBe(DEFAULT_JUDGE_MODEL)
    expect(gateway.judgeModel.id).not.toBe(gateway.model.id)
  })

  test(`\`${JUDGE_MODEL_ENV}\` switches the reviewer`, async () => {
    process.env[JUDGE_MODEL_ENV] = 'grok-4.6'
    const gateway = await createGateway({ modelId: 'gpt-5.6' })
    expect(gateway.model.id).toBe('gpt-5.6')
    expect(gateway.judgeModel.id).toBe('grok-4.6')
    // The point of a different reviewer is a different vocabulary reaching it.
    expect(gateway.judgeModel.thinkingLevelMap!.minimal).toBe('minimal')
    expect(gateway.model.thinkingLevelMap!.minimal).toBe(null)
  })

  test('the per-site option beats the environment', async () => {
    process.env[JUDGE_MODEL_ENV] = 'grok-4.6'
    const gateway = await createGateway({
      modelId: 'gpt-5.6',
      judgeModelId: 'gpt-5.6-sol',
    })
    expect(gateway.judgeModel.id).toBe('gpt-5.6-sol')
  })

  test('naming the translator as reviewer is not a second model', async () => {
    process.env[JUDGE_MODEL_ENV] = 'gpt-5.6'
    const gateway = await createGateway({ modelId: 'gpt-5.6' })
    expect(gateway.judgeModel).toBe(gateway.model)
  })
})
