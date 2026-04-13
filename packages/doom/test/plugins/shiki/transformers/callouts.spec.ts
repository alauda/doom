import { describe, expect, test } from '@rstest/core'
import { codeToHtml } from 'shiki'

import { createTransformerCallouts } from '#plugins/shiki/transformers/callouts.ts'

describe('createTransformerCallouts', () => {
  test('creates transformer with default options', () => {
    const transformer = createTransformerCallouts()

    expect(transformer).toBeDefined()
    expect(transformer.name).toBe('shiki-transformer:callouts')
  })

  test('creates transformer with custom classActiveLine', () => {
    const transformer = createTransformerCallouts({
      classActiveLine: 'custom-callout',
    })

    expect(transformer).toBeDefined()
    expect(transformer.name).toBe('shiki-transformer:callouts')
  })

  test('creates transformer with custom classActivePre', () => {
    const transformer = createTransformerCallouts({
      classActivePre: 'custom-has-callouts',
    })

    expect(transformer).toBeDefined()
    expect(transformer.name).toBe('shiki-transformer:callouts')
  })

  test('creates transformer with all custom options', () => {
    const transformer = createTransformerCallouts({
      classActiveLine: 'my-callout',
      classActivePre: 'my-has-callouts',
    })

    expect(transformer).toBeDefined()
    expect(transformer.name).toBe('shiki-transformer:callouts')
  })

  test('transformer adds callout class to marked lines', async () => {
    const transformer = createTransformerCallouts()

    const code = `const x = 1 // [!code callout]
const y = 2`

    const html = await codeToHtml(code, {
      lang: 'javascript',
      theme: 'github-light',
      transformers: [transformer],
    })

    expect(html).toContain('callout')
  })

  test('transformer adds has-callouts class to pre element', async () => {
    const transformer = createTransformerCallouts()

    const code = `const x = 1 // [!code callout]`

    const html = await codeToHtml(code, {
      lang: 'javascript',
      theme: 'github-light',
      transformers: [transformer],
    })

    expect(html).toContain('has-callouts')
  })

  test('transformer uses custom classes when provided', async () => {
    const transformer = createTransformerCallouts({
      classActiveLine: 'custom-line',
      classActivePre: 'custom-pre',
    })

    const code = `const x = 1 // [!code callout]`

    const html = await codeToHtml(code, {
      lang: 'javascript',
      theme: 'github-light',
      transformers: [transformer],
    })

    expect(html).toContain('custom-line')
    expect(html).toContain('custom-pre')
  })

  test('transformer does not add classes when no callout annotation', async () => {
    const transformer = createTransformerCallouts()

    const code = `const x = 1
const y = 2`

    const html = await codeToHtml(code, {
      lang: 'javascript',
      theme: 'github-light',
      transformers: [transformer],
    })

    expect(html).not.toContain('has-callouts')
  })
})
