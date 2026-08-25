import type { Root } from 'mdast'
import { lintRule } from 'unified-lint-rule'

import { collectProseText, currentPair } from './shared.ts'

/**
 * A translation is roughly as long as its source, in the way that language is.
 *
 * This is the one check that catches a translation which simply stops — the
 * model ran out of room, or answered with a summary. It cannot be tight,
 * because languages differ in density, and it has to be calibrated against the
 * measure the rule actually uses. Measured over 1050 real pairs, on **prose
 * only** (code, inline code and component attributes excluded):
 *
 *     zh   min 0.247   p05 0.288   p50 0.394   p95 0.541   max 1.000
 *     ru   min 0.644   p05 0.987   p50 1.090   p95 1.209   max 1.714
 *
 * Chinese says the same thing in roughly two fifths of the characters, so a
 * band borrowed from a whole-file byte ratio sits *inside* the healthy
 * distribution and condemns ordinary pages — which is what happened before
 * these numbers were measured. The bands below sit well outside the observed
 * range: a page has to be out of family, not merely at the edge of it.
 *
 * Re-measure before changing them, and measure the same thing the rule measures.
 */
const RATIO_BANDS: Record<
  string,
  { floor: number; ceiling: number } | undefined
> = {
  zh: { floor: 0.12, ceiling: 1.5 },
  ru: { floor: 0.35, ceiling: 2.5 },
}

/** Below this many characters the ratio is noise, not signal. */
const MIN_PROSE_CHARS = 200

export const translationLengthRatio = lintRule<Root>(
  'doom-lint:translation-length-ratio',
  async (tree, vfile) => {
    const pair = await currentPair(tree, vfile)
    if (!pair || pair.isCopyOnly) {
      return
    }

    const band = RATIO_BANDS[pair.targetLang]
    if (!band) {
      return
    }

    const source = collectProseText(pair.sourceTree).length
    if (source < MIN_PROSE_CHARS) {
      return
    }
    const ratio = collectProseText(tree).length / source

    if (ratio < band.floor) {
      vfile.message(
        `Translation is far shorter than its source (${ratio.toFixed(2)}× the prose, expected at least ${band.floor}× for ${pair.targetLang}) — it looks truncated or summarised.`,
        tree,
      )
    } else if (ratio > band.ceiling) {
      vfile.message(
        `Translation is far longer than its source (${ratio.toFixed(2)}× the prose, expected at most ${band.ceiling}× for ${pair.targetLang}) — it looks like content was added or repeated.`,
        tree,
      )
    }
  },
)
