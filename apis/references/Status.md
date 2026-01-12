# Status

## [#](#io.k8s.apimachinery.pkg.apis.meta.v1.Status)Status

Status is a return value for calls that don't return other objects.

- `apiVersion`: `string`APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: [https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources](https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources)


- `code`: `integer`Suggested HTTP return code for this status, 0 if not set.


- `details`: [StatusDetails](#io.k8s.apimachinery.pkg.apis.meta.v1.StatusDetails)StatusDetails is a set of additional properties that MAY be set by the server to provide additional information about a response. The Reason field of a Status object defines what attributes will be set. Clients must ignore fields that do not match the defined type of each attribute, and should assume that any attribute may be empty, invalid, or under defined.


- `kind`: `string`Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: [https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds](https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds)


- `message`: `string`A human-readable description of the status of this operation.


- `metadata`: [ListMeta](https://kubernetes.io/docs/reference/kubernetes-api/common-definitions/list-meta/)ListMeta describes metadata that synthetic resources must have, including lists and various status objects. A resource may have only one of {ObjectMeta, ListMeta}.


- `reason`: `string`A machine-readable description of why this operation is in the "Failure" status. If this value is empty there is no information available. A Reason clarifies an HTTP status code but does not override it.


- `status`: `string`Status of the operation. One of: "Success" or "Failure". More info: [https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#spec-and-status](https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#spec-and-status)



## [#](#io.k8s.apimachinery.pkg.apis.meta.v1.StatusDetails)StatusDetails

StatusDetails is a set of additional properties that MAY be set by the server to provide additional information about a response. The Reason field of a Status object defines what attributes will be set. Clients must ignore fields that do not match the defined type of each attribute, and should assume that any attribute may be empty, invalid, or under defined.

- `causes`: `[][StatusCause](#io.k8s.apimachinery.pkg.apis.meta.v1.StatusCause)`The Causes array includes more details associated with the StatusReason failure. Not all StatusReasons may provide detailed causes.


- `group`: `string`The group attribute of the resource associated with the status StatusReason.


- `kind`: `string`The kind attribute of the resource associated with the status StatusReason. On some operations may differ from the requested resource Kind. More info: [https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds](https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds)


- `name`: `string`The name attribute of the resource associated with the status StatusReason (when there is a single name which can be described).


- `retryAfterSeconds`: `integer`If specified, the time in seconds before the operation should be retried. Some errors may indicate the client must take an alternate action - for those errors this field may indicate how long to wait before taking the alternate action.


- `uid`: `string`UID of the resource. (when there is a single resource which can be described). More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/names#uids](https://kubernetes.io/docs/concepts/overview/working-with-objects/names#uids)



## [#](#io.k8s.apimachinery.pkg.apis.meta.v1.StatusCause)StatusCause

StatusCause provides more information about an api.Status failure, including cases when multiple errors are encountered.

- `field`: `string`The field of the resource that has caused this error, as named by its JSON serialization. May include dot and postfix notation for nested attributes. Arrays are zero-indexed.  Fields may appear more than once in an array of causes due to fields having multiple errors. Optional.


Examples:
"name" - the field "name" on the current resource
"items[0].name" - the field "name" on the first array entry in "items"


- `message`: `string`A human-readable description of the cause of the error.  This field may be presented as-is to a reader.


- `reason`: `string`A machine-readable description of the cause of the error. If this value is empty there is no information available.



