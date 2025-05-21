import type { Root } from 'mdast'
import type { Plugin } from 'unified'

import { getASTNodeImport } from '../shared.js'

export const remarkAutoToc: Plugin<[], Root> = function () {
  return (root) => {
    let foundIndex = -1

    for (const [index, node] of root.children.entries()) {
      if (node.type === 'heading' && node.depth === 2) {
        foundIndex = index
        break
      }
    }

    if (foundIndex === -1) {
      return
    }

    root.children.splice(
      foundIndex,
      0,
      getASTNodeImport(
        { useTranslation: 'useTranslation_' },
        '@alauda/doom/runtime',
      ),
      {
        type: 'mdxJsxFlowElement',
        name: 'div',
        attributes: [
          {
            type: 'mdxJsxAttribute',
            name: 'className',
            value: 'doom-auto-toc rspress-toc-exclude',
          },
        ],
        children: [
          {
            type: 'heading',
            depth: 2,
            children: [
              {
                type: 'mdxTextExpression',
                value: "useTranslation_()('toc')",
                data: {
                  estree: {
                    type: 'Program',
                    sourceType: 'module',
                    body: [
                      {
                        type: 'ExpressionStatement',
                        expression: {
                          type: 'CallExpression',
                          callee: {
                            type: 'CallExpression',
                            callee: {
                              type: 'Identifier',
                              name: 'useTranslation_',
                            },
                            arguments: [],
                            optional: false,
                          },
                          arguments: [
                            {
                              type: 'Literal',
                              value: 'toc',
                              raw: "'toc'",
                            },
                          ],
                          optional: false,
                        },
                      },
                    ],
                  },
                },
              },
              {
                type: 'text',
                value: ' {#toc}',
              },
            ],
          },
          {
            type: 'mdxJsxFlowElement',
            name: 'Toc',
            attributes: [],
            children: [],
          },
        ],
      },
    )
  }
}
