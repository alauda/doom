import type {
  AgentEventSink,
  AgentHarnessTool,
  AgentTool,
  AgentToolResult,
  ExecutionToolContext,
} from '@earendil-works/pi-agent-core'
import type {
  Message,
  Model,
  Models,
  TSchema,
  ThinkingLevel,
} from '@earendil-works/pi-ai'

import type { TranslationFinding } from './translate-checker.ts'
import { blockingFindings } from './translate-checker.ts'
import type { SegmentRepairer } from './translate-pipeline.ts'
import {
  SCRATCH_SOURCE,
  SCRATCH_TRANSLATION,
  createScratch,
  loadPi,
} from './translate-scratch.ts'

/**
 * The last resort for one segment, and the only place a model is left to work
 * on its own.
 *
 * Autonomy is deployed where it wins. Translating a segment, counting
 * placeholders, cutting a document and putting it back together are jobs with
 * one right answer, and giving them to an agent only adds variance — so they
 * are code. Working out why a particular paragraph keeps failing a particular
 * check, and making a surgical change to fix it, is open-ended, and that is
 * what an agent is for. This is that, and nothing else.
 *
 * What makes it safe is not the prompt. **The tools are `read`, `edit` and
 * `check`.** There is no `write` and no `append`, so "do not rewrite the whole
 * thing" is not advice it might ignore under pressure: nothing here takes a
 * replacement for the file. Be exact about how far that goes — `edit` asks only
 * that its `oldText` occur once, so quoting the entire file back and handing
 * over a new one is still a rewrite the tool would accept. What stands in the
 * way is the price: every byte of the segment has to be reproduced exactly to
 * match, and a model that could do that reliably would not have needed
 * repairing. The guarantee is economic, not syntactic — but it is the
 * difference between a rewrite being the cheapest thing to reach for and being
 * the most expensive. That distinction is the entire lesson of the incident
 * this design came from: the previous agent was *told* to prefer targeted
 * edits, had `write` in its hands — one call, no quoting, no cost — and
 * replaced a translation that was one problem from finished with one that had a
 * thousand.
 *
 * And it works inside a segment. Even a repair that goes as badly as possible
 * can only damage a few kilobytes that were already failing, it has to pass the
 * same acceptance check as any other attempt, and the segment's best accepted
 * version is untouched while it works.
 */

/** Turns before it is stopped. A segment's size has an upper bound, so a fixed number is meaningful. */
export const DEFAULT_REPAIR_MAX_TURNS = 40

/** Reasoning for the repair path. Rare and hard, which is what reasoning is for. */
export const DEFAULT_REPAIR_REASONING_EFFORT: ThinkingLevel = 'high'

const MODEL_MAX_RETRIES = 5
const MODEL_RETRY_DELAY_MS = 3_000

export interface CreateRepairAgentOptions {
  models: Models
  model: Model<'openai-completions'>
  reasoningEffort?: ThinkingLevel
  /** Directory scratch directories are created under. */
  scratchDir: string
  /** `.mdx` or `.md`, so the agent sees the flavour it is editing. */
  extension: string
  maxTurns?: number
  /** Applied to every model call, so repairs count against the same budget. */
  limit: <T>(run: () => Promise<T>) => Promise<T>
  maxModelRetries?: number
  modelRetryDelayMs?: number
  onProgress?: (message: string) => void
}

const renderFindings = (findings: readonly TranslationFinding[]) =>
  findings
    .map(
      (finding) =>
        `- ${finding.rule}${finding.line ? ` (line ${finding.line})` : ''}: ${finding.reason}`,
    )
    .join('\n')

export const createRepairAgent = ({
  models,
  model,
  reasoningEffort = DEFAULT_REPAIR_REASONING_EFFORT,
  scratchDir,
  extension,
  maxTurns = DEFAULT_REPAIR_MAX_TURNS,
  limit,
  maxModelRetries = MODEL_MAX_RETRIES,
  modelRetryDelayMs = MODEL_RETRY_DELAY_MS,
  onProgress,
}: CreateRepairAgentOptions): SegmentRepairer => ({
  async repair({ segment, draft, history, check }) {
    const [pi] = await Promise.all([loadPi()])
    const { createReadTool, createEditTool, runAgentLoop } = pi.core

    // Taken from the scratch directory's own names rather than written out
    // again: the prompt tells the agent these files exist, and an agent that
    // reads a name that is not there gets `not_found` and no explanation.
    const sourceName = `${SCRATCH_SOURCE}${extension}`
    const translationName = `${SCRATCH_TRANSLATION}${extension}`

    const scratch = await createScratch({
      parentDir: scratchDir,
      label: `repair-${segment.index}`,
      maskedSource: segment.text,
      extension,
      draft,
    })

    try {
      const toolContext: ExecutionToolContext = { env: scratch.env }
      const bind = <TParameters extends TSchema, TDetails>(
        tool: AgentHarnessTool<ExecutionToolContext, TParameters, TDetails>,
      ): AgentTool<TParameters, TDetails> => ({
        ...tool,
        execute: (toolCallId, params, signal, onUpdate) =>
          tool.execute(toolCallId, params, signal, onUpdate, toolContext),
      })

      const textResult = <T>(text: string, details: T): AgentToolResult<T> => ({
        content: [{ type: 'text', text }],
        details,
      })

      let latest = draft

      /**
       * The agent's view of its own work — the same function that decides
       * whether any other attempt is accepted.
       *
       * It returns findings and nothing else, never the restored text: the
       * restored form holds the real link targets and identifiers, and handing
       * those back would put in the model's context exactly what masking took
       * out of it.
       */
      const checkTool: AgentTool<TSchema, undefined> = {
        label: 'Check',
        name: 'check',
        description:
          'Compare your translation of this segment with its source and list what is wrong. Reports nothing when it is correct.',
        parameters: (await import('@earendil-works/pi-ai')).Type.Object({}),
        execute: async () => {
          latest = await scratch.readTranslation()
          const findings = await check(latest)
          if (blockingFindings(findings).length === 0) {
            return textResult(
              'No problems found. This segment is correct.',
              undefined,
            )
          }
          return textResult(
            `${findings.length} problem(s):\n${renderFindings(findings)}`,
            undefined,
          )
        },
      }

      // `read` and `edit`. Deliberately no `write` and no `append`: the one
      // thing this agent must not be able to do is replace the file, and the
      // way to guarantee that is to not give it the means.
      const tools: Array<AgentTool<TSchema, unknown>> = [
        bind(createReadTool()),
        bind(createEditTool()),
        checkTool,
      ]

      const systemPrompt = [
        'You are fixing the translation of ONE SEGMENT of a documentation page. It is a few kilobytes; you can hold all of it at once.',
        '',
        '## Your working directory',
        '',
        'It is everything you can reach. There is no other file, and no shell.',
        '',
        `- \`${sourceName}\` — the segment's prepared source.`,
        `- \`${translationName}\` — its translation, as it stands. It is close: repeated attempts have already got most of it right.`,
        '',
        '## How to work',
        '',
        `1. \`check\` to see exactly what is wrong.`,
        `2. \`edit\` \`${translationName}\` to fix precisely that, and nothing else.`,
        `3. \`check\` again.`,
        '',
        'You can only change this file by editing parts of it. There is no tool that replaces it, and that is deliberate: most of this translation is already correct, and the failure this design exists to prevent is a rewrite that throws away what was right in order to fix what was not.',
        '',
        '## Placeholders',
        '',
        'Tokens shaped like `__DOOM_TR_LINK_3__` stand for content nobody may author — link targets, code, identifiers. Each one must appear exactly as often as it does in the source. Never translate, renumber, remove, duplicate or invent one.',
        '',
        '## When you are finished',
        '',
        'You are finished when `check` reports nothing. Saying so yourself does not end the task: the same check runs again when you stop.',
      ].join('\n')

      const initialPrompt: Message = {
        role: 'user',
        content: [
          `Fix \`${translationName}\` so that \`check\` reports nothing.`,
          '',
          `This is the segment's source:`,
          '',
          '<<<SOURCE',
          segment.text,
          'SOURCE',
          '',
          `This is the translation as it stands:`,
          '',
          '<<<TRANSLATION',
          draft || '(empty)',
          'TRANSLATION',
          '',
          history.length > 0
            ? `Previous attempts were rejected for these reasons, oldest first:\n\n${history
                .map(
                  (findings, round) =>
                    `Attempt ${round + 1}:\n${renderFindings(findings)}`,
                )
                .join('\n\n')}`
            : '',
        ].join('\n'),
        timestamp: Date.now(),
      }

      let turns = 0
      const failure: { message?: string } = {}
      const clearFailure = () => {
        failure.message = undefined
      }

      const streamFn: Parameters<typeof runAgentLoop>[5] = (
        streamModel,
        context,
        streamOptions,
      ) =>
        limit(() =>
          Promise.resolve(
            models.streamSimple(streamModel, context, streamOptions),
          ),
        )

      const config: Parameters<typeof runAgentLoop>[2] = {
        model,
        reasoning: reasoningEffort,
        // The caller's number, not the default: a caller that asked for no
        // retries — a test, or a run that would rather fail than wait — was
        // still getting five inside pi.
        maxRetries: maxModelRetries,
        convertToLlm: (messages) => messages as Message[],
        shouldStopAfterTurn: () => ++turns >= maxTurns,
        // pi's "the agent would stop here" hook. Returning anything puts it back
        // to work, so the agent finishes exactly when the harness's own check
        // finds nothing — it never sees this call and cannot route around it.
        getFollowUpMessages: async () => {
          latest = await scratch.readTranslation()
          const findings = await check(latest)
          const blocking = blockingFindings(findings)
          if (blocking.length === 0) {
            return []
          }
          return [
            {
              role: 'user',
              content: `Not yet — ${blocking.length} problem(s) remain:\n\n${renderFindings(findings)}\n\nFix them in \`${translationName}\` with \`edit\`, then \`check\` again.`,
              timestamp: Date.now(),
            },
          ]
        },
      }

      const watchForStreamFailure = (event: Parameters<AgentEventSink>[0]) => {
        if (
          event.type === 'turn_end' &&
          'stopReason' in event.message &&
          (event.message.stopReason === 'error' ||
            event.message.stopReason === 'aborted')
        ) {
          failure.message =
            ('errorMessage' in event.message
              ? event.message.errorMessage
              : undefined) ?? event.message.stopReason
        }
      }

      for (let attempt = 0; ; attempt++) {
        clearFailure()
        const prompt: Message =
          attempt === 0
            ? initialPrompt
            : {
                role: 'user',
                content: `Carry on fixing \`${translationName}\`. \`read\` it first to see where you got to, then \`check\`.`,
                timestamp: Date.now(),
              }

        await runAgentLoop(
          [prompt],
          { systemPrompt, messages: [], tools },
          config,
          watchForStreamFailure,
          undefined,
          streamFn,
        )

        if (!failure.message) {
          break
        }
        if (attempt >= maxModelRetries || turns >= maxTurns) {
          // A refusal is not a repair that failed. It costs the segment its
          // escalation, and the document fails with the findings it already
          // had, rather than the run dying on someone else's rate limit.
          onProgress?.(
            `repairing segment ${segment.index + 1} gave up: ${failure.message}`,
          )
          return undefined
        }
        await new Promise((resolve) =>
          globalThis.setTimeout(resolve, modelRetryDelayMs * 2 ** attempt),
        )
      }

      return await scratch.readTranslation()
    } finally {
      await scratch.dispose()
    }
  },
})

/**
 * The only tools a repair agent has.
 *
 * Exported so a test can assert on it. `write` and `append` are absent on
 * purpose, and the reason is worth stating where someone adding a tool will
 * read it: with `write` in its hands, the previous agent replaced a translation
 * that was one finding from finished with one that had a thousand. Nothing
 * about that was against its instructions in spirit; it simply had the means.
 *
 * Adding a tool that takes whole-file content puts those means back. `edit`
 * does not, in any practical sense — a rewrite through it costs an exact
 * byte-for-byte quotation of the file — but that is a matter of price rather
 * than of syntax, so a cheaper route to the same thing would undo it.
 */
export const REPAIR_TOOL_NAMES = ['read', 'edit', 'check'] as const
