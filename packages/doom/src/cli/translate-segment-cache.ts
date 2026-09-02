import type { Root } from 'mdast'
import type { MdxJsxAttribute } from 'mdast-util-mdx'

import { isTranslatableJsxAttr } from '../runtime/components/_translation-policy.ts'

import {
  countPlaceholders,
  type MaskEntry,
  type MaskProcessor,
  maskAst,
} from './translate-mask.ts'
import {
  type DefinitionContext,
  type Segment,
  type SegmentAddress,
  type SegmentPlan,
  type SegmentRecord,
  definitionContext,
  parseWithDefinitions,
  resolveAttributeNode,
  resolvePlacement,
} from './translate-segment.ts'

/**
 * Reusing the segments whose source did not change.
 *
 * `sourceSHA` already skips a document nobody touched. This is the layer below
 * it: when a document *has* changed, only the segments that changed are
 * retranslated. The edit that set off the incident this work came from was one
 * line — `+1/-1` — and it cost a full retranslation of 3122 lines. Under this
 * it costs one segment.
 *
 * Two things make that safe to do.
 *
 * **The previous translation is on disk with its real content, not its masked
 * content.** A reusable segment has to be masked again to be comparable, and it
 * cannot simply be re-masked with fresh numbering — the numbers would be the
 * translation's, not the current source's. So each masked value in the
 * candidate is matched *by value* against the mask entries the current source
 * issued for that segment, and the candidate's tokens are rewritten to the
 * source's. This is done by running the same {@link maskAst} the rest of the
 * pipeline runs, so there is no second opinion about what counts as maskable.
 *
 * **Nothing is trusted because it was written down.** A record says where a
 * segment went; it does not say the file still holds it. Somebody may have
 * edited the translation by hand, a merge may have moved things, the record may
 * simply be stale. So every candidate has to survive the match above and come
 * out with exactly the placeholders the current source expects — and anything
 * that does not is retranslated rather than reused. A cache entry that cannot
 * be verified for free is worth nothing, because the failure it causes looks
 * exactly like a translation defect.
 */

/** The `i18nSegments` block, as it is written into a translation's frontmatter. */
export interface SegmentCacheRecord {
  /** `SEGMENTER_VERSION` the cut was made under. */
  v: number
  /** The cap it was made under. */
  cap: number
  /** One entry per reusable segment. */
  segs: string[]
}

/**
 * One record, as one short string.
 *
 * `<sha> <start>-<end>` at the top level, `<sha> <path>/<start>-<end>` inside a
 * container, `<sha> <path>:attrs` for a tag's own words. Compact because it
 * lives in every translated document's frontmatter, and readable because the
 * first thing anyone does with an unexpected diff is read it.
 */
export const encodeRecord = ({ sha, address }: SegmentRecord) => {
  const container = address.container.join('/')
  if (address.kind === 'attributes') {
    return `${sha} ${container}:attrs`
  }
  const range = `${address.start}-${address.end}`
  return `${sha} ${container ? `${container}/${range}` : range}`
}

export const decodeRecord = (entry: string): SegmentRecord | undefined => {
  const [sha, locator] = entry.trim().split(/\s+/u)
  if (!sha || !locator || !/^[0-9a-f]{12}$/u.test(sha)) {
    return undefined
  }
  if (locator.endsWith(':attrs')) {
    const path = locator.slice(0, -':attrs'.length)
    const container = parsePath(path)
    return container && container.length > 0
      ? { sha, address: { kind: 'attributes', container } }
      : undefined
  }
  const cut = locator.lastIndexOf('/')
  const path = cut < 0 ? '' : locator.slice(0, cut)
  const range = cut < 0 ? locator : locator.slice(cut + 1)
  const match = /^(\d+)-(\d+)$/u.exec(range)
  const container = parsePath(path)
  if (!match || !container) {
    return undefined
  }
  const start = Number(match[1])
  const end = Number(match[2])
  return end < start
    ? undefined
    : { sha, address: { kind: 'blocks', container, start, end } }
}

const parsePath = (path: string) => {
  if (path === '') {
    return []
  }
  const parts = path.split('/').map(Number)
  return parts.every((part) => Number.isInteger(part) && part >= 0)
    ? parts
    : undefined
}

export const encodeCacheRecord = (
  plan: Pick<SegmentPlan, 'version' | 'cap'>,
  records: readonly SegmentRecord[],
): SegmentCacheRecord | undefined =>
  records.length === 0
    ? undefined
    : { v: plan.version, cap: plan.cap, segs: records.map(encodeRecord) }

export interface MatchCachedSegmentsOptions {
  plan: SegmentPlan
  maskEntries: readonly MaskEntry[]
  processor: MaskProcessor
  /** Its `i18nSegments`, as parsed out of that frontmatter. */
  record: SegmentCacheRecord | undefined
  /**
   * The body of the previous translation — everything after the frontmatter.
   *
   * The body rather than the file, because that is the coordinate system the
   * records were written in: `compose` rewrites frontmatter on the way out, so
   * counting it as block 0 would put every address off by one.
   */
  previousBody: string
}

export interface CachedSegments {
  /** Masked translations, by segment index, ready to freeze. */
  reuse: Map<number, string>
  /** Why nothing was reused, when nothing was. For the log. */
  reason?: string
}

/**
 * Which of this document's segments can be taken from the previous translation.
 *
 * The two hash sequences are matched with a longest-common-subsequence, so a
 * segment inserted in the middle of a page shifts nothing after it and two
 * identical segments cannot swap places. Every match is then verified, and only
 * what survives is offered.
 */
export const matchCachedSegments = ({
  plan,
  maskEntries,
  processor,
  record,
  previousBody,
}: MatchCachedSegmentsOptions): CachedSegments => {
  const reuse = new Map<number, string>()

  if (!record) {
    return { reuse, reason: 'the previous translation has no segment record' }
  }
  if (record.v !== plan.version) {
    return {
      reuse,
      reason: `the previous translation was cut by segmenter v${record.v}, this run is v${plan.version}`,
    }
  }
  if (record.cap !== plan.cap) {
    return {
      reuse,
      reason: `the previous translation was cut at ${record.cap} characters, this run cuts at ${plan.cap}`,
    }
  }

  const previousRecords = record.segs
    .map(decodeRecord)
    .filter((entry): entry is SegmentRecord => !!entry)
  if (previousRecords.length !== record.segs.length) {
    return { reuse, reason: 'the previous segment record is malformed' }
  }

  let tree: Root
  try {
    tree = processor.parse(previousBody)
  } catch {
    return { reuse, reason: 'the previous translation does not parse' }
  }

  const entriesByToken = new Map(
    maskEntries.map((entry) => [entry.placeholder.toLowerCase(), entry]),
  )
  // Computed once for the document, not once per segment: it walks the whole
  // previous translation, and every segment is asked about the same one.
  const context = definitionContext(tree, processor)

  for (const [index, previousIndex] of alignBySha(
    plan.segments.map((segment) => segment.sha),
    previousRecords.map((entry) => entry.sha),
  )) {
    const segment = plan.segments[index]
    const candidate = extract({
      tree,
      address: previousRecords[previousIndex].address,
      processor,
      context,
    })
    if (candidate == null) {
      continue
    }
    const remasked = remask({
      candidate,
      segment,
      entriesByToken,
      processor,
    })
    if (remasked != null) {
      reuse.set(index, remasked)
    }
  }

  return { reuse }
}

/**
 * The longest run of segments, in order, whose hashes agree.
 *
 * A plain two-pointer walk loses alignment for the rest of the page the moment
 * one segment is inserted or removed. This is the standard subsequence instead:
 * pairs never cross, so two identical segments cannot be matched to each
 * other's positions, and an edit only costs the segment it touched.
 */
export const alignBySha = (
  current: readonly string[],
  previous: readonly string[],
): Array<[number, number]> => {
  const rows = current.length
  const columns = previous.length
  const lengths: number[][] = Array.from({ length: rows + 1 }, () =>
    Array.from({ length: columns + 1 }, () => 0),
  )
  for (let row = rows - 1; row >= 0; row--) {
    for (let column = columns - 1; column >= 0; column--) {
      lengths[row][column] =
        current[row] === previous[column]
          ? lengths[row + 1][column + 1] + 1
          : Math.max(lengths[row + 1][column], lengths[row][column + 1])
    }
  }
  const pairs: Array<[number, number]> = []
  let row = 0
  let column = 0
  while (row < rows && column < columns) {
    if (current[row] === previous[column]) {
      pairs.push([row, column])
      row++
      column++
    } else if (lengths[row + 1][column] >= lengths[row][column + 1]) {
      row++
    } else {
      column++
    }
  }
  return pairs
}

/** The previous translation of one segment, as it sits on disk: restored, not masked. */
const extract = ({
  tree,
  address,
  processor,
  context,
}: {
  tree: Root
  address: SegmentAddress
  processor: MaskProcessor
  /**
   * The previous translation's own reference definitions.
   *
   * The blocks are re-parsed on their own below, and `[text][label]`, `![x][fig]`
   * and `[^1]` are only reference nodes while the definition they name is in
   * scope. A segment whose definitions live in a *different* segment therefore
   * parsed as plain bracketed text, `maskAst` found no reference to mask, and
   * the candidate could not account for the `REFID`/`FNID` the current source
   * expects — so it was rejected and the segment retranslated although nothing
   * about it had changed. That is the same defect assembly had, on the other
   * side of the cache, and it is resolved the same way.
   */
  context?: DefinitionContext
}): Root | undefined => {
  if (address.kind === 'attributes') {
    const node = resolveAttributeNode(tree, address)
    if (!node) {
      return undefined
    }
    const attrs = node.attributes.filter(
      (attr): attr is MdxJsxAttribute =>
        attr.type === 'mdxJsxAttribute' &&
        typeof attr.value === 'string' &&
        isTranslatableJsxAttr(node.name, attr.name),
    )
    return attrs.length === 0
      ? undefined
      : {
          type: 'root',
          children: [
            {
              type: 'mdxJsxFlowElement',
              name: node.name,
              attributes: attrs.map((attr) => ({ ...attr })),
              children: [],
            },
          ],
        }
  }
  const resolved = resolvePlacement(tree, address)
  if (!resolved) {
    return undefined
  }
  // Re-parsed rather than reused: masking mutates, and the tree these nodes
  // came from is the caller's.
  try {
    return {
      type: 'root',
      children: parseWithDefinitions(
        processor.stringify({ type: 'root', children: resolved.nodes }),
        context,
        processor,
      ),
    }
  } catch {
    return undefined
  }
}

/**
 * Puts this document's placeholders back into a translation that has none.
 *
 * The candidate is masked with {@link maskAst}, which numbers from zero for
 * whatever it is given; those numbers mean nothing here. What does mean
 * something is *what* was masked, so each candidate entry is matched to a
 * segment entry of the same kind holding the same value, and the candidate's
 * tokens are rewritten accordingly — in one pass, so a token that is both a
 * source and a target of the rewrite cannot be replaced twice.
 *
 * Anything that does not line up exactly returns nothing, and the segment is
 * translated again. That covers a hand-edited translation, a stale record, a
 * link somebody fixed by hand in the target language — every way a cache entry
 * can be quietly wrong.
 */
const remask = ({
  candidate,
  segment,
  entriesByToken,
  processor,
}: {
  candidate: Root
  segment: Segment
  entriesByToken: ReadonlyMap<string, MaskEntry>
  processor: MaskProcessor
}): string | undefined => {
  const wanted = [...segment.expected.keys()]
    .map((token) => entriesByToken.get(token))
    .filter((entry): entry is MaskEntry => !!entry)
  if (wanted.length !== segment.expected.size) {
    return undefined
  }

  let candidateEntries: MaskEntry[]
  let masked: string
  try {
    candidateEntries = maskAst(candidate)
    masked = processor.stringify(candidate)
  } catch {
    // Includes the case where the previous translation already contains a
    // reserved token, which is not something to paper over.
    return undefined
  }

  const available = new Map<string, string[]>()
  for (const entry of wanted) {
    const key = valueKey(entry)
    const list = available.get(key)
    if (list) {
      list.push(entry.placeholder)
    } else {
      available.set(key, [entry.placeholder])
    }
  }

  const rewrite = new Map<string, string>()
  for (const entry of candidateEntries) {
    const list = available.get(valueKey(entry))
    const replacement = list?.shift()
    if (!replacement) {
      // The translation holds something this segment's source does not — it has
      // been edited, or the record points somewhere else entirely.
      return undefined
    }
    rewrite.set(entry.placeholder.toLowerCase(), replacement)
  }
  for (const list of available.values()) {
    if (list.length > 0) {
      return undefined
    }
  }

  const remasked = masked.replace(/__DOOM_TR_[A-Z]+_\d+__/giu, (token) => {
    return rewrite.get(token.toLowerCase()) ?? token
  })

  // The last word is the same measurement the segment check would make.
  const counts = countPlaceholders(remasked)
  if (counts.size !== segment.expected.size) {
    return undefined
  }
  for (const [token, expected] of segment.expected) {
    if (counts.get(token) !== expected) {
      return undefined
    }
  }

  return remasked
}

/** What a mask entry actually protects, as a comparable string. */
const valueKey = (entry: MaskEntry) => {
  switch (entry.kind) {
    case 'DEF':
    case 'IMG':
    case 'LINK': {
      return `${entry.kind}\0${entry.url}`
    }
    case 'FNID':
    case 'REFID': {
      return `${entry.kind}\0${entry.identifier.toLowerCase()}`
    }
    case 'CODE': {
      return `CODE\0${entry.node.lang ?? ''}\0${entry.node.meta ?? ''}\0${entry.node.value}`
    }
    case 'URL': {
      return `URL\0${entry.node.url}`
    }
    case 'JSXATTR': {
      return `JSXATTR\0${entry.attrKind}\0${
        typeof entry.value === 'string' ? entry.value : entry.value.value
      }`
    }
    default: {
      return `${entry.kind}\0${entry.value}`
    }
  }
}
