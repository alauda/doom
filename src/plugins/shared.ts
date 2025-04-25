import type { MdxjsEsm } from 'mdast-util-mdx'

// Construct import statement for AST
// Such as: import image1 from './test.png'
export function getASTNodeImport(
  name: string | Record<string, string | null>,
  from: string,
): MdxjsEsm {
  const isStringName = typeof name === 'string'
  return {
    type: 'mdxjsEsm',
    value: `import ${
      isStringName
        ? name
        : `{${Object.entries(name)
            .map(
              ([imported, local]) =>
                `${imported}${imported === local || !local ? '' : ` as ${local}`}`,
            )
            .join(',')}}`
    } from ${JSON.stringify(from)}`,
    data: {
      estree: {
        type: 'Program',
        sourceType: 'module',
        body: [
          {
            type: 'ImportDeclaration',
            specifiers: isStringName
              ? [
                  {
                    type: 'ImportDefaultSpecifier',
                    local: { type: 'Identifier', name },
                  },
                ]
              : Object.entries(name).map(([imported, local]) => ({
                  type: 'ImportSpecifier',
                  imported: { type: 'Identifier', name: imported },
                  local: {
                    type: 'Identifier',
                    name: local || imported,
                  },
                })),
            source: {
              type: 'Literal',
              value: from,
              raw: JSON.stringify(from),
            },
            attributes: [],
          },
        ],
      },
    },
  }
}
