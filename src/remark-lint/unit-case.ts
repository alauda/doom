import type { Root } from 'mdast'
import { lintRule } from 'unified-lint-rule'
import { visitParents } from 'unist-util-visit-parents'

// cspell:disable-next-line
const UNIT_CASE_REGEX = /\b\d+(?:\.\d+)?\s*([kmgtpe]i?)\b/gi

const VALID_UNITS = new Set([
  'm',
  'k',
  'Ki',
  ...['M', 'G', 'T', 'P', 'E'].flatMap((it) => [it, `${it}i`]),
])

const getPairUnit = (unit: string) => {
  for (const it of VALID_UNITS) {
    if (it.toLowerCase() === unit.toLowerCase()) {
      return it
    }
  }
}

export const unitCase = lintRule<Root>('doom-lint:unit-case', (root, vfile) => {
  visitParents(root, 'text', (text, parents) => {
    for (const [, unit] of text.value.matchAll(UNIT_CASE_REGEX)) {
      if (!VALID_UNITS.has(unit)) {
        vfile.message(
          `Unexpected unit case "${unit}", use "${getPairUnit(unit)}" instead`,
          {
            ancestors: [...parents, text],
            place: text.position,
          },
        )
      }
    }
  })
})
