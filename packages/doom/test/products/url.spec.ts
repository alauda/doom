import { describe, expect, test } from '@rstest/core'

import {
  getProductsOverviewCanonical,
  getProductsOverviewUrl,
} from '#products/url.ts'

describe('products overview URLs', () => {
  test('adds the current language to a root-relative deployment URL', () => {
    expect(
      getProductsOverviewUrl({ url: '/russian/products' }, 'ru', '/docs'),
    ).toBe('/russian/products?lang=ru')
  })

  test.each([
    [undefined, 'en', '/products/'],
    ['/', 'en', '/products/'],
    ['/russian', 'ru', '/russian/products/'],
    ['/docs', 'zh', '/docs/products/'],
    ['/docs/', 'zh', '/docs/products/'],
    ['/preview/acp', 'en', '/preview/acp/products/'],
  ])(
    'derives the default overview from prefix %s',
    (prefix, lang, expected) => {
      expect(getProductsOverviewUrl(undefined, lang, prefix)).toBe(
        `${expected}?lang=${lang}`,
      )
      expect(getProductsOverviewCanonical(undefined, prefix)).toBe(expected)
    },
  )

  test('keeps an absolute deployment URL absolute', () => {
    expect(
      getProductsOverviewUrl(
        { url: 'https://docs.example.test/docs/products?source=doom' },
        'zh',
      ),
    ).toBe('https://docs.example.test/docs/products?source=doom&lang=zh')
  })

  test('canonical URL does not inherit the language query', () => {
    expect(
      getProductsOverviewCanonical({ url: '/docs/products' }, '/russian'),
    ).toBe('/docs/products')
  })

  test('rejects a non-root-relative URL without a host', () => {
    expect(() => getProductsOverviewUrl({ url: 'products' }, 'en')).toThrow(
      'absolute URL or a root-relative path',
    )
  })

  test('rejects a protocol-relative URL', () => {
    expect(
      () => getProductsOverviewUrl({ url: '//host.example/products/' }, 'en'),
    ).toThrow('absolute URL or a root-relative path')
  })
})
