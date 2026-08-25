import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import type { AssistantMessage, Models } from '@earendil-works/pi-ai'
import { createAssistantMessageEventStream } from '@earendil-works/pi-ai'
import { afterAll, beforeAll, describe, expect, test } from '@rstest/core'

import { translateWithAgent } from '#cli/translate-agent.ts'
import type { TranslationChecker } from '#cli/translate-checker.ts'
import { maskAst } from '#cli/translate-mask.ts'
import { gatewayModel } from '#cli/translate-models.ts'
import { mdxProcessor } from '#plugins/index.ts'

/**
 * What the loop guarantees, driven by a scripted model.
 *
 * These are claims about control flow, so they are tested where control flow
 * lives: a fake `streamFn` says what the model does, and the assertions are
 * about what the harness does in response. Whether the *rules* are any good is
 * a different question, answered by running them over a real corpus.
 */

const SOURCE = `---
title: Installing
---

# Installing

See the [installation guide](../global/install.mdx) and run \`kubectl apply\`.
`

let workspace: string

beforeAll(async () => {
  workspace = await fs.mkdtemp(path.join(os.tmpdir(), 'doom-agent-'))
})

afterAll(async () => {
  await fs.rm(workspace, { recursive: true, force: true })
})

const prepareSource = () => {
  const tree = mdxProcessor.parse(SOURCE)
  const maskEntries = maskAst(tree)
  return { maskEntries, maskedSource: mdxProcessor.stringify(tree) }
}

/** A translation that reproduces every placeholder — what a correct answer looks like. */
const goodTranslation = (masked: string) =>
  masked.replace('# Installing', '# 安装').replace('See the', '请参阅')

const message = (
  content: AssistantMessage['content'],
  stopReason: AssistantMessage['stopReason'],
): AssistantMessage => ({
  role: 'assistant',
  content,
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
  stopReason,
  timestamp: Date.now(),
})

const says = (text: string) => message([{ type: 'text', text }], 'stop')

let callCounter = 0
const calls = (name: string, args: Record<string, unknown>) =>
  message(
    [{ type: 'toolCall', id: `call-${++callCounter}`, name, arguments: args }],
    'toolUse',
  )

const errors = (reason: string) => {
  const failed = message([], 'error')
  failed.errorMessage = reason
  return failed
}

type Turn = AssistantMessage | (() => AssistantMessage)

interface Run {
  models: Models
  modelCalls: () => number
  /** Everything that was put in front of the model, across every call. */
  everythingSeen: () => string
}

const scriptedModels = (
  script: Turn[],
  fallback: () => AssistantMessage,
): Run => {
  let count = 0
  const seenByModel: string[] = []
  const models = {
    streamSimple: (_model: unknown, context: { messages: unknown[] }) => {
      count++
      seenByModel.push(JSON.stringify(context.messages))
      const next = script.shift()
      const produced = next
        ? typeof next === 'function'
          ? next()
          : next
        : fallback()
      const stream = createAssistantMessageEventStream()
      stream.push({ type: 'start', partial: produced })
      if (produced.stopReason === 'error') {
        stream.push({ type: 'error', reason: 'error', error: produced })
      } else {
        stream.push({
          type: 'done',
          reason: produced.stopReason === 'toolUse' ? 'toolUse' : 'stop',
          message: produced,
        })
      }
      return stream
    },
  } as unknown as Models

  return {
    models,
    modelCalls: () => count,
    everythingSeen: () => seenByModel.join('\n'),
  }
}

/** A checker whose verdict the test decides. The rules themselves are tested elsewhere. */
const checkerReturning = (
  findings: (content: string) => Array<{ rule: string; reason: string }>,
): TranslationChecker => ({
  check: (_targetPath, content) => Promise.resolve(findings(content)),
  assertCheckable: () => Promise.resolve(),
})

const run = async ({
  script,
  fallback = () => says('I am done.'),
  checker = checkerReturning(() => []),
  maxRepairRounds = 3,
  maxTurns = 30,
}: {
  script: Turn[]
  fallback?: () => AssistantMessage
  checker?: TranslationChecker
  maxRepairRounds?: number
  maxTurns?: number
}) => {
  const { maskEntries, maskedSource } = prepareSource()
  const { models, modelCalls, everythingSeen } = scriptedModels(
    script,
    fallback,
  )
  const result = await translateWithAgent({
    maskedSource,
    maskEntries,
    processor: mdxProcessor,
    compose: (restored) => `---\nsourceSHA: test\n---\n\n${restored}`,
    targetPath: path.join(workspace, 'docs', 'zh', 'install', 'installing.mdx'),
    sourceLabel: 'en/install/installing.mdx',
    source: 'en',
    target: 'zh',
    translationRules: 'Translate from English to Chinese.',
    checker,
    models,
    model: gatewayModel({ id: 'test', baseUrl: 'http://localhost:1/v1' }),
    reasoningEffort: 'low',
    scratchDir: path.join(workspace, 'scratch'),
    maxRepairRounds,
    maxTurns,
    limit: (job) => job(),
  })
  return { result, maskedSource, modelCalls, everythingSeen }
}

describe('the repair loop', () => {
  test('a translation that passes every check is returned', async () => {
    const { maskedSource } = prepareSource()
    const { result } = await run({
      script: [
        calls('write', {
          path: 'translation.mdx',
          content: goodTranslation(maskedSource),
        }),
        says('Translated.'),
      ],
    })

    expect(result.findings).toEqual([])
    expect(result.document).toContain('# 安装')
    // The masked link came back as the real one.
    expect(result.document).toContain('../global/install.mdx')
    expect(result.document).not.toContain('__DOOM_TR_')
    expect(result.repairRounds).toBe(0)
  })

  test('saying the work is done does not finish it — the harness checks anyway', async () => {
    let wrote = false
    const { maskedSource } = prepareSource()

    const { result } = await run({
      script: [
        // Claims to be finished without having written anything.
        says('I have translated the document.'),
        // Only after being told otherwise does it do the work.
        () => {
          wrote = true
          return calls('write', {
            path: 'translation.mdx',
            content: goodTranslation(maskedSource),
          })
        },
        says('Now it is done.'),
      ],
    })

    expect(wrote).toBe(true)
    expect(result.repairRounds).toBe(1)
    expect(result.document).toContain('# 安装')
    expect(result.findings).toEqual([])
  })

  test('a dropped placeholder comes back as a finding, and can be repaired', async () => {
    const { maskedSource } = prepareSource()
    const damaged = goodTranslation(maskedSource).replace(
      /__DOOM_TR_LINK_0__/,
      '../global/installation.mdx',
    )

    const { result } = await run({
      script: [
        calls('write', { path: 'translation.mdx', content: damaged }),
        says('Done.'),
        calls('write', {
          path: 'translation.mdx',
          content: goodTranslation(maskedSource),
        }),
        says('Fixed.'),
      ],
    })

    expect(result.repairRounds).toBe(1)
    expect(result.document).toContain('../global/install.mdx')
    expect(result.findings).toEqual([])
  })

  test('running out of repair rounds fails the document instead of shipping it', async () => {
    const { maskedSource } = prepareSource()
    const damaged = goodTranslation(maskedSource).replace(
      /__DOOM_TR_ICODE_0__/,
      'kubectl apply',
    )

    const { result } = await run({
      script: [calls('write', { path: 'translation.mdx', content: damaged })],
      fallback: () => says('I believe it is correct.'),
      maxRepairRounds: 2,
    })

    expect(result.repairRounds).toBe(2)
    expect(result.document).toBeUndefined()
    expect(result.findings.length).toBeGreaterThan(0)
    expect(result.findings[0].rule).toBe('doom-translate:missing-placeholder')
  })

  test('findings from the rules also keep the agent going, and also fail it in the end', async () => {
    const { maskedSource } = prepareSource()
    const { result } = await run({
      script: [
        calls('write', {
          path: 'translation.mdx',
          content: goodTranslation(maskedSource),
        }),
      ],
      fallback: () => says('Still fine by me.'),
      checker: checkerReturning(() => [
        {
          rule: 'doom-lint:translation-component-multiset',
          reason: 'the translation lost a `<Term>`',
        },
      ]),
      maxRepairRounds: 1,
    })

    expect(result.repairRounds).toBe(1)
    expect(result.document).toBeUndefined()
    expect(result.findings).toEqual([
      {
        rule: 'doom-lint:translation-component-multiset',
        reason: 'the translation lost a `<Term>`',
      },
    ])
  })

  test('a model that never stops calling tools is cut off by the turn cap, and fails', async () => {
    const { result } = await run({
      script: [],
      fallback: () => calls('read', { path: 'source.mdx' }),
      maxTurns: 4,
    })

    expect(result.turns).toBe(4)
    expect(result.document).toBeUndefined()
    expect(result.findings.length).toBeGreaterThan(0)
  })

  test('the check tool reports problems without handing back what masking removed', async () => {
    const { maskedSource } = prepareSource()
    const seenByRules: string[] = []

    const { everythingSeen } = await run({
      script: [
        calls('write', {
          path: 'translation.mdx',
          content: goodTranslation(maskedSource),
        }),
        calls('check', {}),
        says('Done.'),
      ],
      checker: checkerReturning((content) => {
        seenByRules.push(content)
        return [{ rule: 'doom-lint:example', reason: 'something is off' }]
      }),
      maxRepairRounds: 1,
    })

    // The rules see the restored document — they have to, that is what is
    // being checked.
    expect(
      seenByRules.some((content) => content.includes('../global/install.mdx')),
    ).toBe(true)

    // The model never does. It was told what was wrong and nothing else: the
    // link target went into the check and did not come back out.
    expect(everythingSeen()).toContain('something is off')
    expect(everythingSeen()).not.toContain('global/install.mdx')
  })

  test('a failure from the model is raised, not translated around', async () => {
    await expect(
      run({
        script: [errors('gateway said no')],
        fallback: () => errors('gateway said no'),
      }),
    ).rejects.toThrow(/gateway said no/)
  })

  test('the scratch directory is removed whether the run passes or fails', async () => {
    const scratchDir = path.join(workspace, 'scratch')
    const before = await fs
      .readdir(scratchDir)
      .then((entries) => entries.length)
      .catch(() => 0)
    const { maskedSource } = prepareSource()
    await run({
      script: [
        calls('write', {
          path: 'translation.mdx',
          content: goodTranslation(maskedSource),
        }),
        says('Done.'),
      ],
    })
    const after = await fs
      .readdir(scratchDir)
      .then((entries) => entries.length)
      .catch(() => 0)
    expect(after).toBe(before)
  })
})
