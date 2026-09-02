import type { Root } from 'mdast'

import type { SegmentTranslator } from './translate-call.ts'
import { renderOutline, tailOf } from './translate-call.ts'
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
import type { SegmentCacheRecord } from './translate-segment-cache.ts'
import {
  encodeCacheRecord,
  matchCachedSegments,
} from './translate-segment-cache.ts'
import { checkSegment } from './translate-segment-check.ts'
import {
  type Segment,
  type SegmentRecord,
  UnsplittableBlockError,
  assemble,
  documentOutline,
  planSegments,
  resolveAttributeNode,
  resolvePlacement,
} from './translate-segment.ts'
import type { TermPair } from './translate-terms.ts'

/**
 * Translating one document, a segment at a time.
 *
 * The shape of this file is the whole proposal in one place: cut the document
 * up, translate each piece on its own, **freeze what passes**, ask again only
 * for what did not, put the pieces back, and check the result as a whole.
 *
 * The freezing is the part that matters. In the design this replaces, the unit
 * of work, of acceptance and of retry were all "the document", while the unit
 * of failure was one placeholder out of 871 — so every retry put everything
 * that was already right back at risk, and one of them took a translation that
 * was one problem from done and turned it into a thousand. Here, a segment that
 * passes is never touched again by anything: not a retry, not a repair, not a
 * later assembly round. Work only ever accumulates.
 */

/** How many times a segment is asked for before it is escalated. */
export const DEFAULT_MAX_SEGMENT_ATTEMPTS = 3

/** How many times the assembled document may send segments back. */
export const DEFAULT_MAX_ASSEMBLY_ROUNDS = 2

export type SegmentStatus = 'translated' | 'cached' | 'repaired' | 'failed'

export interface SegmentOutcome {
  index: number
  status: SegmentStatus
  label: Segment['label']
  /** Model calls spent asking for this segment, across every round. */
  attempts: number
  /** What was wrong on each rejected attempt, oldest first. For the diagnosis. */
  history: TranslationFinding[][]
  /** What was still wrong when it was given up on. */
  findings: TranslationFinding[]
}

export type DocumentFailure =
  /** A single block too large to send and impossible to divide. */
  | { kind: 'unsplittable-block'; detail: string }
  /** One or more segments never passed. */
  | { kind: 'segment'; segments: readonly number[] }
  /** The assembled document failed a whole-document rule that was routed back and still failed. */
  | { kind: 'assembly' }
  /** The assembled document failed a rule nothing could attribute to a segment. */
  | { kind: 'unlocatable' }

export interface TranslateDocumentResult {
  /** The finished document, when it passed. */
  document?: string
  /**
   * What was still wrong when the run ended.
   *
   * `document` is set exactly when none of these block. A passing document can
   * still carry advisory findings — readability notes, and the whole-document
   * review — which are worth printing and not worth failing a build over.
   */
  findings: TranslationFinding[]
  failure?: DocumentFailure
  outcomes: SegmentOutcome[]
  assemblyRounds: number
  /** Where each segment landed, for the next run's cache. Only when it passed. */
  records?: SegmentRecord[]
}

/** A last resort for a segment repeated attempts could not fix. */
export interface SegmentRepairer {
  repair(request: {
    segment: Segment
    /** The best rejected attempt — the one with the fewest blocking findings. */
    draft: string
    history: readonly TranslationFinding[][]
    /**
     * The acceptance check for this segment, so the agent sees exactly the
     * verdict that will decide its work.
     *
     * Handed in rather than rebuilt: an agent checking itself against anything
     * but the real gate would pass its own check and then be rejected, which is
     * a loop with no exit.
     */
    check: (translation: string) => Promise<TranslationFinding[]>
  }): Promise<string | undefined>
}

export interface TranslateDocumentOptions {
  /** The masked tree. Segments address it, assembly rebuilds it. */
  tree: Root
  /** The masked source as text, for the whole-document review. */
  maskedSource: string
  maskEntries: readonly MaskEntry[]
  processor: MaskProcessor
  /** Merges a restored translation with the frontmatter it will be written with. */
  compose: (restored: string, cache?: SegmentCacheRecord) => string
  /** Absolute path the translation will be written to. */
  targetPath: string
  /** Path of the source, relative to the docs root — for logs only. */
  sourceLabel: string
  /** Language names, as the reviewer is told them — `English`, not `en`. */
  sourceLanguage: string
  targetLanguage: string
  translator: SegmentTranslator
  checker: TranslationChecker
  /** Reads each segment against its source. */
  segmentJudge?: Judge
  /** Reads the assembled document. Advisory only — it never fails a build. */
  documentJudge?: Judge
  terms?: readonly TermPair[]
  segmentCap?: number
  segmentHardCap?: number
  segmentFloor?: number
  maxSegmentAttempts?: number
  maxAssemblyRounds?: number
  contextTail?: number
  repairer?: SegmentRepairer
  /**
   * The translation already on disk, for reusing the segments that did not
   * change. Absent on a first translation, and when `--force` is given.
   *
   * What may be reused is decided in `translate-segment-cache.ts`, which
   * verifies every candidate against this document's own mask table before
   * offering it.
   */
  previous?: { body: string; record?: SegmentCacheRecord }
  onProgress?: (message: string) => void
}

/**
 * A mask finding, said in the vocabulary the rest of the pipeline speaks.
 *
 * Exported because the repair agent reports the same things.
 */
export const maskFindingToTranslationFinding = (
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
  placeholder: finding.placeholder,
})

export const translateDocument = async (
  options: TranslateDocumentOptions,
): Promise<TranslateDocumentResult> => {
  const {
    tree,
    maskedSource,
    maskEntries,
    processor,
    compose,
    targetPath,
    sourceLabel,
    sourceLanguage,
    targetLanguage,
    translator,
    checker,
    segmentJudge,
    documentJudge,
    terms,
    segmentCap,
    segmentHardCap,
    segmentFloor,
    maxSegmentAttempts = DEFAULT_MAX_SEGMENT_ATTEMPTS,
    maxAssemblyRounds = DEFAULT_MAX_ASSEMBLY_ROUNDS,
    contextTail,
    repairer,
    previous,
    onProgress,
  } = options

  let plan
  try {
    plan = planSegments({
      tree,
      processor,
      cap: segmentCap,
      hardCap: segmentHardCap,
      floor: segmentFloor,
    })
  } catch (error) {
    if (error instanceof UnsplittableBlockError) {
      // Not a translation failure: nothing a model could have done differently.
      // The document has to change.
      return {
        findings: [
          { rule: 'doom-translate:unsplittable-block', reason: error.message },
        ],
        failure: { kind: 'unsplittable-block', detail: error.message },
        outcomes: [],
        assemblyRounds: 0,
      }
    }
    throw error
  }

  const { reuse, reason: noReuse } = previous
    ? matchCachedSegments({
        plan,
        maskEntries,
        processor,
        previousBody: previous.body,
        record: previous.record,
      })
    : { reuse: new Map<number, string>(), reason: undefined }
  if (previous && reuse.size === 0 && noReuse) {
    onProgress?.(`${sourceLabel}: nothing reused — ${noReuse}`)
  }

  const documentTokens = new Set(
    maskEntries.map((entry) => entry.placeholder.toLowerCase()),
  )
  const outline = renderOutline(documentOutline(tree))

  /** The accepted translation of each segment. Only ever written on a pass. */
  const frozen: (string | undefined)[] = []
  /** The least-bad rejected attempt, for a repairer to start from. */
  const best: ({ text: string; blocking: number } | undefined)[] = []
  const outcomes: SegmentOutcome[] = plan.segments.map((segment) => ({
    index: segment.index,
    status: 'failed',
    label: segment.label,
    attempts: 0,
    history: [],
    findings: [],
  }))
  const advisory: TranslationFinding[] = []

  const previousTail = (segment: Segment) => {
    if (contextTail === 0) {
      return undefined
    }
    const before = frozen[segment.index - 1]
    return before == null ? undefined : tailOf(before, contextTail)
  }

  /**
   * One pass at a segment: ask, check, and freeze only on a pass.
   *
   * The ratchet lives in this function and nowhere else — `frozen` is assigned
   * exactly once here, on the branch where nothing blocks. Every other outcome
   * leaves whatever was already accepted alone, which is what makes "the
   * document uses the version of each segment that passed" true by
   * construction rather than by care.
   */
  const workOn = async (
    segment: Segment,
    sentBack?: readonly TranslationFinding[],
  ) => {
    const outcome = outcomes[segment.index]
    let retry = sentBack?.length
      ? { previous: frozen[segment.index] ?? '', findings: sentBack }
      : undefined

    for (let attempt = 1; attempt <= maxSegmentAttempts; attempt++) {
      outcome.attempts++
      const translation = await translator.translate({
        segment,
        outline,
        previousTail: previousTail(segment),
        attempt,
        retry,
      })
      const findings = await checkSegment({
        segment,
        translation,
        processor,
        documentTokens,
        judge: segmentJudge,
        sourceLanguage,
        targetLanguage,
        terms,
      })
      const blocking = blockingFindings(findings)

      if (blocking.length === 0) {
        frozen[segment.index] = translation
        outcome.status = 'translated'
        outcome.findings = []
        advisory.push(...findings)
        return true
      }

      outcome.history.push(findings)
      const previousBest = best[segment.index]
      if (!previousBest || blocking.length < previousBest.blocking) {
        best[segment.index] = { text: translation, blocking: blocking.length }
      }
      retry = { previous: translation, findings }
      onProgress?.(
        `${sourceLabel} [segment ${segment.index + 1}/${plan.segments.length}${describe(segment)}] attempt ${attempt} rejected: ${summarise(blocking)}`,
      )
    }

    if (repairer) {
      const draft = best[segment.index]?.text ?? ''
      onProgress?.(
        `${sourceLabel} [segment ${segment.index + 1}/${plan.segments.length}${describe(segment)}] escalating to the repair agent`,
      )
      const repaired = await repairer.repair({
        segment,
        draft,
        history: outcome.history,
        check: (translation) =>
          checkSegment({
            segment,
            translation,
            processor,
            documentTokens,
            judge: segmentJudge,
            sourceLanguage,
            targetLanguage,
            terms,
          }),
      })
      if (repaired != null) {
        const findings = await checkSegment({
          segment,
          translation: repaired,
          processor,
          documentTokens,
          judge: segmentJudge,
          sourceLanguage,
          targetLanguage,
          terms,
        })
        if (blockingFindings(findings).length === 0) {
          frozen[segment.index] = repaired
          outcome.status = 'repaired'
          outcome.findings = []
          advisory.push(...findings)
          onProgress?.(
            `${sourceLabel} [segment ${segment.index + 1}/${plan.segments.length}${describe(segment)}] repaired`,
          )
          return true
        }
        outcome.history.push(findings)
      }
    }

    // Nothing passed. Whatever was frozen before — from an earlier round —
    // stays frozen: a failed attempt never costs a segment its best accepted
    // version.
    outcome.findings = outcome.history.at(-1) ?? []
    if (frozen[segment.index] == null) {
      outcome.status = 'failed'
      return false
    }
    return true
  }

  // ------------------------------------------------ every segment, in order

  for (const segment of plan.segments) {
    const reused = reuse.get(segment.index)
    if (reused != null) {
      frozen[segment.index] = reused
      outcomes[segment.index].status = 'cached'
      continue
    }
    await workOn(segment)
  }
  if (reuse.size > 0) {
    onProgress?.(
      `${sourceLabel}: reused ${reuse.size} of ${plan.segments.length} segment(s) from the previous translation`,
    )
  }

  const unfinished = plan.segments.filter(
    (segment) => frozen[segment.index] == null,
  )
  if (unfinished.length > 0) {
    for (const segment of unfinished) {
      onProgress?.(
        `${sourceLabel} [segment ${segment.index + 1}/${plan.segments.length}${describe(segment)}] gave up after ${outcomes[segment.index].attempts} attempt(s)`,
      )
    }
    return {
      findings: unfinished.flatMap(
        (segment) => outcomes[segment.index].findings,
      ),
      failure: {
        kind: 'segment',
        segments: unfinished.map((segment) => segment.index),
      },
      outcomes,
      assemblyRounds: 0,
    }
  }

  // ------------------------------------------------------------- assembling

  let assemblyRounds = 0
  for (;;) {
    const assembled = assemble({
      tree,
      plan,
      processor,
      translations: frozen as string[],
    })

    let restored: string | undefined
    let findings: TranslationFinding[] = []
    try {
      restored = restoreMaskedContent(assembled.text, maskEntries, processor)
    } catch (error) {
      if (!(error instanceof MaskIntegrityError)) {
        throw error
      }
      findings = error.findings.map(maskFindingToTranslationFinding)
    }

    const document =
      restored == null
        ? undefined
        : compose(restored, encodeCacheRecord(plan, assembled.records))

    if (document != null) {
      findings = await checker.check(targetPath, document)
    }

    const blocking = blockingFindings(findings)
    if (blocking.length === 0 && document != null) {
      if (documentJudge && plan.segments.length > 1) {
        // Advisory, always: this reads the whole page for the things a segment
        // cannot see — a term that drifted between sections, a join that reads
        // badly — and those are worth telling someone about and not worth
        // failing a build over. A page that is one segment has already been
        // read by exactly this check, so it is not read twice.
        const whole = await documentJudge.review({
          sourceText: maskedSource,
          translationText: assembled.text,
          sourceLanguage,
          targetLanguage,
          terms,
        })
        advisory.push(
          ...whole.map((finding) => ({ ...finding, blocking: false })),
        )
      }
      return {
        document,
        findings: [...findings, ...advisory],
        outcomes,
        assemblyRounds,
        records: assembled.records,
      }
    }

    if (assemblyRounds >= maxAssemblyRounds) {
      return {
        findings: [...blocking, ...advisory],
        failure: { kind: 'assembly' },
        outcomes,
        assemblyRounds,
      }
    }

    const routed = route({
      findings: blocking,
      plan,
      placements: assembled.placements,
      document,
      processor,
    })

    if (routed.size === 0) {
      // Deliberately not "redo every segment": that is the whole-document blast
      // radius this design exists to remove. A finding nobody can attribute is
      // reported as it is, which is already an order of magnitude better than
      // the 873 undifferentiated problems this replaced.
      return {
        findings: [...blocking, ...advisory],
        failure: { kind: 'unlocatable' },
        outcomes,
        assemblyRounds,
      }
    }

    assemblyRounds++
    for (const [index, sentBack] of routed) {
      const segment = plan.segments[index]
      onProgress?.(
        `${sourceLabel} [segment ${index + 1}/${plan.segments.length}${describe(segment)}] sent back by the assembled document: ${summarise(sentBack)}`,
      )
      await workOn(segment, sentBack)
    }
  }
}

const describe = (segment: Segment) =>
  segment.label.heading ? ` ‹${segment.label.heading}›` : ''

const summarise = (findings: readonly TranslationFinding[]) =>
  findings
    .slice(0, 3)
    .map((finding) => finding.rule)
    .join(', ') + (findings.length > 3 ? `, +${findings.length - 3} more` : '')

/**
 * Which segment each whole-document finding belongs to.
 *
 * Two routes, because the findings arrive in two shapes:
 *
 * - **a placeholder** names its segment exactly — the token belongs to one
 *   segment's table and no other. This is the important one: it covers every
 *   way the masked round trip can fail;
 * - **a line number** is looked up in the composed document, whose block
 *   structure is the one assembly recorded.
 *
 * The pairwise rules — `translation-component-multiset`,
 * `translation-heading-sequence` and the rest — report against the document as
 * a whole and carry no usable line, so they cannot be routed at all. That is
 * why the same comparisons are made per segment during acceptance, where they
 * arrive with a segment attached. One of them firing *here*, after every
 * segment passed the same comparison, means assembly itself did something —
 * and that is worth failing loudly for rather than retrying blindly.
 */
const route = ({
  findings,
  plan,
  placements,
  document,
  processor,
}: {
  findings: readonly TranslationFinding[]
  plan: { segments: Segment[] }
  placements: readonly { segment: number; address: Segment['address'] }[]
  document?: string
  processor: MaskProcessor
}) => {
  const routed = new Map<number, TranslationFinding[]>()
  const add = (index: number, finding: TranslationFinding) => {
    const list = routed.get(index)
    if (list) {
      list.push(finding)
    } else {
      routed.set(index, [finding])
    }
  }

  const byPlaceholder = new Map<string, number>()
  for (const segment of plan.segments) {
    for (const token of segment.expected.keys()) {
      byPlaceholder.set(token, segment.index)
    }
  }

  const spans = document ? lineSpans(document, placements, processor) : []

  for (const finding of findings) {
    const token = finding.placeholder?.toLowerCase()
    const owner = token ? byPlaceholder.get(token) : undefined
    if (owner != null) {
      add(owner, finding)
      continue
    }
    if (finding.line == null || finding.line <= 0) {
      continue
    }
    const span = spans.find(
      ({ start, end }) => finding.line! >= start && finding.line! <= end,
    )
    if (span) {
      add(span.segment, finding)
    }
  }

  return routed
}

/** Which lines of the composed document each segment occupies. */
const lineSpans = (
  document: string,
  placements: readonly { segment: number; address: Segment['address'] }[],
  processor: MaskProcessor,
) => {
  let tree: Root
  try {
    tree = processor.parse(document)
  } catch {
    return []
  }
  const shift = tree.children[0]?.type === 'yaml' ? 1 : 0

  const spans: { segment: number; start: number; end: number }[] = []
  for (const { segment, address } of placements) {
    if (address.kind === 'attributes') {
      const node = resolveAttributeNode(tree, address, shift)
      const position = node?.position
      if (position) {
        spans.push({
          segment,
          start: position.start.line,
          end: position.end.line,
        })
      }
      continue
    }
    const resolved = resolvePlacement(tree, address, shift)
    const first = resolved?.nodes.at(0)?.position?.start.line
    const last = resolved?.nodes.at(-1)?.position?.end.line
    if (first != null && last != null) {
      spans.push({ segment, start: first, end: last })
    }
  }
  return spans
}
