import path from 'node:path'

import type { Root } from 'mdast'
import { toString } from 'mdast-util-to-string'
import { lintRule } from 'unified-lint-rule'
import { visitParents } from 'unist-util-visit-parents'

import { PUNCTUATION_REGEX } from './utils.ts'

const QUESTION_MARKS = new Set(['?', '？'])

export const noHeadingPunctuation = lintRule<Root>(
  'doom-lint:no-heading-punctuation',
  (root, vfile) => {
    const filename = path.basename(vfile.path, path.extname(vfile.path))

    visitParents(root, 'heading', (heading, parents) => {
      const text = toString(heading)
      const tail = text.slice(-1)

      if (PUNCTUATION_REGEX.test(tail)) {
        if (filename === 'faq' && QUESTION_MARKS.has(tail)) {
          return
        }

        if (
          (tail === '}' && text.includes('{')) ||
          (tail === ']' && text.includes('[')) ||
          (tail === '>' && text.includes('<')) ||
          (tail === ')' && text.includes('('))
        ) {
          return
        }

        vfile.message(
          `Unexpected character \`${tail}\` at end of heading, remove it`,
          {
            ancestors: [...parents, heading],
            place: heading.position,
          },
        )
      }
    })
  },
)
