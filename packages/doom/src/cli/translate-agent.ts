import path from 'node:path'

import type {
  AgentEventSink,
  AgentMessage,
  AgentTool,
  AgentToolResult,
  ExecutionToolContext,
  AgentHarnessTool,
} from '@earendil-works/pi-agent-core'
import type {
  Message,
  Model,
  Models,
  TSchema,
  ThinkingLevel,
  ToolResultMessage,
} from '@earendil-works/pi-ai'

import { Language } from '../shared/index.ts'

import {
  blockingFindings,
  type TranslationChecker,
  type TranslationFinding,
} from './translate-checker.ts'
import type { Judge } from './translate-judge.ts'
import {
  MaskIntegrityError,
  type MaskEntry,
  type MaskProcessor,
  restoreMaskedContent,
} from './translate-mask.ts'
import { createScratch, loadPi } from './translate-scratch.ts'
import type { TermPair } from './translate-terms.ts'

/**
 * Translating one document, as a loop that ends when the document passes its
 * checks.
 *
 * The loop is pi's. What is ours is its boundary: the tools the agent has, the
 * directory it can reach, what is released from its context, and — the part
 * everything else rests on — the condition under which it is allowed to stop.
 *
 * `getFollowUpMessages` is pi's "the agent would finish here" hook: whatever it
 * returns is appended to the context and the agent takes another turn. Putting
 * the harness's own check there means the agent cannot finish while the
 * document still fails it. Not "we check afterwards and start it again if it
 * failed" — the check *is* the exit condition, and the agent has no name for
 * it, no way to call it, and no way around it.
 *
 * The turn cap is enforced separately, in `shouldStopAfterTurn`, which pi
 * consults *before* polling for follow-ups. So a run that will not converge
 * ends, and ends failed: there is no third exit where a document is written out
 * anyway.
 */

export interface TranslateAgentOptions {
  /** The masked source, exactly as the model will see it. */
  maskedSource: string
  /** The mask table, for restoring and for counting what came back. */
  maskEntries: readonly MaskEntry[]
  /** Parser/stringifier matching the document's flavour. */
  processor: MaskProcessor
  /** Merges the restored translation with the frontmatter it will be written with. */
  compose: (restored: string) => string
  /** Absolute path the translation will be written to. Rules read the language and find the source from it. */
  targetPath: string
  /** Path of the source, relative to the docs root — for logs only. */
  sourceLabel: string
  source: Language
  target: Language
  /** The translation rules, rendered — the same prompt body the single-shot translator used. */
  translationRules: string
  /** Terms the source matched, used to keep one document's wording consistent across segments. */
  terms?: readonly TermPair[]
  checker: TranslationChecker
  /** The semantic check. Absent only in tests that are about control flow. */
  judge?: Judge
  models: Models
  model: Model<'openai-completions'>
  reasoningEffort: ThinkingLevel
  /** Directory scratch directories are created under. */
  scratchDir: string
  /** How many times findings may be fed back before the document is failed. */
  maxRepairRounds: number
  /** Runaway guard: total assistant turns, tool calls included. */
  maxTurns: number
  /** Applied to every model call, so an agent's extra turns count against the same budget. */
  limit: <T>(run: () => Promise<T>) => Promise<T>
  /** How many times a refused request is retried before the document fails. */
  maxModelRetries?: number
  /** First backoff after a refused request, doubled per attempt. */
  modelRetryDelayMs?: number
  onProgress?: (message: string) => void
}

export interface TranslateAgentResult {
  /** The finished document, when it passed. */
  document?: string
  /**
   * What was still wrong when the run ended.
   *
   * `document` is set exactly when none of these block. A passing document can
   * still carry advisory findings — the judge's readability notes — which are
   * worth printing and are not worth failing a build over.
   */
  findings: TranslationFinding[]
  turns: number
  repairRounds: number
  modelCalls: number
}

/** How many findings to put in front of the model at once. */
const MAX_REPORTED_FINDINGS = 25

/** Retries for a refused request. Transient limits are normal at corpus scale. */
const MODEL_MAX_RETRIES = 5
const MODEL_RETRY_DELAY_MS = 3_000

const SCRATCH_SOURCE_NAME = 'source'
const SCRATCH_TRANSLATION_NAME = 'translation'

const maskFindingToTranslationFinding = (
  finding: MaskIntegrityError['findings'][number],
): TranslationFinding => ({
  rule: `doom-translate:${finding.code}`,
  reason:
    finding.code === 'missing-placeholder'
      ? `\`${finding.placeholder}\` is not in the translation. It stands for a ${finding.kind}${finding.detail ? ` (${finding.detail})` : ''}. Either that part has not been translated yet, or it was dropped.`
      : finding.code === 'duplicate-placeholder'
        ? `\`${finding.placeholder}\` appears ${finding.actual} times but must appear ${finding.expected}.`
        : finding.code === 'unregistered-placeholder'
          ? `\`${finding.placeholder}\` was never issued — do not invent placeholders.`
          : finding.code === 'unrestored-placeholder'
            ? `\`${finding.placeholder}\` ended up somewhere it does not belong${finding.detail ? ` — ${finding.detail}` : ''}.`
            : (finding.detail ??
              `the placeholder round trip failed (${finding.code})`),
})

const renderFindings = (findings: readonly TranslationFinding[]) => {
  const shown = findings.slice(0, MAX_REPORTED_FINDINGS)
  const lines = shown.map(
    (finding) =>
      `- ${finding.rule}${finding.line ? ` (line ${finding.line})` : ''}: ${finding.reason}`,
  )
  if (findings.length > shown.length) {
    lines.push(
      `- …and ${findings.length - shown.length} more of the same kind. Fix these first and check again.`,
    )
  }
  return lines.join('\n')
}

/**
 * Everything the harness knows about the draft on disk right now.
 *
 * Note that "not written yet" and "written wrong" arrive here as the same kind
 * of thing — a missing placeholder is a missing placeholder whether the agent
 * dropped it or has not reached it. That is deliberate: a translation produced
 * in segments is incomplete for most of its life, and giving completeness its
 * own separate judgement means two mechanisms that have to agree.
 */
interface DraftReport {
  findings: TranslationFinding[]
  document?: string
}

export const translateWithAgent = async (
  options: TranslateAgentOptions,
): Promise<TranslateAgentResult> => {
  const {
    maskedSource,
    maskEntries,
    processor,
    compose,
    targetPath,
    sourceLabel,
    source,
    target,
    translationRules,
    terms = [],
    checker,
    judge,
    models,
    model,
    reasoningEffort,
    scratchDir,
    maxRepairRounds,
    maxTurns,
    limit,
    maxModelRetries = MODEL_MAX_RETRIES,
    modelRetryDelayMs = MODEL_RETRY_DELAY_MS,
    onProgress,
  } = options

  const [pi, { Type }] = await Promise.all([
    loadPi(),
    import('@earendil-works/pi-ai'),
  ])
  const {
    createReadTool,
    createWriteTool,
    createEditTool,
    runAgentLoop,
    estimateContextTokens,
    shouldCompact,
    DEFAULT_COMPACTION_SETTINGS,
  } = pi.core

  const extension = path.extname(targetPath) || '.mdx'
  const scratch = await createScratch({
    parentDir: scratchDir,
    label: path.basename(targetPath, extension),
    maskedSource,
    extension,
  })

  const sourceName = `${SCRATCH_SOURCE_NAME}${extension}`
  const translationName = `${SCRATCH_TRANSLATION_NAME}${extension}`

  try {
    const inspectDraft = async (): Promise<DraftReport> => {
      const draft = await scratch.readTranslation()
      if (draft.trim() === '') {
        return {
          findings: [
            {
              rule: 'doom-translate:nothing-written',
              reason: `\`${translationName}\` is still empty. Write the translation there.`,
            },
          ],
        }
      }

      let restored: string
      try {
        restored = restoreMaskedContent(draft, maskEntries, processor)
      } catch (error) {
        if (error instanceof MaskIntegrityError) {
          return {
            findings: error.findings.map(maskFindingToTranslationFinding),
          }
        }
        throw error
      }

      const document = compose(restored)
      const findings = await checker.check(targetPath, document)
      if (findings.length > 0) {
        // The judge is the expensive check and the only one that reads. Asking
        // it about a draft the deterministic rules have already faulted spends
        // a reading on a document that is going back for repair regardless —
        // and asks it to judge the meaning of a half-written page.
        return { findings }
      }

      if (judge) {
        findings.push(
          ...(await judge.review({
            // The masked pair, not the restored one. Judge findings are fed
            // back into the translator's context, and a finding quoting an
            // unmasked link target would put that target back within the
            // model's reach. Placeholders are stable on both sides, so nothing
            // about judging prose is lost.
            sourceText: maskedSource,
            translationText: draft,
            sourceLanguage: Language[source],
            targetLanguage: Language[target],
            terms,
          })),
        )
      }

      return blockingFindings(findings).length > 0
        ? { findings }
        : { findings, document }
    }

    // ---------------------------------------------------------------- tools

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

    /**
     * Appending.
     *
     * pi's `write` replaces a file, and using `edit` to add to the end means
     * quoting the end as an anchor. Neither suits a translation produced a
     * section at a time, and `FileSystem` already has `appendFile`.
     */
    const appendTool: AgentTool<TSchema, undefined> = {
      label: 'Append',
      name: 'append',
      description:
        'Add text to the end of a file, keeping what is already there. Use this for each section of the translation after the first.',
      parameters: Type.Object({
        path: Type.String({ description: 'File to append to.' }),
        text: Type.String({ description: 'Text to add at the end.' }),
      }),
      execute: async (_toolCallId, params) => {
        const { path: target, text } = params as { path: string; text: string }
        const appended = await scratch.env.appendFile(target, text)
        if (!appended.ok) {
          throw new Error(
            `Could not append to ${target}: ${appended.error.message}`,
          )
        }
        const info = await scratch.env.fileInfo(target)
        return textResult(
          `Appended ${text.length} characters.${info.ok ? ` \`${path.basename(target)}\` is now ${info.value.size} bytes.` : ''}`,
          undefined,
        )
      },
    }

    /**
     * Reading by byte range.
     *
     * pi's `read` pages by line, and when one line is longer than its byte
     * limit it tells the model to fall back to `sed` through a shell. There is
     * no shell here, on purpose — which would leave that content unreachable,
     * and a document unfinishable for a reason no repair round could clear. So
     * the escape hatch is a tool instead of dead text; `afterToolCall` below
     * rewrites the message that points at it.
     */
    const readBytesTool: AgentTool<TSchema, undefined> = {
      label: 'Read bytes',
      name: 'read_bytes',
      description:
        'Read a byte range of a file. Use this when `read` reports a line too long to show.',
      parameters: Type.Object({
        path: Type.String({ description: 'File to read.' }),
        offset: Type.Number({ description: 'First byte to read, from 0.' }),
        limit: Type.Number({ description: 'How many bytes to read.' }),
      }),
      execute: async (_toolCallId, params) => {
        const {
          path: target,
          offset,
          limit: byteLimit,
        } = params as { path: string; offset: number; limit: number }
        const read = await scratch.env.readBinaryFile(target)
        if (!read.ok) {
          throw new Error(`Could not read ${target}: ${read.error.message}`)
        }
        const slice = Buffer.from(read.value).subarray(
          Math.max(0, offset),
          Math.max(0, offset) + Math.max(0, byteLimit),
        )
        const total = read.value.byteLength
        const end = Math.min(
          total,
          Math.max(0, offset) + Math.max(0, byteLimit),
        )
        return textResult(
          `${slice.toString('utf8')}\n\n[bytes ${offset}–${end} of ${total}]`,
          undefined,
        )
      },
    }

    let checkCalls = 0

    /**
     * The agent's view of its own work.
     *
     * It returns findings and nothing else — never the restored document. The
     * restored text holds the real link targets and identifiers, and handing
     * them back would put in the model's context exactly what masking took out
     * of it.
     */
    const checkTool: AgentTool<TSchema, undefined> = {
      label: 'Check',
      name: 'check',
      description:
        'Compare your translation with the source and list what is wrong. Reports nothing when the translation is complete and correct.',
      parameters: Type.Object({}),
      execute: async () => {
        checkCalls++
        const report = await inspectDraft()
        if (report.findings.length === 0) {
          return textResult(
            'No problems found. The translation is complete and matches the source.',
            undefined,
          )
        }
        return textResult(
          `${report.findings.length} problem(s):\n${renderFindings(report.findings)}`,
          undefined,
        )
      },
    }

    /**
     * pi's `read`, with its one untrue sentence corrected.
     *
     * When a line is longer than its byte limit, the tool tells the model to
     * fall back to `sed` through a shell. There is no shell here, on purpose,
     * so that advice is dead text — and a document containing such a line would
     * be unfinishable for a reason no repair round could clear. Rewritten to
     * point at `read_bytes` instead, next to the tool it is about rather than
     * in a hook somewhere else.
     */
    const baseReadTool = bind(createReadTool())
    const readTool: typeof baseReadTool = {
      ...baseReadTool,
      execute: async (toolCallId, params, signal, onUpdate) => {
        const result = await baseReadTool.execute(
          toolCallId,
          params,
          signal,
          onUpdate,
        )
        return {
          ...result,
          content: result.content.map((part) =>
            part.type === 'text' && part.text.includes('Use bash:')
              ? {
                  ...part,
                  text: part.text.replace(
                    /Use bash: sed -n '\d+p' (\S+) \| head -c \d+/,
                    'Use read_bytes on $1 to read it a byte range at a time',
                  ),
                }
              : part,
          ),
        }
      },
    }

    const tools: Array<AgentTool<TSchema, unknown>> = [
      readTool,
      bind(createWriteTool()),
      bind(createEditTool()),
      appendTool,
      readBytesTool,
      checkTool,
    ]

    // -------------------------------------------------------------- prompts

    const systemPrompt = [
      `You are translating one document, on your own, until it is correct.`,
      '',
      `## Your working directory`,
      '',
      `It is everything you can reach. There is no other file, and no shell.`,
      '',
      `- \`${sourceName}\` — the prepared source document.`,
      `- \`${translationName}\` — where your translation goes. It starts empty.`,
      '',
      `## How to work`,
      '',
      `1. \`read\` \`${sourceName}\`. Long documents come back a page at a time; keep reading with \`offset\` until you have seen all of it, and translate it section by section rather than holding it all at once.`,
      `2. \`write\` the first part of the translation to \`${translationName}\`, then \`append\` each following part. \`write\` replaces the file, so use it once.`,
      `3. When the whole document has been translated, call \`check\`. It compares your translation against the source and lists what is wrong.`,
      `4. Repair with \`edit\` and \`check\` again. Prefer \`edit\` over rewriting: a targeted change is one fewer chance to damage what was already right.`,
      '',
      `Anything you released from your context is still on disk — \`read\` it again rather than working from memory.`,
      '',
      `## When you are finished`,
      '',
      `You are finished when \`check\` reports nothing. Saying so yourself does not end the task: the same check runs again when you stop, and anything it finds comes back to you as another turn.`,
      '',
      `## Placeholders`,
      '',
      `Tokens shaped like \`__DOOM_TR_LINK_3__\` stand for content you must not author — link targets, code, identifiers, component attribute values. Reproduce each one verbatim and exactly once, in the position it appears. Never translate, reformat, split, renumber, remove, duplicate or invent one. The text around a placeholder is translated as usual.`,
      '',
      `## Translation rules`,
      '',
      translationRules,
    ].join('\n')

    const initialPrompt: Message = {
      role: 'user',
      content: `Translate \`${sourceName}\` and write the translation to \`${translationName}\`. The source is ${maskedSource.length} characters long and contains ${maskEntries.length} placeholder(s), every one of which must appear in your translation.`,
      timestamp: Date.now(),
    }

    // ------------------------------------------------------- context release

    /**
     * Releasing context, deterministically.
     *
     * What is dropped is chosen by a rule, not by a model: the bodies of
     * `read`/`read_bytes` results that are no longer the recent ones. pi ships
     * a compaction that summarises the conversation with an LLM, and that is
     * the one thing this cannot use — the context holds source and translation
     * text that has to survive byte for byte, and summarising it hands the
     * bytes to the process they are being protected from. Only pi's
     * *measurement* is borrowed, to decide when to release.
     *
     * Releasing is safe because nothing is lost: every released page is still
     * in the scratch directory, and the agent is told to read it again.
     */
    const KEEP_RECENT_MESSAGES = 6
    const RELEASABLE_TOOLS = new Set(['read', 'read_bytes'])

    const wordingAlreadyUsed = (produced: string) =>
      terms.filter((term) => produced.includes(term.target))

    const transformContext = async (messages: AgentMessage[]) => {
      const estimate = estimateContextTokens(messages)
      if (
        !shouldCompact(
          estimate.tokens,
          model.contextWindow,
          DEFAULT_COMPACTION_SETTINGS,
        )
      ) {
        return messages
      }

      const cutoff = messages.length - KEEP_RECENT_MESSAGES
      let released = 0
      const trimmed = messages.map((message, index) => {
        if (index >= cutoff) {
          return message
        }
        if (
          !('role' in message) ||
          message.role !== 'toolResult' ||
          !RELEASABLE_TOOLS.has(
            (message as ToolResultMessage<unknown>).toolName,
          )
        ) {
          return message
        }
        released++
        return {
          ...(message as ToolResultMessage<unknown>),
          content: [
            {
              type: 'text' as const,
              text: `[released from context to make room. Read \`${sourceName}\` again if you need this part.]`,
            },
          ],
        }
      })

      if (released === 0) {
        return messages
      }

      // Carried forward as a fact, not a preference: these are the words this
      // document has already used, and the released pages are where the agent
      // would otherwise have seen them.
      const produced = await scratch.readTranslation()
      const used = wordingAlreadyUsed(produced)
      if (used.length === 0) {
        return trimmed
      }
      return [
        ...trimmed,
        {
          role: 'user' as const,
          content: `For consistency with what you have already written in this document: ${used
            .map((term) => `"${term.source}" → "${term.target}"`)
            .join(', ')}.`,
          timestamp: Date.now(),
        },
      ]
    }

    // ------------------------------------------------------------- the loop

    let turns = 0
    let repairRounds = 0
    let modelCalls = 0
    const failure: { message?: string } = {}
    // Cleared through a call, not an assignment: an assignment here narrows the
    // property to `undefined` for the rest of the block, and the sink that sets
    // it is a callback the compiler cannot follow.
    const clearFailure = () => {
      failure.message = undefined
    }

    const streamFn: Parameters<typeof runAgentLoop>[5] = (
      streamModel,
      context,
      streamOptions,
    ) => {
      modelCalls++
      return limit(() =>
        Promise.resolve(
          models.streamSimple(streamModel, context, streamOptions),
        ),
      )
    }

    const config: Parameters<typeof runAgentLoop>[2] = {
      model,
      reasoning: reasoningEffort,
      // The gateway refuses requests when a user is over its per-minute limit,
      // and a corpus run is thousands of calls. Measured: a translation that
      // met a 429 ended the whole document, because nothing retried it. The
      // rate limiter keeps us under the limit in the normal case; this is what
      // happens when something else is also using the budget.
      maxRetries: MODEL_MAX_RETRIES,
      convertToLlm: (messages) => messages as Message[],
      transformContext,

      // The runaway guard. pi checks this *before* it polls for follow-ups, so
      // it wins over the exit condition below: a loop that will not converge
      // ends here, and the caller finds out it ended failed.
      shouldStopAfterTurn: () => ++turns >= maxTurns,

      // The exit condition. pi calls this when the agent has run out of tool
      // calls and would stop; anything returned goes into the context and the
      // agent takes another turn. So the agent finishes exactly when the
      // harness's own check finds nothing — it never sees this call and cannot
      // route around it.
      getFollowUpMessages: async () => {
        const report = await inspectDraft()
        // Advisory findings — the judge's readability notes — travel with the
        // feedback when there is feedback, and never cause a round of their
        // own. Meeting the standard is the bar; "cannot be improved" is not a
        // bar a loop can reach.
        const blocking = blockingFindings(report.findings)
        if (blocking.length === 0) {
          return []
        }
        if (repairRounds >= maxRepairRounds) {
          return []
        }
        repairRounds++
        onProgress?.(
          `${sourceLabel}: ${blocking.length} problem(s) after round ${repairRounds}, sending them back`,
        )
        return [
          {
            role: 'user',
            content: `The translation is not finished. Checking it against the source reports ${report.findings.length} problem(s):\n\n${renderFindings(report.findings)}\n\nFix them in \`${translationName}\`, then call \`check\` again.`,
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

    /**
     * A gateway that refuses is not a translation that failed.
     *
     * Measured on the real gateway while translating three documents: "429
     * user requests-per-minute limit exceeded" and "Upstream service
     * temporarily unavailable", both of which pi surfaces as a stream error
     * that ends the run. A corpus is thousands of calls; meeting one of those
     * is routine, and failing the document over it would fail the wrong thing
     * — loudly, and in a way that makes the gate look unreliable rather than
     * the gateway.
     *
     * Retrying is cheap here because the draft is on disk. The agent starts
     * with a fresh context and is told to carry on from what it has already
     * written, so a refusal costs the turns since the last write rather than
     * the whole document.
     */
    for (let attempt = 0; ; attempt++) {
      clearFailure()
      const prompt: Message =
        attempt === 0
          ? initialPrompt
          : {
              role: 'user',
              content: `Continue translating \`${sourceName}\` into \`${translationName}\`. Some of it may already be written: \`read\` \`${translationName}\` first, then call \`check\` to see what is still missing, and carry on from there.`,
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
        throw new Error(
          `The translation model failed while translating ${sourceLabel}: ${failure.message}`,
        )
      }
      onProgress?.(
        `${sourceLabel}: the gateway refused (${failure.message}) — retrying from what is already written`,
      )
      await new Promise((resolve) =>
        globalThis.setTimeout(resolve, modelRetryDelayMs * 2 ** attempt),
      )
    }

    // The loop can end two ways — the check passed, or the turn cap fired
    // before it did. Only one of them means the document is good, so it is
    // decided here rather than inferred from how the loop exited.
    const final = await inspectDraft()
    void checkCalls
    return {
      document: final.document,
      findings: final.findings,
      turns,
      repairRounds,
      modelCalls,
    }
  } finally {
    await scratch.dispose()
  }
}
