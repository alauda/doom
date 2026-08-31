import { describe, expect, test } from '@rstest/core'

import {
  getGlobalComponentNames,
  isGlobalComponentFile,
} from '#plugins/global/components.ts'

/**
 * Every file in `runtime/components/` that is not opted out becomes a global
 * MDX component, and its *filename* is emitted verbatim as the identifier:
 *
 *     import Toc from "…/runtime/components/Toc.ts"
 *
 * So a filename that is not a valid JS identifier is not a bad name — it is a
 * syntax error injected into every document of every site doom builds. That is
 * exactly what `translation-policy.ts` did: a shared constants module dropped
 * beside the components produced `import Translation-policy from …`, and every
 * `docs:build` failed with `Expected ',', got '-'`.
 *
 * The rule for a non-component module in that directory is the one `_utils.ts`
 * has always followed: prefix it with `_`.
 */
describe('global component names', () => {
  const names = getGlobalComponentNames()

  test('there are some', () => {
    // Guards the guard: a glob that silently returns nothing would make every
    // assertion below vacuously true.
    expect(names.length).toBeGreaterThan(10)
  })

  test.each(names)('`%s` is a usable JSX identifier', (name) => {
    // Uppercase first letter is not style: MDX reads a lowercase identifier as
    // an HTML tag, so a lowercase component silently never renders.
    expect(name).toMatch(/^[A-Z]\w*$/)
  })
})

describe('isGlobalComponentFile', () => {
  test('takes a component', () => {
    expect(isGlobalComponentFile('Term.tsx')).toBe(true)
  })

  test.each(['_utils.ts', '_translation-policy.ts', '_X.tsx'])(
    'leaves out `%s` — the `_` prefix is how a non-component opts out',
    (file) => {
      expect(isGlobalComponentFile(file)).toBe(false)
    },
  )

  test.each(['index.ts', 'types.d.ts'])('leaves out `%s`', (file) => {
    expect(isGlobalComponentFile(file)).toBe(false)
  })
})
