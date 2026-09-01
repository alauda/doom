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
 * A bare URL ends where markdown says it ends, and markdown does not know
 * about Chinese sentence punctuation.
 *
 * GFM closes an autolink literal at whitespace and drops *ASCII* trailing
 * punctuation, so `see http://h:8080.` links to `http://h:8080`. A full-width
 * stop is not ASCII: it is absorbed, and `例如 http://h:8080。` links to
 * `http://h:8080。`, an address that does not exist. The translator writes
 * correct Chinese and gets a broken link for it — and the two messages it used
 * to get, "lost this target" and "points at that one", never said which of the
 * two spellings was the one to change, so the repair loop could only guess.
 *
 * Only a non-ASCII suffix is read this way. `https://x.com` becoming
 * `https://x.com/docs` is also a prefix, and that one is a real retarget.
 */
const isAbsorbedSuffix = (suffix: string) =>
  suffix.length > 0 && suffix.codePointAt(0)! > 0x7f

export const partitionAbsorbed = (
  missing: readonly string[],
  extra: readonly string[],
) => {
  const unmatched = [...extra]
  const lost: string[] = []
  const absorbed: Array<{ target: string; suffix: string }> = []

  for (const target of missing) {
    const index = unmatched.findIndex(
      (candidate) =>
        candidate.startsWith(target) &&
        isAbsorbedSuffix(candidate.slice(target.length)),
    )
    if (index === -1) {
      lost.push(target)
      continue
    }
    absorbed.push({ target, suffix: unmatched[index].slice(target.length) })
    unmatched.splice(index, 1)
  }

  return { absorbed, lost, unmatched }
}

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
    const { absorbed, lost, unmatched } = partitionAbsorbed(missing, extra)

    for (const { target, suffix } of absorbed) {
      vfile.message(
        `Translation link \`${target}${suffix}\` swallowed the \`${suffix}\` that follows it: a bare URL runs on until a space, and markdown only leaves out trailing ASCII punctuation. Write it as \`[${target}](${target})\` so the punctuation stays outside the link.`,
        tree,
      )
    }
    if (lost.length) {
      vfile.message(
        `Translation lost ${lost.length} link target(s) the source has: ${preview(lost)}.`,
        tree,
      )
    }
    if (unmatched.length) {
      vfile.message(
        `Translation points at ${unmatched.length} target(s) the source does not: ${preview(unmatched)}.`,
        tree,
      )
    }
  },
)
