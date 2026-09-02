import type { Root } from 'mdast'

import {
  collectComponents,
  collectHeadingDepths,
} from '../remark-lint/translation-parity/shared.ts'

import type { TranslationFinding } from './translate-checker.ts'
import type { Judge } from './translate-judge.ts'
import { countPlaceholders, type MaskProcessor } from './translate-mask.ts'
import { type Segment, parseAttributeElement } from './translate-segment.ts'
import type { TermPair } from './translate-terms.ts'

/**
 * Whether one translated segment is good enough to freeze.
 *
 * This is the gate the whole design rests on. A segment that passes here is
 * never touched again — not by a retry, not by a repair agent, not by a later
 * assembly round — so everything that was right stays right. The incident this
 * replaced had no such gate: a document one problem away from finished was
 * handed back to a model that rewrote it whole, and 870 correct placeholders
 * became 1000 problems with no way back.
 *
 * Four layers, cheapest first, and a failing layer stops the ones after it.
 * Three of the four are free; only the last one costs a model call, and it is
 * not spent on a segment the free ones have already faulted.
 *
 * The same function is what a repair agent calls to see its own work, so "the
 * agent is checked against the rules it checks itself with" is true because
 * there is one function, not because two of them were kept in step.
 */

/** How much of a mismatched segment to quote back. Enough to act on, not enough to drown in. */
const PREVIEW = 80

const preview = (value: string) =>
  value.length > PREVIEW ? `${value.slice(0, PREVIEW - 1)}…` : value

export interface CheckSegmentOptions {
  segment: Segment
  /** What the model returned for it. */
  translation: string
  processor: MaskProcessor
  /**
   * Every placeholder the document issued.
   *
   * Lets a token that belongs to a *different* segment be reported as what it
   * is — content dragged in from a neighbour — rather than as an invented one.
   * The two have different causes and different fixes.
   */
  documentTokens?: ReadonlySet<string>
  /** The semantic check. Absent in tests that are about control flow. */
  judge?: Judge
  sourceLanguage: string
  targetLanguage: string
  terms?: readonly TermPair[]
}

export const checkSegment = async ({
  segment,
  translation,
  processor,
  documentTokens,
  judge,
  sourceLanguage,
  targetLanguage,
  terms,
}: CheckSegmentOptions): Promise<TranslationFinding[]> => {
  if (translation.trim() === '') {
    return [
      {
        rule: 'doom-translate:nothing-written',
        reason: 'The model returned nothing for this segment.',
      },
    ]
  }

  // ------------------------------------------------------------ 1. it parses

  if (segment.address.kind === 'attributes') {
    return checkAttributes(segment, translation, processor)
  }

  let tree: Root
  try {
    tree = processor.parse(translation)
  } catch (error) {
    return [
      {
        rule: 'doom-translate:segment-unparseable',
        reason: `This segment's translation is not valid markdown/MDX: ${error instanceof Error ? error.message : String(error)}`,
      },
    ]
  }

  // --------------------------------------------------- 2. the placeholders

  const findings = placeholderFindings(segment, translation, documentTokens)
  if (findings.length > 0) {
    return findings
  }

  // ----------------------------------------------------- 3. the structure

  findings.push(...structureFindings(segment, tree, processor))
  if (findings.length > 0) {
    return findings
  }

  // --------------------------------------------------------- 4. the meaning

  if (judge) {
    findings.push(
      ...(await judge.review({
        // The masked pair, as everywhere else: a finding that quoted an
        // unmasked link target would put that target back in the model's reach,
        // which is the one thing masking exists to prevent.
        sourceText: segment.text,
        translationText: translation,
        sourceLanguage,
        targetLanguage,
        terms,
        fragment: true,
      })),
    )
  }

  return findings
}

/**
 * Every placeholder back, exactly as often as it went out.
 *
 * Pure string counting — no restore, no tree walk, nothing to configure — which
 * is why it can run on every attempt of every segment without thinking about
 * cost. It is also where the failure that ended the incident is now caught: in
 * a few kilobytes, against a table of a few dozen tokens, instead of in 78 KB
 * against 871.
 */
const placeholderFindings = (
  segment: Segment,
  translation: string,
  documentTokens?: ReadonlySet<string>,
): TranslationFinding[] => {
  const found = countPlaceholders(translation)
  const findings: TranslationFinding[] = []

  for (const [token, expected] of segment.expected) {
    const actual = found.get(token) ?? 0
    found.delete(token)
    if (actual === expected) {
      continue
    }
    findings.push({
      rule:
        actual < expected
          ? 'doom-translate:missing-placeholder'
          : 'doom-translate:duplicate-placeholder',
      reason:
        actual < expected
          ? `\`${token.toUpperCase()}\` is not in this segment's translation${expected > 1 ? ` as often as it should be (expected ${expected}, found ${actual})` : ''}. It stands for content you must reproduce exactly — a link target, some code, an identifier. Either it has not been translated yet, or it was dropped.`
          : `\`${token.toUpperCase()}\` appears ${actual} times but must appear ${expected}.`,
    })
  }

  for (const [token, actual] of found) {
    const fromElsewhere = documentTokens?.has(token) ?? false
    findings.push({
      rule: fromElsewhere
        ? 'doom-translate:out-of-segment-placeholder'
        : 'doom-translate:unregistered-placeholder',
      reason: fromElsewhere
        ? `\`${token.toUpperCase()}\` belongs to a different part of the document and appears here ${actual} time(s). Translate only the segment you were given; do not carry text in from anywhere else.`
        : `\`${token.toUpperCase()}\` was never issued — do not invent placeholders.`,
    })
  }

  return findings
}

/**
 * The skeleton is the source's, not the model's.
 *
 * Headings and components are structure rather than prose: translating a page
 * never changes a heading's level and never adds or removes a component. Both
 * are already checked over the whole document by `translation-heading-sequence`
 * and `translation-component-multiset` — this runs the *same* collectors, one
 * segment at a time.
 *
 * That is not a duplicate of those rules, it is where they become actionable.
 * Every pairwise rule reports against the document as a whole, with no line
 * number to route by, so a finding from one of them at assembly time names a
 * defect but not a place. Checked per segment, the same defect arrives with the
 * segment attached, inside a blast radius of a few kilobytes, and can simply be
 * retranslated. When one of those rules does fire at assembly time afterwards,
 * it means something assembly itself did — which is worth failing loudly for
 * rather than retrying blindly.
 */
const structureFindings = (
  segment: Segment,
  tree: Root,
  processor: MaskProcessor,
): TranslationFinding[] => {
  let source: Root
  try {
    source = processor.parse(segment.text)
  } catch {
    // The segment came from a parsed tree, so this cannot normally happen; if
    // it somehow does, it is not the translation's fault.
    return []
  }

  const findings: TranslationFinding[] = []

  const expectedDepths = collectHeadingDepths(source)
  const actualDepths = collectHeadingDepths(tree)
  if (
    expectedDepths.length !== actualDepths.length ||
    expectedDepths.some((depth, index) => depth !== actualDepths[index])
  ) {
    findings.push({
      rule: 'doom-translate:segment-heading-sequence',
      reason: `This segment's headings changed: the source is ${expectedDepths.join('-') || '(none)'}, the translation is ${actualDepths.join('-') || '(none)'}. Translate the text of a heading; never its level, and never add or drop one.`,
    })
  }

  const expectedComponents = collectComponents(source)
  const actualComponents = collectComponents(tree)
  for (const name of new Set([
    ...expectedComponents.keys(),
    ...actualComponents.keys(),
  ])) {
    const want = expectedComponents.get(name) ?? 0
    const got = actualComponents.get(name) ?? 0
    if (want === got) {
      continue
    }
    findings.push({
      rule: 'doom-translate:segment-component-multiset',
      reason:
        got < want
          ? `This segment's translation dropped ${want - got} \`<${name}>\` (the source has ${want}, the translation has ${got}) — content that was in the source is missing.`
          : `This segment's translation invented ${got - want} \`<${name}>\` (the source has ${want}, the translation has ${got}).`,
    })
  }

  return findings
}

/**
 * A tag's prose, checked as the tag it has to become.
 *
 * An attribute segment is one JSX element carrying the words on a tag — a
 * `<Tab label>` inside a container too large to send whole. It goes back into
 * the document as attribute values, so what matters is that it is still one
 * element and still has the same attributes; a model that answered with a
 * sentence instead would otherwise leave that label silently untranslated.
 */
const checkAttributes = (
  segment: Segment,
  translation: string,
  processor: MaskProcessor,
): TranslationFinding[] => {
  const expected = parseAttributeElement(segment.text, processor)
  const actual = parseAttributeElement(translation, processor)

  if (!actual) {
    return [
      {
        rule: 'doom-translate:segment-attributes',
        reason: `Answer with the element itself and nothing else, exactly as it was given — \`${preview(segment.text.trim())}\` — translating only the attribute values.`,
      },
    ]
  }

  const names = (element: NonNullable<typeof actual>) =>
    element.attributes
      .map((attr) => (attr.type === 'mdxJsxAttribute' ? attr.name : '...'))
      .sort()

  const want = expected ? names(expected) : []
  const got = names(actual)
  if (actual.name !== expected?.name || want.join() !== got.join()) {
    return [
      {
        rule: 'doom-translate:segment-attributes',
        reason: `The element must stay \`<${expected?.name ?? ''}>\` with the attributes ${want.map((name) => `\`${name}\``).join(', ')}; the translation has \`<${actual.name ?? ''}>\` with ${got.map((name) => `\`${name}\``).join(', ') || '(none)'}. Translate the values, not the names.`,
      },
    ]
  }

  return []
}
