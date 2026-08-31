import type { Root } from 'mdast'
import { lintRule } from 'unified-lint-rule'

import { collectComponents, currentPair } from './shared.ts'

/**
 * A translation uses exactly the components its source uses.
 *
 * A component is a thing on the page — a term, a callout, a link to another
 * site — not a turn of phrase, so translating a page never adds or removes one.
 * When the count differs, something was dropped or invented; both of the
 * content-loss defects that opened this work were caught this way, and by
 * nothing else:
 *
 * - `zh/extend/cluster_plugin.mdx`: two bullets in English, one in Chinese —
 *   the sentence telling readers without Customer Portal access to contact
 *   support was simply gone, and it happened to contain a `<Term>`.
 * - `ru/install/installing.mdx`: the product name dropped out of the opening
 *   sentence of the installation guide.
 */
export const translationComponentMultiset = lintRule<Root>(
  'doom-lint:translation-component-multiset',
  async (tree, vfile) => {
    const pair = await currentPair(tree, vfile)
    if (!pair) {
      return
    }

    const expected = collectComponents(pair.sourceTree)
    const actual = collectComponents(tree)

    for (const name of new Set([...expected.keys(), ...actual.keys()])) {
      const want = expected.get(name) ?? 0
      const got = actual.get(name) ?? 0
      if (want === got) {
        continue
      }
      vfile.message(
        got < want
          ? `Translation dropped ${want - got} \`<${name}>\` (source has ${want}, this has ${got}) — content that was in the source is missing here.`
          : `Translation invented ${got - want} \`<${name}>\` (source has ${want}, this has ${got}).`,
        tree,
      )
    }
  },
)
