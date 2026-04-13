import { describe, expect, test } from '@rstest/core'

import {
  ACP_BASE,
  APIS_ROUTES,
  FALSY_VALUES,
  JS_STR_FALSY_VALUES,
  Language,
  SUPPORTED_LANGUAGES,
  TITLE_TRANSLATION_MAP,
  TRUTHY_VALUES,
  UNVERSIONED,
  UNVERSIONED_PREFIX,
} from '#shared/constants.ts'

describe('ACP_BASE', () => {
  test('has correct value', () => {
    expect(ACP_BASE).toBe('/container_platform/')
  })
})

describe('FALSY_VALUES', () => {
  test('contains expected falsy values', () => {
    expect(FALSY_VALUES.has(null)).toBe(true)
    expect(FALSY_VALUES.has(undefined)).toBe(true)
    expect(FALSY_VALUES.has('')).toBe(true)
    expect(FALSY_VALUES.has('0')).toBe(true)
    expect(FALSY_VALUES.has('false')).toBe(true)
    expect(FALSY_VALUES.has('no')).toBe(true)
    expect(FALSY_VALUES.has('off')).toBe(true)
    expect(FALSY_VALUES.has('n')).toBe(true)
    expect(FALSY_VALUES.has('f')).toBe(true)
  })

  test('does not contain truthy values', () => {
    expect(FALSY_VALUES.has('1')).toBe(false)
    expect(FALSY_VALUES.has('true')).toBe(false)
    expect(FALSY_VALUES.has('yes')).toBe(false)
  })
})

describe('TRUTHY_VALUES', () => {
  test('contains expected truthy values', () => {
    expect(TRUTHY_VALUES.has('1')).toBe(true)
    expect(TRUTHY_VALUES.has('true')).toBe(true)
    expect(TRUTHY_VALUES.has('yes')).toBe(true)
    expect(TRUTHY_VALUES.has('on')).toBe(true)
    expect(TRUTHY_VALUES.has('y')).toBe(true)
    expect(TRUTHY_VALUES.has('t')).toBe(true)
  })

  test('does not contain falsy values', () => {
    expect(TRUTHY_VALUES.has('0')).toBe(false)
    expect(TRUTHY_VALUES.has('false')).toBe(false)
    expect(TRUTHY_VALUES.has('no')).toBe(false)
  })
})

describe('JS_STR_FALSY_VALUES', () => {
  test('contains JS string falsy values', () => {
    expect(JS_STR_FALSY_VALUES.has(null)).toBe(true)
    expect(JS_STR_FALSY_VALUES.has(undefined)).toBe(true)
    expect(JS_STR_FALSY_VALUES.has('')).toBe(true)
    expect(JS_STR_FALSY_VALUES.has('0')).toBe(true)
    expect(JS_STR_FALSY_VALUES.has('false')).toBe(true)
    expect(JS_STR_FALSY_VALUES.has('null')).toBe(true)
    expect(JS_STR_FALSY_VALUES.has('undefined')).toBe(true)
  })
})

describe('APIS_ROUTES', () => {
  test('contains expected API routes', () => {
    expect(APIS_ROUTES.has('apis/**')).toBe(true)
    expect(APIS_ROUTES.has('*/apis/**')).toBe(true)
  })

  test('has exactly 2 routes', () => {
    expect(APIS_ROUTES.size).toBe(2)
  })
})

describe('Language', () => {
  test('has correct language mappings', () => {
    expect(Language.en).toBe('English')
    expect(Language.zh).toBe('Chinese')
    expect(Language.ru).toBe('Russian')
  })
})

describe('SUPPORTED_LANGUAGES', () => {
  test('contains all language keys', () => {
    expect(SUPPORTED_LANGUAGES).toContain('en')
    expect(SUPPORTED_LANGUAGES).toContain('zh')
    expect(SUPPORTED_LANGUAGES).toContain('ru')
  })

  test('has correct length', () => {
    expect(SUPPORTED_LANGUAGES).toHaveLength(3)
  })
})

describe('TITLE_TRANSLATION_MAP', () => {
  test('is an array of translation objects', () => {
    expect(Array.isArray(TITLE_TRANSLATION_MAP)).toBe(true)
    expect(TITLE_TRANSLATION_MAP.length).toBeGreaterThan(0)
  })

  test('contains Navigation translations', () => {
    const nav = TITLE_TRANSLATION_MAP.find((t) => t.en === 'Navigation')
    expect(nav).toBeDefined()
    expect(nav!.zh).toBe('导航')
    expect(nav!.ru).toBe('Навигация')
  })

  test('contains Overview translations', () => {
    const overview = TITLE_TRANSLATION_MAP.find((t) => t.en === 'Overview')
    expect(overview).toBeDefined()
    expect(overview!.zh).toBe('概览')
    expect(overview!.ru).toBe('Обзор')
  })

  test('contains FAQ translations', () => {
    const faq = TITLE_TRANSLATION_MAP.find((t) => t.en === 'FAQ')
    expect(faq).toBeDefined()
    expect(faq!.zh).toBe('常见问题')
  })
})

describe('UNVERSIONED', () => {
  test('has correct value', () => {
    expect(UNVERSIONED).toBe('unversioned')
  })
})

describe('UNVERSIONED_PREFIX', () => {
  test('has correct value', () => {
    expect(UNVERSIONED_PREFIX).toBe('unversioned-')
  })

  test('starts with UNVERSIONED', () => {
    expect(UNVERSIONED_PREFIX.startsWith(UNVERSIONED)).toBe(true)
  })
})
