import type { Root } from 'mdast'
import { lintRule } from 'unified-lint-rule'
import { visit } from 'unist-util-visit'
import { visitParents } from 'unist-util-visit-parents'

const SUP_SUB_REGEX = /<\/?(?:sup|sub)>/

export const noHeadingSupSub = lintRule<Root>(
  'doom-lint:no-heading-sup-sub',
  (root, vfile) => {
    visit(root, 'heading', (heading) => {
      visitParents(heading, 'html', (html, parents) => {
        if (SUP_SUB_REGEX.test(html.value)) {
          vfile.message(
            `Unexpected \`${html.value}\` tag in heading, remove it`,
            {
              ancestors: [...parents, html],
              place: html.position,
            },
          )
        }
      })
    })
  },
)
