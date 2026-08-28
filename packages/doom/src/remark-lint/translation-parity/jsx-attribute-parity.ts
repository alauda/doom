import type { Root } from 'mdast'
import { lintRule } from 'unified-lint-rule'

import { TRANSLATABLE_JSX_ATTRS } from '../../runtime/components/_translation-policy.ts'

import { collectJsxAttributes, currentPair, diffMultiset } from './shared.ts'

/**
 * `src` and `href` are compared by `translation-link-isomorphism` instead,
 * which resolves them first. They legitimately differ as *written*: assets are
 * not copied per language, so a translation points back into the source tree —
 * `../../../en/networking/x.png` where the source says `./x.png`. Both name the
 * same file. Comparing the strings reports every illustrated page in the
 * corpus, which is what it did before this exemption existed.
 */
const RESOLVED_ELSEWHERE = new Set(['href', 'src'])

const isExempt = (key: string) => {
  const [element, attribute] = key.split('.')
  return (
    RESOLVED_ELSEWHERE.has(attribute) ||
    !!TRANSLATABLE_JSX_ATTRS[element]?.includes(attribute)
  )
}

/**
 * Component attributes are identifiers, and identifiers survive translation
 * unchanged.
 *
 * `<Term name="productShort" />`, `<K8sAPI name="backups.velero.io" />`,
 * `<OpenAPIPath path="/v1/alerthistories" />` — none of these is prose, and a
 * translation that changes one produces a page that renders wrong while the
 * build stays green. The exceptions are declared in one place,
 * `runtime/components/_translation-policy.ts`, and are the same list the
 * translator's masking uses: what may be translated is exactly what is not
 * protected.
 */
export const translationJsxAttributeParity = lintRule<Root>(
  'doom-lint:translation-jsx-attribute-parity',
  async (tree, vfile) => {
    const pair = await currentPair(tree, vfile)
    if (!pair) {
      return
    }

    const expected = collectJsxAttributes(pair.sourceTree)
    const actual = collectJsxAttributes(tree)

    for (const key of new Set([...expected.keys(), ...actual.keys()])) {
      if (isExempt(key)) {
        continue
      }
      const { missing, extra } = diffMultiset(
        expected.get(key) ?? [],
        actual.get(key) ?? [],
      )
      if (!missing.length && !extra.length) {
        continue
      }
      vfile.message(
        `Translation changed \`${key}\`, which is an identifier rather than prose: source has ${missing.length ? missing.map((v) => `\`${v}\``).join(', ') : '(nothing extra)'}, this has ${extra.length ? extra.map((v) => `\`${v}\``).join(', ') : '(nothing extra)'}.`,
        tree,
      )
    }
  },
)
