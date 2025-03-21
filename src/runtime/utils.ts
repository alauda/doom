import virtual from 'doom-@api-virtual'
import { last, upperFirst } from 'es-toolkit'
import { get } from 'es-toolkit/compat'
import type { OpenAPIV3_1 } from 'openapi-types'

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

const DEFAULT_COMMON_REFS = {
  'v1alpha1.ListMeta': 'common-definitions/list-meta/#ListMeta',
  'v1.ObjectMeta': 'common-definitions/object-meta/#ObjectMeta',
}

const K8S_DOC_PREFIX = 'https://kubernetes.io/docs/reference/kubernetes-api/'

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
