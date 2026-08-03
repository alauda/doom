import crdsMap from 'doom-@api-crdsMap'
import openapisMap from 'doom-@api-openapisMap'
import virtual from 'doom-@api-virtual'
import { plural as pluralize } from 'pluralize'
import { useMemo } from 'react'

import { declaresStatusSubresource } from '../api-paths.js'
import { resolveRef, selectCrdVersionName } from '../utils.js'

import { K8sAPIEndpoints, type K8sAPIDefinition } from './_K8sAPIEndpoints.js'
import { K8sAPISchema } from './_K8sAPISchema.js'

export interface K8sAPIProps {
  name: string
  namespaced?: boolean
  pathPrefix?: string
  filepath?: string
  apiGroup?: string
  apiVersion?: string
  apiKind?: string
  /**
   * Override the resource's plural name in the endpoint paths. Only needed for
   * OpenAPI-sourced resources whose plural cannot be read from a CRD; for CRD
   * sources the plural comes from `spec.names.plural` automatically.
   */
  plural?: string
  /**
   * Whether the API server exposes a `/status` subresource. Declared by the
   * caller when the source cannot be trusted to answer — an aggregation-layer
   * OpenAPI document may describe neither the subresource routes nor the
   * resource's own routes.
   */
  hasStatus?: boolean
}

export const K8sAPI = ({
  name,
  namespaced,
  pathPrefix,
  filepath,
  apiGroup,
  apiVersion,
  apiKind,
  plural,
  hasStatus,
}: K8sAPIProps) => {
  const [, openapi] = useMemo(
    () =>
      Object.entries(openapisMap).find(([pathname, openapi]) => {
        if (filepath && pathname !== filepath) {
          return
        }
        return resolveRef(openapi, name)
      }) || [],
    [filepath, name],
  )

  const [, crd] = useMemo(
    () =>
      Object.entries(crdsMap).find(([pathname, crd]) => {
        if (filepath && pathname !== filepath) {
          return
        }
        return crd.metadata.name === name
      }) || [],
    [filepath, name],
  )

  // The version this page renders: an explicit `apiVersion` prop wins,
  // otherwise the version `kubectl` would resolve to (see `selectCrdVersionName`
  // / `api.crdVersion`). Used consistently for the schema AND the endpoint
  // paths so the two never disagree.
  const resolvedVersion = useMemo(
    () =>
      crd
        ? (apiVersion ??
          selectCrdVersionName(crd.spec.versions, virtual.crdVersion))
        : apiVersion,
    [apiVersion, crd],
  )

  const versionDef = useMemo(
    () => crd?.spec.versions.find((ver) => ver.name === resolvedVersion),
    [crd, resolvedVersion],
  )

  const schema = useMemo(() => {
    if (openapi) {
      return resolveRef(openapi, name)
    }

    if (!crd) {
      return
    }

    if (!versionDef) {
      console.error(
        `CRD ${name} does not have version ${resolvedVersion}, available versions: ${crd.spec.versions
          .map((ver) => ver.name)
          .join(', ')}`,
      )
      return
    }
    return versionDef.schema.openAPIV3Schema
  }, [crd, name, openapi, resolvedVersion, versionDef])

  const k8sApiDef = useMemo(() => {
    if (!schema) {
      return
    }

    if ('x-kubernetes-group-version-kind' in schema) {
      const def = schema['x-kubernetes-group-version-kind'] as
        | K8sAPIDefinition
        | K8sAPIDefinition[]
      return Array.isArray(def) ? def[0] : def
    }

    if (crd) {
      return {
        group: crd.spec.group,
        version: resolvedVersion ?? crd.spec.versions[0].name,
        kind: crd.spec.names.kind,
      }
    }
  }, [crd, resolvedVersion, schema])

  // The endpoint paths are built by concatenating group / version / plural. An
  // unknown segment used to fall back to `''`, which concatenates into a
  // silently broken path such as `/api//` — a guess dressed up as a fact. Merge
  // the caller's props with whatever the fact sources yielded, then render the
  // endpoints only if the result is actually complete.
  const group = apiGroup ?? k8sApiDef?.group
  const version = apiVersion ?? k8sApiDef?.version
  const kind = apiKind ?? k8sApiDef?.kind

  const pluralName =
    plural ??
    crd?.spec.names.plural ??
    (kind ? pluralize(kind).toLowerCase() : undefined)

  // `subresources.status` is the CRD's own declaration. An OpenAPI source has
  // no such field, so the routes it lists are the next best fact; only when it
  // lists none for this resource does the weaker "the schema has a `status`
  // property" signal still apply (see `declaresStatusSubresource`).
  const derivedHasStatus = useMemo(() => {
    if (crd) {
      return !!versionDef?.subresources?.status
    }
    if (!schema) {
      return false
    }
    return (
      declaresStatusSubresource(
        Object.keys(openapi?.paths ?? {}),
        pluralName,
      ) ?? !!schema.properties?.status
    )
  }, [crd, openapi, pluralName, schema, versionDef])

  if (!openapi && !crd) {
    console.error(
      `No OpenAPI nor CustomResourceDefinition schema found for ${name}`,
    )
    return null
  }

  // `group` is legitimately absent for core-group resources (`/api/v1/...`);
  // `version` and `kind` are not — without them there is no path to render.
  const endpointDef = version && kind ? { group, version, kind } : undefined

  if (schema && !endpointDef) {
    console.error(
      `Cannot resolve the group/version/kind of ${name}: its OpenAPI schema carries no \`x-kubernetes-group-version-kind\` extension and no CustomResourceDefinition defines it. Pass explicit \`apiVersion\` and \`apiKind\` props (plus \`apiGroup\` for non-core groups, and \`plural\` if the plural is irregular). Omitting the API endpoints section.`,
    )
  }

  return schema ? (
    <>
      <K8sAPISchema schema={schema} fullSchema={openapi} />
      {endpointDef && (
        <K8sAPIEndpoints
          {...endpointDef}
          hasStatus={hasStatus ?? derivedHasStatus}
          hasScale={crd ? !!versionDef?.subresources?.scale : undefined}
          plural={pluralName}
          pathPrefix={pathPrefix}
          namespaced={
            namespaced ?? (crd ? crd.spec.scope === 'Namespaced' : undefined)
          }
        />
      )}
    </>
  ) : null
}

export default K8sAPI
