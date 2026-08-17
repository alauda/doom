# Search

## [#](#platformeventsalaudaiov1events)/platform/events.alauda.io/v1/events

### [#](#get-retrieve-kubernetes-events)`get` Retrieve Kubernetes events

Retrieve the k8s events using query parameters.

#### [#](#参数)参数

- `start_time` (*in query*): `number` required Required: Unix timestamp for start time.


- `end_time` (*in query*): `number` required Required: Unix timestamp for end time.


- `cluster` (*in query*): `string` required Required: Name of the Kubernetes cluster.


- `pageno` (*in query*): `number` Optional: Page number to retrieve.


- `size` (*in query*): `number` Optional: Page size, defaults to 30.


- `project` (*in query*): `string` Optional: Name of the project.


- `namespace` (*in query*): `string` Optional: Event's namespace. Use comma-separated values for multiple namespaces.


- `kind` (*in query*): `string` Optional: Event related resource kind. Use comma-separated values for multiple kinds.


- `name` (*in query*): `string` Optional: Filter events by name (fuzzy matching).


- `filters` (*in query*): `string` Optional: Custom filters.


- `type` (*in query*): `string` Optional: Event type (e.g. Normal, Warning, etc.).



#### [#](#响应)响应

- `200` [EventsResponse](#EventsResponse): Successful retrieval of events.

## [#](#platformeventsalaudaiov1projectsprojectclustersclusternamespacesnamespaceevents)/platform/events.alauda.io/v1/projects/{project}/clusters/{cluster}/namespaces/{namespace}/events

### [#](#get-retrieve-kubernetes-events-for-a-specific-project-and-namespace)`get` Retrieve Kubernetes events for a specific project and namespace

Retrieve the k8s events with a business view. For these requests, the cluster, project, and namespace fields must be provided.

#### [#](#参数-1)参数

- `projectName` (*in path*): `string` required Required: Name of the project.


- `clusterName` (*in path*): `string` required Required: Name of the cluster.


- `namespace` (*in path*): `string` required Required: Namespace for the events.


- `start_time` (*in query*): `number` required Required: Unix timestamp for start time.


- `end_time` (*in query*): `number` required Required: Unix timestamp for end time.


- `cluster` (*in query*): `string` required Required: Name of the Kubernetes cluster.


- `pageno` (*in query*): `number` Optional: Page number to retrieve.


- `size` (*in query*): `number` Optional: Page size, defaults to 30.


- `kind` (*in query*): `string` Optional: Event related resource kind. Use comma-separated values for multiple kinds.


- `name` (*in query*): `string` Optional: Filter events by name (fuzzy matching).


- `filters` (*in query*): `string` Optional: Custom filters.


- `type` (*in query*): `string` Optional: Event type (e.g. Normal, Warning, etc.).



#### [#](#响应-1)响应

- `200` [EventsResponse](#EventsResponse): Successful retrieval of events.

## [#](#EventsResponse)EventsResponse

- `items`: `[][EventItem](#EventItem)`List of event items.


- `total_items`: `integer`Total number of event items.


- `total_page`: `integer`Total number of pages.



## [#](#EventItem)EventItem

- `spec`: `object`Specification details for the event.



