import type { Root } from 'mdast'
import { lintRule } from 'unified-lint-rule'
import { visitParents } from 'unist-util-visit-parents'

export const noEmptyTableCell = lintRule<Root>(
  'doom-lint:no-empty-table-cell',
  (root, vfile) => {
    visitParents(root, 'tableCell', (tableCell, parents) => {
      if (!tableCell.children.length) {
        vfile.message('Table cell cannot be empty, please add some content', {
          ancestors: [...parents, tableCell],
          place: tableCell.position,
        })
      }
    })
  },
)
