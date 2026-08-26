import type { Model, Models, ThinkingLevel } from '@earendil-works/pi-ai'

import type { TranslationFinding } from './translate-checker.ts'

/**
 * The semantic check — the one that reads.
 *
 * Every deterministic check in this pipeline asks a structural question: is
 * every placeholder back, does the component count match, do the headings line
 * up. All of them pass a translation that is fluent, well-formed, correctly
 * linked, and about something else. That blind spot is not a gap in the rules,
 * it is what rules are: `state.md` §7 records two documents that lost whole
 * sentences and were caught only because the missing sentence happened to
 * contain a `<Term>`.
 *
 * So a second model reads both documents and says what the translation lost,
 * added, or got wrong. Three things keep that from becoming a coin toss:
 *
 * 1. **Only three kinds block.** Omission, addition and mistranslation are
 *    defects. Readability is an opinion, and it is reported without failing
 *    anything — a translation that meets the standard passes, rather than being
 *    iterated until nobody can improve it.
 * 2. **A finding must be drawn twice.** Two independent readings, and only what
 *    both report counts. A false positive has to happen twice to reach anyone.
 * 3. **It quotes.** Every finding names the passage it is about, so a person —
 *    or the translator — can go and look instead of taking its word.
 *
 * It reads the *masked* documents, the same ones the translator sees. Its
 * findings are fed back into the translator's context, and an unmasked link
 * target quoted in a finding would be a link target back in the model's reach
 * — the one thing masking exists to prevent. Placeholders are stable tokens on
 * both sides, so nothing about judging prose is lost by leaving them in.
 */

export type JudgeFindingKind =
  /** the translation dropped something the source says */
  | 'omission'
  /** the translation says something the source does not */
  | 'addition'
  /** the translation says something different from the source */
  | 'mistranslation'
  /** the translation is awkward or unidiomatic — reported, never blocking */
  | 'fluency'

/** The kinds that stop a document from shipping. */
export const BLOCKING_JUDGE_KINDS: readonly JudgeFindingKind[] = [
  'omission',
  'addition',
  'mistranslation',
]

const ALL_KINDS: readonly JudgeFindingKind[] = [
  ...BLOCKING_JUDGE_KINDS,
  'fluency',
]

export interface JudgeFinding {
  kind: JudgeFindingKind
  /** The passage in the source the finding is about. Required: a finding nobody can locate is not actionable. */
  source: string
  /** What is wrong with the translation of that passage. */
  detail: string
}

export interface JudgeRequest {
  /** The masked source, as the translator saw it. */
  sourceText: string
  /** The masked translation, as the translator wrote it. */
  translationText: string
  sourceLanguage: string
  targetLanguage: string
  /**
   * The product's established translations for terms the source uses.
   *
   * The same table the translator is given. Without it the reviewer reports
   * the house translation of a product term as a mistranslation — measured:
   * four of the ten false reds in the first calibration were one term,
   * "workload cluster" → "业务集群", which is simply what these documents call
   * it.
   */
  terms?: readonly { source: string; target: string }[]
}

export interface Judge {
  review(request: JudgeRequest): Promise<TranslationFinding[]>
  /** Readings taken so far. For the run summary — the judge is the expensive part. */
  readings(): number
}

export interface CreateJudgeOptions {
  models: Models
  model: Model<'openai-completions'>
  reasoningEffort: ThinkingLevel
  /**
   * How many independent readings must agree.
   *
   * Two by default. The variety comes from the model's own non-determinism —
   * measured on this gateway, `temperature: 0` does not produce identical
   * answers — so it needs no parameter to create it.
   */
  draws?: number
  /** Applied to every model call, so judge readings count against the same budget as translation. */
  limit: <T>(run: () => Promise<T>) => Promise<T>
  /** How many times a failed reading is retried before the document fails. */
  maxRetries?: number
  /** First backoff, doubled per attempt. */
  retryDelayMs?: number
  /**
   * Called with each raw reading, before the draws are compared.
   *
   * Only calibration uses this. Agreement throws most of what a single reading
   * says away, which is the point — but it also means "no findings" and "the
   * judge said nothing at all" produce the same output, and those are very
   * different situations to be looking at when deciding whether this can be a
   * gate.
   */
  onDraw?: (findings: readonly JudgeFinding[]) => void
}

export const DEFAULT_JUDGE_DRAWS = 2

/**
 * Transient refusals are normal at corpus scale.
 *
 * Measured on this gateway: a handful of concurrent full-document readings gets
 * "Concurrency limit exceeded for user, please retry later". Thousands of
 * readings will meet it. Retrying is not softening the check — a reading that
 * never succeeds still fails the document.
 */
export const DEFAULT_JUDGE_MAX_RETRIES = 4
export const DEFAULT_JUDGE_RETRY_DELAY_MS = 2_000

const SYSTEM_PROMPT = `You are reviewing a translation of technical documentation. You are not improving it and not rewriting it: you are saying what is wrong with it, if anything.

Work in two passes, in this order.

PASS 1 — coverage. Go through the SOURCE one block at a time: every paragraph, every list item, every table row, every heading. For each block, find what corresponds to it in the translation. A block with nothing corresponding to it is an "omission" — report it and quote the block.

Do this pass first and do it completely. A dropped sentence or a dropped bullet is what this review exists to catch: it leaves the document well-formed, correctly linked and fluent, so nothing else in the pipeline can see it. Counting is part of the job — if a list has six items in the source and five in the translation, one was dropped, and saying which is the finding.

PASS 2 — the blocks that do have a counterpart. Report "mistranslation" only when a reader would come away with a different fact or a different instruction: a changed number, a reversed direction, a different component, a step that now says something else. A wording that is merely less precise than the source, or that you would have phrased better, is "fluency" — not a defect. If you find yourself explaining that a word "should rather be" some other word, it is fluency.

Report "addition" when the translation states a fact the source does not.

Report only what you can point at. Every finding quotes the passage of the SOURCE it is about.

Tokens shaped like \`__DOOM_TR_LINK_3__\` are placeholders standing in for content that was deliberately kept out of translation — link targets, code, identifiers. They appear in both documents. A placeholder is not a translation problem: never report one, in any category. Whether they are all present is checked elsewhere.

Differences that are not findings:
- word order, sentence splitting or merging that keeps the meaning;
- a technical term, product name, UI label or command left in the source language;
- formatting, whitespace, or markdown structure.

Answer with a JSON array and nothing else. Each element:
  {"kind": "omission" | "addition" | "mistranslation" | "fluency", "source": "<the exact passage from the source>", "detail": "<what is wrong, in one sentence>"}

An empty array means the translation is faithful. That is the expected answer for a good translation — do not look for something to say.`

/**
 * Drops the frontmatter block.
 *
 * The translator is *supposed* to change it: `sourceSHA` is written by the
 * translator, `i18n` is dropped, `title` is translated. Showing that to a
 * reviewer asked to find additions guarantees it reports one, every time, on
 * every document — which is what the first calibration run measured. Whether
 * the rest of the frontmatter survived is counted exactly by
 * `translation-frontmatter-preservation`.
 */
const withoutFrontmatter = (document: string) => {
  if (!document.startsWith('---')) {
    return document
  }
  const end = document.indexOf('\n---', 3)
  return end < 0 ? document : document.slice(end + 4).replace(/^\n+/u, '')
}

const buildUserPrompt = ({
  sourceText,
  translationText,
  sourceLanguage,
  targetLanguage,
  terms = [],
}: JudgeRequest) =>
  [
    ...(terms.length > 0
      ? [
          "These are this product's established translations. Using them is correct by definition — never report one as a mistranslation:",
          ...terms.map((term) => `  ${term.source} => ${term.target}`),
          '',
        ]
      : []),
    `The source document (${sourceLanguage}):`,
    '<<<SOURCE',
    withoutFrontmatter(sourceText),
    'SOURCE',
    '',
    `Its translation (${targetLanguage}):`,
    '<<<TRANSLATION',
    withoutFrontmatter(translationText),
    'TRANSLATION',
  ].join('\n')

/**
 * Pulls the array out of a reply that may be wrapped in prose or a code fence.
 *
 * Lenient on purpose: a reply that is unusable is treated as a reading that
 * found nothing, because the alternative — failing the document because the
 * judge was hard to parse — fails the wrong thing. A judge that cannot be read
 * cannot report a defect either, and the deterministic checks are unaffected.
 */
const parseFindings = (reply: string): JudgeFinding[] => {
  const start = reply.indexOf('[')
  const end = reply.lastIndexOf(']')
  if (start < 0 || end <= start) {
    return []
  }
  let parsed: unknown
  try {
    parsed = JSON.parse(reply.slice(start, end + 1))
  } catch {
    return []
  }
  if (!Array.isArray(parsed)) {
    return []
  }
  const findings: JudgeFinding[] = []
  for (const entry of parsed) {
    if (!entry || typeof entry !== 'object') {
      continue
    }
    const { kind, source, detail } = entry as Record<string, unknown>
    if (
      typeof kind !== 'string' ||
      !ALL_KINDS.includes(kind as JudgeFindingKind) ||
      typeof source !== 'string' ||
      source.trim() === '' ||
      typeof detail !== 'string'
    ) {
      continue
    }
    if (isAboutPlaceholdersOnly(source)) {
      continue
    }
    findings.push({
      kind: kind as JudgeFindingKind,
      source: source.trim(),
      detail: detail.trim(),
    })
  }
  return findings
}

/**
 * A quote with nothing in it but placeholders.
 *
 * The prompt tells the judge that placeholders are not its business, and it
 * mostly listens. When it does not, the finding is about something the
 * deterministic checks already count exactly — so it is dropped here rather
 * than sent to the translator, who would be asked to fix a token it is
 * required to reproduce verbatim.
 */
const isAboutPlaceholdersOnly = (source: string) =>
  source.replace(/__DOOM_TR_[A-Z]+_\d+__/gu, '').trim() === ''

/** Whitespace and case removed, so two readings quoting the same passage look the same. */
const normalise = (value: string) =>
  value.toLowerCase().replace(/\s+/gu, ' ').trim()

/**
 * Whether two readings are talking about the same thing.
 *
 * Same kind, and one quote contains the other. Requiring the quotes to match
 * exactly would make agreement depend on where each reading chose to start and
 * stop, which is not what "both saw it" should mean.
 */
const sameFinding = (a: JudgeFinding, b: JudgeFinding) => {
  if (a.kind !== b.kind) {
    return false
  }
  const left = normalise(a.source)
  const right = normalise(b.source)
  if (left === '' || right === '') {
    return false
  }
  return left.includes(right) || right.includes(left)
}

/** The findings every reading reported. */
export const agreedFindings = (draws: readonly JudgeFinding[][]) => {
  if (draws.length === 0) {
    return []
  }
  const [first, ...rest] = draws
  return first.filter((finding) =>
    rest.every((draw) => draw.some((other) => sameFinding(finding, other))),
  )
}

export const parseJudgeFindings = parseFindings

export const createJudge = ({
  models,
  model,
  reasoningEffort,
  draws = DEFAULT_JUDGE_DRAWS,
  limit,
  maxRetries = DEFAULT_JUDGE_MAX_RETRIES,
  retryDelayMs = DEFAULT_JUDGE_RETRY_DELAY_MS,
  onDraw,
}: CreateJudgeOptions): Judge => {
  let readings = 0

  const readOnce = async (request: JudgeRequest) => {
    readings++
    const { contentText } = await import('@earendil-works/pi-ai')
    const context = {
      systemPrompt: SYSTEM_PROMPT,
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
      const reply = await limit(() =>
        models.completeSimple(model, context, {
          reasoning: reasoningEffort,
          maxRetries,
        }),
      )
      if (reply.stopReason !== 'error' && reply.stopReason !== 'aborted') {
        const drawn = parseFindings(contentText(reply.content))
        onDraw?.(drawn)
        return drawn
      }
      lastError = reply.errorMessage ?? reply.stopReason
      if (attempt < maxRetries) {
        // A whole corpus is thousands of readings, and a gateway under load
        // refuses some of them. Backing off and asking again is not softening
        // the gate: running out of attempts still throws.
        await new Promise((resolve) =>
          globalThis.setTimeout(resolve, retryDelayMs * 2 ** attempt),
        )
      }
    }
    throw new Error(`The judge model failed: ${lastError}`)
  }

  return {
    readings: () => readings,
    async review(request) {
      const results = await Promise.all(
        Array.from({ length: draws }, () => readOnce(request)),
      )
      return agreedFindings(results).map((finding) => ({
        rule: `doom-judge:${finding.kind}`,
        reason: `${finding.detail} — the source says: “${finding.source}”`,
        blocking: BLOCKING_JUDGE_KINDS.includes(finding.kind),
      }))
    },
  }
}
