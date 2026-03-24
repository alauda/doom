import type { Root } from 'mdast'
import { lintRule } from 'unified-lint-rule'
import { visitParents } from 'unist-util-visit-parents'

export const noMultiOpenAPIPaths = lintRule<Root>(
  'doom-lint:no-multi-open-api-paths',
  (root, vfile) => {
    let count = 0
    visitParents(
      root,
      ['mdxJsxFlowElement', 'mdxJsxTextElement'] as const,
      (element, parents) => {
        if (element.name === 'OpenAPIPath' && ++count > 1) {
          vfile.message(
            'Multiple `OpenAPIPath` components are used in the same file, combine them into a single component by passing an array to the `path` prop instead',
            {
              ancestors: [...parents, element],
              place: element.position,
            },
          )
        }
      },
    )
  },
)
