import crdsMap from 'doom-@api-crdsMap'
import openapisMap from 'doom-@api-openapisMap'
import virtual from 'doom-@api-virtual'
import { useMemo } from 'react'

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

  if (!openapi && !crd) {
    console.error(
      `No OpenAPI nor CustomResourceDefinition schema found for ${name}`,
    )
    return null
  }

  return schema ? (
    <>
      <K8sAPISchema schema={schema} fullSchema={openapi} />
      <K8sAPIEndpoints
        hasStatus={
          crd ? !!versionDef?.subresources?.status : !!schema.properties?.status
        }
        hasScale={crd ? !!versionDef?.subresources?.scale : undefined}
        group={apiGroup ?? k8sApiDef?.group}
        version={apiVersion ?? k8sApiDef?.version ?? ''}
        kind={apiKind ?? k8sApiDef?.kind ?? ''}
        plural={plural ?? crd?.spec.names.plural}
        pathPrefix={pathPrefix}
        namespaced={
          namespaced ?? (crd ? crd.spec.scope === 'Namespaced' : undefined)
        }
      />
    </>
  ) : null
}

export default K8sAPI
