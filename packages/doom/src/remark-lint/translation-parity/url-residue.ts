import type { Root } from 'mdast'
import { lintRule } from 'unified-lint-rule'
import { visit } from 'unist-util-visit'

import { currentPair, diffMultiset } from './shared.ts'

/**
 * URLs written in prose that markdown does not turn into links still survive
 * translation.
 *
 * This is the other half of a deliberate asymmetry. A URL with a scheme becomes
 * a link node and is protected structurally; a bare `example.com` or an
 * `ftp://…` stays plain text, and protecting *that* would mean pattern-matching
 * inside prose — the one way masking could swallow something that ought to have
 * been translated. So it is checked instead: a check that misfires costs one
 * finding to read, whereas a mask that misfires hides a sentence.
 *
 * The pattern insists on a scheme or a `www.`, which is narrower than "looks
 * like a domain" on purpose. A first attempt matched any `name.tld/path` and
 * reported seven documents — every one an API group or an annotation key
 * (`autoscaling.k8s.io/v1`, `kubevirt.io/storage`) that had merely moved
 * between prose and inline code. Those are identifiers, not links, and a guard
 * that cries wolf about them is worse than no guard at all.
 *
 * Honest caveat: measured exposure on this corpus is zero — all seven bare URLs
 * carry `https://`, which makes them link nodes, protected structurally. This
 * is a guard for a case nothing else covers, not a demonstrated detector.
 */
const BARE_URL = /\b(?:[a-z][a-z0-9+.-]*:\/\/|www\.)\S+/gi

const collect = (tree: Root) => {
  const found: string[] = []
  visit(tree, 'text', (node) => {
    for (const [match] of node.value.matchAll(BARE_URL)) {
      found.push(match)
    }
  })
  return found
}

export const translationUrlResidue = lintRule<Root>(
  'doom-lint:translation-url-residue',
  async (tree, vfile) => {
    const pair = await currentPair(tree, vfile)
    if (!pair) {
      return
    }

    const { missing } = diffMultiset(collect(pair.sourceTree), collect(tree))
    if (!missing.length) {
      return
    }

    vfile.message(
      `Translation lost ${missing.length} URL(s) written in prose: ${missing.map((url) => `\`${url}\``).join(', ')}. These are plain text rather than links, so nothing protects them structurally.`,
      tree,
    )
  },
)
