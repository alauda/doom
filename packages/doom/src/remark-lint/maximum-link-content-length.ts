import type { Root } from 'mdast'
import stringWidth from 'string-width'
import { lintRule } from 'unified-lint-rule'
import { visit } from 'unist-util-visit'
import { visitParents } from 'unist-util-visit-parents'

import { extractTextAndId } from '../shared/helpers.ts'

const MAX_LENGTH = 40

export const maximumLinkContentLength = lintRule<Root>(
  'doom-lint:maximum-link-content-length',
  (root, vfile) => {
    visit(root, ['link', 'linkReference'] as const, (node) => {
      visitParents(node, 'text', (text, parents) => {
        let value = text.value
        try {
          new URL(value)
          return
        } catch {
          ;[value] = extractTextAndId(value)
        }
        const length = stringWidth(value)
        if (length > MAX_LENGTH) {
          vfile.message(
            `Link content length \`${length}\` of \`${value}\` is too long, maximum is ${MAX_LENGTH} characters, please shorten it`,
            {
              ancestors: [...parents, text],
              place: text.position,
            },
          )
        }
      })
    })
  },
)
