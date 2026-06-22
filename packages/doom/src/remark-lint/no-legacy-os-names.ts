import type { Root } from 'mdast'
import type {
  MdxJsxAttribute,
  MdxJsxAttributeValueExpression,
} from 'mdast-util-mdx-jsx'
import { lintRule } from 'unified-lint-rule'
import { visitParents } from 'unist-util-visit-parents'

const LEGACY_OS_NAME_REGEX =
  /(?<![\p{L}\p{N}])(?:micro\s*os|micros|kube\s*os)(?![\p{L}\p{N}])/giu

interface StringValueNode {
  value: string
  position?: Root['position']
}

const isStringValueNode = (node: unknown): node is StringValueNode =>
  !!node &&
  typeof node === 'object' &&
  'value' in node &&
  typeof node.value === 'string'

const reportLegacyOSNames = (
  value: string,
  report: (legacyName: string) => void,
) => {
  for (const { 0: legacyName } of value.matchAll(LEGACY_OS_NAME_REGEX)) {
    report(legacyName)
  }
}

const createMessage = (legacyName: string) =>
  `Unexpected legacy OS name "${legacyName}", use "Alauda OS" or "alauda os" instead`

const getAttributeStringValue = (
  value: MdxJsxAttribute['value'],
): string | undefined => {
  if (typeof value === 'string') {
    return value
  }

  return (value as MdxJsxAttributeValueExpression).value
}

export const noLegacyOSNames = lintRule<Root>(
  'doom-lint:no-legacy-os-names',
  (root, vfile) => {
    visitParents(root, (node, parents) => {
      if (!isStringValueNode(node)) {
        return
      }

      reportLegacyOSNames(node.value, (legacyName) => {
        vfile.message(createMessage(legacyName), {
          ancestors: [...parents, node],
          place: node.position,
        })
      })
    })

    visitParents(
      root,
      ['mdxJsxFlowElement', 'mdxJsxTextElement'] as const,
      (element, parents) => {
        for (const attribute of element.attributes) {
          if (
            attribute.type !== 'mdxJsxAttribute' ||
            typeof attribute.value === 'boolean' ||
            attribute.value == null
          ) {
            continue
          }

          const value = getAttributeStringValue(attribute.value)
          if (value == null) {
            continue
          }

          reportLegacyOSNames(value, (legacyName) => {
            vfile.message(createMessage(legacyName), {
              ancestors: [...parents, element],
              place: attribute.position,
            })
          })
        }
      },
    )
  },
)
