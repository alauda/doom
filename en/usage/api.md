# API Documentation

According to actual business needs, we generally divide APIs into three types: standard K8S API, advanced API, and CRD (Custom Resource Definition). Therefore, the directory structure is usually organized as follows:

```sh
├── apis
│   ├── advanced_apis # Advanced APIs
│   ├── crds # CRDs
│   ├── kubernetes_apis # K8S APIs
│   └── references # Common references
```

## K8S API

### Standard K8S API

```mdx title="kubernetes_apis/workload/daemonset.mdx"
# DaemonSet [apps/v1]

<K8sAPI
  name="io.k8s.api.apps.v1.DaemonSet"
  pathPrefix="/kubernetes/{cluster}"
/>
```

Refer to [DaemonSet](/en/apis/kubernetes_apis/workload/daemonset.md).

### CRD

```mdx title="crds/ArtifactCleanupRun.mdx"
# ArtifactCleanupRun

<K8sAPI name="artifactcleanupruns.artifacts.katanomi.dev" />
```

Refer to [ArtifactCleanupRun](/en/apis/crds/ArtifactCleanupRun.md).

### `props`

- `name`: Reference name under OpenAPI schema `definitions` (v2) or `components/schemas` (v3), or CRD `metadata.name`
- `namespaced`: Indicates whether the resource is namespace-scoped, i.e. whether the API Endpoints include the namespace path parameter `namespaces/{namespace}`. A CRD's `spec.scope` decides it when this is unset; OpenAPI sources do not carry a scope and default to `true`
- `pathPrefix`: Can be used to override the global configuration `api.pathPrefix`
- `filepath`: Similar to [specifying openapi path](#specified-openapi-path), used to specify a particular openapi or CRD file
- `apiGroup`: Optional, specifies the API group; openapi will try to read the referenced `x-kubernetes-group-version-kind`, same below
- `apiVersion`: Optional, specifies the API version; a CRD defaults to the version `kubectl` resolves to — the highest-priority `served` version — which [`api.crdVersion`](/en/usage/configuration.md#api) can change
- `apiKind`: Optional, specifies the API resource kind
- `plural`: Optional, the resource's plural name used in the endpoint paths. A CRD's `spec.names.plural` is read automatically; set this for OpenAPI sources whose plural is irregular, otherwise it is derived from the kind
- `hasStatus`: Optional, whether the API server exposes a `status` subresource. A CRD's `subresources.status` decides it; for an OpenAPI source the routes listed in the document decide it. This prop overrides both

An OpenAPI document that carries no `x-kubernetes-group-version-kind` — aggregation-layer documents routinely omit it — must have `apiVersion` and `apiKind` declared here, plus `apiGroup` outside the core group. Otherwise the group, version and kind cannot be derived: the API Endpoints section is omitted rather than built from empty path segments, and `doom lint` reports the page.

## Advanced API

```mdx title="advanced_apis/codeQualityTaskSummary.mdx"
# CodeQualityTaskSummary

<OpenAPIPath path="/plugins/v1alpha1/template/codeQuality/task/{task-id}/summary" />
```

Refer to [CodeQualityTaskSummary](/en/apis/advanced_apis/codeQualityTaskSummary.md).

### `props`

- `path`: Path under OpenAPI schema `paths`
- `pathPrefix`: Can be used to override the global configuration `api.pathPrefix`
- `openapiPath`: See [specifying openapi path](#specified-openapi-path)

## Common References

```mdx title="references/CodeQuality.mdx"
# CodeQuality

<OpenAPIRef schema="v1alpha1.CodeQuality" />
```

Refer to [CodeQuality](/en/apis/references/CodeQuality.md).

### `props`

- `schema`: Reference name under OpenAPI schema `definitions` (v2) or `components/schemas` (v3)
- `openapiPath`: See [specifying openapi path](#specified-openapi-path)

## Specifying openapi Path \{#specified-openapi-path}

For `OpenAPIPath` and `OpenAPIRef` components, by default, the system searches through all openapi definition files until a match is found. If you need to specify a particular openapi file, you can use the `openapiPath` property:

```mdx
<OpenAPIPath
  path="/plugins/v1alpha1/template/codeQuality/task/{task-id}/summary"
  openapiPath="shared/openapis/katanomi.json"
/>
```
