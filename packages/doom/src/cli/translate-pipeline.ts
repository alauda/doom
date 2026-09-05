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
  type SegmentPlan,
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

/**
 * How many times the assembled document may send segments back.
 *
 * Raised from 2 on 2026-09-03. At 2, the only rule that ever fired here in
 * production — `no-unparsed-emphasis`, 22 send-backs out of 22 across four
 * builds of `immutable-infra-docs` — failed three of six documents by running
 * out of rounds, and a document that fails discards every other document's
 * accepted work in the same run. The model does fix it; it does not always fix
 * it twice in a row.
 *
 * This is the backstop, not the fix: that rule is now also checked per segment,
 * where it gets three attempts and a repair agent before it ever reaches here.
 */
export const DEFAULT_MAX_ASSEMBLY_ROUNDS = 4

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
  /** The translation stopped on an error — a gateway that never answered, or a bug. Nothing was written. */
  | { kind: 'error'; detail: string }

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

  let plan: SegmentPlan
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
  /**
   * Whether the reviewer is looking at a piece of a page or at the page.
   *
   * A one-segment document is not a fragment, and must not be reviewed as one:
   * the fragment prompt stops counting a missing beginning or end as an
   * omission, and on a page that *is* the segment those are the omissions.
   * Half of this corpus is a single segment, and there the segment reviewer is
   * the only blocking semantic check there is.
   */
  const fragment = plan.segments.length > 1
  /**
   * The page's headings, with the segment's own section marked.
   *
   * Rendered per segment rather than once: the list is the same, but the mark
   * is what makes it useful — the prompt tells the model this is "so you know
   * where the segment sits", and an unmarked list does not say that.
   */
  const headings = documentOutline(tree)
  const outlines = new Map<number, string>()
  const outlineFor = (segment: Segment) => {
    let rendered = outlines.get(segment.index)
    if (rendered == null) {
      rendered = renderOutline(headings, segment.label.headingLine)
      outlines.set(segment.index, rendered)
    }
    return rendered
  }

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
  /**
   * The non-blocking notes each segment came back with, by segment.
   *
   * Kept per segment and replaced rather than appended to, because a segment
   * can be worked on more than once — a later assembly round can send it back
   * — and a note from the attempt that was superseded is not a note about the
   * document that shipped. Appending printed the same readability remark twice
   * for every segment that was ever revisited.
   */
  const advisoryBySegment: TranslationFinding[][] = []
  /** Notes about the assembled page, which belong to no segment. */
  const documentAdvisory: TranslationFinding[] = []
  const advisory = () => [...advisoryBySegment.flat(), ...documentAdvisory]

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
    // A page that is a heading and an `<Overview />` has nothing for a
    // reviewer to read, and the deterministic layers already hold the heading
    // to the source. Half the index pages of a site are exactly that.
    const judge = hasProse(segment) ? segmentJudge : undefined
    if (segmentJudge && !judge && !sentBack) {
      onProgress?.(
        `${sourceLabel} [segment ${segment.index + 1}/${plan.segments.length}${describe(segment)}] not reviewed: nothing but headings and components`,
      )
    }

    for (let attempt = 1; attempt <= maxSegmentAttempts; attempt++) {
      outcome.attempts++
      const translation = await translator.translate({
        segment,
        outline: outlineFor(segment),
        previousTail: previousTail(segment),
        attempt,
        retry,
      })
      const findings = await checkSegment({
        segment,
        translation,
        processor,
        documentTokens,
        judge,
        fragment,
        sourceLanguage,
        targetLanguage,
        terms,
      })
      const blocking = blockingFindings(findings)

      if (blocking.length === 0) {
        frozen[segment.index] = translation
        outcome.status = 'translated'
        outcome.findings = []
        advisoryBySegment[segment.index] = findings
        return true
      }

      outcome.history.push(findings)
      const previousBest = best[segment.index]
      if (!previousBest || blocking.length < previousBest.blocking) {
        best[segment.index] = { text: translation, blocking: blocking.length }
      }
      retry = { previous: translation, findings }
      onProgress?.(
        `${sourceLabel} [segment ${segment.index + 1}/${plan.segments.length}${describe(segment)}] attempt ${attempt} rejected: ${summarise(blocking)}${reasons(blocking)}`,
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
            fragment,
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
          fragment,
          sourceLanguage,
          targetLanguage,
          terms,
        })
        if (blockingFindings(findings).length === 0) {
          frozen[segment.index] = repaired
          outcome.status = 'repaired'
          outcome.findings = []
          advisoryBySegment[segment.index] = findings
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
        documentAdvisory.push(
          ...whole.map((finding) => ({ ...finding, blocking: false })),
        )
      }
      return {
        document,
        findings: [...findings, ...advisory()],
        outcomes,
        assemblyRounds,
        records: assembled.records,
      }
    }

    if (assemblyRounds >= maxAssemblyRounds) {
      return {
        findings: [...blocking, ...advisory()],
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
        findings: [...blocking, ...advisory()],
        failure: { kind: 'unlocatable' },
        outcomes,
        assemblyRounds,
      }
    }

    assemblyRounds++
    for (const [index, sentBack] of routed) {
      const segment = plan.segments[index]
      onProgress?.(
        `${sourceLabel} [segment ${index + 1}/${plan.segments.length}${describe(segment)}] sent back by the assembled document: ${summarise(sentBack)}${reasons(sentBack)}`,
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
 * What the findings said, one per line under the summary.
 *
 * The rule names alone were what the build log used to carry, and they are
 * not enough to tell a reviewer that is right from one that is not: on
 * 2026-09-04 that question needed a day of probing to answer, because the
 * reviewer's reasons for 29 rejections had been printed nowhere. Now they
 * are in the log, where a person can read them.
 */
const reasons = (findings: readonly TranslationFinding[]) =>
  findings
    .slice(0, 3)
    .map(
      (finding) =>
        `\n    ${finding.rule}: ${finding.reason.length > 240 ? `${finding.reason.slice(0, 240)}…` : finding.reason}`,
    )
    .join('')

/**
 * Whether a segment has any text a reviewer could judge.
 *
 * Frontmatter, headings, blank lines, lines that are only a component tag or
 * a placeholder do not count: a heading is held to the source by the structure
 * check, a tag by the component multiset, a placeholder by the count.
 */
export const hasProse = (segment: Pick<Segment, 'text'>) => {
  const body = segment.text.replace(/^---\n[\s\S]*?\n---\n?/u, '')
  return body.split('\n').some((line) => {
    const text = line.trim()
    if (text === '' || text.startsWith('#')) {
      return false
    }
    if (/^<\/?[A-Za-z][^>]*>$/u.test(text) || /^\{.*\}$/u.test(text)) {
      return false
    }
    return /[\p{L}\p{N}]/u.test(text.replace(/__DOOM_TR_[A-Z]+_\d+__/gu, ''))
  })
}

/**
 * Rules that compare the translation with its source across the whole tree.
 *
 * Every one of them reports on the root node, so `line` is 1 no matter where
 * the defect is. Treating that 1 as a location is how a page without
 * frontmatter used to send its first segment back for something that segment
 * had nothing to do with.
 */
const PAIRWISE_RULE_PREFIX = 'doom-lint:translation-'

/**
 * Which segment each whole-document finding belongs to.
 *
 * Two routes, because the findings arrive in two shapes:
 *
 * - **a placeholder** names its segments exactly — the token belongs to those
 *   segments' tables and no others. This is the important one: it covers every
 *   way the masked round trip can fail. Reference and footnote labels
 *   (`REFID`/`FNID`) are shared linkage keys, so a definition and its uses can
 *   sit in different segments; all of them are asked again, because which one
 *   dropped the label is exactly what the finding does not say;
 * - **a line number** is looked up in the composed document, whose block
 *   structure is the one assembly recorded. When several segments' spans
 *   contain the line — a drilled container's tag segment covers every line of
 *   its children — the **narrowest** one is the owner. A child is always
 *   narrower than the container it sits in.
 *
 * The pairwise rules — `translation-component-multiset`,
 * `translation-heading-sequence` and the rest — report against the document as
 * a whole and always land on line 1, which is not a location: on a page with
 * frontmatter that line belongs to nobody, and on a page without one it belongs
 * to the first segment by accident. So they are recognised by name and never
 * routed by line, which is what makes the same defect fail the same way on both
 * kinds of page. That is also why the same comparisons are made per segment
 * during acceptance, where they arrive with a segment attached. One of them
 * firing *here*, after every segment passed the same comparison, means assembly
 * itself did something — and that is worth failing loudly for rather than
 * retrying blindly.
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

  const byPlaceholder = new Map<string, number[]>()
  for (const segment of plan.segments) {
    for (const token of segment.expected.keys()) {
      const owners = byPlaceholder.get(token)
      if (owners) {
        owners.push(segment.index)
      } else {
        byPlaceholder.set(token, [segment.index])
      }
    }
  }

  const spans = document ? lineSpans(document, placements, processor) : []

  for (const finding of findings) {
    const token = finding.placeholder?.toLowerCase()
    const owners = token ? byPlaceholder.get(token) : undefined
    if (owners?.length) {
      for (const owner of owners) {
        add(owner, finding)
      }
      continue
    }
    if (
      finding.line == null ||
      finding.line <= 0 ||
      finding.rule.startsWith(PAIRWISE_RULE_PREFIX)
    ) {
      continue
    }
    const line = finding.line
    let owner: (typeof spans)[number] | undefined
    for (const span of spans) {
      if (line < span.start || line > span.end) {
        continue
      }
      if (!owner || span.end - span.start < owner.end - owner.start) {
        owner = span
      }
    }
    if (owner) {
      add(owner.segment, finding)
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
