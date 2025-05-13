---
weight: 5
sourceSHA: 0b49514f79d09a01026a8298196675d07468e9e90efd7acc6c77353dd24b72f3
---

# API Documentation

Based on actual business needs, we generally categorize APIs into two types: Advanced APIs and CRDs (Custom Resource Definitions). Therefore, the directory structure is typically organized as follows:

```sh
├── apis
│   ├── advanced-apis # Advanced APIs
│   ├── crds # CRDs
│   └── references # Common References
```

## Advanced APIs

```mdx title="advanced-apis/codeQualityTaskSummary.mdx"
# CodeQualityTaskSummary

<OpenAPIPath path="/plugins/v1alpha1/template/codeQuality/task/{task-id}/summary" />
```

Refer to [CodeQualityTaskSummary](../apis/advanced-apis/codeQualityTaskSummary).

### `props`

- `path`: The path under OpenAPI schema `paths`
- `pathPrefix`: Can be used to override the `api.pathPrefix` in global configuration
- `openapiPath`: Refer to [Specifying OpenAPI Path](#specifying-openapi-path)

## CRD

```mdx title="crds/ArtifactCleanupRun.mdx"
# ArtifactCleanupRun

<K8sCrd name="artifactcleanupruns.artifacts.katanomi.dev" />
```

Refer to [ArtifactCleanupRun](../apis/crds/ArtifactCleanupRun).

### `props`

- `name`: CRD `metadata.name`
- `crdPath`: Similar to [Specifying OpenAPI Path](#specifying-openapi-path), used to specify a particular CRD file

## Common References

```mdx title="references/CodeQuality.mdx"
# CodeQuality

<OpenAPIRef schema="v1alpha1.CodeQuality" />
```

Refer to [CodeQuality](../apis/references/CodeQuality).

### `props`

- `schema`: The name under OpenAPI schema `definitions`(v2) or `components/schemas`(v3)
- `openapiPath`: Refer to [Specifying OpenAPI Path](#specifying-openapi-path)

## Specifying OpenAPI Path

For the `OpenAPIPath` and `OpenAPIRef` components, the default behavior is to search for matches across all OpenAPI definition files. If you need to specify a particular OpenAPI file, you can use the `openapiPath` property:

```mdx
<OpenAPIPath
  path="/plugins/v1alpha1/template/codeQuality/task/{task-id}/summary"
  openapiPath="shared/openapis/katanomi.json"
/>
```
