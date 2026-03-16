# Search

## [#](#_r_b3_-platformeventsalaudaiov1events)/platform/events.alauda.io/v1/events

### [#](#_r_b3_--retrieve-kubernetes-events)`get` Retrieve Kubernetes events

Retrieve the k8s events using query parameters.

#### [#](#_r_b3_-parameters)Parameters

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



#### [#](#_r_b3_-response)Response

- `200` [EventsResponse](#_r_b3_-EventsResponse): Successful retrieval of events.

## [#](#_r_b3_-EventsResponse)EventsResponse

- `items`: `[][EventItem](#_r_b3_-EventItem)`List of event items.


- `total_items`: `integer`Total number of event items.


- `total_page`: `integer`Total number of pages.



## [#](#_r_b3_-EventItem)EventItem

- `spec`: `object`Specification details for the event.




## [#](#_r_b6_-platformeventsalaudaiov1projectsprojectclustersclusternamespacesnamespaceevents)/platform/events.alauda.io/v1/projects/{project}/clusters/{cluster}/namespaces/{namespace}/events

### [#](#_r_b6_--retrieve-kubernetes-events-for-a-specific-project-and-namespace)`get` Retrieve Kubernetes events for a specific project and namespace

Retrieve the k8s events with a business view. For these requests, the cluster, project, and namespace fields must be provided.

#### [#](#_r_b6_-parameters)Parameters

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



#### [#](#_r_b6_-response)Response

- `200` [EventsResponse](#_r_b6_-EventsResponse): Successful retrieval of events.

## [#](#_r_b6_-EventsResponse)EventsResponse

- `items`: `[][EventItem](#_r_b6_-EventItem)`List of event items.


- `total_items`: `integer`Total number of event items.


- `total_page`: `integer`Total number of pages.



## [#](#_r_b6_-EventItem)EventItem

- `spec`: `object`Specification details for the event.



