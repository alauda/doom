---
weight: 5
---

# API 文档

根据实际业务，我们一般会将 API 分为高级 API 和 CRD (Custom Resource Definition) 两种，因此在目录结构上一般分为：

```tree
├── apis
│   ├── advanced-apis # 高级 API
│   ├── crds # CRDs
│   └── references # 公共引用
```

## 高级 API

```mdx title="advanced-apis/codeQualityTaskSummary.mdx"
# CodeQualityTaskSummary

<OpenAPIPath path="/plugins/v1alpha1/template/codeQuality/task/{task-id}/summary" />
```

参考 [CodeQualityTaskSummary](../apis/advanced-apis/codeQualityTaskSummary)。

### `props`

- `path`: OpenAPI schema `paths` 下的路径
- `pathPrefix`: 可以用于覆盖全局配置中的 `api.pathPrefix`
- `openapiPath`: 参考[指定 openapi 路径](#指定-openapi-路径)

## CRD

```mdx title="crds/ArtifactCleanupRun.mdx"
# ArtifactCleanupRun

<K8sCrd name="artifactcleanupruns.artifacts.katanomi.dev" />
```

参考 [ArtifactCleanupRun](../apis/crds/ArtifactCleanupRun)。

### `props`

- `name`: CRD `metadata.name`
- `crdPath`: 类似[指定 openapi 路径](#指定-openapi-路径)，用于指定特定的 CRD 文件

## 公共引用

```mdx title="references/CodeQuality.mdx"
# CodeQuality

<OpenAPIRef schema="v1alpha1.CodeQuality" />
```

参考 [CodeQuality](../apis/references/CodeQuality)。

### `props`

- `schema`: OpenAPI schema `definitions`(v2) or `component/schemas`(v3) 下的名称
- `openapiPath`: 参考[指定 openapi 路径](#指定-openapi-路径)

## 指定 openapi 路径

对于 `OpenAPIPath` 和 `OpenAPIRef` 组件，默认会在所有 openapi 定义文件中查找至匹配，如果需要指定特定的 openapi 文件，可以使用 `openapiPath` 属性指定：

```mdx
<OpenAPIPath
  path="/plugins/v1alpha1/template/codeQuality/task/{task-id}/summary"
  openapiPath="shared/openapis/katanomi.json"
/>
```
