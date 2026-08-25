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

import doomLint, {
  checkDeadLinks,
  chineseTypographyOnlyInChinese,
  headingAnchorFormat,
  noDeepHeading,
  noDeepList,
  noLegacyOSNames,
  noMultiOpenAPIPaths,
  noParagraphIndent,
  noUnmatchedAnchor,
  noUnresolvedApiRef,
  site,
  tableSize,
  titleRequired,
  translationComponentMultiset,
  translationFrontmatterPreservation,
  translationHeadingSequence,
  translationJsxAttributeParity,
  translationLengthRatio,
  translationLinkIsomorphism,
  translationEchoedSource,
  translationUpToDate,
  translationUrlResidue,
  unitCase,
} from './remark-lint/index.ts'

export default {
  plugins: [
    remarkDirective,
    remarkFrontmatter,
    remarkGfm,
    remarkLintCodeBlockSplitList,
    remarkLintHeadingIncrement,
    remarkLintLintMatchPunctuation,
    remarkLintNoChinesePunctuationInNumber,
    remarkLintNoDuplicateHeadingsInSection,
    remarkLintNoHiddenTableCell,
    // Must follow the two Chinese-typography rules above.
    chineseTypographyOnlyInChinese,
    doomLint,
    // translation-parity: compare a translation with the source it was made
    // from. These run **before** `checkDeadLinks`, which rewrites link urls in
    // place (`.mdx` to `.html`, language prefixes) as a side effect of asking
    // rspress to resolve them. A rule that compares a rewritten translation
    // against an unrewritten source reports every link in the corpus.
    translationUpToDate,
    translationComponentMultiset,
    translationFrontmatterPreservation,
    translationHeadingSequence,
    translationJsxAttributeParity,
    translationLengthRatio,
    translationLinkIsomorphism,
    translationEchoedSource,
    translationUrlResidue,
    checkDeadLinks,
    headingAnchorFormat,
    noDeepHeading,
    noDeepList,
    noLegacyOSNames,
    noMultiOpenAPIPaths,
    noParagraphIndent,
    noUnmatchedAnchor,
    noUnresolvedApiRef,
    site,
    tableSize,
    titleRequired,
    unitCase,
  ],
}
