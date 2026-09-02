import type { Root } from 'mdast'
import { lintRule } from 'unified-lint-rule'
import { pointStart } from 'unist-util-position'
import { visit } from 'unist-util-visit'

/**
 * Frontmatter whose opening `---` is missing.
 *
 * A document that starts
 *
 * ```
 * weight: 13
 * ---
 * ```
 *
 * has no frontmatter at all. What it has is a setext heading: a line of text
 * underlined by `---` is a level-two heading, so the page gets a heading called
 * "weight: 13" and loses whatever the frontmatter was supposed to say.
 *
 * Nothing else notices. The file parses, every link resolves, the heading is a
 * perfectly ordinary heading — `heading-increment` sees a rank drop from 2 to 1
 * and is fine with it, `title-required` finds the `#` heading below and is
 * satisfied. It took a *translation* to surface it, because comparing the two
 * documents showed a heading the translation did not have. A single document
 * cannot tell "weight: 13" from a heading someone meant to write; this rule can,
 * because it only looks at the very first node and only at the keys doom's
 * frontmatter actually uses.
 *
 * Measured on acp-docs before being turned on: 914 English documents, of which
 * 88 legitimately have no frontmatter (generated api pages, index pages) — and
 * exactly one of those 88 opens with something shaped like a frontmatter key.
 * One true positive, no false ones. "Every document must have frontmatter"
 * would have reported all 88.
 */

/**
 * The keys doom's frontmatter actually uses, counted across acp-docs rather
 * than remembered: weight 797 · sourceSHA 194 · title 132 · i18n 125 ·
 * queries 73 · description 21 · category 5 · author 4. `i18nSegments` is
 * written by `doom translate` and so appears in no count taken before it
 * existed; it is here because a translation is exactly the kind of file whose
 * frontmatter a model can lose the opening `---` from.
 *
 * Deliberately a list and not `\w+:` — a heading really can begin "Note:" or
 * "Step 1:", and reporting those would be a rule nobody keeps.
 */
const FRONTMATTER_KEYS = [
  'author',
  'category',
  'description',
  'i18n',
  'i18nSegments',
  'queries',
  'sourceSHA',
  'title',
  'weight',
]

const OPENS_WITH_FRONTMATTER_KEY = new RegExp(
  `^(?:${FRONTMATTER_KEYS.join('|')})\\s*:`,
)

export const noUnopenedFrontmatter = lintRule<Root>(
  'doom-lint:no-unopened-frontmatter',
  (root, vfile) => {
    if (root.children.length === 0) {
      return
    }
    const [first] = root.children
    // Frontmatter that opened properly is a `yaml` node, not a heading.
    if (first.type !== 'heading') {
      return
    }

    let text = ''
    visit(first, 'text', (node) => {
      text += node.value
    })

    const match = OPENS_WITH_FRONTMATTER_KEY.exec(text.trim())
    if (!match) {
      return
    }

    vfile.message(
      `This document opens with a heading called \`${text.trim()}\`, which is frontmatter that never opened: the \`---\` above it is missing, so the line below it underlined it into a heading instead. Add the opening \`---\`.`,
      { ancestors: [first], place: pointStart(first) },
    )
  },
)
