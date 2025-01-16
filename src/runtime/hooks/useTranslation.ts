import { useLang } from '@rspress/core/runtime'
import { useCallback } from 'react'

import { type Locale, TRANSLATIONS } from '../translation.js'

export const useTranslation = () => {
  const lang = (useLang() || 'zh') as Locale
  const translations = TRANSLATIONS[lang]
  return useCallback((key: keyof typeof translations) => translations[key], [])
}
