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
    en: 'Navigation',
    zh: '导航',
    ru: 'Навигация',
  },
  {
    en: 'Overview',
    zh: '概览',
    ru: 'Обзор',
  },
  {
    en: 'Introduction',
    zh: '介绍',
    ru: 'Введение',
  },
  {
    en: 'Architecture',
    zh: '架构',
    ru: 'Архитектура',
  },
  {
    en: 'Install',
    zh: '安装',
    ru: 'Установка',
  },
  {
    en: 'Upgrade',
    zh: '升级',
    ru: 'Обновление',
  },
  {
    en: 'Quick Start',
    zh: '快速开始',
    ru: 'Быстрый старт',
  },
  {
    en: 'Concepts',
    zh: '核心概念',
    ru: 'Основные понятия',
  },
  {
    en: 'Guides',
    zh: '操作指南',
    ru: 'Руководства',
  },
  {
    en: 'How To',
    zh: '实用指南',
    ru: 'Как сделать',
  },
  {
    en: 'Release Notes',
    zh: '发版日志',
    ru: 'Примечания к выпуску',
  },
  {
    en: 'API Reference',
    zh: 'API 参考',
    ru: 'Справочник API',
  },
  {
    en: 'FAQ',
    zh: '常见问题',
    ru: 'Часто задаваемые вопросы',
  },
  {
    en: 'Trouble Shooting',
    zh: '故障排除',
    ru: 'Устранение неполадок',
  },
]

export const UNVERSIONED = 'unversioned'

export const UNVERSIONED_PREFIX = `${UNVERSIONED}-`
