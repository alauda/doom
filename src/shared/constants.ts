export const ACP_BASE = '/container_platform/'

export const FALSY_VALUES = new Set([
  null,
  undefined,
  '',
  '0',
  'false',
  'no',
  'off',
  'n',
  'f',
])

export const TRUTHY_VALUES = new Set(['1', 'true', 'yes', 'on', 'y', 't'])

export const JS_STR_FALSY_VALUES = new Set([
  null,
  undefined,
  '',
  '0',
  'false',
  'null',
  'undefined',
])

export const APIS_ROUTES = new Set(['apis/**', '*/apis/**'])

export const Language = {
  en: 'English',
  zh: 'Chinese',
  ru: 'Russian',
} as const

export type Language = keyof typeof Language

export const SUPPORTED_LANGUAGES = Object.keys(Language) as Language[]

export const TITLE_TRANSLATION_MAP: Array<Partial<Record<Language, string>>> = [
  {
    en: 'Concepts',
    zh: '核心概念',
    ru: 'Основные понятия',
  },
  {
    en: 'Guides',
    zh: '操作指南',
  },
  {
    en: 'How To',
    zh: '实用指南',
  },
  {
    en: 'Release Notes',
    zh: '发版日志',
  },
]

export const UNVERSIONED = 'unversioned'

export const UNVERSIONED_PREFIX = `${UNVERSIONED}-`
