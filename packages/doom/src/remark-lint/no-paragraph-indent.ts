import type { Root } from 'mdast'
import { phrasing } from 'mdast-util-phrasing'
import pluralize from 'pluralize'
import { lintRule } from 'unified-lint-rule'
import { pointStart } from 'unist-util-position'
import { SKIP, visitParents } from 'unist-util-visit-parents'

export const noParagraphIndent = lintRule<Root>(
  'doom-lint:no-paragraph-indent',
  (root, vfile) => {
    visitParents(root, (node, parents) => {
      // Do not walk into phrasing.
      if (phrasing(node)) {
        return SKIP
      }

      const parent = parents.at(-1)
      const start = pointStart(node)

      // Note: it’s rather complex to detect what the expected indent is in block
      // quotes and lists, so let’s only do directly in root for now.
      if (
        !start ||
        !parent ||
        node.type !== 'paragraph' ||
        parent.type !== 'root'
      ) {
        return
      }

      const actual = start.column - 1

      if (actual) {
        vfile.message(
          `Unexpected \`${actual}\` ${pluralize(
            'space',
            actual,
          )} before paragraph, expected \`0\` spaces, remove \`${actual}\` ${pluralize(
            'space',
            actual,
          )}`,
          { ancestors: [...parents, node], place: start },
        )
      }
    })
  },
)
