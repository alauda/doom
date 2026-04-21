import type { Heading, Html, Paragraph, Root } from 'mdast'
import type {
  MdxJsxAttribute,
  MdxJsxFlowElement,
  MdxJsxTextElement,
} from 'mdast-util-mdx-jsx'
import { lintRule } from 'unified-lint-rule'
import { visitParents } from 'unist-util-visit-parents'

type IdBearingElement = {
  context: string
  id: string
  node: Html | MdxJsxFlowElement | MdxJsxTextElement | Paragraph
}

const getHtmlId = (value: string) => {
  const match = /\sid\s*=\s*(["'])(.*?)\1/iu.exec(value)
  if (!match) {
    return
  }
  return match[2]
}

const getHtmlIdBearingElement = (
  node: Html | Paragraph,
): IdBearingElement | undefined => {
  const context =
    node.type === 'html'
      ? node.value
      : node.children.every((child) => child.type === 'html')
        ? node.children.map((child) => child.value).join('')
        : undefined

  if (!context) {
    return
  }

  const id = getHtmlId(context)
  if (!id) {
    return
  }

  return {
    context,
    id,
    node,
  }
}

const getMdxIdAttribute = (
  node: MdxJsxFlowElement | MdxJsxTextElement,
): MdxJsxAttribute | undefined => {
  const idAttribute = node.attributes.find(
    (attribute): attribute is MdxJsxAttribute =>
      attribute.type === 'mdxJsxAttribute' &&
      attribute.name === 'id' &&
      typeof attribute.value === 'string',
  )

  return idAttribute
}

const getMdxId = (node: MdxJsxFlowElement | MdxJsxTextElement) => {
  const idAttribute = getMdxIdAttribute(node)
  return typeof idAttribute?.value === 'string' ? idAttribute.value : undefined
}

const stringifyMdxElement = (node: MdxJsxFlowElement | MdxJsxTextElement) => {
  const attributes = node.attributes
    .map((attribute) => {
      if (attribute.type === 'mdxJsxExpressionAttribute') {
        return `{...${attribute.value}}`
      }

      if (attribute.value === null || attribute.value === undefined) {
        return attribute.name
      }

      if (typeof attribute.value === 'string') {
        return `${attribute.name}="${attribute.value}"`
      }

      return `${attribute.name}={${attribute.value.value}}`
    })
    .join(' ')

  const name = node.name ?? ''
  return `<${name}${attributes ? ` ${attributes}` : ''} />`
}

const getIdBearingElement = (
  node: Root['children'][number] | Heading['children'][number],
): IdBearingElement | undefined => {
  if (node.type === 'html' || node.type === 'paragraph') {
    return getHtmlIdBearingElement(node)
  }

  if (node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') {
    const id = getMdxId(node)
    if (!id) {
      return
    }

    return {
      context: stringifyMdxElement(node),
      id,
      node,
    }
  }
}

const getHeadingAnchorExample = (filepath: string, id: string) =>
  filepath.endsWith('.mdx') ? `# Title \\{#${id}}` : `# Title {#${id}}`

const createMessage = (filepath: string, element: IdBearingElement) =>
  `Unexpected id-bearing element \`${element.context}\` associated with a heading, rewrite it to \`${getHeadingAnchorExample(filepath, element.id)}\` instead.`

export const headingAnchorFormat = lintRule<Root>(
  'doom-lint:heading-anchor-format',
  (root, vfile) => {
    visitParents(
      root,
      ['paragraph', 'html', 'mdxJsxFlowElement', 'mdxJsxTextElement'] as const,
      (node, parents) => {
        const element = getIdBearingElement(node)
        if (!element) {
          return
        }

        const report = () => {
          vfile.message(createMessage(vfile.path, element), {
            ancestors: [...parents, node],
            place: element.node.position,
          })
        }

        const parent = parents.at(-1)!

        if (parent.type === 'heading') {
          report()
          return
        }

        const index = parent.children.indexOf(node)
        if (index < 0) {
          return
        }

        for (const siblingIndex of [index - 1, index + 1]) {
          if (siblingIndex < 0 || siblingIndex >= parent.children.length) {
            continue
          }

          const sibling = parent.children[siblingIndex]
          if (sibling.type !== 'heading') {
            continue
          }

          report()
          return
        }
      },
    )
  },
)
