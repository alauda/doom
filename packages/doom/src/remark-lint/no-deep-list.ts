import type { Root } from 'mdast'
import { lintRule } from 'unified-lint-rule'
import { visitParents } from 'unist-util-visit-parents'

const MAX_LIST_DEPTH = 4

export const noDeepList = lintRule<Root>(
  'doom-lint:no-deep-list',
  (root, vfile) => {
    visitParents(root, 'list', (list, parents) => {
      const depth = parents.filter((p) => p.type === 'list').length + 1
      if (depth > MAX_LIST_DEPTH) {
        vfile.message(
          `Unexpected list depth ${depth}, maximum is ${MAX_LIST_DEPTH}`,
          {
            ancestors: [...parents, list],
            place: list.position,
          },
        )
      }
    })
  },
)
