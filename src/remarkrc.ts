import remarkDirective from 'remark-directive'
import remarkFrontmatter from 'remark-frontmatter'
import remarkGfm from 'remark-gfm'
// @ts-expect-error -- https://github.com/ilyatitovich/remark-lint-code-block-split-list/issues/2
import remarkLintCodeBlockSplitList from 'remark-lint-code-block-split-list'
import remarkLintHeadingIncrement from 'remark-lint-heading-increment'
// @ts-expect-error -- https://github.com/laysent/remark-lint-plugins/issues/51
import remarkLintLintMatchPunctuation from 'remark-lint-match-punctuation'
// import remarkLintMaximumHeadingLength, {
//   type Options,
// } from 'remark-lint-maximum-heading-length'
// @ts-expect-error -- https://github.com/laysent/remark-lint-plugins/issues/51
import remarkLintNoChinesePunctuationInNumber from 'remark-lint-no-chinese-punctuation-in-number'
import remarkLintNoDuplicateHeadingsInSection from 'remark-lint-no-duplicate-headings-in-section'
import remarkLintNoHeadingContentIndent from 'remark-lint-no-heading-content-indent'
import remarkLintNoHeadingIndent from 'remark-lint-no-heading-indent'
import remarkLintNoHiddenTableCell from 'remark-lint-no-hidden-table-cell'
// @ts-expect-error -- https://github.com/laysent/remark-lint-plugins/issues/51
import remarkLintNoRepeatPunctuation from 'remark-lint-no-repeat-punctuation'

import doomLint, {
  listItemPunctuation,
  listItemSize,
  maximumLinkContentLength,
  noDeepHeading,
  noDeepList,
  noEmptyTableCell,
  noHeadingPunctuation,
  noHeadingSupSub,
  noParagraphIndent,
  tableSize,
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
    // [
    //   remarkLintMaximumHeadingLength,
    //   {
    //     size: 50,
    //     stringLength(value) {
    //       const [text] = extractTextAndId(value)
    //       return stringWidth(text)
    //     },
    //   } satisfies Options,
    // ],
    remarkLintNoChinesePunctuationInNumber,
    remarkLintNoDuplicateHeadingsInSection,
    remarkLintNoHeadingContentIndent,
    remarkLintNoHeadingIndent,
    remarkLintNoHiddenTableCell,
    remarkLintNoRepeatPunctuation,
    doomLint,
    listItemPunctuation,
    listItemSize,
    maximumLinkContentLength,
    noDeepHeading,
    noDeepList,
    noEmptyTableCell,
    noHeadingPunctuation,
    noHeadingSupSub,
    noParagraphIndent,
    tableSize,
    unitCase,
  ],
}
