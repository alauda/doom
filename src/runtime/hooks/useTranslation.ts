import { useLang } from '@rspress/core/runtime'
import { useCallback } from 'react'

import { type Locale, TRANSLATIONS } from '../translation.js'

export const useLocale = () => useLang() as Locale

export const useTranslation = () => {
  const lang = useLocale()
  const translations = TRANSLATIONS[lang]
  return useCallback((key: keyof typeof translations) => translations[key], [])
}
