# DaemonSet \[apps/v1]

## [#](#_r_29_-kubernetesclusterapisappsv1daemonsets)/kubernetes/{cluster}/apis/apps/v1/daemonsets

### [#](#_r_29_-common-parameters)Common Parameters

- `cluster` (*in path*): `string` required The name of the kuberentes cluster to access.


- `allowWatchBookmarks` (*in query*): `boolean` allowWatchBookmarks requests watch events with type "BOOKMARK". Servers that do not implement bookmarks may ignore this flag and bookmarks are sent at the server's discretion. Clients should not assume bookmarks are returned at any specific interval, nor may they assume the server will send any BOOKMARK event during a session. If this is not a watch, this field is ignored.


- `continue` (*in query*): `string` The continue option should be set when retrieving more results from the server. Since this value is server defined, clients may only use the continue value from a previous query result with identical query parameters (except for the value of continue) and the server may reject a continue value it does not recognize. If the specified continue value is no longer valid whether due to expiration (generally five to fifteen minutes) or a configuration change on the server, the server will respond with a 410 ResourceExpired error together with a continue token. If the client needs a consistent list, it must restart their list without the continue field. Otherwise, the client may send another list request with the token received with the 410 error, the server will respond with a list starting from the next key, but from the latest snapshot, which is inconsistent from the previous list results - objects that are created, modified, or deleted after the first list request will be included in the response, as long as their keys are after the "next key".


This field is not supported when watch is true. Clients may start a watch from the last resourceVersion value returned by the server and not miss any modifications.


- `fieldSelector` (*in query*): `string` A selector to restrict the list of returned objects by their fields. Defaults to everything.


- `labelSelector` (*in query*): `string` A selector to restrict the list of returned objects by their labels. Defaults to everything.


- `limit` (*in query*): `integer` limit is a maximum number of responses to return for a list call. If more items exist, the server will set the `continue` field on the list metadata to a value that can be used with the same initial query to retrieve the next set of results. Setting a limit may return fewer than the requested amount of items (up to zero items) in the event all requested objects are filtered out and clients should only use the presence of the continue field to determine whether more results are available. Servers may choose not to support the limit argument and will return all of the available results. If limit is specified and the continue field is empty, clients may assume that no more results are available. This field is not supported if watch is true.


The server guarantees that the objects returned when using continue will be identical to issuing a single list call without a limit - that is, no objects created, modified, or deleted after the first request is issued will be included in any subsequent continued requests. This is sometimes referred to as a consistent snapshot, and ensures that a client that is using limit to receive smaller chunks of a very large result can ensure they see all possible objects. If objects are updated during a chunked list the version of the object that was present at the time the first list result was calculated is returned.


- `pretty` (*in query*): `string` If 'true', then the output is pretty printed. Defaults to 'false' unless the user-agent indicates a browser or command-line HTTP tool (curl and wget).


- `resourceVersion` (*in query*): `string` resourceVersion sets a constraint on what resource versions a request may be served from. See [https://kubernetes.io/docs/reference/using-api/api-concepts/#resource-versions](https://kubernetes.io/docs/reference/using-api/api-concepts/#resource-versions) for details.


Defaults to unset


- `resourceVersionMatch` (*in query*): `string` resourceVersionMatch determines how resourceVersion is applied to list calls. It is highly recommended that resourceVersionMatch be set for list calls where resourceVersion is set See [https://kubernetes.io/docs/reference/using-api/api-concepts/#resource-versions](https://kubernetes.io/docs/reference/using-api/api-concepts/#resource-versions) for details.


Defaults to unset


- `sendInitialEvents` (*in query*): `boolean` `sendInitialEvents=true` may be set together with `watch=true`. In that case, the watch stream will begin with synthetic events to produce the current state of objects in the collection. Once all such events have been sent, a synthetic "Bookmark" event  will be sent. The bookmark will report the ResourceVersion (RV) corresponding to the set of objects, and be marked with `"k8s.io/initial-events-end": "true"` annotation. Afterwards, the watch stream will proceed as usual, sending watch events corresponding to changes (subsequent to the RV) to objects watched.


When `sendInitialEvents` option is set, we require `resourceVersionMatch` option to also be set. The semantic of the watch request is as following: - `resourceVersionMatch` = NotOlderThan
is interpreted as "data at least as new as the provided `resourceVersion`"
and the bookmark event is send when the state is synced
to a `resourceVersion` at least as fresh as the one provided by the ListOptions.
If `resourceVersion` is unset, this is interpreted as "consistent read" and the
bookmark event is send when the state is synced at least to the moment
when request started being processed.



- `resourceVersionMatch` set to any other value or unset
Invalid error is returned.



Defaults to true if `resourceVersion=""` or `resourceVersion="0"` (for backward compatibility reasons) and to false otherwise.


- `timeoutSeconds` (*in query*): `integer` Timeout for the list/watch call. This limits the duration of the call, regardless of any activity or inactivity.


- `watch` (*in query*): `boolean` Watch for changes to the described resources and return them as a stream of add, update, and remove notifications. Specify resourceVersion.



### [#](#_r_29_)`get`

list or watch objects of kind DaemonSet

#### [#](#_r_29_-response)Response

- `200`[DaemonSetList](#_r_29_-io.k8s.api.apps.v1.DaemonSetList): OK
- `401`: Unauthorized

## [#](#_r_29_-io.k8s.api.apps.v1.DaemonSetList)DaemonSetList

DaemonSetList is a collection of daemon sets.

- `apiVersion`: `string`APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: [https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources](https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources)


- `items`: `[][DaemonSet](/apis/references/DaemonSet#io.k8s.api.apps.v1.DaemonSet)`A list of daemon sets.


- `kind`: `string`Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: [https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds](https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds)


- `metadata`: [ListMeta](https://kubernetes.io/docs/reference/kubernetes-api/common-definitions/list-meta/)ListMeta describes metadata that synthetic resources must have, including lists and various status objects. A resource may have only one of {ObjectMeta, ListMeta}.




## [#](#_r_2b_-kubernetesclusterapisappsv1namespacesnamespacedaemonsetsname)/kubernetes/{cluster}/apis/apps/v1/namespaces/{namespace}/daemonsets/{name}

### [#](#_r_2b_-common-parameters)Common Parameters

- `cluster` (*in path*): `string` required The name of the kuberentes cluster to access.


- `name` (*in path*): `string` required name of the DaemonSet


- `namespace` (*in path*): `string` required object name and auth scope, such as for teams and projects


- `pretty` (*in query*): `string` If 'true', then the output is pretty printed. Defaults to 'false' unless the user-agent indicates a browser or command-line HTTP tool (curl and wget).



### [#](#_r_2b_)`get`

read the specified DaemonSet

#### [#](#_r_2b_-response)Response

- `200`[DaemonSet](/apis/references/DaemonSet#io.k8s.api.apps.v1.DaemonSet): OK
- `401`: Unauthorized

### [#](#_r_2b_--1)`put`

replace the specified DaemonSet

#### [#](#_r_2b_-parameters)Parameters

- `dryRun` (*in query*): `string` When present, indicates that modifications should not be persisted. An invalid or unrecognized dryRun directive will result in an error response and no further processing of the request. Valid values are: - All: all dry run stages will be processed


- `fieldManager` (*in query*): `string` fieldManager is a name associated with the actor or entity that is making these changes. The value must be less than or 128 characters long, and only contain printable characters, as defined by [https://golang.org/pkg/unicode/#IsPrint](https://golang.org/pkg/unicode/#IsPrint).


- `fieldValidation` (*in query*): `string` fieldValidation instructs the server on how to handle objects in the request (POST/PUT/PATCH) containing unknown or duplicate fields. Valid values are: - Ignore: This will ignore any unknown fields that are silently dropped from the object, and will ignore all but the last duplicate field that the decoder encounters. This is the default behavior prior to v1.23. - Warn: This will send a warning via the standard warning response header for each unknown field that is dropped from the object, and for each duplicate field that is encountered. The request will still succeed if there are no other errors, and will only persist the last of any duplicate fields. This is the default in v1.23+ - Strict: This will fail the request with a BadRequest error if any unknown fields would be dropped from the object, or if any duplicate fields are present. The error returned from the server will contain all unknown and duplicate fields encountered.



#### [#](#_r_2b_-request-body)Request Body

[DaemonSet](/apis/references/DaemonSet#io.k8s.api.apps.v1.DaemonSet)

#### [#](#_r_2b_-response-1)Response

- `200`[DaemonSet](/apis/references/DaemonSet#io.k8s.api.apps.v1.DaemonSet): OK
- `201`[DaemonSet](/apis/references/DaemonSet#io.k8s.api.apps.v1.DaemonSet): Created
- `401`: Unauthorized

### [#](#_r_2b_--2)`delete`

delete a DaemonSet

#### [#](#_r_2b_-parameters-1)Parameters

- `dryRun` (*in query*): `string` When present, indicates that modifications should not be persisted. An invalid or unrecognized dryRun directive will result in an error response and no further processing of the request. Valid values are: - All: all dry run stages will be processed


- `gracePeriodSeconds` (*in query*): `integer` The duration in seconds before the object should be deleted. Value must be non-negative integer. The value zero indicates delete immediately. If this value is nil, the default grace period for the specified type will be used. Defaults to a per object value if not specified. zero means delete immediately.


- `ignoreStoreReadErrorWithClusterBreakingPotential` (*in query*): `boolean` if set to true, it will trigger an unsafe deletion of the resource in case the normal deletion flow fails with a corrupt object error. A resource is considered corrupt if it can not be retrieved from the underlying storage successfully because of a) its data can not be transformed e.g. decryption failure, or b) it fails to decode into an object. NOTE: unsafe deletion ignores finalizer constraints, skips precondition checks, and removes the object from the storage. WARNING: This may potentially break the cluster if the workload associated with the resource being unsafe-deleted relies on normal deletion flow. Use only if you REALLY know what you are doing. The default value is false, and the user must opt in to enable it


- `orphanDependents` (*in query*): `boolean` Deprecated: please use the PropagationPolicy, this field will be deprecated in 1.7. Should the dependent objects be orphaned. If true/false, the "orphan" finalizer will be added to/removed from the object's finalizers list. Either this field or PropagationPolicy may be set, but not both.


- `propagationPolicy` (*in query*): `string` Whether and how garbage collection will be performed. Either this field or OrphanDependents may be set, but not both. The default policy is decided by the existing finalizer set in the metadata.finalizers and the resource-specific default policy. Acceptable values are: 'Orphan' - orphan the dependents; 'Background' - allow the garbage collector to delete the dependents in the background; 'Foreground' - a cascading policy that deletes all dependents in the foreground.



#### [#](#_r_2b_-request-body-1)Request Body

[DeleteOptions](https://kubernetes.io/docs/reference/kubernetes-api/common-definitions/delete-options/)

#### [#](#_r_2b_-response-2)Response

- `200`[Status](https://kubernetes.io/docs/reference/kubernetes-api/common-definitions/status/): OK
- `202`[Status](https://kubernetes.io/docs/reference/kubernetes-api/common-definitions/status/): Accepted
- `401`: Unauthorized

### [#](#_r_2b_--3)`patch`

partially update the specified DaemonSet

#### [#](#_r_2b_-parameters-2)Parameters

- `dryRun` (*in query*): `string` When present, indicates that modifications should not be persisted. An invalid or unrecognized dryRun directive will result in an error response and no further processing of the request. Valid values are: - All: all dry run stages will be processed


- `fieldManager` (*in query*): `string` fieldManager is a name associated with the actor or entity that is making these changes. The value must be less than or 128 characters long, and only contain printable characters, as defined by [https://golang.org/pkg/unicode/#IsPrint](https://golang.org/pkg/unicode/#IsPrint). This field is required for apply requests (application/apply-patch) but optional for non-apply patch types (JsonPatch, MergePatch, StrategicMergePatch).


- `fieldValidation` (*in query*): `string` fieldValidation instructs the server on how to handle objects in the request (POST/PUT/PATCH) containing unknown or duplicate fields. Valid values are: - Ignore: This will ignore any unknown fields that are silently dropped from the object, and will ignore all but the last duplicate field that the decoder encounters. This is the default behavior prior to v1.23. - Warn: This will send a warning via the standard warning response header for each unknown field that is dropped from the object, and for each duplicate field that is encountered. The request will still succeed if there are no other errors, and will only persist the last of any duplicate fields. This is the default in v1.23+ - Strict: This will fail the request with a BadRequest error if any unknown fields would be dropped from the object, or if any duplicate fields are present. The error returned from the server will contain all unknown and duplicate fields encountered.


- `force` (*in query*): `boolean` Force is going to "force" Apply requests. It means user will re-acquire conflicting fields owned by other people. Force flag must be unset for non-apply patch requests.



#### [#](#_r_2b_-request-body-2)Request Body

[Patch](https://kubernetes.io/docs/reference/kubernetes-api/common-definitions/patch/)

#### [#](#_r_2b_-response-3)Response

- `200`[DaemonSet](/apis/references/DaemonSet#io.k8s.api.apps.v1.DaemonSet): OK
- `201`[DaemonSet](/apis/references/DaemonSet#io.k8s.api.apps.v1.DaemonSet): Created
- `401`: Unauthorized

