import type { AssistantMessage, Models } from '@earendil-works/pi-ai'
import { describe, expect, test } from '@rstest/core'

import {
  agreedFindings,
  createJudge,
  parseJudgeFindings,
  type JudgeFinding,
} from '#cli/translate-judge.ts'
import { gatewayModel } from '#cli/translate-models.ts'

/**
 * The judge is the one check whose answer is a model's opinion. What is tested
 * here is everything around that opinion: what is thrown away before it counts,
 * what has to be said twice, and what is allowed to fail a build.
 */

const reply = (text: string): AssistantMessage => ({
  role: 'assistant',
  content: [{ type: 'text', text }],
  api: 'openai-completions',
  provider: 'test',
  model: 'test',
  usage: {
    input: 0,
    output: 0,
    cacheRead: 0,
    cacheWrite: 0,
    totalTokens: 0,
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 },
  },
  stopReason: 'stop',
  timestamp: Date.now(),
})

const judgeSaying = (replies: string[]) => {
  const queue = [...replies]
  const models = {
    completeSimple: () => Promise.resolve(reply(queue.shift() ?? '[]')),
  } as unknown as Models
  return createJudge({
    models,
    model: gatewayModel({ id: 'test', baseUrl: 'http://localhost:1/v1' }),
    reasoningEffort: 'medium',
    limit: (job) => job(),
  })
}

const request = {
  sourceText: 'Download the package. See __DOOM_TR_LINK_0__.',
  translationText: '下载软件包。参见 __DOOM_TR_LINK_0__。',
  sourceLanguage: 'English',
  targetLanguage: 'Chinese',
}

const finding = (kind: JudgeFinding['kind'], source: string): JudgeFinding => ({
  kind,
  source,
  detail: 'something',
})

describe('reading the judge’s answer', () => {
  test('accepts a bare array', () => {
    expect(
      parseJudgeFindings(
        '[{"kind":"omission","source":"Download the package.","detail":"missing"}]',
      ),
    ).toHaveLength(1)
  })

  test('accepts an array wrapped in prose or a code fence', () => {
    for (const wrapped of [
      'Here is what I found:\n```json\n[{"kind":"fluency","source":"Download","detail":"stiff"}]\n```',
      'I read both documents.\n\n[{"kind":"fluency","source":"Download","detail":"stiff"}]\n\nThat is all.',
    ]) {
      expect(parseJudgeFindings(wrapped)).toHaveLength(1)
    }
  })

  test('an answer nobody can parse is a reading that found nothing', () => {
    // Not an error: a judge that cannot be read cannot report a defect either,
    // and failing the document over it would fail the wrong thing.
    for (const unusable of ['I could not review this.', '', '{']) {
      expect(parseJudgeFindings(unusable)).toEqual([])
    }
  })

  test('drops entries that are not findings', () => {
    const parsed = parseJudgeFindings(
      JSON.stringify([
        { kind: 'omission', source: 'kept', detail: 'ok' },
        { kind: 'invented-kind', source: 'x', detail: 'y' },
        { kind: 'omission', source: '', detail: 'no quote' },
        { kind: 'omission', detail: 'no source at all' },
        'not an object',
      ]),
    )
    expect(parsed.map((f) => f.source)).toEqual(['kept'])
  })

  test('drops findings that are only about a placeholder', () => {
    // Whether every placeholder came back is counted exactly elsewhere. Passing
    // this on would ask the translator to fix a token it must reproduce
    // verbatim.
    const parsed = parseJudgeFindings(
      JSON.stringify([
        { kind: 'omission', source: '__DOOM_TR_LINK_0__', detail: 'dropped' },
        {
          kind: 'omission',
          source: 'the sentence with __DOOM_TR_LINK_0__ in it',
          detail: 'dropped',
        },
      ]),
    )
    expect(parsed).toHaveLength(1)
    expect(parsed[0].source).toContain('the sentence')
  })
})

describe('a finding has to be seen twice', () => {
  test('what both readings report survives', () => {
    const kept = agreedFindings([
      [finding('omission', 'Download the package.')],
      [finding('omission', 'Download the package.')],
    ])
    expect(kept).toHaveLength(1)
  })

  test('what only one reading reports does not', () => {
    const kept = agreedFindings([
      [finding('omission', 'Download the package.')],
      [finding('omission', 'A different sentence entirely.')],
    ])
    expect(kept).toEqual([])
  })

  test('the same passage quoted at different lengths still counts as agreement', () => {
    const kept = agreedFindings([
      [finding('omission', 'Download the package.')],
      [finding('omission', 'Download   the   package')],
    ])
    expect(kept).toHaveLength(1)
  })

  test('the same passage read as two different problems is not agreement', () => {
    const kept = agreedFindings([
      [finding('omission', 'Download the package.')],
      [finding('fluency', 'Download the package.')],
    ])
    expect(kept).toEqual([])
  })
})

describe('what the judge hands back', () => {
  test('omission, addition and mistranslation block; fluency does not', async () => {
    const both = JSON.stringify([
      { kind: 'omission', source: 'Download the package.', detail: 'gone' },
      { kind: 'fluency', source: 'Download the package.', detail: 'stiff' },
    ])
    const findings = await judgeSaying([both, both]).review(request)

    expect(findings).toHaveLength(2)
    expect(
      findings.find((f) => f.rule === 'doom-judge:omission')?.blocking,
    ).toBe(true)
    expect(
      findings.find((f) => f.rule === 'doom-judge:fluency')?.blocking,
    ).toBe(false)
  })

  test('a finding quotes the source it is about, so it can be checked', async () => {
    const answer = JSON.stringify([
      {
        kind: 'omission',
        source: 'Download the package.',
        detail: 'the translation does not mention downloading',
      },
    ])
    const [only] = await judgeSaying([answer, answer]).review(request)
    expect(only.reason).toContain('Download the package.')
    expect(only.reason).toContain('does not mention downloading')
  })

  test('a faithful translation gets an empty answer, and that is the expected one', async () => {
    const judge = judgeSaying(['[]', '[]'])
    expect(await judge.review(request)).toEqual([])
    expect(judge.readings()).toBe(2)
  })

  test('a model failure that never clears is raised, not read as "nothing wrong"', async () => {
    const failed = reply('')
    failed.stopReason = 'error'
    failed.errorMessage = 'gateway said no'
    const models = {
      completeSimple: () => Promise.resolve(failed),
    } as unknown as Models
    const judge = createJudge({
      models,
      model: gatewayModel({ id: 'test', baseUrl: 'http://localhost:1/v1' }),
      reasoningEffort: 'medium',
      limit: (job) => job(),
      maxRetries: 0,
    })
    await expect(judge.review(request)).rejects.toThrow(/gateway said no/)
  })

  test('a refusal that clears on the next attempt is retried, not failed', async () => {
    // Measured on the real gateway: concurrent full-document readings are
    // refused under load. At corpus scale that is routine, and failing a
    // document over it would fail the wrong thing.
    const refused = reply('')
    refused.stopReason = 'error'
    refused.errorMessage = 'Concurrency limit exceeded for user'
    let attempts = 0
    const models = {
      completeSimple: () => {
        attempts++
        return Promise.resolve(attempts <= 2 ? refused : reply('[]'))
      },
    } as unknown as Models
    const judge = createJudge({
      models,
      model: gatewayModel({ id: 'test', baseUrl: 'http://localhost:1/v1' }),
      reasoningEffort: 'medium',
      limit: (job) => job(),
      maxRetries: 3,
      retryDelayMs: 1,
    })
    expect(await judge.review(request)).toEqual([])
    expect(attempts).toBeGreaterThan(2)
  })
})
