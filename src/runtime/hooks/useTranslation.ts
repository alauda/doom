import { useCallback } from 'react'
import { useLang as useLang_ } from 'rspress/runtime'

import type { Language } from '../../shared/index.js'
import { TRANSLATIONS } from '../translation.js'

export const useLang = () => useLang_() as Language

export const useTranslation = () => {
  const lang = useLang()
  const translations = TRANSLATIONS[lang]
  return useCallback(
    (key: keyof typeof translations) => translations[key],
    [translations],
  )
}
