import { OpenAPIV3 } from 'openapi-types'

export interface ApiPluginOptions {
  localBasePath: string
  crds?: string[]
  openapis?: string[]
  references?: Record<string, string>
  pathPrefix?: string
}

export interface CustomResourceDefinitionVersion {
  name: string
  schema: {
    openAPIV3Schema: OpenAPIV3.SchemaObject
  }
  served: boolean
  storage: boolean
}

export interface CustomResourceDefinition {
  apiVersion: string
  kind: 'CustomResourceDefinition'
  metadata: {
    annotations: Record<string, string>
    name: string
  }
  spec: {
    group: string
    names: {
      kind: string
      listKind: string
      plural: string
      singular: string
    }
    scope: 'Namespaced' | 'Cluster'
    versions: CustomResourceDefinitionVersion[]
  }
}
