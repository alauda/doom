---
weight: 5
---

# API 文档

根据实际业务，我们一般会将 API 分为标准 K8S API, 高级 API 和 CRD (Custom Resource Definition) 三种，因此在目录结构上一般分为：

```sh
├── apis
│   ├── advanced_apis # 高级 API
│   ├── crds # CRDs
│   ├── kubernetes_apis # K8S API
│   └── references # 公共引用
```

## K8S API

```mdx title="kubernetes_apis/workload/daemonset.mdx"
# DaemonSet [apps/v1]

<K8sAPI
  name="io.k8s.api.apps.v1.DaemonSet"
  pathPrefix="/kubernetes/{cluster}"
/>
```

参考 [DaemonSet](../apis/kubernetes_apis/workload/daemonset)。

```mdx title="crds/ArtifactCleanupRun.mdx"
# ArtifactCleanupRun

<K8sAPI name="artifactcleanupruns.artifacts.katanomi.dev" />
```

参考 [ArtifactCleanupRun](../apis/crds/ArtifactCleanupRun)。

### `props`

- `name`: OpenAPI schema `definitions`(v2) or `components/schemas`(v3) 下的引用名称或CRD `metadata.name`
- `namespaced`: 指示资源是否为命名空间级别，默认为 `true`，即 API Endpoints 是否包含命名空间路径参数 `namespaces/{namespace}`
- `pathPrefix`: 可以用于覆盖全局配置中的 `api.pathPrefix`
- `filepath`: 类似[指定 openapi 路径](#specified-openapi-path)，用于指定特定的 openapi 或 CRD 文件
- `apiGroup`: 可选，指定 API 组，openapi 会尝试读取引用的 `x-kubernetes-group-version-kind`，下同
- `apiVersion`: 可选，指定 API 版本，CRD 会默认使用 `spec.versions` 中第一个版本
- `apiKind`: 可选，指定 API 资源类型

## 高级 API

```mdx title="advanced_apis/codeQualityTaskSummary.mdx"
# CodeQualityTaskSummary

<OpenAPIPath path="/plugins/v1alpha1/template/codeQuality/task/{task-id}/summary" />
```

参考 [CodeQualityTaskSummary](../apis/advanced_apis/codeQualityTaskSummary)。

### `props`

- `path`: OpenAPI schema `paths` 下的路径
- `pathPrefix`: 可以用于覆盖全局配置中的 `api.pathPrefix`
- `openapiPath`: 参考[指定 openapi 路径](#specified-openapi-path)

## CRD (deprecated)

:::warning
请使用 `K8sAPI` 组件替代 `K8sCrd` 组件，`K8sCrd` 组件将在未来版本中移除。
:::

```mdx title="crds/ArtifactCleanupRun-K8sCrd.mdx"
# ArtifactCleanupRun - K8sCrd

<K8sCrd name="artifactcleanupruns.artifacts.katanomi.dev" />
```

参考 [ArtifactCleanupRun-K8sCrd](../apis/crds/ArtifactCleanupRun-K8sCrd)。

### `props`

- `name`: CRD `metadata.name`
- `crdPath`: 类似[指定 openapi 路径](#specified-openapi-path)，用于指定特定的 CRD 文件

## 公共引用

```mdx title="references/CodeQuality.mdx"
# CodeQuality

<OpenAPIRef schema="v1alpha1.CodeQuality" />
```

参考 [CodeQuality](../apis/references/CodeQuality)。

### `props`

- `schema`: OpenAPI schema `definitions`(v2) or `components/schemas`(v3) 下的引用名称
- `openapiPath`: 参考[指定 openapi 路径](#specified-openapi-path)

## 指定 openapi 路径 {#specified-openapi-path}

对于 `OpenAPIPath` 和 `OpenAPIRef` 组件，默认会在所有 openapi 定义文件中查找至匹配，如果需要指定特定的 openapi 文件，可以使用 `openapiPath` 属性指定：

```mdx
<OpenAPIPath
  path="/plugins/v1alpha1/template/codeQuality/task/{task-id}/summary"
  openapiPath="shared/openapis/katanomi.json"
/>
```
