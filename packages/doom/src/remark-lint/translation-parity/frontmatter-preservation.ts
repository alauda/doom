import type { Root } from 'mdast'
import { lintRule } from 'unified-lint-rule'

import { currentPair } from './shared.ts'

/**
 * Frontmatter is configuration, not copy.
 *
 * `weight` orders the sidebar, `sourceSHA` pairs the document with its source,
 * `i18n` and the rest steer the build. Only `title` and `description` are read
 * by a human, and only those two are translated. Anything else that differs
 * between a source and its translation changes how the site is built for one
 * language and not the other.
 */
const TRANSLATED_KEYS = new Set(['title', 'description'])
// `sourceSHA` and `i18nSegments` are written by the translator and `i18n` is
// deliberately dropped from the translation — none of the three is a
// divergence. Leaving `i18nSegments` out of this set would report every
// translated document in the corpus, every time.
const TRANSLATOR_OWNED_KEYS = new Set(['sourceSHA', 'i18nSegments', 'i18n'])

export const translationFrontmatterPreservation = lintRule<Root>(
  'doom-lint:translation-frontmatter-preservation',
  async (tree, vfile) => {
    const pair = await currentPair(tree, vfile)
    if (!pair) {
      return
    }

    const keys = new Set([
      ...Object.keys(pair.sourceFrontmatter),
      ...Object.keys(pair.targetFrontmatter),
    ])

    for (const key of keys) {
      if (TRANSLATED_KEYS.has(key) || TRANSLATOR_OWNED_KEYS.has(key)) {
        continue
      }
      const expected = JSON.stringify(pair.sourceFrontmatter[key] ?? null)
      const actual = JSON.stringify(pair.targetFrontmatter[key] ?? null)
      if (expected === actual) {
        continue
      }
      vfile.message(
        `Translation changed frontmatter \`${key}\`: source has ${expected}, this has ${actual}. Only \`title\` and \`description\` are translated.`,
        tree,
      )
    }
  },
)
