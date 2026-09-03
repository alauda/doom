import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import type { AssistantMessage, Models } from '@earendil-works/pi-ai'
import { createAssistantMessageEventStream } from '@earendil-works/pi-ai'
import { afterAll, beforeAll, describe, expect, test } from '@rstest/core'

import type { TranslationFinding } from '#cli/translate-checker.ts'
import { gatewayModel } from '#cli/translate-models.ts'
import {
  REPAIR_TOOL_NAMES,
  createRepairAgent,
} from '#cli/translate-repair-agent.ts'
import type { Segment } from '#cli/translate-segment.ts'

/**
 * The repair agent's blast radius, asserted rather than described.
 *
 * This is the one place in the pipeline where a model is left to work on its
 * own, and the claim being made about it is narrow and mechanical: nothing it
 * can call takes a replacement for the file it is working on. The design this
 * replaced made the same claim in a prompt — "prefer `edit` over rewriting" —
 * while handing the model `write`, and the incident that followed was a whole
 * document rewritten in one call.
 *
 * So the test is not that it behaves well. It is that the tool that made
 * misbehaving free is not there. It is not that a rewrite is unreachable:
 * `edit` would accept one whose `oldText` quoted the entire file, which is a
 * price rather than a wall. What is asserted here is the tool face.
 */

let workspace: string

beforeAll(async () => {
  workspace = await fs.mkdtemp(path.join(os.tmpdir(), 'doom-repair-'))
})

afterAll(async () => {
  await fs.rm(workspace, { recursive: true, force: true })
})

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

let counter = 0
const calls = (name: string, args: Record<string, unknown>) =>
  message(
    [{ type: 'toolCall', id: `call-${++counter}`, name, arguments: args }],
    'toolUse',
  )

const scriptedModels = (
  script:
    | Array<AssistantMessage>
    | ((context: AgentContext) => AssistantMessage),
) => {
  const offered: string[][] = []
  const contexts: AgentContext[] = []
  const models = {
    streamSimple: (_model: unknown, context: AgentContext) => {
      offered.push((context.tools ?? []).map((tool) => tool.name))
      contexts.push(context)
      const produced =
        (typeof script === 'function' ? script(context) : script.shift()) ??
        says('I am done.')
      const stream = createAssistantMessageEventStream()
      stream.push({ type: 'start', partial: produced })
      stream.push({
        type: 'done',
        reason: produced.stopReason === 'toolUse' ? 'toolUse' : 'stop',
        message: produced,
      })
      return stream
    },
  } as unknown as Models

  return { models, offered: () => offered, contexts: () => contexts }
}

/** As much of pi's context as these tests look at. */
interface AgentContext {
  tools?: Array<{ name: string }>
  systemPrompt?: string
  messages?: unknown[]
}

const SEGMENT: Segment = {
  index: 0,
  address: { kind: 'blocks', container: [], start: 0, end: 1 },
  text: 'Run `__DOOM_TR_ICODE_0__` and read __DOOM_TR_LINK_0__.\n',
  expected: new Map([
    ['__doom_tr_icode_0__', 1],
    ['__doom_tr_link_0__', 1],
  ]),
  sha: '0123456789ab',
  label: { line: 1, heading: 'Installing' },
}

const DRAFT = '运行 `__DOOM_TR_ICODE_0__`，并阅读 __DOOM_TR_LINK_0__。\n'

const run = async ({
  script,
  check = () => Promise.resolve([]),
}: {
  script: AssistantMessage[] | ((context: AgentContext) => AssistantMessage)
  check?: (translation: string) => Promise<TranslationFinding[]>
}) => {
  const { models, offered, contexts } = scriptedModels(script)
  const repairer = createRepairAgent({
    models,
    model: gatewayModel({ id: 'test', baseUrl: 'http://localhost:1/v1' }),
    scratchDir: path.join(workspace, 'scratch'),
    extension: '.mdx',
    limit: (job) => job(),
    maxModelRetries: 0,
    modelRetryDelayMs: 1,
  })
  const repaired = await repairer.repair({
    segment: SEGMENT,
    draft: DRAFT,
    history: [],
    check,
  })
  return { repaired, offered, contexts }
}

describe('the repair agent', () => {
  test('is given read, edit and check — and nothing that replaces a file', async () => {
    const { offered } = await run({ script: [says('Nothing to do.')] })

    const tools = offered()[0]
    expect(tools).toBeDefined()
    expect([...tools].sort()).toEqual([...REPAIR_TOOL_NAMES].sort())
    // Stated separately from the equality above, because this is the claim: the
    // tools that can replace a file whole are the ones that must not be here.
    expect(tools).not.toContain('write')
    expect(tools).not.toContain('append')
  })

  test('cannot replace the file even when it tries', async () => {
    const { repaired } = await run({
      script: [
        calls('write', {
          path: 'translation.mdx',
          content: '完全重写，占位符全部丢失。\n',
        }),
        says('Done.'),
      ],
    })

    // The rewrite never happened: there is no tool that does it.
    expect(repaired).toBe(DRAFT)
    expect(repaired).toContain('__DOOM_TR_ICODE_0__')
    expect(repaired).toContain('__DOOM_TR_LINK_0__')
  })

  test('an edit it does make is kept', async () => {
    const { repaired } = await run({
      script: [
        calls('edit', {
          path: 'translation.mdx',
          edits: [{ oldText: '并阅读', newText: '然后阅读' }],
        }),
        says('Fixed.'),
      ],
    })

    expect(repaired).toContain('然后阅读')
    // And the placeholders it was not asked about are untouched.
    expect(repaired).toContain('__DOOM_TR_ICODE_0__')
    expect(repaired).toContain('__DOOM_TR_LINK_0__')
  })

  test('it is not finished while the check still reports something', async () => {
    let asked = 0
    await run({
      script: [says('Looks fine to me.'), says('Still fine.')],
      check: () => {
        asked++
        return Promise.resolve(
          asked < 3
            ? [{ rule: 'doom-translate:missing-placeholder', reason: 'nope' }]
            : [],
        )
      },
    })

    // Saying so does not end it: the harness checks again when it stops.
    expect(asked).toBeGreaterThan(1)
  })

  test('the files its prompt names are files it can actually read', async () => {
    // The prompt is the agent's whole map of its working directory, so a name
    // in it that is not on disk costs a turn and gets `not_found` with no
    // explanation. Asserted by reading them rather than by comparing strings:
    // the point is that the name resolves, not that two constants match.
    let turn = 0
    const named: string[] = []
    const { contexts } = await run({
      script: (context) => {
        if (turn++ > 0) {
          return says('Done.')
        }
        const directory = /## Your working directory([\s\S]*?)\n## /u.exec(
          context.systemPrompt ?? '',
        )?.[1]
        named.push(
          ...[...(directory ?? '').matchAll(/`([\w.-]+\.mdx)`/gu)].map(
            (match) => match[1],
          ),
        )
        return calls('read', { path: named[0] })
      },
    })

    expect(named).toEqual(['source.mdx', 'translation.mdx'])
    // And the read of the first one came back with the segment, not an error.
    const afterRead = JSON.stringify(contexts().at(-1)?.messages ?? [])
    expect(afterRead).not.toContain('not_found')
    expect(afterRead).toContain('__DOOM_TR_ICODE_0__')
  })

  test('the scratch directory is removed either way', async () => {
    const scratchDir = path.join(workspace, 'scratch')
    await run({ script: [says('Done.')] })
    const entries = await fs
      .readdir(scratchDir)
      .then((list) => list.length)
      .catch(() => 0)
    expect(entries).toBe(0)
  })
})
