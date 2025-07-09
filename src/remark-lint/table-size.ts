import type { Root } from 'mdast'
import { lintRule } from 'unified-lint-rule'
import { visitParents } from 'unist-util-visit-parents'

export const tableSize = lintRule<Root>(
  'doom-lint:table-size',
  (root, vfile) => {
    visitParents(root, 'table', (table, parents) => {
      const rows = table.children.length
      const columns = table.children[0].children.length

      if (columns === 1 || rows === 1) {
        vfile.message(
          'Tables with only one row or only one column are not allowed, please use a list or add an additional row or column',
          {
            ancestors: [...parents, table],
            place: table.position,
          },
        )
      }
    })
  },
)
