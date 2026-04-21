import type { Root } from 'mdast'
import remarkMessageControl from 'remark-message-control'
import type { Plugin } from 'unified'

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
export * from './no-multi-open-api-paths.ts'
export * from './no-paragraph-indent.ts'
export * from './no-unmatched-anchor.ts'
export * from './site.ts'
export * from './table-size.ts'
export * from './title-required.ts'
export * from './unit-case.ts'

const doomLint: Plugin<[], Root> = function () {
  this.use(() =>
    remarkMessageControl({
      name: 'lint',
      source: ['doom-lint', 'remark-lint'],
    }),
  )
}

export default doomLint
