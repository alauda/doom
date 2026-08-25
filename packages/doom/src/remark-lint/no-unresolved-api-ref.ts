import path from 'node:path'

import type { Root } from 'mdast'
import type {
  MdxJsxAttribute,
  MdxJsxExpressionAttribute,
} from 'mdast-util-mdx-jsx'
import { glob } from 'tinyglobby'
import { lintRule } from 'unified-lint-rule'
import type { Node, Position } from 'unist'
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

export interface ApiSources {
  crdNames: Set<string>
  schemaNames: Set<string>
  /**
   * OpenAPI schema names that carry no `x-kubernetes-group-version-kind`
   * extension. `<K8sAPI>` derives the endpoint paths' group/version/kind from
   * that extension (or from a CRD); without either, the paths cannot be built
   * from facts and the caller has to declare them via props.
   */
  schemaNamesWithoutGvk: Set<string>
  pathNames: Set<string>
  functionNames: Set<string>
}

const GVK_EXTENSION = 'x-kubernetes-group-version-kind'

const hasGvk = (schema: unknown) =>
  !!schema && typeof schema === 'object' && GVK_EXTENSION in schema

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

/**
 * Reads a Kubernetes source that may be either a single resource or a
 * `kind: List` wrapper.
 *
 * The permission plugin unwraps `items` when it builds the runtime module, so a
 * check that reads `metadata.name` off the wrapper finds nothing at all and
 * then reports every reference as unresolved.
 */
export const unwrapK8sList = <T>(doc: unknown): T[] => {
  if (!doc || typeof doc !== 'object') {
    return []
  }
  const { items } = doc as { items?: unknown }
  return Array.isArray(items) ? (items as T[]) : [doc as T]
}

const loadSources = async (): Promise<ApiSources> => {
  const { config, configFilePath } = await getConfig()
  const base = configFilePath ? path.dirname(configFilePath) : config.root!

  const crdNames = new Set<string>()
  const schemaNames = new Set<string>()
  const schemaNamesWithGvk = new Set<string>()
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
    // swagger 2.0 sources carry schemas under `definitions`.
    const definitions = doc.definitions as Record<string, unknown> | undefined
    for (const [key, schema] of [
      ...Object.entries(components?.schemas ?? {}),
      ...Object.entries(definitions ?? {}),
    ]) {
      schemaNames.add(key)
      if (hasGvk(schema)) {
        schemaNamesWithGvk.add(key)
      }
    }
    for (const key of Object.keys(
      (doc.paths as Record<string, unknown> | undefined) ?? {},
    )) {
      pathNames.add(key)
    }
  }

  const functionResourceDocs = await loadYamlOrJson<unknown>(
    base,
    config.permission?.functionresources,
  )
  for (const doc of functionResourceDocs) {
    for (const fr of unwrapK8sList<{ metadata?: { name?: string } }>(doc)) {
      if (fr.metadata?.name) {
        functionNames.add(fr.metadata.name)
      }
    }
  }

  // A name defined in several sources counts as resolvable as long as *one* of
  // them carries the extension — the runtime stops at the first source that
  // resolves, so flagging the others would be a false positive.
  const schemaNamesWithoutGvk = new Set(
    [...schemaNames].filter((name) => !schemaNamesWithGvk.has(name)),
  )

  return {
    crdNames,
    schemaNames,
    schemaNamesWithoutGvk,
    pathNames,
    functionNames,
  }
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

/**
 * The rule's decision logic, separated from source loading so it can be
 * exercised against hand-built {@link ApiSources} in tests.
 */
export const checkApiRefs = (
  root: Root,
  sources: ApiSources,
  report: (
    message: string,
    place: Position | undefined,
    ancestors: Node[],
  ) => void,
) => {
  const {
    crdNames,
    schemaNames,
    schemaNamesWithoutGvk,
    pathNames,
    functionNames,
  } = sources

  visitParents(
    root,
    ['mdxJsxFlowElement', 'mdxJsxTextElement'] as const,
    (element, parents) => {
      const reportAt = (message: string, attr?: MdxJsxAttribute) => {
        report(message, (attr ?? element).position, [...parents, element])
      }

      switch (element.name) {
        case 'K8sAPI':
        case 'K8sCrd': {
          const attr = attrOf(element, 'name')
          const name = staticStrings(attr)[0]
          if (!name) {
            break
          }
          if (!crdNames.has(name) && !schemaNames.has(name)) {
            reportAt(
              `\`<${element.name}>\` references \`name="${name}"\`, which resolves to neither a CRD (\`api.crds\`) nor an OpenAPI schema (\`api.openapis\`). The page would render blank.`,
              attr,
            )
            break
          }
          // The endpoint paths need a group/version/kind. It comes from the
          // schema's `x-kubernetes-group-version-kind` extension, else from a
          // CRD of the same name, else it has to be declared by the caller —
          // aggregation-layer OpenAPI documents routinely ship without the
          // extension. Without any of the three the endpoints section is
          // dropped at render time, which a green build would otherwise hide.
          if (
            schemaNamesWithoutGvk.has(name) &&
            !crdNames.has(name) &&
            // A spread (`{...props}`) can carry the props unseen; do not guess.
            !element.attributes.some(
              (attribute) => attribute.type === 'mdxJsxExpressionAttribute',
            ) &&
            !(attrOf(element, 'apiVersion') && attrOf(element, 'apiKind'))
          ) {
            reportAt(
              `\`<${element.name} name="${name}">\` resolves to an OpenAPI schema without the \`${GVK_EXTENSION}\` extension, and no CRD defines it, so its group/version/kind cannot be derived. Pass explicit \`apiVersion\` and \`apiKind\` props (plus \`apiGroup\` for non-core groups, and \`plural\` if the plural is irregular), or the API endpoints section is omitted.`,
              attr,
            )
          }
          break
        }
        case 'OpenAPIRef': {
          const attr = attrOf(element, 'schema')
          const name = staticStrings(attr)[0]
          if (name && !schemaNames.has(name)) {
            reportAt(
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
              reportAt(
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
              reportAt(
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
}

export const noUnresolvedApiRef = lintRule<Root>(
  'doom-lint:no-unresolved-api-ref',
  async (root, vfile) => {
    const sources = await (sourcesPromise ??= loadSources())

    checkApiRefs(root, sources, (message, place, ancestors) =>
      vfile.message(message, { ancestors, place }),
    )
  },
)
