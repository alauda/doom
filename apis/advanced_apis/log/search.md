# Search

## [#](#platformloggingalaudaiov2logssearch)/platform/logging.alauda.io/v2/logs/search

### [#](#get-log-search)`get` Log Search

Search logs with authentication.

#### [#](#参数)参数

- `start` (*in query*): `number` required Start time of the time range.


- `end` (*in query*): `number` required End time of the time range.


- `page` (*in query*): `integer` required Page number for the query results.


- `pageSize` (*in query*): `integer` Number of records per page. For export, 0 means export all.


- `ascending` (*in query*): `boolean` Sort order. Default is false (descending).


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



#### [#](#响应)响应

- `200` `object`: Successful log search response*Properties:*- `items`: `[][LogEntry](#LogEntry)`



## [#](#platformloggingalaudaiov2clustersclusterlogssearch)/platform/logging.alauda.io/v2/clusters/{cluster}/logs/search

### [#](#get-log-search-by-cluster)`get` Log Search by Cluster

Search logs by cluster with authentication.

#### [#](#参数-1)参数

- `cluster` (*in path*): `string` required Name of the cluster.


- `start` (*in query*): `number` required Start time of the time range.


- `end` (*in query*): `number` required End time of the time range.


- `page` (*in query*): `integer` required Page number for the query results.


- `pageSize` (*in query*): `integer` Number of records per page. For export, 0 means export all.


- `ascending` (*in query*): `boolean` Sort order. Default is false (descending).


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



#### [#](#响应-1)响应

- `200` `object`: Successful log search response*Properties:*- `items`: `[][LogEntry](#LogEntry)`



## [#](#platformloggingalaudaiov2projectsprojectclustersclusternamespacesnamespacelogssearch)/platform/logging.alauda.io/v2/projects/{project}/clusters/{cluster}/namespaces/{namespace}/logs/search

### [#](#get-log-search-by-project-cluster-and-namespace)`get` Log Search by Project, Cluster and Namespace

Search logs within a specific project, cluster, and namespace with authentication.

#### [#](#参数-2)参数

- `project` (*in path*): `string` required Name of the project.


- `cluster` (*in path*): `string` required Name of the cluster.


- `namespace` (*in path*): `string` required Name of the namespace.


- `start` (*in query*): `number` required Start time of the time range.


- `end` (*in query*): `number` required End time of the time range.


- `page` (*in query*): `integer` required Page number for the query results.


- `pageSize` (*in query*): `integer` Number of records per page. For export, 0 means export all.


- `ascending` (*in query*): `boolean` Sort order. Default is false (descending).


- `logType` (*in query*): `string` Type of log. Options: system, platform, kubernetes, workload. Default is workload.


- `projects` (*in query*): `string` Project names for application logs, comma separated.


- `workloads` (*in query*): `string` Workload type and name pairs for application logs, e.g., Deployment:lanaya. Multiple values separated by commas.


- `podNames` (*in query*): `string` Pod names, comma separated.


- `containerNames` (*in query*): `string` Container names, comma separated.


- `namespaces` (*in query*): `string` Namespace names for application logs, comma separated.


- `nodes` (*in query*): `string` Node names, comma separated.


- `paths` (*in query*): `string` Path names, comma separated.


- `products` (*in query*): `string` Product names for product logs, comma separated.


- `components` (*in query*): `string` Component names for product logs or Kubernetes logs, comma separated.


- `query` (*in query*): `string` Query keywords, supports AND, OR, and escape with backslash.



#### [#](#响应-2)响应

- `200` `object`: Successful log search response*Properties:*- `items`: `[][LogEntry](#LogEntry)`



## [#](#LogEntry)LogEntry

- `time`: `number`Time of the log entry.


- `node`: `string`Name of the node.


- `podName`: `string`Name of the pod.


- `podId`: `string`Identifier of the pod.


- `logData`: `string`Log data as a JSON string.


- `logLevel`: `string`Severity level of the log.


- `containerName`: `string`Name of the container.


- `cluster`: `string`Name of the cluster.


- `containerId`: `string`Identifier of the container.


- `containerId8`: `string`Shortened container identifier.


- `@timestamp`: `string`Timestamp in string format.


- `namespace`: `string`Namespace of the log.


- `project`: `string`Project associated with the log.


- `path`: `string`Log path.


- `logId`: `string`Unique identifier of the log.


- `logType`: `string`Type of the log.


- `logIndex`: `string`Index name for the log.


- `component`: `string`Component related to the log.


- `product`: `string`Product name associated with the log.


- `workload`: `string`Workload details.



