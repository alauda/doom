import { useLang } from '@rspress/core/runtime'

import { Locale, TRANSLATIONS } from '../translation.js'
import { useCallback } from 'react'

export const useTranslation = () => {
  const lang = (useLang() || 'zh') as Locale
  const translations = TRANSLATIONS[lang]
  return useCallback((key: keyof typeof translations) => translations[key], [])
}
