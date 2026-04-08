import virtual from 'doom-@api-virtual'
import { last, upperFirst } from 'es-toolkit'
import { get } from 'es-toolkit/compat'
import type { OpenAPIV3_1 } from 'openapi-types'

export const modelName = (ref: string) => {
  const lastPart = last(ref.split('.'))!
  return upperFirst(lastPart.startsWith('#') ? lastPart.slice(1) : lastPart)
}

// https://swagger.io/docs/specification/v3_0/components/#components-structure
const COMPONENTS = [
  'schemas',
  'parameters',
  'securitySchemes',
  'requestBodies',
  'responses',
  'headers',
  'examples',
  'links',
  'callbacks',
]

const COMPONENTS_REFS = COMPONENTS.map(
  (component) => `#/components/${component}/`,
)

export const resolveRef = <
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  T extends object = OpenAPIV3_1.SchemaObject,
>(
  openapi: OpenAPIV3_1.Document,
  ref: string,
) => {
  const refs = ref.startsWith('#/')
    ? [ref]
    : COMPONENTS_REFS.map((prefix) => `${prefix}${ref}`)

  for (const ref of refs) {
    const resolved = get(openapi, ref.slice(2).split('/')) as T | undefined
    if (resolved) {
      return resolved
    }
  }
}

const DEFAULT_COMMON_REFS = {
  'v1alpha1.ListMeta': 'list-meta/',
  'v1.ObjectMeta': 'object-meta/',
}

const K8S_DOC_PREFIX =
  'https://kubernetes.io/docs/reference/kubernetes-api/common-definitions/'

export const COMMON_REFS = {
  ...Object.fromEntries(
    Object.entries(DEFAULT_COMMON_REFS).map(([key, value]) => [
      key,
      `${K8S_DOC_PREFIX}${value}`,
    ]),
  ),
  ...virtual.references,
}

export const omitRoutePathRefs = (routePath: string) =>
  Object.fromEntries(
    Object.entries(COMMON_REFS).filter(
      ([, value]) => routePath !== value.split('#')[0],
    ),
  )

export const CJK_PATTERN = /\p{sc=Han}/u

export const handleCJKWhitespaces = (text?: string) => {
  if (!text) {
    return ''
  }
  text = text.at(0)?.match(CJK_PATTERN) ? text : ` ${text}`
  return text.at(-1)?.match(CJK_PATTERN) ? text : `${text} `
}
