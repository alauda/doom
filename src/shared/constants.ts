export const ACP_BASE = '/container_platform/'

export const FALSY_VALUES = new Set(['', '0', 'false', 'no', 'off', 'n', 'f'])

export const JS_STR_FALSY_VALUES = new Set([
  '',
  '0',
  'false',
  'null',
  'undefined',
])

export const APIS_ROUTES = new Set(['apis/**', '*/apis/**'])

export const Language = {
  en: '英文',
  zh: '中文',
  ru: '俄文',
} as const

export type Language = keyof typeof Language

export const SUPPORTED_LANGUAGES = Object.keys(Language) as Language[]

export const UNVERSIONED = 'unversioned'

export const UNVERSIONED_PREFIX = `${UNVERSIONED}-`
