import type { Root } from 'mdast'
import { lintRule } from 'unified-lint-rule'
import { SKIP, visit } from 'unist-util-visit'

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

/**
 * Text inside a link is not prose for this purpose.
 *
 * The rule's whole premise is that a URL markdown *did* turn into a link is
 * protected structurally and belongs to `link-isomorphism`. The first
 * implementation still walked into link nodes, so an autolink counted twice:
 * once as a target and once as the label text that repeats it. That is not
 * merely redundant. A translator that writes `[http://host:8080](http://host:8080)`
 * — the one spelling of a bare URL that Chinese sentence punctuation cannot
 * corrupt — had its label read as prose, found the URL missing from it (the
 * port is a `textDirective` there), and was told it had lost a URL it had in
 * fact preserved exactly. No spelling it could reach satisfied both rules, so
 * the repair loop could only run out of rounds.
 */
const IS_LINK = new Set(['link', 'linkReference', 'definition'])

export const collectProseUrls = (tree: Root) => {
  const found: string[] = []
  visit(tree, (node) => {
    if (IS_LINK.has(node.type)) {
      return SKIP
    }
    if (node.type !== 'text') {
      return
    }
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

    const { missing } = diffMultiset(
      collectProseUrls(pair.sourceTree),
      collectProseUrls(tree),
    )
    if (!missing.length) {
      return
    }

    vfile.message(
      `Translation lost ${missing.length} URL(s) written in prose: ${missing.map((url) => `\`${url}\``).join(', ')}. These are plain text rather than links, so nothing protects them structurally.`,
      tree,
    )
  },
)
