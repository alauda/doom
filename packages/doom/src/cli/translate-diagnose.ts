import type { Model, Models, ThinkingLevel } from '@earendil-works/pi-ai'

import type { TranslationFinding } from './translate-checker.ts'
import type { DocumentFailure, SegmentOutcome } from './translate-pipeline.ts'

/**
 * Explaining a failure to the person who has to do something about it.
 *
 * Around forty repositories run `doom translate` unattended, and the only
 * channel any of them has to a human is a red pipeline. Working out what a red
 * one means used to take a specialist an afternoon — the incident behind this
 * design needed two rounds of log-gathering before anyone could say which of
 * two unrelated causes it was.
 *
 * So when a document fails, the evidence that was collected on the way is
 * handed to a model with the reasoning turned up, and what comes back is a
 * paragraph in the build log saying what went wrong and what to try. One call,
 * not an agent: every fact is already in hand, and there is nothing to go and
 * look up.
 *
 * **It is advisory and it is inert.** It does not change the exit code, it is
 * not a finding, nothing branches on it, and when it fails to produce anything
 * the build says exactly that and carries on failing for the reason it already
 * had. A diagnosis that could change a verdict would be a gate made of prose.
 */

export const DEFAULT_DIAGNOSE_REASONING_EFFORT: ThinkingLevel = 'high'

/** How many rejected attempts of one segment to show. The pattern is in the first few. */
const MAX_ATTEMPTS_SHOWN = 4
/** How many segments to describe in full. */
const MAX_SEGMENTS_SHOWN = 12

const SYSTEM_PROMPT = `You are explaining, to a documentation engineer reading a failed build log, why one document could not be translated.

You are given the evidence the pipeline collected: how the document was cut into segments, what happened to each one, and what each rejected attempt was rejected for.

How the pipeline works, so you can read the evidence:
- a document is cut into segments by code, and each segment is translated by a single model call;
- a segment is accepted only when it parses, reproduces every placeholder exactly, keeps its source's headings and components, and passes a semantic review;
- a segment that is accepted is frozen and never touched again;
- a segment that is rejected is asked for again, with the findings attached; after several attempts it goes to a repair agent that can only edit, not rewrite;
- once every segment is accepted they are assembled and the whole page is checked again.
- tokens shaped like \`__DOOM_TR_ICODE_3__\` are placeholders standing in for content kept out of translation — link targets, code, identifiers.

Write at most 200 words, as plain prose, covering:
1. which segment or segments failed and what the failure actually was;
2. whether the findings got better, worse, or stayed the same across attempts — and what that suggests;
3. the most useful next step for a person: something about the source document, something about the configuration, or "this looks like a model or gateway problem, retry".

Be concrete and be honest about uncertainty. Do not invent evidence, do not repeat the findings verbatim as a list, and do not pad. If the evidence does not support a conclusion, say which further evidence would settle it.`

export interface DiagnoseRequest {
  /** The document, as a person would name it. */
  sourceLabel: string
  failure?: DocumentFailure
  outcomes: readonly SegmentOutcome[]
  /** What was still wrong when the run ended. */
  findings: readonly TranslationFinding[]
  assemblyRounds: number
}

export interface Diagnoser {
  /** A paragraph for the build log, or nothing when it could not be produced. */
  diagnose(request: DiagnoseRequest): Promise<string | undefined>
}

export interface CreateDiagnoserOptions {
  models: Models
  model: Model<'openai-completions'>
  reasoningEffort?: ThinkingLevel
  limit: <T>(run: () => Promise<T>) => Promise<T>
}

const describeFinding = (finding: TranslationFinding) =>
  `    - ${finding.rule}${finding.line ? ` (line ${finding.line})` : ''}: ${finding.reason}`

export const buildEvidence = ({
  sourceLabel,
  failure,
  outcomes,
  findings,
  assemblyRounds,
}: DiagnoseRequest) => {
  const lines: string[] = [
    `Document: ${sourceLabel}`,
    `Cut into ${outcomes.length} segment(s). Assembly rounds used: ${assemblyRounds}.`,
    `Failure: ${
      failure?.kind === 'unsplittable-block'
        ? `a single block could not be divided — ${failure.detail}`
        : failure?.kind === 'segment'
          ? `segment(s) ${failure.segments.map((index) => index + 1).join(', ')} were never accepted`
          : failure?.kind === 'assembly'
            ? 'the assembled page kept failing a check of the whole document'
            : failure?.kind === 'unlocatable'
              ? 'the assembled page failed a check of the whole document that could not be attributed to any segment'
              : 'unknown'
    }`,
    '',
  ]

  const interesting = outcomes.filter(
    (outcome) => outcome.history.length > 0 || outcome.status === 'failed',
  )
  const shown = (interesting.length > 0 ? interesting : outcomes).slice(
    0,
    MAX_SEGMENTS_SHOWN,
  )

  const summary = new Map<string, number>()
  for (const outcome of outcomes) {
    summary.set(outcome.status, (summary.get(outcome.status) ?? 0) + 1)
  }
  lines.push(
    `Segment outcomes: ${[...summary]
      .map(([status, count]) => `${count} ${status}`)
      .join(', ')}`,
    '',
  )

  for (const outcome of shown) {
    lines.push(
      `Segment ${outcome.index + 1}${
        outcome.label.heading ? ` — under “${outcome.label.heading}”` : ''
      }${outcome.label.line ? `, source line ${outcome.label.line}` : ''}: ${outcome.status}, ${outcome.attempts} attempt(s)`,
    )
    for (const [round, attemptFindings] of outcome.history
      .slice(0, MAX_ATTEMPTS_SHOWN)
      .entries()) {
      lines.push(
        `  attempt ${round + 1} rejected with ${attemptFindings.length} finding(s):`,
        ...attemptFindings.slice(0, 8).map(describeFinding),
        ...(attemptFindings.length > 8
          ? [`    - …and ${attemptFindings.length - 8} more of the same kinds`]
          : []),
      )
    }
    if (outcome.history.length > MAX_ATTEMPTS_SHOWN) {
      lines.push(
        `  …and ${outcome.history.length - MAX_ATTEMPTS_SHOWN} further rejected attempt(s)`,
      )
    }
  }

  if (interesting.length > shown.length) {
    lines.push(
      '',
      `…and ${interesting.length - shown.length} further segment(s).`,
    )
  }

  const blocking = findings.filter((finding) => finding.blocking !== false)
  if (blocking.length > 0) {
    lines.push(
      '',
      'What was still wrong when the run ended:',
      ...blocking.slice(0, 12).map(describeFinding),
    )
  }

  return lines.join('\n')
}

export const createDiagnoser = ({
  models,
  model,
  reasoningEffort = DEFAULT_DIAGNOSE_REASONING_EFFORT,
  limit,
}: CreateDiagnoserOptions): Diagnoser => ({
  async diagnose(request) {
    try {
      const { contentText } = await import('@earendil-works/pi-ai')
      const reply = await limit(() =>
        models.completeSimple(
          model,
          {
            systemPrompt: SYSTEM_PROMPT,
            messages: [
              {
                role: 'user' as const,
                content: buildEvidence(request),
                timestamp: Date.now(),
              },
            ],
          },
          { reasoning: reasoningEffort, maxRetries: 1 },
        ),
      )
      if (reply.stopReason === 'error' || reply.stopReason === 'aborted') {
        return undefined
      }
      const text = contentText(reply.content).trim()
      return text === '' ? undefined : text
    } catch {
      // Never allowed to affect the run. The document has already failed for a
      // reason that is on record; failing to explain it changes nothing about
      // that, and must not turn one failure into two.
      return undefined
    }
  },
})
