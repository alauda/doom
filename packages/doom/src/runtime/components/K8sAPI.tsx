import crdsMap from 'doom-@api-crdsMap'
import openapisMap from 'doom-@api-openapisMap'
import type { OpenAPIV3_1 } from 'openapi-types'
import { useMemo } from 'react'

import { resolveRef } from '../utils.js'

import { K8sAPIEndpoints, type K8sAPIDefinition } from './_K8sAPIEndpoints.js'
import { K8sAPISchema } from './_K8sAPISchema.js'

export interface K8sAPIProps {
  name: string
  pathPrefix?: string
  filepath?: string
  apiGroup?: string
  apiVersion?: string
  apiKind?: string
}

export const K8sAPI = ({
  name,
  pathPrefix,
  filepath,
  apiGroup,
  apiVersion,
  apiKind,
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

  const schema = useMemo(() => {
    if (openapi) {
      return resolveRef(openapi, name)
    }

    if (!crd) {
      return
    }

    const { versions } = crd.spec
    const v = apiVersion ?? versions[0]?.name
    const versionDef = versions.find((ver) => ver.name === v)
    if (!versionDef) {
      console.error(
        `CRD ${name} does not have version ${v}, available versions: ${versions
          .map((ver) => ver.name)
          .join(', ')}`,
      )
      return
    }
    return versionDef.schema.openAPIV3Schema as OpenAPIV3_1.SchemaObject
  }, [apiVersion, crd, name, openapi])

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
        version: crd.spec.versions[0].name,
        kind: crd.spec.names.kind,
      } as K8sAPIDefinition
    }
  }, [crd, schema])

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
        hasStatus={!!schema.properties?.status}
        group={apiGroup ?? k8sApiDef?.group}
        version={apiVersion ?? k8sApiDef?.version ?? ''}
        kind={apiKind ?? k8sApiDef?.kind ?? ''}
        pathPrefix={pathPrefix}
      />
    </>
  ) : null
}

export default K8sAPI
