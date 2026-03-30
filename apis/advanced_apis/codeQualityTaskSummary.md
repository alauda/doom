# CodeQualityTaskSummary

## [#](#pluginsv1alpha1templatecodequalitytasktask-idsummary)/plugins/v1alpha1/template/codeQuality/task/{task-id}/summary

### [#](#getsummarybytaskid)`get` GetSummaryByTaskID

#### [#](#parameters)Parameters

- `task-id` (*in path*): `string` required code scan task id


- `project-key` (*in query*): `string` identifier of the project


- `branch` (*in query*): `string` branch name


- `pullRequest` (*in query*): `string` pull request id



#### [#](#response)Response

- `200` [CodeQualityTaskMetrics](#v1alpha1.CodeQualityTaskMetrics): OK

## [#](#v1alpha1.CodeQualityTaskMetrics)CodeQualityTaskMetrics

- `apiVersion`: `string`APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: [https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources](https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources)


- `kind`: `string`Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: [https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds](https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds)


- `metadata`: [ObjectMeta](https://kubernetes.io/docs/reference/kubernetes-api/common-definitions/object-meta/)ObjectMeta is metadata that all persisted resources must have, which includes all objects users must create.


- `spec`: [CodeQualityTaskMetricsSpec](#v1alpha1.CodeQualityTaskMetricsSpec)
- `status`: [CodeQualityTaskMetricsStatus](#v1alpha1.CodeQualityTaskMetricsStatus)

## [#](#v1alpha1.CodeQualityTaskMetricsSpec)CodeQualityTaskMetricsSpec

- `component`: [CodeQualityTaskMetricsSpecComponent](#v1alpha1.CodeQualityTaskMetricsSpecComponent)
- `metrics`: `map[string]string`
- `summary`: [CodeQualityTaskMetricsSpecSummary](#v1alpha1.CodeQualityTaskMetricsSpecSummary)
- `task`: [CodeQualityTaskMetricsSpecTask](#v1alpha1.CodeQualityTaskMetricsSpecTask)

## [#](#v1alpha1.CodeQualityTaskMetricsSpecComponent)CodeQualityTaskMetricsSpecComponent

- `id`: `string`
- `key`: `string`
- `name`: `string`

## [#](#v1alpha1.CodeQualityTaskMetricsSpecSummary)CodeQualityTaskMetricsSpecSummary

- `new`: [CodeQualityTaskMetricsSpecSummaryOverview](#v1alpha1.CodeQualityTaskMetricsSpecSummaryOverview)
- `total`: [CodeQualityTaskMetricsSpecSummaryOverview](#v1alpha1.CodeQualityTaskMetricsSpecSummaryOverview)

## [#](#v1alpha1.CodeQualityTaskMetricsSpecSummaryOverview)CodeQualityTaskMetricsSpecSummaryOverview

- `bugs`: `string`
- `codeSmells`: `string`
- `duplicatedLinesDensity`: `string`
- `vulnerabilities`: `string`

## [#](#v1alpha1.CodeQualityTaskMetricsSpecTask)CodeQualityTaskMetricsSpecTask

- `analysisId`: `string`
- `executedAt`: `string`
- `executionTimeMs`: `string`
- `id`: `string`
- `startedAt`: `string`
- `status`: `string`

## [#](#v1alpha1.CodeQualityTaskMetricsStatus)CodeQualityTaskMetricsStatus

- `reason`: `string`
- `status`: `string`

