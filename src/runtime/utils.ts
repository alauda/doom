import { last, upperFirst } from 'es-toolkit'
import { get } from 'es-toolkit/compat'
import { OpenAPIV3_1 } from 'openapi-types'

export const modelName = (ref: string) => upperFirst(last(ref.split('.'))!)

export const resolveRef = <
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  T extends object = OpenAPIV3_1.SchemaObject,
>(
  openapi: OpenAPIV3_1.Document,
  ref: string,
) => {
  if (!ref.startsWith('#/')) {
    ref = `#/components/schemas/${ref}`
  }
  return get(openapi, ref.slice(2).split('/')) as T
}

const DEFAULT_COMMON_REFS_ = {
  'v1alpha1.ListMeta': 'common-definitions/list-meta/#ListMeta',
  'v1.ObjectMeta': 'common-definitions/object-meta/#ObjectMeta',
}

const K8S_DOC_PREFIX = 'https://kubernetes.io/docs/reference/kubernetes-api/'

export const DEFAULT_COMMON_REFS = Object.fromEntries(
  Object.entries(DEFAULT_COMMON_REFS_).map(([key, value]) => [
    key,
    `${K8S_DOC_PREFIX}${value}`,
  ]),
)

export const omitRoutePathRefs = (
  refs: Record<string, string>,
  routePath: string,
) =>
  Object.fromEntries(
    Object.entries(refs).filter(
      ([, value]) => routePath !== value.split('#')[0],
    ),
  )

export const CJK_PATTERN = /\p{sc=Han}/u

export const handleCJKWhitespaces = (text: string) => {
  text = text.at(0)?.match(CJK_PATTERN) ? text : ` ${text}`
  return text.at(-1)?.match(CJK_PATTERN) ? text : `${text} `
}
