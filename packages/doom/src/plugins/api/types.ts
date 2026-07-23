import { OpenAPIV3 } from 'openapi-types'

export interface ApiPluginOptions {
  localBasePath: string
  crds?: string[]
  openapis?: string[]
  /**
   * Map a schema ref name to how it should be linked / whether it is documented
   * elsewhere. A plain string is the link href (backward compatible). The object
   * form separates the two roles a value plays:
   *
   * - `href`: where a `RefLink` to this schema points.
   * - `routePath`: the page that documents this schema inline. On that page the
   *   schema is expanded; elsewhere it is only linked. `false` disables the
   *   omit entirely (always link, never expand) — the explicit form of the
   *   `.html`-href trick.
   */
  references?: Record<
    string,
    string | { href: string; routePath?: string | false }
  >
  pathPrefix?: string
  /**
   * Which version of a multi-version CRD to render by default when a page does
   * not pass an explicit `apiVersion` prop.
   *
   * - `preferred` (default): the version `kubectl` resolves to — highest
   *   priority among `served` versions (GA > beta > alpha).
   * - `storage`: the etcd storage version (`storage: true`).
   * - `first`: legacy behavior — `spec.versions[0]`.
   *
   * @default 'preferred'
   */
  crdVersion?: 'preferred' | 'storage' | 'first'
}

export interface CustomResourceDefinitionVersion {
  name: string
  schema: {
    openAPIV3Schema: OpenAPIV3.SchemaObject
  }
  served: boolean
  storage: boolean
  /**
   * Subresources the API server actually exposes for this version. `/status`
   * and `/scale` endpoints exist if and only if they are declared here — not
   * because the schema happens to contain a `status` property.
   */
  subresources?: {
    status?: object
    scale?: object
  }
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
