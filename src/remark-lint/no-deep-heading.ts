import type { Root } from 'mdast'
import { lintRule } from 'unified-lint-rule'
import { visitParents } from 'unist-util-visit-parents'

const MAX_HEADING_DEPTH = 5

export const noDeepHeading = lintRule<Root>(
  'doom-lint:no-deep-heading',
  (root, vfile) => {
    visitParents(root, 'heading', (heading, parents) => {
      if (heading.depth > MAX_HEADING_DEPTH) {
        vfile.message(
          `Unexpected deep heading level ${heading.depth}, maximum is ${MAX_HEADING_DEPTH}`,
          {
            ancestors: [...parents, heading],
            place: heading.position,
          },
        )
      }
    })
  },
)
