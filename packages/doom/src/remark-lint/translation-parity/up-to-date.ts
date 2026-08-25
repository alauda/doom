import type { Root } from 'mdast'
import { lintRule } from 'unified-lint-rule'

import { resolveTranslation } from './shared.ts'

/**
 * A translation must correspond to the source it declares.
 *
 * Every other `translation-parity` rule compares two documents, and every one of
 * them is meaningless — noisy, or falsely quiet — if the two are different
 * versions of the same page. So they all stand down unless this one is
 * satisfied, and this one says so out loud rather than letting them skip in
 * silence.
 */
export const translationUpToDate = lintRule<Root>(
  'doom-lint:translation-up-to-date',
  async (tree, vfile) => {
    const status = await resolveTranslation(tree, vfile)

    if (status.kind === 'stale') {
      vfile.message(
        `Translation is out of date: its \`sourceSHA\` names a version of \`${status.sourcePath}\` that no longer exists. Re-run \`doom translate\`; until then no translation check can say anything about this file.`,
        tree,
      )
      return
    }

    if (status.kind === 'source-missing') {
      vfile.message(
        `Translation has no source: nothing exists at \`${status.sourcePath}\`. Either the source page was removed and this one should go too, or it is in the wrong place.`,
        tree,
      )
    }
  },
)
