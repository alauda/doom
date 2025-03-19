import type { Plugin } from 'unified'
import type { Root } from 'hast'
import { visit } from 'unist-util-visit'
import { isExternalUrl } from '@rspress/core'
import type { MdxjsEsm } from 'mdast-util-mdxjs-esm'
import { getASTNodeImport } from './utils.js'

const getMdxSrcAttribute = (tempVar: string) => {
  return {
    type: 'mdxJsxAttribute',
    name: 'src',
    value: {
      type: 'mdxJsxAttributeValueExpression',
      value: tempVar,
      data: {
        estree: {
          type: 'Program',
          sourceType: 'module',
          body: [
            {
              type: 'ExpressionStatement',
              expression: {
                type: 'Identifier',
                name: tempVar,
              },
            },
          ],
        },
      },
    },
  }
}

const normalizeImageUrl = (imageUrl: string) => {
  if (isExternalUrl(imageUrl) || imageUrl.startsWith('/')) {
    return
  }

  return imageUrl
}

export const rehypeNormalizeLink: Plugin<[], Root> = () => {
  return (tree) => {
    const images: MdxjsEsm[] = []
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'img') {
        return
      }

      const { alt, src } = node.properties || {}

      if (typeof src !== 'string') {
        return
      }

      const imagePath = normalizeImageUrl(src)

      if (!imagePath) {
        return
      }

      // relative path
      const tempVariableName = `doom_image${images.length}`

      Object.assign(node, {
        type: 'mdxJsxFlowElement',
        name: 'img',
        children: [],
        attributes: [
          alt && {
            type: 'mdxJsxAttribute',
            name: 'alt',
            value: alt,
          },
          getMdxSrcAttribute(tempVariableName),
        ].filter(Boolean),
      })

      images.push(getASTNodeImport(tempVariableName, imagePath))
    })
    tree.children.unshift(...images)
  }
}
