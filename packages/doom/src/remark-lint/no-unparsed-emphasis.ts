import type { Root } from 'mdast'
import { lintRule } from 'unified-lint-rule'
import { pointStart } from 'unist-util-position'
import { visitParents } from 'unist-util-visit-parents'

/**
 * Emphasis delimiters that did not become emphasis.
 *
 * `**bold**` only works when the delimiters flank the text: `** bold **` does
 * not, and neither does `**注意：**卸载`, because the closing run is preceded by
 * punctuation and followed by a letter. Either way the page shows the asterisks
 * to the reader, and nothing else notices — the document parses, every link
 * resolves, every component is present.
 *
 * A `text` node holding `**` is exactly that situation: the delimiters reached
 * the tree as literal characters instead of wrapping anything.
 *
 * Measured on the acp-docs corpus before being turned on: 2 of 922 English
 * documents, 7 of 875 Chinese, 2 of 875 Russian — 11 in all, every one of them
 * a real page with literal asterisks on it, and two of them the English source
 * of the Russian pair. The Chinese cases are the common shape: a translation
 * writes `**注意：**此标签`, which is bold in the source's spacing and is not in
 * the translation's.
 *
 * `__`, which CommonMark treats the same way, is covered by the same rule and
 * by its tests, but was not measured — it does not occur in this corpus at all.
 *
 * A document that means to show literal asterisks says so with
 * `<!-- lint disable no-unparsed-emphasis -->`.
 */

/**
 * A `**` anywhere, or a `__` that is not inside a word.
 *
 * `__` gets the narrower test because `snake__case` in prose is not emphasis
 * anyone attempted, while `**` in prose is not something anyone types by
 * accident.
 */
const UNPARSED_EMPHASIS = /\*\*|(?<![\p{L}\p{N}])__|__(?![\p{L}\p{N}])/u

/**
 * The `**` half of the test on its own.
 *
 * `doom translate` runs this check a segment at a time, before the placeholders
 * are put back, and a masked segment is full of `__DOOM_TR_ICODE_0__`. The `__`
 * half would report every one of them. `**` never appears in a placeholder, so
 * the half that matters for the defect this rule was written for is also the
 * half that is safe to run on masked text.
 */
const UNPARSED_STRONG = /\*\*/u

/** What one of these looks like to a person, wherever it is reported. */
export const explainUnparsedEmphasis = (delimiter: string, window: string) =>
  `\`${delimiter}\` is printed to the page here, not read as emphasis: \`${window}\`. ` +
  `Emphasis delimiters must sit directly against the text they emphasise — \`**text**\`, not \`** text **\` and not \`**text：**more\`.`

/**
 * The first unparsed delimiter in a string, if there is one.
 *
 * `maskedText` narrows the test to `**`; see `UNPARSED_STRONG`.
 */
export const findUnparsedEmphasis = (
  value: string,
  { maskedText = false }: { maskedText?: boolean } = {},
) => {
  const match = (maskedText ? UNPARSED_STRONG : UNPARSED_EMPHASIS).exec(value)
  return match
    ? { delimiter: match[0], window: preview(value, match.index) }
    : undefined
}

export const noUnparsedEmphasis = lintRule<Root>(
  'doom-lint:no-unparsed-emphasis',
  (root, vfile) => {
    visitParents(root, 'text', (node, parents) => {
      const found = findUnparsedEmphasis(node.value)
      if (!found) {
        return
      }
      vfile.message(explainUnparsedEmphasis(found.delimiter, found.window), {
        ancestors: [...parents, node],
        place: pointStart(node),
      })
    })
  },
)

/** A short window around the offending delimiter, for a person reading the log. */
const preview = (value: string, index: number) => {
  const from = Math.max(0, index - 20)
  const to = Math.min(value.length, index + 30)
  return `${from > 0 ? '…' : ''}${value.slice(from, to)}${to < value.length ? '…' : ''}`
}
