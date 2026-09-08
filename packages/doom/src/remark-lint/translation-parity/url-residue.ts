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
 * Honest caveat, kept because it turned out to matter: when this shipped,
 * measured exposure on the corpus was zero — all seven bare URLs carried
 * `https://`, which makes them link nodes, protected structurally. It was a
 * guard for a case nothing else covered, not a demonstrated detector. Its
 * first meeting with real prose was a false positive that took a build down
 * for a day; what that cost, and what it changed, is written up on
 * {@link BARE_URL} and {@link HAS_HOST}.
 */

/**
 * A URL runs to the first character a URL cannot contain.
 *
 * This used to be `\S+`, "everything up to the next space" — and Chinese does
 * not write spaces. On the translation side the match therefore swallowed the
 * rest of the sentence: `（https://）和路径` yielded `https://）和路径`, which
 * could not equal anything the English side produced no matter how faithful
 * the translation was. `[!-~]` is printable ASCII, which is what a URL is made
 * of, so a match now ends at the first full-width bracket or Han character.
 *
 * `[^\s\P{ASCII}]` reads as a double negative because that is the only way to
 * say it without an opaque code-point range: not whitespace, and not outside
 * ASCII.
 *
 * The letters are spelled out rather than left to an `i` flag, and that is not
 * style. Under `iu` the engine case-folds before testing the class, and two
 * ASCII letters fold to non-ASCII ones — `s` to `ſ` (U+017F), `k` to `K`
 * (U+212A) — so `\P{ASCII}` would swallow them and the negated class would
 * *reject* `s` and `k`. Caught by the one test with an `s` mid-URL:
 * `ftp://h/Foo_(disambiguation)` matched as far as `ftp://h/Foo_(di`.
 *
 * That misfire is not hypothetical and it was not cheap. `connectors-operator`
 * release-1.14 was red on every run for 22 hours over one line of prose —
 * `includes the correct protocol (https://) and path` — where nothing had been
 * lost at all: the translation said the same thing with full-width brackets.
 * And because this rule reports against the whole page, the assembled document
 * could not attribute the finding to any segment and failed outright without a
 * repair round. A misfire here does not cost "one finding to read".
 *
 * The price of the narrowing, stated plainly: an internationalised host
 * written out in prose (`https://例え.jp`) is no longer detected. That is the
 * right trade — the sources are English technical documentation, and a
 * detector that cannot agree with its own translation is not a detector.
 *
 * The sibling rule made the opposite choice, and deliberately:
 * `translation-link-isomorphism` *reports* the full-width stop an autolink
 * absorbed rather than normalising it away, because there the punctuation ends
 * up inside a real `href` and the link genuinely breaks. Prose has no `href`
 * to break — `（ftp://h/x）` reads exactly as intended — so here the two
 * spellings are made comparable instead of being reported.
 */
const BARE_URL = /\b(?:[a-zA-Z][a-zA-Z0-9+.-]*:\/\/|[wW]{3}\.)[^\s\P{ASCII}]+/gu

/**
 * Punctuation that ends the sentence rather than the URL.
 *
 * `(see ftp://h/x)` and `fetch ftp://h/x.tar.` both put a character in the
 * match that the writer did not mean as part of the address, and the
 * translation — which repunctuates, because that is what translating prose
 * does — will not have it. Trimmed the way GFM's autolink extension trims it,
 * which is also the way a reader would.
 *
 * Only ASCII forms are listed: {@link BARE_URL} cannot match anything else, so
 * a full-width bracket here would be a branch that can never be taken.
 */
const TRAILING_PUNCTUATION = /[!"'*,.:;?_~]+$/u

/**
 * Closing brackets, and the opener each needs in order to belong to the URL.
 *
 * So `ftp://h/Foo_(disambiguation)` keeps its parenthesis — the URL opened it
 * — and `(see ftp://h/x)` does not.
 */
const BRACKETS = new Map([
  [')', '('],
  [']', '['],
  ['}', '{'],
])

const occurrences = (value: string, character: string) =>
  value.split(character).length - 1

const trimSentence = (url: string) => {
  let value = url
  for (;;) {
    const before = value
    value = value.replace(TRAILING_PUNCTUATION, '')
    const closing = value.at(-1)
    const opening = closing == null ? undefined : BRACKETS.get(closing)
    if (
      closing != null &&
      opening != null &&
      occurrences(value, closing) > occurrences(value, opening)
    ) {
      value = value.slice(0, -1)
    }
    if (value === before) {
      return value
    }
  }
}

/**
 * A scheme with nothing after it is not a URL.
 *
 * `https://` on its own is prose — a sentence naming the protocol, as in "the
 * address must include the protocol (https://)". Requiring a host is what
 * tells the two apart, and it gives up nothing this rule was protecting: an
 * address with no host cannot be fetched, so it cannot be a link a translation
 * has to carry through.
 */
const HAS_HOST = /(?::\/\/|^[wW]{3}\.)[^\s\P{ASCII}]/u

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
      const url = trimSentence(match)
      if (HAS_HOST.test(url)) {
        found.push(url)
      }
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
