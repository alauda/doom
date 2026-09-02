import crypto from 'node:crypto'

import type { Root, RootContent } from 'mdast'
import type { MdxJsxAttribute, MdxJsxFlowElement } from 'mdast-util-mdx'

import { isTranslatableJsxAttr } from '../runtime/components/_translation-policy.ts'

import { countPlaceholders, type MaskProcessor } from './translate-mask.ts'

/**
 * Cutting one document into the units everything else works in.
 *
 * The unit of work, the unit of acceptance, the unit of retry and the unit of
 * caching are all this: a segment. Before this existed they were all "the whole
 * document", while the unit of *failure* was a single placeholder — so a
 * document with 871 placeholders had to win 871 coin tosses at once, and losing
 * any one of them threw away every correct one along with it.
 *
 * Cutting is done by code rather than by a model, and it is deterministic: the
 * same source and the same parameters produce byte-identical segments. That is
 * not tidiness, it is what the segment cache stands on — a segment whose source
 * has not changed is recognised by its hash, and a hash is only meaningful if
 * the cut is reproducible. Any change to the algorithm or its defaults must
 * bump {@link SEGMENTER_VERSION}, which invalidates every recorded segment.
 */

/**
 * Bumped whenever the cut changes.
 *
 * Recorded in each translation's `i18nSegments`; a translation recorded under a
 * different version is retranslated whole rather than trusted.
 */
export const SEGMENTER_VERSION = 1

/**
 * How large a segment may get, in masked characters.
 *
 * Roughly 4k tokens of source, whose translation is far inside the 32k
 * single-response cap. Measured against the four documents from the incident:
 * at this cap the hardest segment carries 154 placeholders, below the 307 of
 * the one document that reliably succeeded whole, and the median segment
 * carries 25.
 */
export const DEFAULT_SEGMENT_CAP = 16_000

/**
 * The size past which a single indivisible block fails the document.
 *
 * A block that is over {@link DEFAULT_SEGMENT_CAP} and cannot be drilled into
 * — a huge table, a huge list — becomes a segment of its own and is allowed to
 * exceed the cap. This is where that stops. Measured over 1030 documents: the
 * largest such block is 24.3 KB, so this is a guard rail rather than a path.
 */
export const DEFAULT_SEGMENT_HARD_CAP = 48_000

/**
 * How large a segment must already be before a heading is allowed to end it.
 *
 * Without a floor, "start a new segment at every `##`" fragments a
 * section-dense page into uselessly small pieces: measured over 1030
 * documents, one CLI reference of 11,948 masked characters — a page that fits
 * in a single segment by size — cut into 104 segments averaging 115
 * characters. Each of those is a model call and a judge reading.
 *
 * Measured across the same corpus, this floor halves the work without
 * coarsening the documents that matter: 3645 segments become 1750, the median
 * segment grows from 484 to 1986 characters, and the document this design was
 * written for is cut into 13 segments either way — it has real sections, so
 * the floor never fires on it. The most-segmented document in the corpus stops
 * being a page of one-line headings and becomes that one.
 *
 * Merging adjacent small sections costs the cache almost nothing (an edit to a
 * 300-character section retranslates 600 characters instead of 300, while the
 * rest of the page is still reused) and helps everywhere else: more context
 * per call, and fewer of the very short texts where a reviewer is most likely
 * to invent a finding.
 */
export const DEFAULT_SEGMENT_FLOOR = 2_000

/**
 * Where a segment lives in the tree.
 *
 * `container` is the path of ancestor child-indices to the node whose
 * `children` the segment addresses — empty for the top level. `blocks` names a
 * half-open range of those children; `attributes` names the container node
 * itself, and covers the prose carried by its own tag rather than by its
 * children.
 */
export type SegmentAddress =
  | { kind: 'blocks'; container: number[]; start: number; end: number }
  | { kind: 'attributes'; container: number[] }

export interface SegmentLabel {
  /** Line the segment starts on, in the source. */
  line?: number
  /** The section it falls under. Both are for people reading a build log. */
  heading?: string
}

export interface Segment {
  /** Position in {@link SegmentPlan.segments}; how a translation is matched back. */
  index: number
  address: SegmentAddress
  /** The masked text handed to the model — a standalone, parseable document. */
  text: string
  /**
   * How many times each placeholder must come back, keyed by the canonical
   * lower-case token.
   *
   * Measured from {@link text} with the same function that will measure the
   * translation, so the comparison is between two measurements of the same
   * kind rather than between a text count and a tree count.
   */
  expected: Map<string, number>
  /** `sha256(kind + text)`, first 12 hex digits. The segment cache's key. */
  sha: string
  label: SegmentLabel
}

export interface SegmentPlan {
  segments: Segment[]
  cap: number
  version: number
  /**
   * Placeholders that belong to no segment.
   *
   * When a container is drilled into, its own opening and closing tags are held
   * by the assembler and never sent to a model — so the placeholders masked
   * into its attributes are never asked for back. They are counted here so the
   * conservation check stays exact rather than being loosened to accommodate
   * them.
   */
  heldOut: Map<string, number>
}

/** A block too large to send and impossible to divide. */
export class UnsplittableBlockError extends Error {
  constructor(
    readonly size: number,
    readonly hardCap: number,
    readonly label: SegmentLabel,
  ) {
    super(
      `This document contains a single block of ${size} characters that cannot be divided (line ${label.line ?? '?'}${label.heading ? `, under “${label.heading}”` : ''}). The limit is ${hardCap}. Split it in the source — a table or list this large is also unreadable.`,
    )
    this.name = 'UnsplittableBlockError'
  }
}

/**
 * Raised when the segments do not add up to the document.
 *
 * The first line of defence against the segmenter itself losing content: if
 * every placeholder in the masked document is not accounted for exactly once
 * across the segments and the held-out tags, the cut is wrong, and no amount of
 * good translation downstream would reveal it.
 */
export class SegmentConservationError extends Error {
  constructor(readonly divergences: readonly string[]) {
    super(
      `The segmenter did not conserve the document's placeholders:\n${divergences
        .map((line) => `  - ${line}`)
        .join('\n')}`,
    )
    this.name = 'SegmentConservationError'
  }
}

/** Raised when a translated segment cannot be put back where it came from. */
export class SegmentAssemblyError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SegmentAssemblyError'
  }
}

/**
 * Node types that stand on their own as a block.
 *
 * A container is only drilled into when all of its children are one of these:
 * a segment is stringified as a document, and phrasing content is not a
 * document. `<Note>some **text**</Note>` therefore stays whole, which is what
 * we want for something that small anyway.
 */
const FLOW_TYPES = new Set([
  'blockquote',
  'code',
  'definition',
  'footnoteDefinition',
  'heading',
  'html',
  'list',
  'mdxFlowExpression',
  'mdxJsxFlowElement',
  'paragraph',
  'table',
  'thematicBreak',
  'yaml',
])

const isDrillable = (node: RootContent): node is MdxJsxFlowElement =>
  node.type === 'mdxJsxFlowElement' &&
  node.children.length > 0 &&
  node.children.every((child) => FLOW_TYPES.has(child.type))

/** The attributes on a tag that carry prose, and so still need translating. */
const translatableAttributes = (node: MdxJsxFlowElement): MdxJsxAttribute[] =>
  node.attributes.filter(
    (attr): attr is MdxJsxAttribute =>
      attr.type === 'mdxJsxAttribute' &&
      typeof attr.value === 'string' &&
      attr.value.trim() !== '' &&
      isTranslatableJsxAttr(node.name, attr.name),
  )

/** Everything a tag's attributes hold, as one string, for counting placeholders. */
const attributeText = (node: MdxJsxFlowElement) =>
  node.attributes
    .map((attr) => {
      if (attr.type === 'mdxJsxExpressionAttribute') {
        return attr.value
      }
      if (attr.value == null) {
        return ''
      }
      return typeof attr.value === 'string' ? attr.value : attr.value.value
    })
    .join('\n')

const addCounts = (into: Map<string, number>, from: Map<string, number>) => {
  for (const [token, count] of from) {
    into.set(token, (into.get(token) ?? 0) + count)
  }
}

const shaOf = (kind: string, text: string) =>
  crypto
    .createHash('sha256')
    .update(`${kind}\0${text}`)
    .digest('hex')
    .slice(0, 12)

/** A heading's own words, with placeholders taken out — this is a label, not content. */
const headingText = (node: RootContent): string | undefined => {
  if (node.type !== 'heading') {
    return undefined
  }
  const words: string[] = []
  const walk = (value: unknown) => {
    if (Array.isArray(value)) {
      value.forEach(walk)
      return
    }
    if (!value || typeof value !== 'object') {
      return
    }
    const node_ = value as { type?: string; value?: string; children?: unknown }
    if (typeof node_.value === 'string' && node_.type === 'text') {
      words.push(node_.value)
    }
    walk(node_.children)
  }
  walk(node.children)
  const text = words.join('').trim()
  return text === '' ? undefined : text
}

/** Every heading on the page, in order — the map a segment is placed on. */
export const documentOutline = (tree: Root) => {
  const headings: { depth: number; text: string }[] = []
  const walk = (children: readonly RootContent[]) => {
    for (const child of children) {
      if (child.type === 'heading') {
        const text = headingText(child)
        if (text) {
          headings.push({ depth: child.depth, text })
        }
      }
      if ('children' in child && Array.isArray(child.children)) {
        walk(child.children)
      }
    }
  }
  walk(tree.children)
  return headings
}

export interface PlanSegmentsOptions {
  /** The masked tree, exactly as it will be sent and assembled. */
  tree: Root
  processor: MaskProcessor
  cap?: number
  hardCap?: number
  floor?: number
}

/**
 * Cuts a masked document into segments.
 *
 * Three rules, applied in order, all of them deterministic:
 *
 * 1. **an `##` heading starts a new segment**, once the open one has reached
 *    {@link DEFAULT_SEGMENT_FLOOR}, so segments line up with the sections an
 *    author edits — which is what makes the cache hit after an ordinary edit,
 *    and what makes a failure report nameable — without a page of one-line
 *    sections turning into a page of one-line segments;
 * 2. **the cap closes a segment**, greedily;
 * 3. **a container larger than the cap is drilled into** rather than sent
 *    whole. The 24.9 KB `<Tabs>` in the document that failed is four ordinary
 *    segments under this rule. Its tag is held by the assembler; the prose on
 *    the tag — a `<Tab label>` — becomes a segment of its own, because
 *    otherwise it would be the one piece of the document nobody translates.
 *
 * The frontmatter is never a segment of its own: it joins the segment that
 * follows it, so the model sees `title` and `description` in the context of the
 * page they belong to.
 */
export const planSegments = ({
  tree,
  processor,
  cap = DEFAULT_SEGMENT_CAP,
  hardCap = DEFAULT_SEGMENT_HARD_CAP,
  floor = Math.min(DEFAULT_SEGMENT_FLOOR, cap),
}: PlanSegmentsOptions): SegmentPlan => {
  const segments: Segment[] = []
  const heldOut = new Map<string, number>()

  const stringifyBlocks = (children: readonly RootContent[]): string =>
    processor.stringify({ type: 'root', children: [...children] })

  const push = (address: SegmentAddress, text: string, label: SegmentLabel) => {
    segments.push({
      index: segments.length,
      address,
      text,
      expected: countPlaceholders(text),
      sha: shaOf(address.kind, text),
      label,
    })
  }

  /** The section heading in force, carried down into drilled containers. */
  const section: { heading?: string } = {}

  const walk = (children: RootContent[], container: number[]) => {
    let start = -1
    let size = 0
    /** Whether the open group holds anything but frontmatter. */
    let hasContent = false
    let label: SegmentLabel = {}

    const flush = (end: number) => {
      if (start < 0 || end <= start) {
        return
      }
      const slice = children.slice(start, end)
      push(
        { kind: 'blocks', container, start, end },
        stringifyBlocks(slice),
        label,
      )
      start = -1
      size = 0
      hasContent = false
    }

    for (const [index, child] of children.entries()) {
      const heading = headingText(child)
      if (heading && child.type === 'heading' && child.depth <= 3) {
        section.heading = heading
      }
      const labelHere: SegmentLabel = {
        line: child.position?.start.line,
        heading: section.heading,
      }

      const text = stringifyBlocks([child])

      if (text.length > cap && isDrillable(child)) {
        flush(index)
        const path = [...container, index]
        // The tag stays behind: its placeholders are never asked for back, so
        // they are recorded as held out rather than quietly dropped.
        addCounts(heldOut, countPlaceholders(attributeText(child)))
        const attrs = translatableAttributes(child)
        if (attrs.length > 0) {
          push(
            { kind: 'attributes', container: path },
            stringifyBlocks([attributeElement(child, attrs)]),
            labelHere,
          )
        }
        walk(child.children, path)
        continue
      }

      if (text.length > hardCap) {
        throw new UnsplittableBlockError(text.length, hardCap, labelHere)
      }

      if (hasContent) {
        if (child.type === 'heading' && child.depth === 2 && size >= floor) {
          flush(index)
        } else if (size + text.length > cap) {
          flush(index)
        }
      }

      if (start < 0) {
        start = index
        label = labelHere
      }
      size += text.length
      if (child.type !== 'yaml') {
        hasContent = true
      }

      // A block that is over the cap on its own — an indivisible table or list
      // — closes its segment immediately rather than dragging the next one in.
      if (size > cap && hasContent) {
        flush(index + 1)
      }
    }

    flush(children.length)
  }

  walk(tree.children, [])

  assertConservation(
    { segments, heldOut, cap, version: SEGMENTER_VERSION },
    processor.stringify(tree),
  )

  return { segments, heldOut, cap, version: SEGMENTER_VERSION }
}

/** A tag reduced to the prose on it — a standalone element the model can translate. */
const attributeElement = (
  node: MdxJsxFlowElement,
  attrs: readonly MdxJsxAttribute[],
): MdxJsxFlowElement => ({
  type: 'mdxJsxFlowElement',
  name: node.name,
  attributes: attrs.map((attr) => ({
    type: 'mdxJsxAttribute',
    name: attr.name,
    value: attr.value,
  })),
  children: [],
})

/**
 * Proves the cut lost nothing.
 *
 * Counts every placeholder in the whole masked document and every placeholder
 * across the segments plus the held-out tags, and requires them to be equal.
 * A segmenter that dropped a block, double-counted one, or cut a placeholder in
 * half fails here — before a single model call is spent, and long before the
 * damage could be mistaken for a bad translation.
 */
const assertConservation = (plan: SegmentPlan, maskedSource: string) => {
  const expected = countPlaceholders(maskedSource)
  const actual = new Map(plan.heldOut)
  for (const segment of plan.segments) {
    addCounts(actual, segment.expected)
  }

  const divergences: string[] = []
  for (const [token, count] of expected) {
    const found = actual.get(token) ?? 0
    if (found !== count) {
      divergences.push(
        `${token}: the document has ${count}, the segments account for ${found}`,
      )
    }
  }
  for (const [token, count] of actual) {
    if (!expected.has(token)) {
      divergences.push(
        `${token}: the segments account for ${count}, the document has none`,
      )
    }
  }
  if (divergences.length > 0) {
    throw new SegmentConservationError(divergences)
  }
}

/** Where one segment's translation ended up, so the next run can find it again. */
export interface SegmentRecord {
  sha: string
  address: SegmentAddress
}

export interface AssembleOptions {
  /** The masked source tree the plan was made from. */
  tree: Root
  plan: SegmentPlan
  processor: MaskProcessor
  /** Each segment's accepted translation, by segment index. */
  translations: readonly string[]
}

export interface SegmentPlacement {
  /** Index into {@link SegmentPlan.segments}. */
  segment: number
  address: SegmentAddress
}

export interface AssembleResult {
  /** The whole masked translation, ready to restore. */
  text: string
  /**
   * Where every segment landed, addressed in the *translation*.
   *
   * Top-level indices are relative to the body — the document without its
   * frontmatter — because that is the coordinate system every later reader
   * works in: both the next run, which parses the written file, and the finding
   * router, which parses the composed document.
   */
  placements: SegmentPlacement[]
  /**
   * The subset of {@link placements} worth recording for the next run.
   *
   * The segment carrying the frontmatter is left out: `compose` rewrites
   * frontmatter on the way out, so it is the one place where the assembled tree
   * and the written file can disagree about what block 0 is, and one segment is
   * not worth that risk.
   */
  records: SegmentRecord[]
}

/**
 * Puts the translated segments back into the shape of the source.
 *
 * Assembly is structural, not textual: each translation is parsed into blocks
 * and spliced into the position its segment came from, and the whole tree is
 * stringified once. Segments therefore cannot be lost, duplicated or reordered
 * — not because a check says so afterwards, but because there is no step in
 * which it could happen.
 */
export const assemble = ({
  tree,
  plan,
  processor,
  translations,
}: AssembleOptions): AssembleResult => {
  const blocksAt = new Map<string, Segment>()
  const attrsAt = new Map<string, Segment>()
  const drilled = new Set<string>()

  for (const segment of plan.segments) {
    const { address } = segment
    if (address.kind === 'attributes') {
      attrsAt.set(address.container.join('.'), segment)
      continue
    }
    blocksAt.set(`${address.container.join('.')}#${address.start}`, segment)
  }
  // A container is drilled into if any segment addresses something inside it.
  for (const segment of plan.segments) {
    const path = segment.address.container
    for (let depth = 1; depth <= path.length; depth++) {
      drilled.add(path.slice(0, depth).join('.'))
    }
  }

  const placed = new Map<number, SegmentAddress>()

  const parseBlocks = (segment: Segment): RootContent[] => {
    const translation = translations[segment.index]
    if (typeof translation !== 'string') {
      throw new SegmentAssemblyError(
        `Segment ${segment.index} has no accepted translation.`,
      )
    }
    try {
      return processor.parse(translation).children
    } catch (error) {
      throw new SegmentAssemblyError(
        `Segment ${segment.index}'s translation does not parse: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  const rebuild = (
    children: RootContent[],
    sourcePath: number[],
    targetPath: number[],
  ): RootContent[] => {
    const out: RootContent[] = []
    let index = 0
    while (index < children.length) {
      const segment = blocksAt.get(`${sourcePath.join('.')}#${index}`)
      if (segment) {
        const blocks = parseBlocks(segment)
        placed.set(segment.index, {
          kind: 'blocks',
          container: targetPath,
          start: out.length,
          end: out.length + blocks.length,
        })
        out.push(...blocks)
        index = (segment.address as { end: number }).end
        continue
      }
      const child = children[index]
      const path = [...sourcePath, index]
      if (drilled.has(path.join('.')) && isDrillable(child)) {
        const here = [...targetPath, out.length]
        const attrs = attrsAt.get(path.join('.'))
        const clone: MdxJsxFlowElement = {
          ...child,
          attributes: [...child.attributes],
          children: [],
        }
        if (attrs) {
          applyAttributes(clone, translations[attrs.index], processor)
          placed.set(attrs.index, { kind: 'attributes', container: here })
        }
        clone.children = rebuild(
          child.children,
          path,
          here,
        ) as MdxJsxFlowElement['children']
        out.push(clone)
        index++
        continue
      }
      throw new SegmentAssemblyError(
        `No segment covers child ${index} of container [${sourcePath.join('.')}] — the plan does not cover the document.`,
      )
    }
    return out
  }

  const assembled: Root = { ...tree, children: rebuild(tree.children, [], []) }
  const text = processor.stringify(assembled)

  const shift = assembled.children[0]?.type === 'yaml' ? 1 : 0
  const toBody = (address: SegmentAddress): SegmentAddress =>
    address.kind === 'attributes'
      ? { ...address, container: shiftPath(address.container, shift) }
      : {
          ...address,
          container: shiftPath(address.container, shift),
          start:
            address.container.length === 0
              ? Math.max(0, address.start - shift)
              : address.start,
          end:
            address.container.length === 0
              ? Math.max(0, address.end - shift)
              : address.end,
        }

  const placements: SegmentPlacement[] = []
  const records: SegmentRecord[] = []
  for (const segment of plan.segments) {
    const address = placed.get(segment.index)
    if (!address) {
      continue
    }
    const body = toBody(address)
    placements.push({ segment: segment.index, address: body })
    const carriesFrontmatter =
      shift === 1 &&
      address.kind === 'blocks' &&
      address.container.length === 0 &&
      address.start === 0
    if (!carriesFrontmatter) {
      records.push({ sha: segment.sha, address: body })
    }
  }

  return { text, placements, records }
}

/** The frontmatter block only shifts the top level; nested containers are unaffected. */
const shiftPath = (path: number[], shift: number) =>
  path.length === 0 ? path : [path[0] - shift, ...path.slice(1)]

/**
 * The children a placement addresses, in a parsed translation.
 *
 * The one place that knows how a recorded address is read back — used both to
 * pull a cached segment out of the previous translation and to work out which
 * lines of the composed document a segment occupies. `shift` accounts for the
 * frontmatter, which is block 0 of a whole file and absent from a body.
 */
export const resolvePlacement = (
  tree: Root,
  address: SegmentAddress,
  shift = 0,
): { parent: RootContent[]; nodes: RootContent[] } | undefined => {
  let children: RootContent[] = tree.children
  const [first, ...rest] = address.container
  if (address.container.length > 0) {
    // `.at` rather than `[]`: an address can point past the end of a document
    // that has been edited since it was written, and that has to come back as
    // "not there" rather than as `undefined` typed as a node.
    const node = children.at(first + shift)
    if (!node || !('children' in node) || !Array.isArray(node.children)) {
      return undefined
    }
    children = node.children
    for (const index of rest) {
      const next = children.at(index)
      if (!next || !('children' in next) || !Array.isArray(next.children)) {
        return undefined
      }
      children = next.children
    }
  }

  if (address.kind === 'attributes') {
    // An attribute placement names a node, not a range — see
    // {@link resolveAttributeNode}.
    return undefined
  }

  const offset = address.container.length === 0 ? shift : 0
  const nodes = children.slice(address.start + offset, address.end + offset)
  return nodes.length === address.end - address.start
    ? { parent: children, nodes }
    : undefined
}

/** The node an `attributes` placement addresses. */
export const resolveAttributeNode = (
  tree: Root,
  address: SegmentAddress,
  shift = 0,
): MdxJsxFlowElement | undefined => {
  if (address.kind !== 'attributes') {
    return undefined
  }
  let node: RootContent | undefined
  let children: RootContent[] = tree.children
  for (const [depth, index] of address.container.entries()) {
    node = children.at(index + (depth === 0 ? shift : 0))
    if (!node) {
      return undefined
    }
    children =
      'children' in node && Array.isArray(node.children) ? node.children : []
  }
  return node?.type === 'mdxJsxFlowElement' ? node : undefined
}

/**
 * Copies the translated prose back onto a tag.
 *
 * Strict about shape: the translation of an attribute segment is one JSX
 * element, and its attributes are the ones that were sent. Anything else is an
 * assembly error rather than a silent fallback to the source language, which is
 * the failure this whole design exists to stop happening quietly.
 */
export const applyAttributes = (
  node: MdxJsxFlowElement,
  translation: string | undefined,
  processor: MaskProcessor,
) => {
  if (typeof translation !== 'string') {
    throw new SegmentAssemblyError(
      `The attributes of \`<${node.name ?? ''}>\` have no accepted translation.`,
    )
  }
  const parsed = parseAttributeElement(translation, processor)
  if (!parsed) {
    throw new SegmentAssemblyError(
      `The translation of \`<${node.name ?? ''}>\`'s attributes is not a single JSX element.`,
    )
  }
  const translated = new Map(
    parsed.attributes
      .filter(
        (attr): attr is MdxJsxAttribute =>
          attr.type === 'mdxJsxAttribute' && typeof attr.value === 'string',
      )
      .map((attr) => [attr.name, attr.value as string]),
  )
  node.attributes = node.attributes.map((attr) => {
    if (attr.type !== 'mdxJsxAttribute' || !translated.has(attr.name)) {
      return attr
    }
    return { ...attr, value: translated.get(attr.name)! }
  })
}

/** The single JSX element an attribute segment must be, or nothing. */
export const parseAttributeElement = (
  translation: string,
  processor: MaskProcessor,
): MdxJsxFlowElement | undefined => {
  let root: Root
  try {
    root = processor.parse(translation)
  } catch {
    return undefined
  }
  const blocks = root.children.filter(
    (child) => child.type !== 'yaml' && !isBlank(child),
  )
  const only = blocks.at(0)
  return blocks.length === 1 && only?.type === 'mdxJsxFlowElement'
    ? only
    : undefined
}

const isBlank = (node: RootContent) =>
  node.type === 'paragraph' && node.children.length === 0
