import type { Root } from 'mdast'
import { lintRule } from 'unified-lint-rule'

import { collectProseText, currentPair } from './shared.ts'

/**
 * A translation must not be the source.
 *
 * The failure is the model handing back what it was given: frontmatter title
 * and description come out translated — those are produced separately — while
 * the body is returned verbatim. Every structural check is satisfied by this,
 * because structurally it *is* the source: same links, same components, same
 * headings, same length.
 *
 * The test is prose identity rather than "how much of it looks Chinese".
 * Sampling the script does not work: reference pages in this corpus run as low
 * as 2% native characters and are perfectly good translations — they are mostly
 * field names — so any threshold that catches an echo also condemns them.
 * Identity has no threshold to get wrong, and on 1050 real pairs it selected
 * exactly three documents, all three of them genuinely untranslated.
 *
 * What it deliberately does not catch is a *partly* echoed document. That needs
 * a reader, not a comparison.
 */
const normalise = (text: string) => text.replace(/\s+/g, ' ').trim()

/** Below this, identity means the page is a heading and a component. */
const MIN_PROSE_CHARS = 200

export const translationEchoedSource = lintRule<Root>(
  'doom-lint:translation-echoed-source',
  async (tree, vfile) => {
    const pair = await currentPair(tree, vfile)
    if (!pair || pair.isCopyOnly) {
      return
    }

    const source = normalise(collectProseText(pair.sourceTree))
    if (source.length < MIN_PROSE_CHARS) {
      return
    }

    if (normalise(collectProseText(tree)) === source) {
      vfile.message(
        `Translation is the source: every word of prose came back unchanged in ${pair.sourceLang}. The model echoed the document instead of translating it.`,
        tree,
      )
    }
  },
)
