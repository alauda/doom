import type { Root } from 'mdast'
import { lintRule } from 'unified-lint-rule'

import { collectHeadingDepths, currentPair } from './shared.ts'

/**
 * A translation keeps its source's heading structure.
 *
 * Headings are the page's skeleton and its anchors: a lost or promoted heading
 * silently changes the table of contents and breaks every link that pointed at
 * it. Translating the text of a heading never changes its level.
 *
 * Honest caveat: this has never fired on real damage in this corpus (0 of 1764
 * pairs). It is a regression guard, not a demonstrated detector.
 */
export const translationHeadingSequence = lintRule<Root>(
  'doom-lint:translation-heading-sequence',
  async (tree, vfile) => {
    const pair = await currentPair(tree, vfile)
    if (!pair) {
      return
    }

    const expected = collectHeadingDepths(pair.sourceTree)
    const actual = collectHeadingDepths(tree)

    if (
      expected.length === actual.length &&
      expected.every((depth, index) => depth === actual[index])
    ) {
      return
    }

    vfile.message(
      `Translation changed the heading structure: source is ${expected.join('-') || '(none)'}, this is ${actual.join('-') || '(none)'}.`,
      tree,
    )
  },
)
