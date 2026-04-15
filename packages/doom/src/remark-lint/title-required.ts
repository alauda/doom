import type { Root } from 'mdast'
import { toString } from 'mdast-util-to-string'
import { lintRule } from 'unified-lint-rule'
import { visitParents } from 'unist-util-visit-parents'
import { parse } from 'yaml'

export const titleRequired = lintRule<Root>(
  'doom-lint:title-required',
  (root, vfile) => {
    let frontmatterTitle: string | undefined
    let headingTitle: string | undefined
    visitParents(root, (node, parents) => {
      if (node.type === 'yaml') {
        frontmatterTitle = (parse(node.value) as { title?: string } | null)
          ?.title
      }

      function checkHeadingTitle(title: string) {
        if (headingTitle) {
          vfile.message(
            'Multiple level 1 headings found, remove redundant heading or consolidate them into one.',
            {
              ancestors: [...parents, node],
              place: node.position,
            },
          )
        } else {
          headingTitle = title
        }
      }

      if (node.type === 'heading') {
        if (node.depth === 1) {
          checkHeadingTitle(toString(node))
        }
      } else if (node.type === 'html') {
        const match = node.value.match(/<h1[^>]*>(.*?)<\/h1>/i)
        if (match) {
          checkHeadingTitle(match[1])
        }
      } else if (
        node.type === 'mdxJsxFlowElement' ||
        node.type === 'mdxJsxTextElement'
      ) {
        if (node.name === 'h1') {
          checkHeadingTitle(toString(node))
        }
      }
    })

    if (!frontmatterTitle && !headingTitle) {
      vfile.message(
        'Title is required. Please add a title in the frontmatter or as a heading.',
        root,
      )
    }
  },
)
