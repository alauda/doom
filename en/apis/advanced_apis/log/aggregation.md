# Aggregation

## [#](#_r_e_-platformloggingalaudaiov2logsaggregation)/platform/logging.alauda.io/v2/logs/aggregation

### [#](#_r_e_--log-aggregation)`get` Log Aggregation

Aggregate logs into buckets for chart display with authentication.

#### [#](#_r_e_-parameters)Parameters

- `buckets` (*in query*): `integer` Number of buckets for aggregation. Default is 30.


- `start` (*in query*): `number` required Start time of the time range.


- `end` (*in query*): `number` required End time of the time range.


- `cluster` (*in query*): `string` required Name of the cluster.


- `logType` (*in query*): `string` Type of log. Options: system, platform, kubernetes, workload. Default is workload.


- `projects` (*in query*): `string` Project names for application logs, comma separated.


- `namespaces` (*in query*): `string` Namespace names for application logs, comma separated.


- `workloads` (*in query*): `string` Workload type and name pairs for application logs, e.g., Deployment:lanaya. Multiple values separated by commas.


- `podNames` (*in query*): `string` Pod names, comma separated.


- `containerNames` (*in query*): `string` Container names, comma separated.


- `nodes` (*in query*): `string` Node names, comma separated.


- `paths` (*in query*): `string` Path names, comma separated.


- `products` (*in query*): `string` Product names for product logs, comma separated.


- `components` (*in query*): `string` Component names for product logs or Kubernetes logs, comma separated.


- `query` (*in query*): `string` Query keywords, supports AND, OR, and escape with backslash.



#### [#](#_r_e_-response)Response

- `200` `object`: Successful aggregation response*Properties:*- `buckets`: `[][Bucket](#_r_e_-Bucket)`



## [#](#_r_e_-Bucket)Bucket

- `time`: `number`
- `count`: `integer`


## [#](#_r_g_-platformloggingalaudaiov2clustersclusterlogsaggregation)/platform/logging.alauda.io/v2/clusters/{cluster}/logs/aggregation

### [#](#_r_g_--log-aggregation-by-cluster)`get` Log Aggregation by Cluster

Aggregate logs by cluster into buckets with authentication.

#### [#](#_r_g_-parameters)Parameters

- `cluster` (*in path*): `string` required Name of the cluster.


- `buckets` (*in query*): `integer` Number of buckets for aggregation. Default is 30.


- `start` (*in query*): `number` required Start time of the time range.


- `end` (*in query*): `number` required End time of the time range.


- `logType` (*in query*): `string` Type of log. Options: system, platform, kubernetes, workload. Default is workload.


- `projects` (*in query*): `string` Project names for application logs, comma separated.


- `namespaces` (*in query*): `string` Namespace names for application logs, comma separated.


- `workloads` (*in query*): `string` Workload type and name pairs for application logs, e.g., Deployment:lanaya. Multiple values separated by commas.


- `podNames` (*in query*): `string` Pod names, comma separated.


- `containerNames` (*in query*): `string` Container names, comma separated.


- `nodes` (*in query*): `string` Node names, comma separated.


- `paths` (*in query*): `string` Path names, comma separated.


- `products` (*in query*): `string` Product names for product logs, comma separated.


- `components` (*in query*): `string` Component names for product logs or Kubernetes logs, comma separated.


- `query` (*in query*): `string` Query keywords, supports AND, OR, and escape with backslash.



#### [#](#_r_g_-response)Response

- `200` `object`: Successful aggregation response*Properties:*- `buckets`: `[][Bucket](#_r_g_-Bucket)`



## [#](#_r_g_-Bucket)Bucket

- `time`: `number`
- `count`: `integer`


## [#](#_r_i_-platformloggingalaudaiov2projectsprojectclustersclusternamespacesnamespacelogsaggregation)/platform/logging.alauda.io/v2/projects/{project}/clusters/{cluster}/namespaces/{namespace}/logs/aggregation

### [#](#_r_i_--log-aggregation-by-project-cluster-and-namespace)`get` Log Aggregation by Project, Cluster and Namespace

Aggregate logs within a specific project, cluster, and namespace into buckets with authentication.

#### [#](#_r_i_-parameters)Parameters

- `project` (*in path*): `string` required Name of the project.


- `cluster` (*in path*): `string` required Name of the cluster.


- `namespace` (*in path*): `string` required Name of the namespace.


- `buckets` (*in query*): `integer` Number of buckets for aggregation. Default is 30.


- `start` (*in query*): `number` required Start time of the time range.


- `end` (*in query*): `number` required End time of the time range.


- `logType` (*in query*): `string` Type of log. Options: system, platform, kubernetes, workload. Default is workload.


- `workloads` (*in query*): `string` Workload type and name pairs for application logs, e.g., Deployment:lanaya. Multiple values separated by commas.


- `podNames` (*in query*): `string` Pod names, comma separated.


- `containerNames` (*in query*): `string` Container names, comma separated.


- `namespaces` (*in query*): `string` Namespace names for application logs, comma separated.


- `nodes` (*in query*): `string` Node names, comma separated.


- `paths` (*in query*): `string` Path names, comma separated.


- `products` (*in query*): `string` Product names for product logs, comma separated.


- `components` (*in query*): `string` Component names for product logs or Kubernetes logs, comma separated.


- `query` (*in query*): `string` Query keywords, supports AND, OR, and escape with backslash.



#### [#](#_r_i_-response)Response

- `200` `object`: Successful aggregation response*Properties:*- `buckets`: `[][Bucket](#_r_i_-Bucket)`



## [#](#_r_i_-Bucket)Bucket

- `time`: `number`
- `count`: `integer`

