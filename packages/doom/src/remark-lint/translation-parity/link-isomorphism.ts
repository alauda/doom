import type { Root } from 'mdast'
import { lintRule } from 'unified-lint-rule'

import {
  collectLinkTargets,
  currentPair,
  diffMultiset,
  docDirInRoot,
} from './shared.ts'

const preview = (values: readonly string[]) =>
  values
    .slice(0, 5)
    .map((value) => `\`${value}\``)
    .join(', ') + (values.length > 5 ? `, … (${values.length} total)` : '')

/**
 * A translation points at exactly the same places its source points at.
 *
 * Not "its links resolve" — that is a much weaker property, and it is the one
 * the build happens to check. A link can be rewritten into a different, still
 * existing page and the build stays green while the reader is sent somewhere
 * else. Every link is therefore resolved against the position of the document
 * holding it and stripped of its language segment, and the resulting multisets
 * must match.
 *
 * Resolving is what makes the comparison possible: a translation's asset links
 * legitimately read `../../../en/networking/x.png` where the source reads
 * `./x.png`, because assets are not copied per language. Both name the same
 * file, so they compare equal — while every corruption measured on this corpus
 * does not:
 *
 * - a `<ExternalSiteLink … href="/global/install.html" />` flattened into
 *   `[…](../global/install.html)`;
 * - `../virtualization/virtualization/virtual_machine/…` collapsed into
 *   `../virtualization/virtualization_virtual_machine/…`;
 * - `../global_dr.mdx` rewritten as `../global.dr.mdx`;
 * - `how_to/` rewritten as `how-to/`;
 * - the same link generated twice.
 */
export const translationLinkIsomorphism = lintRule<Root>(
  'doom-lint:translation-link-isomorphism',
  async (tree, vfile) => {
    const pair = await currentPair(tree, vfile)
    if (!pair) {
      return
    }

    const expected = collectLinkTargets(
      pair.sourceTree,
      docDirInRoot(pair.sourceLang, pair.relativePath),
    )
    const actual = collectLinkTargets(
      tree,
      docDirInRoot(pair.targetLang, pair.relativePath),
    )

    const { missing, extra } = diffMultiset(expected, actual)

    if (missing.length) {
      vfile.message(
        `Translation lost ${missing.length} link target(s) the source has: ${preview(missing)}.`,
        tree,
      )
    }
    if (extra.length) {
      vfile.message(
        `Translation points at ${extra.length} target(s) the source does not: ${preview(extra)}.`,
        tree,
      )
    }
  },
)
