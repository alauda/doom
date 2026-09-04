import type { Model, Models, ThinkingLevel } from '@earendil-works/pi-ai'

import type { TranslationFinding } from './translate-checker.ts'
import type { MaskProcessor } from './translate-mask.ts'
import type { Segment } from './translate-segment.ts'

/**
 * Translating one segment: a single ordinary model call.
 *
 * Not an agent. There is no loop here, no tool, no scratch directory and no
 * bookkeeping — a segment is small enough to hand over, and what comes back is
 * either accepted or asked for again. Autonomy is kept for the place it
 * actually wins (a hard repair, in `translate-repair-agent.ts`); on the path
 * that runs thousands of times it only adds variance.
 *
 * The context a segment needs is small and fixed: the page's headings so the
 * model knows where it is, the tail of the previous segment so the voice
 * carries, and the segment itself. That is a few hundred tokens on top of the
 * segment — which is the whole point. The old design put every byte of a
 * document and its translation through one context, and a model working in a
 * context it has filled and had released is a model that reaches for a rewrite.
 */

/** Retries for a refused request. Transient limits are normal at corpus scale. */
export const DEFAULT_CALL_MAX_RETRIES = 5
export const DEFAULT_CALL_RETRY_DELAY_MS = 3_000

/** How many lines of the previous segment's translation carry the voice forward. */
export const DEFAULT_CONTEXT_TAIL = 20

const PLACEHOLDER_DISCIPLINE = `## Placeholders

Tokens shaped like \`__DOOM_TR_LINK_3__\` stand for content you must not author — link targets, code, identifiers, component attribute values. Reproduce each one verbatim and exactly once, in the position it appears. Never translate, reformat, split, renumber, remove, duplicate or invent one. The text around a placeholder is translated as usual.`

/**
 * Kept out of `DEFAULT_SYSTEM_PROMPT` for the same reason the placeholder
 * discipline is: a repository can replace that prompt wholesale through
 * `translate.systemPrompt`, and this constraint is enforced by a blocking
 * check, so it has to live where a repository cannot drop it.
 */
const EMPHASIS_DISCIPLINE = `## Emphasis

\`**bold**\` only works when the delimiters sit directly against the text, and CommonMark will not close a run that is preceded by punctuation and followed by a letter. \`**Note:** text\` is bold; \`**注意：**文本\` is not — it prints the asterisks to the page.

When a bold label ends in a colon or other punctuation and the next thing is a word, put the punctuation outside the emphasis (\`**注意**：文本\`) or leave a space after the closing \`**\`. Never write \`** text **\`.`

const SEGMENT_TASK = `Answer with the translated segment and nothing else: no explanation, no preamble, no summary, and no code fence wrapped around your whole answer.

The segment is one piece of a longer page. It begins and ends mid-document, and that is correct — do not add a title, an introduction or a conclusion, and do not finish a section that carries on past the end of what you were given.

Keep its structure exactly as it is: the same headings at the same levels, the same lists, tables and components, in the same order. Translate the words.`

const ATTRIBUTE_TASK = `You are given one component tag, carrying the words it shows to a reader.

Answer with that same element and nothing else — the same component name and the same attributes, in the same order — translating only the attribute values. Do not translate attribute names, do not add or remove attributes, and do not give it any children.`

export interface SegmentTranslationRequest {
  segment: Segment
  /** Every heading on the page, so the model knows where this segment sits. */
  outline?: string
  /** The end of the previous segment's accepted translation. */
  previousTail?: string
  /** 1 for the first go; higher when the segment is being asked for again. */
  attempt: number
  /** The answer that was rejected, and why. Absent on the first attempt. */
  retry?: {
    previous: string
    findings: readonly TranslationFinding[]
  }
}

export interface SegmentTranslator {
  translate(request: SegmentTranslationRequest): Promise<string>
  /** Model calls made so far, for the run summary. */
  calls(): number
}

export interface CreateSegmentTranslatorOptions {
  models: Models
  model: Model<'openai-completions'>
  reasoningEffort: ThinkingLevel
  /** The rendered translation rules — the same prompt body the whole document used. */
  translationRules: string
  sourceLanguage: string
  targetLanguage: string
  processor: MaskProcessor
  /** Applied to every model call, so segments count against the same budget as everything else. */
  limit: <T>(run: () => Promise<T>) => Promise<T>
  maxRetries?: number
  retryDelayMs?: number
}

export const createSegmentTranslator = ({
  models,
  model,
  reasoningEffort,
  translationRules,
  sourceLanguage,
  targetLanguage,
  processor,
  limit,
  maxRetries = DEFAULT_CALL_MAX_RETRIES,
  retryDelayMs = DEFAULT_CALL_RETRY_DELAY_MS,
}: CreateSegmentTranslatorOptions): SegmentTranslator => {
  let calls = 0

  const systemPrompt = (kind: Segment['address']['kind']) =>
    [
      `You are a professional technical documentation translator, translating from ${sourceLanguage} to ${targetLanguage}.`,
      '',
      kind === 'attributes' ? ATTRIBUTE_TASK : SEGMENT_TASK,
      '',
      PLACEHOLDER_DISCIPLINE,
      '',
      EMPHASIS_DISCIPLINE,
      '',
      '## Translation rules',
      '',
      translationRules,
    ].join('\n')

  return {
    calls: () => calls,
    async translate(request) {
      const { contentText } = await import('@earendil-works/pi-ai')
      const context = {
        systemPrompt: systemPrompt(request.segment.address.kind),
        messages: [
          {
            role: 'user' as const,
            content: buildUserPrompt(request),
            timestamp: Date.now(),
          },
        ],
      }

      let lastError = 'unknown'
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        calls++
        const reply = await limit(() =>
          models.completeSimple(model, context, {
            reasoning: reasoningEffort,
            maxRetries,
          }),
        )
        if (reply.stopReason !== 'error' && reply.stopReason !== 'aborted') {
          return unwrap(contentText(reply.content), request.segment, processor)
        }
        lastError = reply.errorMessage ?? reply.stopReason
        // A gateway that refuses is not a translation that failed, so this does
        // not spend one of the segment's attempts. Running out still throws.
        if (attempt < maxRetries) {
          await new Promise((resolve) =>
            globalThis.setTimeout(resolve, retryDelayMs * 2 ** attempt),
          )
        }
      }
      throw new Error(`The translation model failed: ${lastError}`)
    },
  }
}

export const buildUserPrompt = ({
  segment,
  outline,
  previousTail,
  attempt,
  retry,
}: SegmentTranslationRequest) => {
  const lines: string[] = []

  if (outline && segment.address.kind !== 'attributes') {
    lines.push(
      'For context, these are the headings of the whole page. Do not translate this list; it is only so you know where the segment sits.',
      '',
      outline,
      '',
    )
  }

  // The tail is dropped the moment a segment has to be asked for again. It is
  // there for voice, and it is also the one thing in the prompt that contains
  // another segment's placeholders — which is exactly what a model copies from
  // when it is trying to satisfy a complaint it has not understood.
  if (previousTail && attempt === 1 && segment.address.kind !== 'attributes') {
    lines.push(
      'The previous segment of this page ended like this. Continue in the same voice and use the same wording for the same things; do not repeat any of it.',
      '',
      '<<<PREVIOUS',
      previousTail,
      'PREVIOUS',
      '',
    )
  }

  if (retry) {
    lines.push(
      'You already translated this segment, and the result was rejected:',
      '',
      '<<<REJECTED',
      retry.previous,
      'REJECTED',
      '',
      `What is wrong with it (${retry.findings.length}):`,
      ...retry.findings.map(
        (finding) =>
          `- ${finding.rule}${finding.line ? ` (line ${finding.line})` : ''}: ${finding.reason}`,
      ),
      '',
      'Answer with the corrected translation of the whole segment — not a diff, not just the part that was wrong.',
      '',
    )
  }

  lines.push(
    retry ? 'The segment, again:' : 'Translate this segment:',
    '',
    '<<<SEGMENT',
    segment.text,
    'SEGMENT',
  )

  return lines.join('\n')
}

/**
 * Takes off a code fence the model wrapped the whole answer in.
 *
 * Asked not to, models still sometimes do. Stripping by pattern would be
 * wrong — a segment can legitimately consist of a fenced block — so the test is
 * structural: the answer parses to exactly one fenced block while the source
 * segment does not. Then, and only then, what is inside the fence is the answer.
 */
export const unwrap = (
  reply: string,
  segment: Segment,
  processor: MaskProcessor,
) => {
  const trimmed = reply.trim()
  if (!trimmed.startsWith('```')) {
    return trimmed
  }
  const onlyFence = (content: string) => {
    try {
      const { children } = processor.parse(content)
      return children.length === 1 && children[0].type === 'code'
        ? children[0]
        : undefined
    } catch {
      return undefined
    }
  }
  const wrapper = onlyFence(trimmed)
  return wrapper && !onlyFence(segment.text) ? wrapper.value : trimmed
}

/**
 * Every heading on the page, indented by level, with the current segment marked.
 *
 * Marked by the heading's **line**, not by its text. A real page repeats
 * `Procedure`, `Prerequisites` and `Verification` under every top-level
 * heading, and matching on text put the mark on the first one of that name — so
 * a segment in the CLI section was told it was in the console section, which is
 * worse than not marking anything.
 */
export const renderOutline = (
  headings: readonly { depth: number; text: string; line?: number }[],
  currentLine?: number,
) =>
  headings
    .map(({ depth, text, line }) => {
      const mark =
        currentLine != null && line === currentLine ? '  ← you are here' : ''
      return `${'  '.repeat(Math.max(0, depth - 1))}- ${text}${mark}`
    })
    .join('\n')

/** The last few lines of a translation, for the next segment to continue from. */
export const tailOf = (translation: string, lines = DEFAULT_CONTEXT_TAIL) => {
  if (lines <= 0) {
    return undefined
  }
  const all = translation.trimEnd().split('\n')
  const tail = all.slice(Math.max(0, all.length - lines)).join('\n')
  return tail.trim() === '' ? undefined : tail
}
