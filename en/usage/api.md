# API Documentation

Based on actual business needs, we generally divide APIs into three categories: standard K8S API, advanced API, and CRD (Custom Resource Definition). Therefore, the directory structure is usually organized as follows:

```sh
├── apis
│   ├── advanced_apis # Advanced APIs
│   ├── crds # CRDs
│   ├── kubernetes_apis # K8S APIs
│   └── references # Common references
```

## K8S API

```mdx title="kubernetes_apis/workload/daemonset.mdx"
# DaemonSet [apps/v1]

<K8sAPI
  name="io.k8s.api.apps.v1.DaemonSet"
  pathPrefix="/kubernetes/{cluster}"
/>
```

Refer to [DaemonSet](/en/apis/kubernetes_apis/workload/daemonset.md).

```mdx title="crds/ArtifactCleanupRun.mdx"
# ArtifactCleanupRun

<K8sAPI name="artifactcleanupruns.artifacts.katanomi.dev" />
```

Refer to [ArtifactCleanupRun](/en/apis/crds/ArtifactCleanupRun.md).

### `props`

- `name`: Reference name under OpenAPI schema `definitions` (v2) or `components/schemas` (v3), or CRD `metadata.name`
- `namespaced`: Indicates whether the resource is namespace-scoped; defaults to `true`, meaning the API Endpoints include the namespace path parameter `namespaces/{namespace}`
- `pathPrefix`: Can be used to override the global configuration `api.pathPrefix`
- `filepath`: Similar to [specified openapi path](#specified-openapi-path), used to specify a particular openapi or CRD file
- `apiGroup`: Optional, specifies the API group; openapi will try to read the referenced `x-kubernetes-group-version-kind`, same below
- `apiVersion`: Optional, specifies the API version; CRD defaults to using the first version in `spec.versions`
- `apiKind`: Optional, specifies the API resource kind

## Advanced API

```mdx title="advanced_apis/codeQualityTaskSummary.mdx"
# CodeQualityTaskSummary

<OpenAPIPath path="/plugins/v1alpha1/template/codeQuality/task/{task-id}/summary" />
```

Refer to [CodeQualityTaskSummary](/en/apis/advanced_apis/codeQualityTaskSummary.md).

### `props`

- `path`: Path under OpenAPI schema `paths`
- `pathPrefix`: Can be used to override the global configuration `api.pathPrefix`
- `openapiPath`: See [specified openapi path](#specified-openapi-path)

## CRD (deprecated)

:::warning
Please use the `K8sAPI` component instead of the `K8sCrd` component. The `K8sCrd` component will be removed in future versions.
:::

```mdx title="crds/ArtifactCleanupRun-K8sCrd.mdx"
# ArtifactCleanupRun - K8sCrd

<K8sCrd name="artifactcleanupruns.artifacts.katanomi.dev" />
```

Refer to [ArtifactCleanupRun-K8sCrd](/en/apis/crds/ArtifactCleanupRun-K8sCrd.md).

### `props`

- `name`: CRD `metadata.name`
- `crdPath`: Similar to [specified openapi path](#specified-openapi-path), used to specify a particular CRD file

## Common References

```mdx title="references/CodeQuality.mdx"
# CodeQuality

<OpenAPIRef schema="v1alpha1.CodeQuality" />
```

Refer to [CodeQuality](/en/apis/references/CodeQuality.md).

### `props`

- `schema`: Reference name under OpenAPI schema `definitions` (v2) or `components/schemas` (v3)
- `openapiPath`: See [specified openapi path](#specified-openapi-path)

## Specified openapi path \{#specified-openapi-path}

For the `OpenAPIPath` and `OpenAPIRef` components, by default, all openapi definition files are searched until a match is found. If you need to specify a particular openapi file, you can use the `openapiPath` property to specify it:

```mdx
<OpenAPIPath
  path="/plugins/v1alpha1/template/codeQuality/task/{task-id}/summary"
  openapiPath="shared/openapis/katanomi.json"
/>
```
