import fs from 'node:fs/promises'
import path from 'node:path'

import type {
  CSpellSettings,
  DictionaryDefinitionCustom,
} from '@cspell/cspell-types'

import { parseTerms } from './cli/helpers.js'
import type { NormalizedTermItem } from './terms.js'

const resolveDictionaries = async (): Promise<
  Pick<CSpellSettings, 'dictionaries' | 'dictionaryDefinitions'> | undefined
> => {
  const dictionariesDir = path.resolve('.cspell')
  try {
    if (!(await fs.stat(dictionariesDir)).isDirectory()) {
      return
    }
  } catch {
    return
  }

  const dictionaries: string[] = []
  const dictionaryDefinitions: DictionaryDefinitionCustom[] = []

  for (const file of await fs.readdir(dictionariesDir, {
    withFileTypes: true,
  })) {
    if (!file.isFile()) {
      continue
    }
    const dictionary = path.parse(file.name).name
    dictionaries.push(dictionary)
    dictionaryDefinitions.push({
      name: dictionary,
      path: `.cspell/${file.name}`,
      addWords: true,
    })
  }

  return { dictionaries, dictionaryDefinitions }
}

const CASE_SENSITIVE_DICTIONARY = '$$case-sensitive$$'

export default async function doom(): Promise<CSpellSettings> {
  const parsedTerms = await parseTerms()
  const words: string[] = []
  const caseSensitiveWords: NormalizedTermItem[] = []

  const flagWords = parsedTerms.flatMap((it) => {
    const word = it.en
    const badCases = it.badCases?.en ?? []
    if (
      badCases.some((c) => word !== c && word.toLowerCase() === c.toLowerCase())
    ) {
      caseSensitiveWords.push(it)
      return []
    }

    words.push(word)
    return badCases
  })

  const { dictionaries = [], dictionaryDefinitions = [] } =
    (await resolveDictionaries()) ?? {}

  if (caseSensitiveWords.length) {
    dictionaries.push(CASE_SENSITIVE_DICTIONARY)
    dictionaryDefinitions.push({
      name: CASE_SENSITIVE_DICTIONARY,
      words: caseSensitiveWords.flatMap((it) => [
        it.en,
        ...(it.badCases?.en ?? []).map((c) => `!${c}`),
      ]),
    })
  }

  return {
    allowCompoundWords: true,
    language: 'en,en-GB,en-US',
    useGitignore: true,
    words,
    flagWords,
    dictionaries,
    dictionaryDefinitions,
  }
}
