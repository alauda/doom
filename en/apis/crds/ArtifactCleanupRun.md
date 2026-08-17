# ArtifactCleanupRun

DescriptionArtifactCleanupRun is the Schema for the artifactcleanupruns APIType`object`## [#](#specification)Specification

| Property | Type | Description |
| --- | --- | --- |
| `apiVersion` | `string` | APIVersion defines the versioned schema of this representation of an object.
Servers should convert recognized schemas to the latest internal value, and
may reject unrecognized values.
More info: [https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources](https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources) |
| `kind` | `string` | Kind is a string value representing the REST resource this object represents.
Servers may infer this from the endpoint the client submits requests to.
Cannot be updated.
In CamelCase.
More info: [https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds](https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds) |
| `metadata` | `[ObjectMeta](/apis/references/ObjectMeta.html)` | ObjectMeta is metadata that all persisted resources must have, which includes all objects users must create. |
| `spec` | `object` | ArtifactCleanupRunSpec defines the desired state of ArtifactCleanupRun |
| `status` | `object` | ArtifactCleanupRunStatus defines the observed state of ArtifactCleanupRun |

### [#](#spec).spec

DescriptionArtifactCleanupRunSpec defines the desired state of ArtifactCleanupRunType`object`| Property | Type | Description |
| --- | --- | --- |
| `artifactCleanupRef` | `object` | Reference to an existing ArtifactCleanup |
| `artifactCleanupSpec` | `object` | In-line spec for ArtifactCleanup. This options is mutually exclusive with artifactCleanupRef. |
| `dryRun` | `boolean` | `True` means that the simulation runs without performing specific cleanup operations. |
| `status` | `string` | Status Used for cancelling a ArtifactCleanupRun (and maybe more later on) |

### [#](#specartifactcleanupref).spec.artifactCleanupRef

DescriptionReference to an existing ArtifactCleanupType`object`| Property | Type | Description |
| --- | --- | --- |
| `apiVersion` | `string` | API version of the referent. |
| `fieldPath` | `string` | If referring to a piece of an object instead of an entire object, this string
should contain a valid JSON/Go field access statement, such as desiredState.manifest.containers[2].
For example, if the object reference is to a container within a pod, this would take on a value like:
"spec.containers{name}" (where "name" refers to the name of the container that triggered
the event) or if no container name is specified "spec.containers[2]" (container with
index 2 in this pod). This syntax is chosen only to have some well-defined way of
referencing a part of an object.
TODO: this design is not final and this field is subject to change in the future. |
| `kind` | `string` | Kind of the referent.
More info: [https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds](https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds) |
| `name` | `string` | Name of the referent.
More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names) |
| `namespace` | `string` | Namespace of the referent.
More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/) |
| `resourceVersion` | `string` | Specific resourceVersion to which this reference is made, if any.
More info: [https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#concurrency-control-and-consistency](https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#concurrency-control-and-consistency) |
| `uid` | `string` | UID of the referent.
More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#uids](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#uids) |

### [#](#specartifactcleanupspec).spec.artifactCleanupSpec

DescriptionIn-line spec for ArtifactCleanup. This options is mutually exclusive with artifactCleanupRef.Type`object`| Property | Type | Description |
| --- | --- | --- |
| `address` | `object` | Address stores the integrated service API address |
| `historyLimits` | `object` | HistoryLimits limits the number of executed items are preserved
It only calculates already completed items |
| `integrationClassName` | `string` | IntegrationClassName sets the name of IntegrationClass that this integration is implemented |
| `integrationRef` | `object` | Reference to specific integration that contains the tool API define. |
| `policies` | `array` | List of strategies. |
| `resource` | `object` | Resources array of predefined resources to be used |
| `triggers` | `object` | all triggers defined for triggering current artifactcleanup |

### [#](#specartifactcleanupspecaddress).spec.artifactCleanupSpec.address

DescriptionAddress stores the integrated service API addressType`object`| Property | Type | Description |
| --- | --- | --- |
| `CACerts` | `string` | CACerts is the Certification Authority (CA) certificates in PEM format
according to [https://www.rfc-editor.org/rfc/rfc7468](https://www.rfc-editor.org/rfc/rfc7468). |
| `name` | `string` | Name is the name of the address. |
| `url` | `string` |  |

### [#](#specartifactcleanupspechistorylimits).spec.artifactCleanupSpec.historyLimits

DescriptionHistoryLimits limits the number of executed items are preserved
It only calculates already completed itemsType`object`| Property | Type | Description |
| --- | --- | --- |
| `count` | `integer` | Sets a hard count for all finished items
to be cleared from storage |

### [#](#specartifactcleanupspecintegrationref).spec.artifactCleanupSpec.integrationRef

DescriptionReference to specific integration that contains the tool API define.Type`object`| Property | Type | Description |
| --- | --- | --- |
| `apiVersion` | `string` | API version of the referent. |
| `fieldPath` | `string` | If referring to a piece of an object instead of an entire object, this string
should contain a valid JSON/Go field access statement, such as desiredState.manifest.containers[2].
For example, if the object reference is to a container within a pod, this would take on a value like:
"spec.containers{name}" (where "name" refers to the name of the container that triggered
the event) or if no container name is specified "spec.containers[2]" (container with
index 2 in this pod). This syntax is chosen only to have some well-defined way of
referencing a part of an object.
TODO: this design is not final and this field is subject to change in the future. |
| `kind` | `string` | Kind of the referent.
More info: [https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds](https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds) |
| `name` | `string` | Name of the referent.
More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names) |
| `namespace` | `string` | Namespace of the referent.
More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/) |
| `resourceVersion` | `string` | Specific resourceVersion to which this reference is made, if any.
More info: [https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#concurrency-control-and-consistency](https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#concurrency-control-and-consistency) |
| `uid` | `string` | UID of the referent.
More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#uids](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#uids) |

### [#](#specartifactcleanupspecpolicies).spec.artifactCleanupSpec.policies

DescriptionList of strategies.Type`array`### [#](#specartifactcleanupspecpolicies-1).spec.artifactCleanupSpec.policies[]

DescriptionPolicy A detailed description of the policy, including warehouse, cleanup rules, and retention rules.Type`object`| Property | Type | Description |
| --- | --- | --- |
| `cleanupRules` | `array` | Clean up the list of rules. |
| `repository` | `object` | A list of Repository to match. Regular expressions are supported. |
| `retentionRules` | `array` | Retention a list of rules. |

### [#](#specartifactcleanupspecpoliciescleanuprules).spec.artifactCleanupSpec.policies[].cleanupRules

DescriptionClean up the list of rules.Type`array`### [#](#specartifactcleanupspecpoliciescleanuprules-1).spec.artifactCleanupSpec.policies[].cleanupRules[]

DescriptionRule Describes the parameters of the rule.Type`object`| Property | Type | Description |
| --- | --- | --- |
| `duration` | `string` | The interval for saving time type rules. |
| `name` | `string` | Rule names are for display purposes only. |
| `quantity` | `integer` | Quantity value used to hold quantity type rules. |
| `regexp` | `string` | The regular expression used to hold the match type rules. |
| `type` | `string` | Rule type |

### [#](#specartifactcleanupspecpoliciesrepository).spec.artifactCleanupSpec.policies[].repository

DescriptionA list of Repository to match. Regular expressions are supported.Type`object`| Property | Type | Description |
| --- | --- | --- |
| `name` | `string` | Matches the warehouse rule name, for display only. |
| `regexp` | `string` | Regular expression that matches the repository. |

### [#](#specartifactcleanupspecpoliciesretentionrules).spec.artifactCleanupSpec.policies[].retentionRules

DescriptionRetention a list of rules.Type`array`### [#](#specartifactcleanupspecpoliciesretentionrules-1).spec.artifactCleanupSpec.policies[].retentionRules[]

DescriptionRule Describes the parameters of the rule.Type`object`| Property | Type | Description |
| --- | --- | --- |
| `duration` | `string` | The interval for saving time type rules. |
| `name` | `string` | Rule names are for display purposes only. |
| `quantity` | `integer` | Quantity value used to hold quantity type rules. |
| `regexp` | `string` | The regular expression used to hold the match type rules. |
| `type` | `string` | Rule type |

### [#](#specartifactcleanupspecresource).spec.artifactCleanupSpec.resource

DescriptionResources array of predefined resources to be usedType`object`Required`name``type`| Property | Type | Description |
| --- | --- | --- |
| `annotations` | `object` | Annotations provides a method to annotate specific resources in order to provide some metadata |
| `name` | `string` | Name stores the name of the resource object |
| `properties` | `object` | Properties of the resource. This is used to transmit fields and values to the integration class |
| `readOnly` | `boolean` | ReadOnly adds a desired behaviour for consumers of this resource |
| `replicationPolicyRef` | `object` | ReplicationPolicyRef stores a reference to a policy that generated this resource
used by the ClusterIntegration object when replicating and creating Integration objects |
| `subResources` | `array` | SubResources sub resource to be used in resource |
| `subtype` | `string` | Subtype of resource associated with the object |
| `syncPolicy` | `string` | SyncPolicy specifies how resources are synced to the system. Defaults to "SyncOnly" |
| `type` | `string` | Type of resource associated with the object |

### [#](#specartifactcleanupspecresourceannotations).spec.artifactCleanupSpec.resource.annotations

DescriptionAnnotations provides a method to annotate specific resources in order to provide some metadataType`object`### [#](#specartifactcleanupspecresourceproperties).spec.artifactCleanupSpec.resource.properties

DescriptionProperties of the resource. This is used to transmit fields and values to the integration classType`object`### [#](#specartifactcleanupspecresourcereplicationpolicyref).spec.artifactCleanupSpec.resource.replicationPolicyRef

DescriptionReplicationPolicyRef stores a reference to a policy that generated this resource
used by the ClusterIntegration object when replicating and creating Integration objectsType`object`| Property | Type | Description |
| --- | --- | --- |
| `apiVersion` | `string` | API version of the referent. |
| `fieldPath` | `string` | If referring to a piece of an object instead of an entire object, this string
should contain a valid JSON/Go field access statement, such as desiredState.manifest.containers[2].
For example, if the object reference is to a container within a pod, this would take on a value like:
"spec.containers{name}" (where "name" refers to the name of the container that triggered
the event) or if no container name is specified "spec.containers[2]" (container with
index 2 in this pod). This syntax is chosen only to have some well-defined way of
referencing a part of an object.
TODO: this design is not final and this field is subject to change in the future. |
| `kind` | `string` | Kind of the referent.
More info: [https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds](https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds) |
| `name` | `string` | Name of the referent.
More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names) |
| `namespace` | `string` | Namespace of the referent.
More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/) |
| `resourceVersion` | `string` | Specific resourceVersion to which this reference is made, if any.
More info: [https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#concurrency-control-and-consistency](https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#concurrency-control-and-consistency) |
| `uid` | `string` | UID of the referent.
More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#uids](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#uids) |

### [#](#specartifactcleanupspecresourcesubresources).spec.artifactCleanupSpec.resource.subResources

DescriptionSubResources sub resource to be used in resourceType`array`### [#](#specartifactcleanupspecresourcesubresources-1).spec.artifactCleanupSpec.resource.subResources[]

Type`object`Required`name``type`| Property | Type | Description |
| --- | --- | --- |
| `annotations` | `object` | Annotations provides a method to annotate specific resources in order to provide some metadata |
| `name` | `string` | Name stores the name of the resource object |
| `properties` | `object` | Properties of the resource. This is used to transmit fields and values to the integration class |
| `subtype` | `string` | Subtype of resource associated with the object |
| `type` | `string` | Type of resource associated with the object |

### [#](#specartifactcleanupspecresourcesubresourcesannotations).spec.artifactCleanupSpec.resource.subResources[].annotations

DescriptionAnnotations provides a method to annotate specific resources in order to provide some metadataType`object`### [#](#specartifactcleanupspecresourcesubresourcesproperties).spec.artifactCleanupSpec.resource.subResources[].properties

DescriptionProperties of the resource. This is used to transmit fields and values to the integration classType`object`### [#](#specartifactcleanupspectriggers).spec.artifactCleanupSpec.triggers

Descriptionall triggers defined for triggering current artifactcleanupType`object`| Property | Type | Description |
| --- | --- | --- |
| `cronTriggers` | `array` | List of timed triggers |

### [#](#specartifactcleanupspectriggerscrontriggers).spec.artifactCleanupSpec.triggers.cronTriggers

DescriptionList of timed triggersType`array`### [#](#specartifactcleanupspectriggerscrontriggers-1).spec.artifactCleanupSpec.triggers.cronTriggers[]

DescriptionArtifactCleanupCronTrigger defines cronTrigger.Type`object`| Property | Type | Description |
| --- | --- | --- |
| `annotations` | `object` | Annotations is an unstructured key value map stored with a resource that may be
set by external tools to store and retrieve arbitrary metadata. They are not
queryable and should be preserved when modifying objects.
More info: [http://kubernetes.io/docs/user-guide/annotations](http://kubernetes.io/docs/user-guide/annotations) |
| `name` | `string` | The name of the timed trigger |
| `spec` | `object` | Trigger the desired property periodically. |

### [#](#specartifactcleanupspectriggerscrontriggersannotations).spec.artifactCleanupSpec.triggers.cronTriggers[].annotations

DescriptionAnnotations is an unstructured key value map stored with a resource that may be
set by external tools to store and retrieve arbitrary metadata. They are not
queryable and should be preserved when modifying objects.
More info: http://kubernetes.io/docs/user-guide/annotationsType`object`### [#](#specartifactcleanupspectriggerscrontriggersspec).spec.artifactCleanupSpec.triggers.cronTriggers[].spec

DescriptionTrigger the desired property periodically.Type`object`Required`schedule`| Property | Type | Description |
| --- | --- | --- |
| `broker` | `string` | Broker instance to listen |
| `disabled` | `boolean` | Disabled a switch for crontrigger. |
| `params` | `array` | Params for rendering runnable template |
| `runnableRef` | `object` | reference of runnabledefinition |
| `runnableSpec` | `object` | Inline spec for runnable template. |
| `schedule` | `string` | Schedule is the cron schedule. |
| `timezone` | `string` | Timezone modifies the actual time relative to the specified timezone. Defaults to UTC.
More general information about time zones: [https://www.iana.org/time-zones](https://www.iana.org/time-zones)
List of valid timezone values: [https://en.wikipedia.org/wiki/List_of_tz_database_time_zones](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) |

### [#](#specartifactcleanupspectriggerscrontriggersspecparams).spec.artifactCleanupSpec.triggers.cronTriggers[].spec.params

DescriptionParams for rendering runnable templateType`array`### [#](#specartifactcleanupspectriggerscrontriggersspecparams-1).spec.artifactCleanupSpec.triggers.cronTriggers[].spec.params[]

DescriptionTriggerValueBinding represent values that will bind to templateType`object`| Property | Type | Description |
| --- | --- | --- |
| `const` | `boolean` | If true, indicates that value is a constant, not an expression. |
| `name` | `string` | name of template parameter |
| `value` | `string` | value of template parameter
do we only need type of string |

### [#](#specartifactcleanupspectriggerscrontriggersspecrunnableref).spec.artifactCleanupSpec.triggers.cronTriggers[].spec.runnableRef

Descriptionreference of runnabledefinitionType`object`| Property | Type | Description |
| --- | --- | --- |
| `apiVersion` | `string` | API version of the referent. |
| `fieldPath` | `string` | If referring to a piece of an object instead of an entire object, this string
should contain a valid JSON/Go field access statement, such as desiredState.manifest.containers[2].
For example, if the object reference is to a container within a pod, this would take on a value like:
"spec.containers{name}" (where "name" refers to the name of the container that triggered
the event) or if no container name is specified "spec.containers[2]" (container with
index 2 in this pod). This syntax is chosen only to have some well-defined way of
referencing a part of an object.
TODO: this design is not final and this field is subject to change in the future. |
| `kind` | `string` | Kind of the referent.
More info: [https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds](https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds) |
| `name` | `string` | Name of the referent.
More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names) |
| `namespace` | `string` | Namespace of the referent.
More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/) |
| `resourceVersion` | `string` | Specific resourceVersion to which this reference is made, if any.
More info: [https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#concurrency-control-and-consistency](https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#concurrency-control-and-consistency) |
| `uid` | `string` | UID of the referent.
More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#uids](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#uids) |

### [#](#specartifactcleanupspectriggerscrontriggersspecrunnablespec).spec.artifactCleanupSpec.triggers.cronTriggers[].spec.runnableSpec

DescriptionInline spec for runnable template.Type`object`| Property | Type | Description |
| --- | --- | --- |
| `kube` | `object` | Uses a yaml format to create a template for resource |

### [#](#specartifactcleanupspectriggerscrontriggersspecrunnablespeckube).spec.artifactCleanupSpec.triggers.cronTriggers[].spec.runnableSpec.kube

DescriptionUses a yaml format to create a template for resourceType`object`| Property | Type | Description |
| --- | --- | --- |
| `parameters` | `array` | Parameters used to generate the resource with jsonpath replacement rules |
| `template` | `object` | Raw resource definition yaml |

### [#](#specartifactcleanupspectriggerscrontriggersspecrunnablespeckubeparameters).spec.artifactCleanupSpec.triggers.cronTriggers[].spec.runnableSpec.kube.parameters

DescriptionParameters used to generate the resource with jsonpath replacement rulesType`array`### [#](#specartifactcleanupspectriggerscrontriggersspecrunnablespeckubeparameters-1).spec.artifactCleanupSpec.triggers.cronTriggers[].spec.runnableSpec.kube.parameters[]

DescriptionKubeParameter used to generate the resource with jsonpath replacement rulesType`object`| Property | Type | Description |
| --- | --- | --- |
| `fieldPaths` | `array` | FieldPaths is jsonpath for replacing the parameter value into the resource at render time |
| `name` | `string` | Unique parameter name |
| `required` | `boolean` | Parameter required, Defaults to false |
| `type` | `string` | Parameter value type, one of [string, number, boolean], default is string |

### [#](#specartifactcleanupspectriggerscrontriggersspecrunnablespeckubeparametersfieldpaths).spec.artifactCleanupSpec.triggers.cronTriggers[].spec.runnableSpec.kube.parameters[].fieldPaths

DescriptionFieldPaths is jsonpath for replacing the parameter value into the resource at render timeType`array`### [#](#specartifactcleanupspectriggerscrontriggersspecrunnablespeckubeparametersfieldpaths-1).spec.artifactCleanupSpec.triggers.cronTriggers[].spec.runnableSpec.kube.parameters[].fieldPaths[]

Type`string`### [#](#specartifactcleanupspectriggerscrontriggersspecrunnablespeckubetemplate).spec.artifactCleanupSpec.triggers.cronTriggers[].spec.runnableSpec.kube.template

DescriptionRaw resource definition yamlType`object`### [#](#status).status

DescriptionArtifactCleanupRunStatus defines the observed state of ArtifactCleanupRunType`object`| Property | Type | Description |
| --- | --- | --- |
| `annotations` | `object` | Annotations is additional Status fields for the Resource to save some
additional State as well as convey more information to the user. This is
roughly akin to Annotations on any k8s resource, just the reconciler conveying
richer information outwards. |
| `artifactCleanupSpec` | `object` | When spec.artifactCleanupRef is used, the spec will be stored here for future reference |
| `completionTime` | `string` | CompletionTime is the time when StageRun completed. |
| `conditions` | `array` | Conditions the latest available observations of a resource's current state. |
| `observedGeneration` | `integer` | ObservedGeneration is the 'Generation' of the Service that
was last processed by the controller. |
| `resources` | `array` | Resources stores a list of clean record. |
| `startTime` | `string` | StartTime is the time when StageRun actually started. |
| `summary` | `object` | Describe the overall result of the cleanup. Record success, failure, ignore the number of records. |
| `triggeredBy` | `object` | TriggeredBy stores a list of triggered information. |

### [#](#statusannotations).status.annotations

DescriptionAnnotations is additional Status fields for the Resource to save some
additional State as well as convey more information to the user. This is
roughly akin to Annotations on any k8s resource, just the reconciler conveying
richer information outwards.Type`object`### [#](#statusartifactcleanupspec).status.artifactCleanupSpec

DescriptionWhen spec.artifactCleanupRef is used, the spec will be stored here for future referenceType`object`| Property | Type | Description |
| --- | --- | --- |
| `address` | `object` | Address stores the integrated service API address |
| `historyLimits` | `object` | HistoryLimits limits the number of executed items are preserved
It only calculates already completed items |
| `integrationClassName` | `string` | IntegrationClassName sets the name of IntegrationClass that this integration is implemented |
| `integrationRef` | `object` | Reference to specific integration that contains the tool API define. |
| `policies` | `array` | List of strategies. |
| `resource` | `object` | Resources array of predefined resources to be used |
| `triggers` | `object` | all triggers defined for triggering current artifactcleanup |

### [#](#statusartifactcleanupspecaddress).status.artifactCleanupSpec.address

DescriptionAddress stores the integrated service API addressType`object`| Property | Type | Description |
| --- | --- | --- |
| `CACerts` | `string` | CACerts is the Certification Authority (CA) certificates in PEM format
according to [https://www.rfc-editor.org/rfc/rfc7468](https://www.rfc-editor.org/rfc/rfc7468). |
| `name` | `string` | Name is the name of the address. |
| `url` | `string` |  |

### [#](#statusartifactcleanupspechistorylimits).status.artifactCleanupSpec.historyLimits

DescriptionHistoryLimits limits the number of executed items are preserved
It only calculates already completed itemsType`object`| Property | Type | Description |
| --- | --- | --- |
| `count` | `integer` | Sets a hard count for all finished items
to be cleared from storage |

### [#](#statusartifactcleanupspecintegrationref).status.artifactCleanupSpec.integrationRef

DescriptionReference to specific integration that contains the tool API define.Type`object`| Property | Type | Description |
| --- | --- | --- |
| `apiVersion` | `string` | API version of the referent. |
| `fieldPath` | `string` | If referring to a piece of an object instead of an entire object, this string
should contain a valid JSON/Go field access statement, such as desiredState.manifest.containers[2].
For example, if the object reference is to a container within a pod, this would take on a value like:
"spec.containers{name}" (where "name" refers to the name of the container that triggered
the event) or if no container name is specified "spec.containers[2]" (container with
index 2 in this pod). This syntax is chosen only to have some well-defined way of
referencing a part of an object.
TODO: this design is not final and this field is subject to change in the future. |
| `kind` | `string` | Kind of the referent.
More info: [https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds](https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds) |
| `name` | `string` | Name of the referent.
More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names) |
| `namespace` | `string` | Namespace of the referent.
More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/) |
| `resourceVersion` | `string` | Specific resourceVersion to which this reference is made, if any.
More info: [https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#concurrency-control-and-consistency](https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#concurrency-control-and-consistency) |
| `uid` | `string` | UID of the referent.
More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#uids](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#uids) |

### [#](#statusartifactcleanupspecpolicies).status.artifactCleanupSpec.policies

DescriptionList of strategies.Type`array`### [#](#statusartifactcleanupspecpolicies-1).status.artifactCleanupSpec.policies[]

DescriptionPolicy A detailed description of the policy, including warehouse, cleanup rules, and retention rules.Type`object`| Property | Type | Description |
| --- | --- | --- |
| `cleanupRules` | `array` | Clean up the list of rules. |
| `repository` | `object` | A list of Repository to match. Regular expressions are supported. |
| `retentionRules` | `array` | Retention a list of rules. |

### [#](#statusartifactcleanupspecpoliciescleanuprules).status.artifactCleanupSpec.policies[].cleanupRules

DescriptionClean up the list of rules.Type`array`### [#](#statusartifactcleanupspecpoliciescleanuprules-1).status.artifactCleanupSpec.policies[].cleanupRules[]

DescriptionRule Describes the parameters of the rule.Type`object`| Property | Type | Description |
| --- | --- | --- |
| `duration` | `string` | The interval for saving time type rules. |
| `name` | `string` | Rule names are for display purposes only. |
| `quantity` | `integer` | Quantity value used to hold quantity type rules. |
| `regexp` | `string` | The regular expression used to hold the match type rules. |
| `type` | `string` | Rule type |

### [#](#statusartifactcleanupspecpoliciesrepository).status.artifactCleanupSpec.policies[].repository

DescriptionA list of Repository to match. Regular expressions are supported.Type`object`| Property | Type | Description |
| --- | --- | --- |
| `name` | `string` | Matches the warehouse rule name, for display only. |
| `regexp` | `string` | Regular expression that matches the repository. |

### [#](#statusartifactcleanupspecpoliciesretentionrules).status.artifactCleanupSpec.policies[].retentionRules

DescriptionRetention a list of rules.Type`array`### [#](#statusartifactcleanupspecpoliciesretentionrules-1).status.artifactCleanupSpec.policies[].retentionRules[]

DescriptionRule Describes the parameters of the rule.Type`object`| Property | Type | Description |
| --- | --- | --- |
| `duration` | `string` | The interval for saving time type rules. |
| `name` | `string` | Rule names are for display purposes only. |
| `quantity` | `integer` | Quantity value used to hold quantity type rules. |
| `regexp` | `string` | The regular expression used to hold the match type rules. |
| `type` | `string` | Rule type |

### [#](#statusartifactcleanupspecresource).status.artifactCleanupSpec.resource

DescriptionResources array of predefined resources to be usedType`object`Required`name``type`| Property | Type | Description |
| --- | --- | --- |
| `annotations` | `object` | Annotations provides a method to annotate specific resources in order to provide some metadata |
| `name` | `string` | Name stores the name of the resource object |
| `properties` | `object` | Properties of the resource. This is used to transmit fields and values to the integration class |
| `readOnly` | `boolean` | ReadOnly adds a desired behaviour for consumers of this resource |
| `replicationPolicyRef` | `object` | ReplicationPolicyRef stores a reference to a policy that generated this resource
used by the ClusterIntegration object when replicating and creating Integration objects |
| `subResources` | `array` | SubResources sub resource to be used in resource |
| `subtype` | `string` | Subtype of resource associated with the object |
| `syncPolicy` | `string` | SyncPolicy specifies how resources are synced to the system. Defaults to "SyncOnly" |
| `type` | `string` | Type of resource associated with the object |

### [#](#statusartifactcleanupspecresourceannotations).status.artifactCleanupSpec.resource.annotations

DescriptionAnnotations provides a method to annotate specific resources in order to provide some metadataType`object`### [#](#statusartifactcleanupspecresourceproperties).status.artifactCleanupSpec.resource.properties

DescriptionProperties of the resource. This is used to transmit fields and values to the integration classType`object`### [#](#statusartifactcleanupspecresourcereplicationpolicyref).status.artifactCleanupSpec.resource.replicationPolicyRef

DescriptionReplicationPolicyRef stores a reference to a policy that generated this resource
used by the ClusterIntegration object when replicating and creating Integration objectsType`object`| Property | Type | Description |
| --- | --- | --- |
| `apiVersion` | `string` | API version of the referent. |
| `fieldPath` | `string` | If referring to a piece of an object instead of an entire object, this string
should contain a valid JSON/Go field access statement, such as desiredState.manifest.containers[2].
For example, if the object reference is to a container within a pod, this would take on a value like:
"spec.containers{name}" (where "name" refers to the name of the container that triggered
the event) or if no container name is specified "spec.containers[2]" (container with
index 2 in this pod). This syntax is chosen only to have some well-defined way of
referencing a part of an object.
TODO: this design is not final and this field is subject to change in the future. |
| `kind` | `string` | Kind of the referent.
More info: [https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds](https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds) |
| `name` | `string` | Name of the referent.
More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names) |
| `namespace` | `string` | Namespace of the referent.
More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/) |
| `resourceVersion` | `string` | Specific resourceVersion to which this reference is made, if any.
More info: [https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#concurrency-control-and-consistency](https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#concurrency-control-and-consistency) |
| `uid` | `string` | UID of the referent.
More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#uids](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#uids) |

### [#](#statusartifactcleanupspecresourcesubresources).status.artifactCleanupSpec.resource.subResources

DescriptionSubResources sub resource to be used in resourceType`array`### [#](#statusartifactcleanupspecresourcesubresources-1).status.artifactCleanupSpec.resource.subResources[]

Type`object`Required`name``type`| Property | Type | Description |
| --- | --- | --- |
| `annotations` | `object` | Annotations provides a method to annotate specific resources in order to provide some metadata |
| `name` | `string` | Name stores the name of the resource object |
| `properties` | `object` | Properties of the resource. This is used to transmit fields and values to the integration class |
| `subtype` | `string` | Subtype of resource associated with the object |
| `type` | `string` | Type of resource associated with the object |

### [#](#statusartifactcleanupspecresourcesubresourcesannotations).status.artifactCleanupSpec.resource.subResources[].annotations

DescriptionAnnotations provides a method to annotate specific resources in order to provide some metadataType`object`### [#](#statusartifactcleanupspecresourcesubresourcesproperties).status.artifactCleanupSpec.resource.subResources[].properties

DescriptionProperties of the resource. This is used to transmit fields and values to the integration classType`object`### [#](#statusartifactcleanupspectriggers).status.artifactCleanupSpec.triggers

Descriptionall triggers defined for triggering current artifactcleanupType`object`| Property | Type | Description |
| --- | --- | --- |
| `cronTriggers` | `array` | List of timed triggers |

### [#](#statusartifactcleanupspectriggerscrontriggers).status.artifactCleanupSpec.triggers.cronTriggers

DescriptionList of timed triggersType`array`### [#](#statusartifactcleanupspectriggerscrontriggers-1).status.artifactCleanupSpec.triggers.cronTriggers[]

DescriptionArtifactCleanupCronTrigger defines cronTrigger.Type`object`| Property | Type | Description |
| --- | --- | --- |
| `annotations` | `object` | Annotations is an unstructured key value map stored with a resource that may be
set by external tools to store and retrieve arbitrary metadata. They are not
queryable and should be preserved when modifying objects.
More info: [http://kubernetes.io/docs/user-guide/annotations](http://kubernetes.io/docs/user-guide/annotations) |
| `name` | `string` | The name of the timed trigger |
| `spec` | `object` | Trigger the desired property periodically. |

### [#](#statusartifactcleanupspectriggerscrontriggersannotations).status.artifactCleanupSpec.triggers.cronTriggers[].annotations

DescriptionAnnotations is an unstructured key value map stored with a resource that may be
set by external tools to store and retrieve arbitrary metadata. They are not
queryable and should be preserved when modifying objects.
More info: http://kubernetes.io/docs/user-guide/annotationsType`object`### [#](#statusartifactcleanupspectriggerscrontriggersspec).status.artifactCleanupSpec.triggers.cronTriggers[].spec

DescriptionTrigger the desired property periodically.Type`object`Required`schedule`| Property | Type | Description |
| --- | --- | --- |
| `broker` | `string` | Broker instance to listen |
| `disabled` | `boolean` | Disabled a switch for crontrigger. |
| `params` | `array` | Params for rendering runnable template |
| `runnableRef` | `object` | reference of runnabledefinition |
| `runnableSpec` | `object` | Inline spec for runnable template. |
| `schedule` | `string` | Schedule is the cron schedule. |
| `timezone` | `string` | Timezone modifies the actual time relative to the specified timezone. Defaults to UTC.
More general information about time zones: [https://www.iana.org/time-zones](https://www.iana.org/time-zones)
List of valid timezone values: [https://en.wikipedia.org/wiki/List_of_tz_database_time_zones](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) |

### [#](#statusartifactcleanupspectriggerscrontriggersspecparams).status.artifactCleanupSpec.triggers.cronTriggers[].spec.params

DescriptionParams for rendering runnable templateType`array`### [#](#statusartifactcleanupspectriggerscrontriggersspecparams-1).status.artifactCleanupSpec.triggers.cronTriggers[].spec.params[]

DescriptionTriggerValueBinding represent values that will bind to templateType`object`| Property | Type | Description |
| --- | --- | --- |
| `const` | `boolean` | If true, indicates that value is a constant, not an expression. |
| `name` | `string` | name of template parameter |
| `value` | `string` | value of template parameter
do we only need type of string |

### [#](#statusartifactcleanupspectriggerscrontriggersspecrunnableref).status.artifactCleanupSpec.triggers.cronTriggers[].spec.runnableRef

Descriptionreference of runnabledefinitionType`object`| Property | Type | Description |
| --- | --- | --- |
| `apiVersion` | `string` | API version of the referent. |
| `fieldPath` | `string` | If referring to a piece of an object instead of an entire object, this string
should contain a valid JSON/Go field access statement, such as desiredState.manifest.containers[2].
For example, if the object reference is to a container within a pod, this would take on a value like:
"spec.containers{name}" (where "name" refers to the name of the container that triggered
the event) or if no container name is specified "spec.containers[2]" (container with
index 2 in this pod). This syntax is chosen only to have some well-defined way of
referencing a part of an object.
TODO: this design is not final and this field is subject to change in the future. |
| `kind` | `string` | Kind of the referent.
More info: [https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds](https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds) |
| `name` | `string` | Name of the referent.
More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names) |
| `namespace` | `string` | Namespace of the referent.
More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/) |
| `resourceVersion` | `string` | Specific resourceVersion to which this reference is made, if any.
More info: [https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#concurrency-control-and-consistency](https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#concurrency-control-and-consistency) |
| `uid` | `string` | UID of the referent.
More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#uids](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#uids) |

### [#](#statusartifactcleanupspectriggerscrontriggersspecrunnablespec).status.artifactCleanupSpec.triggers.cronTriggers[].spec.runnableSpec

DescriptionInline spec for runnable template.Type`object`| Property | Type | Description |
| --- | --- | --- |
| `kube` | `object` | Uses a yaml format to create a template for resource |

### [#](#statusartifactcleanupspectriggerscrontriggersspecrunnablespeckube).status.artifactCleanupSpec.triggers.cronTriggers[].spec.runnableSpec.kube

DescriptionUses a yaml format to create a template for resourceType`object`| Property | Type | Description |
| --- | --- | --- |
| `parameters` | `array` | Parameters used to generate the resource with jsonpath replacement rules |
| `template` | `object` | Raw resource definition yaml |

### [#](#statusartifactcleanupspectriggerscrontriggersspecrunnablespeckubeparameters).status.artifactCleanupSpec.triggers.cronTriggers[].spec.runnableSpec.kube.parameters

DescriptionParameters used to generate the resource with jsonpath replacement rulesType`array`### [#](#statusartifactcleanupspectriggerscrontriggersspecrunnablespeckubeparameters-1).status.artifactCleanupSpec.triggers.cronTriggers[].spec.runnableSpec.kube.parameters[]

DescriptionKubeParameter used to generate the resource with jsonpath replacement rulesType`object`| Property | Type | Description |
| --- | --- | --- |
| `fieldPaths` | `array` | FieldPaths is jsonpath for replacing the parameter value into the resource at render time |
| `name` | `string` | Unique parameter name |
| `required` | `boolean` | Parameter required, Defaults to false |
| `type` | `string` | Parameter value type, one of [string, number, boolean], default is string |

### [#](#statusartifactcleanupspectriggerscrontriggersspecrunnablespeckubeparametersfieldpaths).status.artifactCleanupSpec.triggers.cronTriggers[].spec.runnableSpec.kube.parameters[].fieldPaths

DescriptionFieldPaths is jsonpath for replacing the parameter value into the resource at render timeType`array`### [#](#statusartifactcleanupspectriggerscrontriggersspecrunnablespeckubeparametersfieldpaths-1).status.artifactCleanupSpec.triggers.cronTriggers[].spec.runnableSpec.kube.parameters[].fieldPaths[]

Type`string`### [#](#statusartifactcleanupspectriggerscrontriggersspecrunnablespeckubetemplate).status.artifactCleanupSpec.triggers.cronTriggers[].spec.runnableSpec.kube.template

DescriptionRaw resource definition yamlType`object`### [#](#statusconditions).status.conditions

DescriptionConditions the latest available observations of a resource's current state.Type`array`### [#](#statusconditions-1).status.conditions[]

DescriptionCondition defines a readiness condition for a Knative resource.
See: https://github.com/kubernetes/community/blob/master/contributors/devel/sig-architecture/api-conventions.md#typical-status-propertiesType`object`Required`status``type`| Property | Type | Description |
| --- | --- | --- |
| `lastTransitionTime` | `string` | LastTransitionTime is the last time the condition transitioned from one status to another.
We use VolatileTime in place of metav1.Time to exclude this from creating equality.Semantic
differences (all other things held constant). |
| `message` | `string` | A human readable message indicating details about the transition. |
| `reason` | `string` | The reason for the condition's last transition. |
| `severity` | `string` | Severity with which to treat failures of this type of condition.
When this is not specified, it defaults to Error. |
| `status` | `string` | Status of the condition, one of True, False, Unknown. |
| `type` | `string` | Type of condition. |

### [#](#statusresources).status.resources

DescriptionResources stores a list of clean record.Type`array`### [#](#statusresources-1).status.resources[]

DescriptionResource A detailed description of the cleanup reocrd.Type`object`| Property | Type | Description |
| --- | --- | --- |
| `message` | `string` | Description of reason info. |
| `reason` | `string` | Describes the reason for the status, such as Cancelled, InternalServerError, DryRun. |
| `repository` | `string` | A list of repositories to match. Regular expressions are supported. |
| `status` | `string` | Describes the cleanup state. (Unknown, True, False) |
| `tags` | `array` | Retation a list of rules. |
| `version` | `string` | Clean up the list of rules. |

### [#](#statusresourcestags).status.resources[].tags

DescriptionRetation a list of rules.Type`array`### [#](#statusresourcestags-1).status.resources[].tags[]

Type`object`| Property | Type | Description |
| --- | --- | --- |
| `name` | `string` | tag name |
| `pullTime` | `string` | tag push time, if Name is empty, the pushtime of the version |
| `pushTime` | `string` | tag pull time, if Name is empty, the pulltime of the version |

### [#](#statussummary).status.summary

DescriptionDescribe the overall result of the cleanup. Record success, failure, ignore the number of records.Type`object`| Property | Type | Description |
| --- | --- | --- |
| `failed` | `integer` | Failed records the total number of cleanup failures. |
| `skiped` | `integer` | Skiped records the total number of cleanup ignores. |
| `succeeded` | `integer` | Succeeded records the total number of successful cleanups. |

### [#](#statustriggeredby).status.triggeredBy

DescriptionTriggeredBy stores a list of triggered information.Type`object`| Property | Type | Description |
| --- | --- | --- |
| `cloudEvent` | `object` | Cloud Event data for the event that triggered. |
| `ref` | `object` | Reference to another object that might have triggered this object |
| `triggeredTimestamp` | `string` | Date time of creation of triggered event. Will match a resource's metadata.creationTimestamp
it is added here for convinience only |
| `triggeredType` | `string` | Indicates trigger type, such as Manual Automated. |
| `user` | `object` | Reference to the user that triggered the object. Any Kubernetes `Subject` is accepted. |

### [#](#statustriggeredbycloudevent).status.triggeredBy.cloudEvent

DescriptionCloud Event data for the event that triggered.Type`object`| Property | Type | Description |
| --- | --- | --- |
| `data` | `string` | Data event payload |
| `datacontenttype` | `string` |  |
| `extensions` | `object` |  |
| `id` | `string` |  |
| `source` | `string` |  |
| `specversion` | `string` |  |
| `subject` | `string` |  |
| `time` | `string` |  |
| `type` | `string` | Type of event |

### [#](#statustriggeredbycloudeventextensions).status.triggeredBy.cloudEvent.extensions

Type`object`### [#](#statustriggeredbyref).status.triggeredBy.ref

DescriptionReference to another object that might have triggered this objectType`object`| Property | Type | Description |
| --- | --- | --- |
| `apiVersion` | `string` | API version of the referent. |
| `fieldPath` | `string` | If referring to a piece of an object instead of an entire object, this string
should contain a valid JSON/Go field access statement, such as desiredState.manifest.containers[2].
For example, if the object reference is to a container within a pod, this would take on a value like:
"spec.containers{name}" (where "name" refers to the name of the container that triggered
the event) or if no container name is specified "spec.containers[2]" (container with
index 2 in this pod). This syntax is chosen only to have some well-defined way of
referencing a part of an object.
TODO: this design is not final and this field is subject to change in the future. |
| `kind` | `string` | Kind of the referent.
More info: [https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds](https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds) |
| `name` | `string` | Name of the referent.
More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names) |
| `namespace` | `string` | Namespace of the referent.
More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/) |
| `resourceVersion` | `string` | Specific resourceVersion to which this reference is made, if any.
More info: [https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#concurrency-control-and-consistency](https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#concurrency-control-and-consistency) |
| `uid` | `string` | UID of the referent.
More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#uids](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#uids) |

### [#](#statustriggeredbyuser).status.triggeredBy.user

DescriptionReference to the user that triggered the object. Any Kubernetes `Subject` is accepted.Type`object`Required`kind``name`| Property | Type | Description |
| --- | --- | --- |
| `apiGroup` | `string` | APIGroup holds the API group of the referenced subject.
Defaults to "" for ServiceAccount subjects.
Defaults to "rbac.authorization.k8s.io" for User and Group subjects. |
| `kind` | `string` | Kind of object being referenced. Values defined by this API group are "User", "Group", and "ServiceAccount".
If the Authorizer does not recognized the kind value, the Authorizer should report an error. |
| `name` | `string` | Name of the object being referenced. |
| `namespace` | `string` | Namespace of the referenced object.  If the object kind is non-namespace, such as "User" or "Group", and this value is not empty
the Authorizer should report an error. |

## API Endpoints

The following API endpoints are available:

- `/apis/artifacts.katanomi.dev/v1alpha1/namespaces/{namespace}/artifactcleanupruns`- `DELETE`: delete collection of ArtifactCleanupRun
- `GET`: list objects of kind ArtifactCleanupRun
- `POST`: create a new ArtifactCleanupRun


- `/apis/artifacts.katanomi.dev/v1alpha1/namespaces/{namespace}/artifactcleanupruns/{name}`- `DELETE`: delete the specified ArtifactCleanupRun
- `GET`: read the specified ArtifactCleanupRun
- `PATCH`: partially update the specified ArtifactCleanupRun
- `PUT`: replace the specified ArtifactCleanupRun


- `/apis/artifacts.katanomi.dev/v1alpha1/namespaces/{namespace}/artifactcleanupruns/{name}/status`- `GET`: read status of the specified ArtifactCleanupRun
- `PATCH`: partially update status of the specified ArtifactCleanupRun
- `PUT`: replace status of the specified ArtifactCleanupRun



### /apis/artifacts.katanomi.dev/v1alpha1/namespaces/{namespace}/artifactcleanupruns

HTTP method`DELETE`Descriptiondelete collection of ArtifactCleanupRunHTTP responses| HTTP code | Response body |
| --- | --- |
| 200 - OK | `[Status](/apis/references/Status.html)` schema |
| 401 - Unauthorized | Empty |

HTTP method`GET`Descriptionlist objects of kind ArtifactCleanupRunHTTP responses| HTTP code | Response body |
| --- | --- |
| 200 - OK | `ArtifactCleanupRunList` schema |
| 401 - Unauthorized | Empty |

HTTP method`POST`Descriptioncreate a new ArtifactCleanupRunQuery parameters| Parameter | Type | Description |
| --- | --- | --- |
| `dryRun` | `string` | When present, indicates that modifications should not be persisted. An invalid or unrecognized dryRun directive will result in an error response and no further processing of the request. Valid values are: - All: all dry run stages will be processed |
| `fieldValidation` | `string` | fieldValidation instructs the server on how to handle objects in the request (POST/PUT/PATCH) containing unknown or duplicate fields. Valid values are: - Ignore: This will ignore any unknown fields that are silently dropped from the object, and will ignore all but the last duplicate field that the decoder encounters. This is the default behavior prior to v1.23. - Warn: This will send a warning via the standard warning response header for each unknown field that is dropped from the object, and for each duplicate field that is encountered. The request will still succeed if there are no other errors, and will only persist the last of any duplicate fields. This is the default in v1.23+ - Strict: This will fail the request with a BadRequest error if any unknown fields would be dropped from the object, or if any duplicate fields are present. The error returned from the server will contain all unknown and duplicate fields encountered. |

Body parameters| Parameter | Type | Description |
| --- | --- | --- |
| `body` | `ArtifactCleanupRun` schema | `application/json` formatted |

HTTP responses| HTTP code | Response body |
| --- | --- |
| 200 - OK | `ArtifactCleanupRun` schema |
| 201 - Created | `ArtifactCleanupRun` schema |
| 202 - Accepted | `ArtifactCleanupRun` schema |
| 401 - Unauthorized | Empty |

### /apis/artifacts.katanomi.dev/v1alpha1/namespaces/{namespace}/artifactcleanupruns/{name}

HTTP method`DELETE`Descriptiondelete the specified ArtifactCleanupRunQuery parameters| Parameter | Type | Description |
| --- | --- | --- |
| `dryRun` | `string` | When present, indicates that modifications should not be persisted. An invalid or unrecognized dryRun directive will result in an error response and no further processing of the request. Valid values are: - All: all dry run stages will be processed |

HTTP responses| HTTP code | Response body |
| --- | --- |
| 200 - OK | `[Status](/apis/references/Status.html)` schema |
| 202 - Accepted | `[Status](/apis/references/Status.html)` schema |
| 401 - Unauthorized | Empty |

HTTP method`GET`Descriptionread the specified ArtifactCleanupRunHTTP responses| HTTP code | Response body |
| --- | --- |
| 200 - OK | `ArtifactCleanupRun` schema |
| 401 - Unauthorized | Empty |

HTTP method`PATCH`Descriptionpartially update the specified ArtifactCleanupRunQuery parameters| Parameter | Type | Description |
| --- | --- | --- |
| `dryRun` | `string` | When present, indicates that modifications should not be persisted. An invalid or unrecognized dryRun directive will result in an error response and no further processing of the request. Valid values are: - All: all dry run stages will be processed |
| `fieldValidation` | `string` | fieldValidation instructs the server on how to handle objects in the request (POST/PUT/PATCH) containing unknown or duplicate fields. Valid values are: - Ignore: This will ignore any unknown fields that are silently dropped from the object, and will ignore all but the last duplicate field that the decoder encounters. This is the default behavior prior to v1.23. - Warn: This will send a warning via the standard warning response header for each unknown field that is dropped from the object, and for each duplicate field that is encountered. The request will still succeed if there are no other errors, and will only persist the last of any duplicate fields. This is the default in v1.23+ - Strict: This will fail the request with a BadRequest error if any unknown fields would be dropped from the object, or if any duplicate fields are present. The error returned from the server will contain all unknown and duplicate fields encountered. |

HTTP responses| HTTP code | Response body |
| --- | --- |
| 200 - OK | `ArtifactCleanupRun` schema |
| 401 - Unauthorized | Empty |

HTTP method`PUT`Descriptionreplace the specified ArtifactCleanupRunQuery parameters| Parameter | Type | Description |
| --- | --- | --- |
| `dryRun` | `string` | When present, indicates that modifications should not be persisted. An invalid or unrecognized dryRun directive will result in an error response and no further processing of the request. Valid values are: - All: all dry run stages will be processed |
| `fieldValidation` | `string` | fieldValidation instructs the server on how to handle objects in the request (POST/PUT/PATCH) containing unknown or duplicate fields. Valid values are: - Ignore: This will ignore any unknown fields that are silently dropped from the object, and will ignore all but the last duplicate field that the decoder encounters. This is the default behavior prior to v1.23. - Warn: This will send a warning via the standard warning response header for each unknown field that is dropped from the object, and for each duplicate field that is encountered. The request will still succeed if there are no other errors, and will only persist the last of any duplicate fields. This is the default in v1.23+ - Strict: This will fail the request with a BadRequest error if any unknown fields would be dropped from the object, or if any duplicate fields are present. The error returned from the server will contain all unknown and duplicate fields encountered. |

Body parameters| Parameter | Type | Description |
| --- | --- | --- |
| `body` | `ArtifactCleanupRun` schema | `application/json` formatted |

HTTP responses| HTTP code | Response body |
| --- | --- |
| 200 - OK | `ArtifactCleanupRun` schema |
| 201 - Created | `ArtifactCleanupRun` schema |
| 401 - Unauthorized | Empty |

### /apis/artifacts.katanomi.dev/v1alpha1/namespaces/{namespace}/artifactcleanupruns/{name}/status

HTTP method`GET`Descriptionread status of the specified ArtifactCleanupRunHTTP responses| HTTP code | Response body |
| --- | --- |
| 200 - OK | `ArtifactCleanupRun` schema |
| 401 - Unauthorized | Empty |

HTTP method`PATCH`Descriptionpartially update status of the specified ArtifactCleanupRunQuery parameters| Parameter | Type | Description |
| --- | --- | --- |
| `dryRun` | `string` | When present, indicates that modifications should not be persisted. An invalid or unrecognized dryRun directive will result in an error response and no further processing of the request. Valid values are: - All: all dry run stages will be processed |
| `fieldValidation` | `string` | fieldValidation instructs the server on how to handle objects in the request (POST/PUT/PATCH) containing unknown or duplicate fields. Valid values are: - Ignore: This will ignore any unknown fields that are silently dropped from the object, and will ignore all but the last duplicate field that the decoder encounters. This is the default behavior prior to v1.23. - Warn: This will send a warning via the standard warning response header for each unknown field that is dropped from the object, and for each duplicate field that is encountered. The request will still succeed if there are no other errors, and will only persist the last of any duplicate fields. This is the default in v1.23+ - Strict: This will fail the request with a BadRequest error if any unknown fields would be dropped from the object, or if any duplicate fields are present. The error returned from the server will contain all unknown and duplicate fields encountered. |

HTTP responses| HTTP code | Response body |
| --- | --- |
| 200 - OK | `ArtifactCleanupRun` schema |
| 401 - Unauthorized | Empty |

HTTP method`PUT`Descriptionreplace status of the specified ArtifactCleanupRunQuery parameters| Parameter | Type | Description |
| --- | --- | --- |
| `dryRun` | `string` | When present, indicates that modifications should not be persisted. An invalid or unrecognized dryRun directive will result in an error response and no further processing of the request. Valid values are: - All: all dry run stages will be processed |
| `fieldValidation` | `string` | fieldValidation instructs the server on how to handle objects in the request (POST/PUT/PATCH) containing unknown or duplicate fields. Valid values are: - Ignore: This will ignore any unknown fields that are silently dropped from the object, and will ignore all but the last duplicate field that the decoder encounters. This is the default behavior prior to v1.23. - Warn: This will send a warning via the standard warning response header for each unknown field that is dropped from the object, and for each duplicate field that is encountered. The request will still succeed if there are no other errors, and will only persist the last of any duplicate fields. This is the default in v1.23+ - Strict: This will fail the request with a BadRequest error if any unknown fields would be dropped from the object, or if any duplicate fields are present. The error returned from the server will contain all unknown and duplicate fields encountered. |

Body parameters| Parameter | Type | Description |
| --- | --- | --- |
| `body` | `ArtifactCleanupRun` schema | `application/json` formatted |

HTTP responses| HTTP code | Response body |
| --- | --- |
| 200 - OK | `ArtifactCleanupRun` schema |
| 201 - Created | `ArtifactCleanupRun` schema |
| 401 - Unauthorized | Empty |

