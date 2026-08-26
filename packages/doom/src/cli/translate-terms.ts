import { logger } from '@rspress/core'

import { Language } from '../shared/index.ts'

import { parseTerms } from './helpers.ts'

/**
 * The product's established translations for the terms a document uses.
 *
 * One implementation, because two consumers need exactly the same answer: the
 * translator is told to use these, and the reviewer has to be told that using
 * them is correct. When only the translator had the table, the reviewer
 * reported the house translation of a product term as a mistranslation —
 * measured on the corpus, that was four of the ten false reds in the first
 * calibration, all of them one term.
 */

export interface TermPair {
  source: string
  target: string
}

export const TERMS_SUPPORTED_LANGUAGES: Language[] = ['en', 'zh', 'ru']

export interface ResolvedTerms {
  /** Rendered for the translator's prompt. Empty when nothing matched. */
  text: string
  pairs: TermPair[]
}

export const resolveTerms = async (
  sourceLang: Language,
  targetLang: Language,
  sourceContent: string,
): Promise<ResolvedTerms> => {
  if (
    ![sourceLang, targetLang].every((lang) =>
      TERMS_SUPPORTED_LANGUAGES.includes(lang),
    )
  ) {
    return { text: '', pairs: [] }
  }

  const parsedTerms = await parseTerms()

  // Only the terms this document actually uses: the table is long, and a term
  // the source never mentions is noise in both prompts.
  const relevantTerms = parsedTerms.filter((term) => {
    const sourceTranslation = term[sourceLang]
    const targetTranslation = term[targetLang]
    if (!sourceTranslation || !targetTranslation) {
      return false
    }
    const sourceTermRegex = new RegExp(
      `\\b${sourceTranslation.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`,
      'i',
    )
    return sourceTermRegex.test(sourceContent)
  })

  if (relevantTerms.length === 0) {
    logger.debug('No relevant terms found for translation')
    return { text: '', pairs: [] }
  }

  const pairs = relevantTerms.map((term) => ({
    source: term[sourceLang]!,
    target: term[targetLang]!,
  }))

  const text =
    `- The following is a common related terminology vocabulary table (${Language[sourceLang]} <=> ${Language[targetLang]}), you should use it to translate the matched text.\n` +
    pairs.map((pair) => `  * ${pair.source} <=> ${pair.target}`).join('\n')

  logger.debug('Resolved terms:', text)
  return { text, pairs }
}
