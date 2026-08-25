import type { Root } from 'mdast'
import remarkMessageControl from 'remark-message-control'
import type { Plugin } from 'unified'
import type { VFile } from 'vfile'

export * from './check-dead-links.ts'
export * from './file-naming.ts'
export * from './heading-anchor-format.ts'
export * from './list-item-punctuation.ts'
export * from './list-item-size.ts'
export * from './list-table-introduction.ts'
export * from './maximum-link-content-length.ts'
export * from './no-deep-heading.ts'
export * from './no-deep-list.ts'
export * from './no-empty-table-cell.ts'
export * from './no-heading-punctuation.ts'
export * from './no-heading-special-characters.ts'
export * from './no-heading-sup-sub.ts'
export * from './no-legacy-os-names.ts'
export * from './no-multi-open-api-paths.ts'
export * from './no-paragraph-indent.ts'
export * from './no-unmatched-anchor.ts'
export * from './no-unparsed-emphasis.ts'
export * from './no-unresolved-api-ref.ts'
export * from './site.ts'
export * from './table-size.ts'
export * from './title-required.ts'
export * from './translation-parity/index.ts'
export * from './unit-case.ts'

const doomLint: Plugin<[], Root> = function () {
  this.use(() =>
    remarkMessageControl({
      name: 'lint',
      source: ['doom-lint', 'remark-lint'],
    }),
  )
}

/**
 * Rules about Chinese typography, which only mean anything on a Chinese
 * document.
 *
 * They came into the rule set when the only documents anyone linted were
 * Chinese. Once translations are linted too they read `pod’ами` — Russian
 * declining a Latin word, which is how Russian does it — as an unmatched
 * quotation mark, and report every page that uses one.
 */
const CHINESE_ONLY_RULES = new Set([
  'match-punctuation',
  'no-chinese-punctuation-in-number',
])

const CHINESE_DOCUMENT = /(?:^|[\\/])zh[\\/]/

/**
 * Drops the Chinese-typography rules' messages on documents that are not
 * Chinese.
 *
 * Filtering afterwards rather than not running the rules is deliberate: the
 * rules are third-party plugins with no notion of language, and message control
 * already establishes that filtering `file.messages` is how this rule set
 * expresses "this does not apply here".
 *
 * A document whose language cannot be told from its path keeps its messages —
 * not knowing is a reason to report, not a reason to go quiet.
 */
export const dropChineseTypographyMessages = (file: VFile) => {
  if (!file.path || CHINESE_DOCUMENT.test(file.path)) {
    return
  }
  file.messages = file.messages.filter(
    (message) => !CHINESE_ONLY_RULES.has(message.ruleId ?? ''),
  )
}

/** Must come after the rules it filters. */
export const chineseTypographyOnlyInChinese: Plugin<[], Root> =
  () => (_tree, file) => {
    dropChineseTypographyMessages(file)
  }

export default doomLint
