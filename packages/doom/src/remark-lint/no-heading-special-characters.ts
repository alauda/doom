import type { Root } from 'mdast'
import pluralize from 'pluralize'
import { lintRule } from 'unified-lint-rule'
import { visit } from 'unist-util-visit'
import { visitParents } from 'unist-util-visit-parents'

const SPECIAL_CHARACTER = /[*+/^|~]/

export const noHeadingSpecialCharacters = lintRule<Root>(
  'doom-lint:no-heading-special-characters',
  (root, vfile) => {
    visit(root, 'heading', (heading) => {
      visitParents(heading, 'text', (text, parents) => {
        const pos = text.position!
        const raw = String(vfile.value).slice(pos.start.offset, pos.end.offset)
        const matched = [
          ...new Set(
            raw
              .split('')
              .filter(
                (it, index) =>
                  (!index || raw[index - 1] !== '\\') &&
                  SPECIAL_CHARACTER.test(it),
              ),
          ),
        ]
        const matchedLength = matched.length
        if (matchedLength) {
          vfile.message(
            `Unexpected special ${pluralize(
              'character',
              matchedLength,
            )} \`${matched.join('`, `')}\` contain${
              matchedLength === 1 ? 's' : ''
            } in heading text \`${raw}\`, remove it or use escape character \`\\\` to ignore it`,
            {
              ancestors: [...parents, heading],
              place: heading.position,
            },
          )
        }
      })
    })
  },
)
