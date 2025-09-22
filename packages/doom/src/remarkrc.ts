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
  noDeepHeading,
  noDeepList,
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
    remarkLintNoChinesePunctuationInNumber,
    remarkLintNoDuplicateHeadingsInSection,
    remarkLintNoHiddenTableCell,
    doomLint,
    checkDeadLinks,
    noDeepHeading,
    noDeepList,
    noParagraphIndent,
    tableSize,
    unitCase,
  ],
}
