# Projects

## [#](#pluginsv1alpha1templateprojects)/plugins/v1alpha1/template/projects

### [#](#listprojects)`get` ListProjects

#### [#](#parameters)Parameters

- `itemsPerPage` (*in query*): `string` items to be returned in a page


- `page` (*in query*): `string` page to be returned



#### [#](#response)Response

- `200` [ProjectList](#v1alpha1.ProjectList): OK

### [#](#createproject)`post` CreateProject

#### [#](#request-body)Request Body

[Project](#v1alpha1.Project)required

#### [#](#response-1)Response

- `201` [Project](#v1alpha1.Project): Project Created

## [#](#v1alpha1.ProjectList)ProjectList

TypeMeta describes an individual object in an API response or request with strings representing the type of the object and its API schema version. Structures that are versioned or persisted should inline TypeMeta.

- `apiVersion`: `string`APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: [https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources](https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources)


- `items`: `[][Project](#v1alpha1.Project)`
- `kind`: `string`Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: [https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds](https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds)


- `metadata`: [ListMeta](https://kubernetes.io/docs/reference/kubernetes-api/common-definitions/list-meta/)ListMeta describes metadata that synthetic resources must have, including lists and various status objects. A resource may have only one of {ObjectMeta, ListMeta}.



## [#](#v1alpha1.Project)Project

- `apiVersion`: `string`APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: [https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources](https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources)


- `kind`: `string`Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: [https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds](https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds)


- `metadata`: [ObjectMeta](https://kubernetes.io/docs/reference/kubernetes-api/common-definitions/object-meta/)ObjectMeta is metadata that all persisted resources must have, which includes all objects users must create.


- `spec`: [ProjectSpec](#v1alpha1.ProjectSpec)

## [#](#v1alpha1.ProjectSpec)ProjectSpec

- `access`: [Addressable](#v1.Addressable)
- `address`: [Addressable](#v1.Addressable)
- `extendedAddresses`: `map[string][Addressable](#v1.Addressable)`
- `limited`: `boolean`
- `namespaceRefs`: `[][ObjectReference](#v1.ObjectReference)`
- `properties`: `string`
- `public`: `boolean`
- `readOnly`: `boolean`
- `subType`: `string`

## [#](#v1.Addressable)Addressable

- `url`: `string`

## [#](#v1.ObjectReference)ObjectReference

ObjectReference contains enough information to let you inspect or modify the referred object.

- `apiVersion`: `string`API version of the referent.


- `fieldPath`: `string`If referring to a piece of an object instead of an entire object, this string should contain a valid JSON/Go field access statement, such as desiredState.manifest.containers[2]. For example, if the object reference is to a container within a pod, this would take on a value like: "spec.containers{name}" (where "name" refers to the name of the container that triggered the event) or if no container name is specified "spec.containers[2]" (container with index 2 in this pod). This syntax is chosen only to have some well-defined way of referencing a part of an object.


- `kind`: `string`Kind of the referent. More info: [https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds](https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds)


- `name`: `string`Name of the referent. More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names)


- `namespace`: `string`Namespace of the referent. More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/)


- `resourceVersion`: `string`Specific resourceVersion to which this reference is made, if any. More info: [https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#concurrency-control-and-consistency](https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#concurrency-control-and-consistency)


- `uid`: `string`UID of the referent. More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#uids](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#uids)



