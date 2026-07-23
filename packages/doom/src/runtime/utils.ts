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

export type ReferenceValue =
  | string
  | { href: string; routePath?: string | false }

// A reference config value plays two roles: the literal href a `RefLink` points
// at, AND the page-identity key `omitRoutePathRefs` uses to tell whether a ref
// is already documented on the current page. A `.html` href never equals a
// (locale-prefixed, extension-less) routePath, so a plain string silently
// disables the omit — which is exactly why acp-docs relies on `.html`. Split
// the two roles: `routePath: false` makes "never omit" explicit; a real
// routePath makes the omit actually work.
const resolveRefValue = (
  value: ReferenceValue,
): { href: string; routePath: string | false } =>
  typeof value === 'string'
    ? { href: value, routePath: value }
    : { href: value.href, routePath: value.routePath ?? value.href }

const RESOLVED_REFS: Record<
  string,
  { href: string; routePath: string | false }
> = {
  ...Object.fromEntries(
    Object.entries(DEFAULT_COMMON_REFS).map(([key, value]) => {
      const href = `${K8S_DOC_PREFIX}${value}`
      return [key, { href, routePath: href }]
    }),
  ),
  ...Object.fromEntries(
    Object.entries(virtual.references ?? {}).map(([key, value]) => [
      key,
      resolveRefValue(value),
    ]),
  ),
}

export const COMMON_REFS: Record<string, string> = Object.fromEntries(
  Object.entries(RESOLVED_REFS).map(([key, { href }]) => [key, href]),
)

export const omitRoutePathRefs = (routePath: string) =>
  Object.fromEntries(
    Object.entries(COMMON_REFS).filter(([key]) => {
      const { routePath: rp } = RESOLVED_REFS[key]
      // `false` → never omit (always link-only). Otherwise omit only on the
      // page that IS this reference's own page.
      return rp === false ? true : routePath !== rp.split('#')[0]
    }),
  )

export type CrdVersionStrategy = 'preferred' | 'storage' | 'first'

interface CrdVersionLike {
  name: string
  served?: boolean
  storage?: boolean
}

/**
 * Kubernetes version priority, equivalent to apimachinery's
 * `CompareKubeAwareVersionStrings`: GA (`v1`) > beta (`v1beta1`) >
 * alpha (`v1alpha1`); within the same tier the higher number wins; names that
 * don't follow the convention sort last (lexicographically).
 */
const parseKubeVersion = (v: string) => {
  const m = /^v(\d+)(?:(alpha|beta)(\d+))?$/.exec(v)
  if (!m) {
    return null
  }
  return {
    major: +m[1],
    tier: m[2] ? (m[2] === 'beta' ? 2 : 1) : 3,
    minor: m[3] ? +m[3] : 0,
  }
}

const compareKubeVersions = (a: string, b: string) => {
  const pa = parseKubeVersion(a)
  const pb = parseKubeVersion(b)
  if (pa && !pb) {
    return -1
  }
  if (!pa && pb) {
    return 1
  }
  if (!pa || !pb) {
    return a.localeCompare(b)
  }
  if (pa.tier !== pb.tier) {
    return pb.tier - pa.tier
  }
  if (pa.major !== pb.major) {
    return pb.major - pa.major
  }
  return pb.minor - pa.minor
}

/**
 * Pick the CRD version a doc should render by default.
 *
 * - `preferred` (default): the version `kubectl` would resolve to — the
 *   highest-priority version whose `served` is not `false`. This is what an
 *   operator actually talks to, and it never renders a version the API server
 *   rejects.
 * - `storage`: the version persisted in etcd (`storage: true`). An
 *   implementation detail, offered only as an explicit opt-in.
 * - `first`: the legacy behavior — literally `spec.versions[0]`, i.e. whatever
 *   order the manifest happened to list.
 */
export const selectCrdVersionName = (
  versions: CrdVersionLike[] | undefined,
  strategy: CrdVersionStrategy = 'preferred',
): string | undefined => {
  if (!versions?.length) {
    return undefined
  }
  if (strategy === 'first') {
    return versions[0].name
  }
  if (strategy === 'storage') {
    return (versions.find((v) => v.storage) ?? versions[0]).name
  }
  const served = versions.filter((v) => v.served !== false)
  const pool = served.length ? served : versions
  return [...pool].sort((a, b) => compareKubeVersions(a.name, b.name))[0].name
}

export const CJK_PATTERN = /\p{sc=Han}/u

export const handleCJKWhitespaces = (text?: string) => {
  if (!text) {
    return ''
  }
  text = text.at(0)?.match(CJK_PATTERN) ? text : ` ${text}`
  return text.at(-1)?.match(CJK_PATTERN) ? text : `${text} `
}
