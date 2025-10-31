import parseAttrs from 'md-attr-parser'
import type { Node, Parent, Root } from 'mdast'
import { visit } from 'unist-util-visit'

export interface Attrs extends Node {
  type: 'attrs'
  value?: string | null
}

declare module 'mdast' {
  interface PhrasingContentMap {
    attrs: Attrs
  }

  interface RootContentMap {
    attrs: Attrs
  }
}

export function attributesTransformer(root: Root): void {
  visit(root, 'paragraph', (node, _, parent) => {
    if (
      'children' in node &&
      node.children.length === 1 &&
      node.children[0].type === 'attrs'
    ) {
      const children = parent!.children
      const index = children.indexOf(node)
      children[index] = node.children[0]
    }
  })

  visit(
    root,
    (node, _, parent) =>
      node.type === 'paragraph' && parent?.type === 'listItem',
    (node, _, parent) => {
      const { children } = node as Parent

      const ids = Object.entries(children)
        .filter(([, child]) => child.type === 'attrs')
        .map(([id, node]) => [Number.parseInt(id, 10), node] as [number, Attrs])

      if (ids.length === 0) {
        return
      }

      for (const [index, attrNode] of ids) {
        const sibling = children[index - 1]
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (sibling?.type === 'text' && parent) {
          const data = parent.data
          parent.data = {
            ...data,
            hProperties: {
              ...data?.hProperties,
              ...parseAttrs(attrNode.value).prop,
            },
          }
          children.splice(index, 1)
        }
      }
    },
  )

  visit(root, 'attrs', (node, index, parent) => {
    if (index == null || parent == null || parent.children.length <= 1) {
      return
    }

    const { children } = parent

    const sibling = children.at(index - 1)
    if (!sibling || sibling.type === 'text') {
      parent.data = {
        ...parent.data,
        hProperties: {
          ...parent.data?.hProperties,
          ...parseAttrs(node.value).prop,
        },
      }
    } else {
      sibling.data = {
        ...sibling.data,
        hProperties: {
          ...sibling.data?.hProperties,
          ...parseAttrs(node.value).prop,
        },
      }
    }

    children.splice(index, 1)
  })
}
