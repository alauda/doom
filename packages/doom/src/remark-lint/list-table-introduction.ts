import type { Root } from 'mdast'
import { lintRule } from 'unified-lint-rule'
import { visitParents } from 'unist-util-visit-parents'

export const listTableIntroduction = lintRule<Root>(
  'doom-lint:list-table-introduction',
  (root, vfile) => {
    visitParents(root, ['list', 'table'] as const, (node, parents) => {
      const parent = parents[parents.length - 1]
      const index = parent.children.indexOf(node)
      const prevSibling = parent.children[index - 1]
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!prevSibling || prevSibling.type === 'heading') {
        vfile.message(
          `There should be some introductory text before ${node.type}s`,
          {
            ancestors: [...parents, node],
            place: node.position,
          },
        )
      }
    })
  },
)
