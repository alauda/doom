import type { Root } from 'mdast'
import { lintRule } from 'unified-lint-rule'
import { visitParents } from 'unist-util-visit-parents'

const MAX_LIST_ITEM_SIZE = 10

export const listItemSize = lintRule<Root>(
  'doom-lint:list-item-size',
  (root, vfile) => {
    visitParents(root, 'list', (list, parents) => {
      const size = list.children.length
      if (size > MAX_LIST_ITEM_SIZE) {
        vfile.message(
          `List should have at most ${MAX_LIST_ITEM_SIZE} items, but found ${size}`,
          {
            ancestors: [...parents, list],
            place: list.position,
          },
        )
      }
    })
  },
)
