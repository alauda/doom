import remarkDirective from 'remark-directive'
import remarkFrontmatter from 'remark-frontmatter'
import remarkGfm from 'remark-gfm'
// @ts-expect-error -- https://github.com/ilyatitovich/remark-lint-code-block-split-list/issues/2
import remarkLintCodeBlockSplitList from 'remark-lint-code-block-split-list'
import remarkLintHeadingIncrement from 'remark-lint-heading-increment'
// @ts-expect-error -- https://github.com/laysent/remark-lint-plugins/issues/51
import remarkLintLintMatchPunctuation from 'remark-lint-match-punctuation'
// @ts-expect-error -- https://github.com/laysent/remark-lint-plugins/issues/51
import remarkLintNoChinesePunctuationInNumber from 'remark-lint-no-chinese-punctuation-in-number'
import remarkLintNoDuplicateHeadingsInSection from 'remark-lint-no-duplicate-headings-in-section'
import remarkLintNoHiddenTableCell from 'remark-lint-no-hidden-table-cell'
import type { Plugin } from 'unified'

import {
  checkDeadLinks,
  chineseTypographyOnlyInChinese,
  headingAnchorFormat,
  noDeepHeading,
  noDeepList,
  noLegacyOSNames,
  noMultiOpenAPIPaths,
  noParagraphIndent,
  noUnmatchedAnchor,
  noUnparsedEmphasis,
  noUnresolvedApiRef,
  site,
  tableSize,
  titleRequired,
  translationComponentMultiset,
  translationEchoedSource,
  translationFrontmatterPreservation,
  translationHeadingSequence,
  translationJsxAttributeParity,
  translationLengthRatio,
  translationLinkIsomorphism,
  translationUpToDate,
  translationUrlResidue,
  unitCase,
} from './index.ts'

/**
 * The lint pipeline, in one place, so `doom lint` and the translator cannot
 * drift apart.
 *
 * The translator checks its own output with the rules `doom lint` runs — that
 * is the point of expressing translation checks as lint rules rather than as a
 * second checking system. A rule anyone adds here starts guarding
 * machine-translated documents on the same day, without anyone remembering to
 * register it twice.
 */

type Rule = Plugin<[], never>

/** Syntax plugins every rule needs before it can run. */
export const SYNTAX_PLUGINS = [
  remarkDirective,
  remarkFrontmatter,
  remarkGfm,
] as unknown as Rule[]

/**
 * Rules that compare a translation with the source it was made from.
 *
 * Listed separately only so the ordering constraint below can be stated; they
 * are members of {@link LINT_RULES} like every other rule.
 */
export const TRANSLATION_PARITY_RULES = [
  // Whether the pair is comparable at all comes first: nothing after it means
  // anything otherwise.
  translationUpToDate,
  translationComponentMultiset,
  translationFrontmatterPreservation,
  translationHeadingSequence,
  translationJsxAttributeParity,
  translationLengthRatio,
  translationLinkIsomorphism,
  translationEchoedSource,
  translationUrlResidue,
] as unknown as Rule[]

/**
 * Rules whose verdict depends on documents other than the one being linted: the
 * site's route table, the generated API modules, the configured sibling sites,
 * the headings of whatever a link points at.
 *
 * The translator skips these. Two things have to both hold before a rule
 * belongs here:
 *
 * 1. **It reads a tree that is mid-write.** `checkDeadLinks` builds its route
 *    table by scanning the docs directory. During a translation run the target
 *    language directory is still being filled in, so a link to a page whose
 *    translation has not been written yet resolves to nothing — a red that says
 *    only "this file was translated before that one".
 * 2. **The translator could not act on it anyway.** Link targets, `href`s,
 *    heading anchors and api references are masked before the model sees the
 *    document, so they come back byte-identical to the source by construction,
 *    and `link-isomorphism` proves that separately. A dead link in a
 *    translation is a dead link in the source, and it belongs to whoever lints
 *    the source.
 *
 * `no-unmatched-anchor` is here on evidence rather than on principle. The first
 * real translation run failed `zh/install/installing.mdx` over an anchor in
 * `install/prepare/download.mdx` — a *different* document, whose stale
 * translation had lost the heading that carries it. Nothing about the document
 * being translated was wrong, the link and its anchor were both masked, and no
 * repair round could have changed the outcome. A red like that costs turns and
 * then blames the wrong file.
 *
 * They all still run in `doom lint`, over a docs tree that is complete.
 */
export const ROUTE_DEPENDENT_RULES = [
  checkDeadLinks,
  noUnmatchedAnchor,
  noUnresolvedApiRef,
  site,
] as unknown as Rule[]

/**
 * Every rule, in the order they must run.
 *
 * Two orderings are load-bearing:
 *
 * - the two Chinese-typography rules before `chineseTypographyOnlyInChinese`,
 *   which drops their messages on documents that are not Chinese;
 * - every pairwise rule before `checkDeadLinks`, which rewrites link urls in
 *   the tree as a side effect of asking rspress to resolve them. A pairwise
 *   rule running after it compares a rewritten translation against an
 *   unrewritten source and reports every link in the corpus.
 */
export const LINT_RULES = [
  remarkLintCodeBlockSplitList,
  remarkLintHeadingIncrement,
  remarkLintLintMatchPunctuation,
  remarkLintNoChinesePunctuationInNumber,
  remarkLintNoDuplicateHeadingsInSection,
  remarkLintNoHiddenTableCell,
  chineseTypographyOnlyInChinese,
  ...TRANSLATION_PARITY_RULES,
  checkDeadLinks,
  headingAnchorFormat,
  noDeepHeading,
  noDeepList,
  noLegacyOSNames,
  noMultiOpenAPIPaths,
  noParagraphIndent,
  noUnmatchedAnchor,
  noUnparsedEmphasis,
  noUnresolvedApiRef,
  site,
  tableSize,
  titleRequired,
  unitCase,
] as unknown as Rule[]

/**
 * What the translator checks its output with: every rule except the ones that
 * need a docs tree it is in the middle of writing.
 *
 * Derived by subtraction rather than by listing, so a rule added to
 * {@link LINT_RULES} joins the translation loop automatically — and keeps its
 * position, which some of the orderings above depend on.
 */
export const TRANSLATION_CHECK_RULES = LINT_RULES.filter(
  (rule) => !ROUTE_DEPENDENT_RULES.includes(rule),
)
