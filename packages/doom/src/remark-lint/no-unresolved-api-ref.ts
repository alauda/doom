import path from 'node:path'

import type { Root } from 'mdast'
import type {
  MdxJsxAttribute,
  MdxJsxExpressionAttribute,
} from 'mdast-util-mdx-jsx'
import { glob } from 'tinyglobby'
import { lintRule } from 'unified-lint-rule'
import { visitParents } from 'unist-util-visit-parents'

import { resolveStaticConfig } from '../utils/helpers.ts'

import { getConfig } from './utils.ts'

/**
 * Build-integrity face for the API components (DOOM-1).
 *
 * Every `<K8sAPI>` / `<K8sCrd>` / `<OpenAPIRef>` / `<OpenAPIPath>` /
 * `<K8sPermissionTable>` whose reference cannot be resolved renders a blank page
 * (or a table with vanished rows) with a green `doom build`. These components
 * scatter `console.error` calls that are never surfaced. This rule resolves the
 * same sources the runtime plugins load and reports an unresolved reference at
 * lint time, before it ships silently.
 */

interface ApiSources {
  crdNames: Set<string>
  schemaNames: Set<string>
  pathNames: Set<string>
  functionNames: Set<string>
}

let sourcesPromise: Promise<ApiSources> | undefined

const loadYamlOrJson = async <T>(base: string, patterns?: string[]) => {
  if (!patterns?.length) {
    return [] as T[]
  }
  const files = await glob(patterns, { cwd: base })
  const out: T[] = []
  for (const file of files) {
    try {
      out.push(await resolveStaticConfig<T>(path.resolve(base, file)))
    } catch {
      // A file that fails to parse is a source problem of its own; skip it here
      // so a single bad file does not blind the whole check.
    }
  }
  return out
}

const loadSources = async (): Promise<ApiSources> => {
  const { config, configFilePath } = await getConfig()
  const base = configFilePath ? path.dirname(configFilePath) : config.root!

  const crdNames = new Set<string>()
  const schemaNames = new Set<string>()
  const pathNames = new Set<string>()
  const functionNames = new Set<string>()

  const crds = await loadYamlOrJson<{
    metadata?: { name?: string }
  } | null>(base, config.api?.crds)
  for (const crd of crds) {
    if (crd?.metadata?.name) {
      crdNames.add(crd.metadata.name)
    }
  }

  const openapis = await loadYamlOrJson<Record<string, unknown> | null>(
    base,
    config.api?.openapis,
  )
  for (const doc of openapis) {
    if (!doc) {
      continue
    }
    const components = doc.components as
      | { schemas?: Record<string, unknown> }
      | undefined
    for (const key of Object.keys(components?.schemas ?? {})) {
      schemaNames.add(key)
    }
    // swagger 2.0 sources carry schemas under `definitions`.
    for (const key of Object.keys(
      (doc.definitions as Record<string, unknown> | undefined) ?? {},
    )) {
      schemaNames.add(key)
    }
    for (const key of Object.keys(
      (doc.paths as Record<string, unknown> | undefined) ?? {},
    )) {
      pathNames.add(key)
    }
  }

  const functionResources = await loadYamlOrJson<{
    metadata?: { name?: string }
  } | null>(base, config.permission?.functionresources)
  for (const fr of functionResources) {
    if (fr?.metadata?.name) {
      functionNames.add(fr.metadata.name)
    }
  }

  return { crdNames, schemaNames, pathNames, functionNames }
}

/** Collect static string values from a JSX attribute (string, `{'x'}` or `{['a','b']}`). */
const staticStrings = (attr: MdxJsxAttribute | undefined): string[] => {
  if (!attr) {
    return []
  }
  if (typeof attr.value === 'string') {
    return [attr.value]
  }
  const estree = attr.value?.data?.estree
  const expr = estree?.body[0]
  if (!expr || expr.type !== 'ExpressionStatement') {
    return []
  }
  const node = expr.expression
  if (node.type === 'Literal' && typeof node.value === 'string') {
    return [node.value]
  }
  if (node.type === 'ArrayExpression') {
    return node.elements.flatMap((el) =>
      el && el.type === 'Literal' && typeof el.value === 'string'
        ? [el.value]
        : [],
    )
  }
  // Anything dynamic (a variable, a computed value) cannot be validated here.
  return []
}

const attrOf = (
  element: { attributes: unknown[] },
  name: string,
): MdxJsxAttribute | undefined =>
  (
    element.attributes as Array<MdxJsxAttribute | MdxJsxExpressionAttribute>
  ).find(
    (attr): attr is MdxJsxAttribute =>
      attr.type === 'mdxJsxAttribute' && attr.name === name,
  )

export const noUnresolvedApiRef = lintRule<Root>(
  'doom-lint:no-unresolved-api-ref',
  async (root, vfile) => {
    const { crdNames, schemaNames, pathNames, functionNames } =
      await (sourcesPromise ??= loadSources())

    visitParents(
      root,
      ['mdxJsxFlowElement', 'mdxJsxTextElement'] as const,
      (element, parents) => {
        const report = (message: string, attr?: MdxJsxAttribute) =>
          vfile.message(message, {
            ancestors: [...parents, element],
            place: (attr ?? element).position,
          })

        switch (element.name) {
          case 'K8sAPI':
          case 'K8sCrd': {
            const attr = attrOf(element, 'name')
            const name = staticStrings(attr)[0]
            if (name && !crdNames.has(name) && !schemaNames.has(name)) {
              report(
                `\`<${element.name}>\` references \`name="${name}"\`, which resolves to neither a CRD (\`api.crds\`) nor an OpenAPI schema (\`api.openapis\`). The page would render blank.`,
                attr,
              )
            }
            break
          }
          case 'OpenAPIRef': {
            const attr = attrOf(element, 'schema')
            const name = staticStrings(attr)[0]
            if (name && !schemaNames.has(name)) {
              report(
                `\`<OpenAPIRef>\` references \`schema="${name}"\`, which is not defined in any \`api.openapis\` source.`,
                attr,
              )
            }
            break
          }
          case 'OpenAPIPath': {
            const attr = attrOf(element, 'path')
            for (const p of staticStrings(attr)) {
              if (!pathNames.has(p)) {
                report(
                  `\`<OpenAPIPath>\` references \`path\` \`${p}\`, which is not defined in any \`api.openapis\` source.`,
                  attr,
                )
              }
            }
            break
          }
          case 'K8sPermissionTable': {
            const attr = attrOf(element, 'functions')
            for (const fn of staticStrings(attr)) {
              if (!functionNames.has(fn)) {
                report(
                  `\`<K8sPermissionTable>\` references function \`${fn}\`, which is not a known FunctionResource (\`permission.functionresources\`). Its row would silently vanish.`,
                  attr,
                )
              }
            }
            break
          }
          default:
            break
        }
      },
    )
  },
)
