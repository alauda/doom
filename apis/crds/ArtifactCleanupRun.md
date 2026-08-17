# ArtifactCleanupRun

描述ArtifactCleanupRun is the Schema for the artifactcleanupruns API类型`object`## [#](#规格)规格

| 属性 | 类型 | 描述 |
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

描述ArtifactCleanupRunSpec defines the desired state of ArtifactCleanupRun类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `artifactCleanupRef` | `object` | Reference to an existing ArtifactCleanup |
| `artifactCleanupSpec` | `object` | In-line spec for ArtifactCleanup. This options is mutually exclusive with artifactCleanupRef. |
| `dryRun` | `boolean` | `True` means that the simulation runs without performing specific cleanup operations. |
| `status` | `string` | Status Used for cancelling a ArtifactCleanupRun (and maybe more later on) |

### [#](#specartifactcleanupref).spec.artifactCleanupRef

描述Reference to an existing ArtifactCleanup类型`object`| 属性 | 类型 | 描述 |
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

描述In-line spec for ArtifactCleanup. This options is mutually exclusive with artifactCleanupRef.类型`object`| 属性 | 类型 | 描述 |
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

描述Address stores the integrated service API address类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `CACerts` | `string` | CACerts is the Certification Authority (CA) certificates in PEM format
according to [https://www.rfc-editor.org/rfc/rfc7468](https://www.rfc-editor.org/rfc/rfc7468). |
| `name` | `string` | Name is the name of the address. |
| `url` | `string` |  |

### [#](#specartifactcleanupspechistorylimits).spec.artifactCleanupSpec.historyLimits

描述HistoryLimits limits the number of executed items are preserved
It only calculates already completed items类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `count` | `integer` | Sets a hard count for all finished items
to be cleared from storage |

### [#](#specartifactcleanupspecintegrationref).spec.artifactCleanupSpec.integrationRef

描述Reference to specific integration that contains the tool API define.类型`object`| 属性 | 类型 | 描述 |
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

描述List of strategies.类型`array`### [#](#specartifactcleanupspecpolicies-1).spec.artifactCleanupSpec.policies[]

描述Policy A detailed description of the policy, including warehouse, cleanup rules, and retention rules.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `cleanupRules` | `array` | Clean up the list of rules. |
| `repository` | `object` | A list of Repository to match. Regular expressions are supported. |
| `retentionRules` | `array` | Retention a list of rules. |

### [#](#specartifactcleanupspecpoliciescleanuprules).spec.artifactCleanupSpec.policies[].cleanupRules

描述Clean up the list of rules.类型`array`### [#](#specartifactcleanupspecpoliciescleanuprules-1).spec.artifactCleanupSpec.policies[].cleanupRules[]

描述Rule Describes the parameters of the rule.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `duration` | `string` | The interval for saving time type rules. |
| `name` | `string` | Rule names are for display purposes only. |
| `quantity` | `integer` | Quantity value used to hold quantity type rules. |
| `regexp` | `string` | The regular expression used to hold the match type rules. |
| `type` | `string` | Rule type |

### [#](#specartifactcleanupspecpoliciesrepository).spec.artifactCleanupSpec.policies[].repository

描述A list of Repository to match. Regular expressions are supported.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `name` | `string` | Matches the warehouse rule name, for display only. |
| `regexp` | `string` | Regular expression that matches the repository. |

### [#](#specartifactcleanupspecpoliciesretentionrules).spec.artifactCleanupSpec.policies[].retentionRules

描述Retention a list of rules.类型`array`### [#](#specartifactcleanupspecpoliciesretentionrules-1).spec.artifactCleanupSpec.policies[].retentionRules[]

描述Rule Describes the parameters of the rule.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `duration` | `string` | The interval for saving time type rules. |
| `name` | `string` | Rule names are for display purposes only. |
| `quantity` | `integer` | Quantity value used to hold quantity type rules. |
| `regexp` | `string` | The regular expression used to hold the match type rules. |
| `type` | `string` | Rule type |

### [#](#specartifactcleanupspecresource).spec.artifactCleanupSpec.resource

描述Resources array of predefined resources to be used类型`object`必填`name``type`| 属性 | 类型 | 描述 |
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

描述Annotations provides a method to annotate specific resources in order to provide some metadata类型`object`### [#](#specartifactcleanupspecresourceproperties).spec.artifactCleanupSpec.resource.properties

描述Properties of the resource. This is used to transmit fields and values to the integration class类型`object`### [#](#specartifactcleanupspecresourcereplicationpolicyref).spec.artifactCleanupSpec.resource.replicationPolicyRef

描述ReplicationPolicyRef stores a reference to a policy that generated this resource
used by the ClusterIntegration object when replicating and creating Integration objects类型`object`| 属性 | 类型 | 描述 |
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

描述SubResources sub resource to be used in resource类型`array`### [#](#specartifactcleanupspecresourcesubresources-1).spec.artifactCleanupSpec.resource.subResources[]

类型`object`必填`name``type`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `annotations` | `object` | Annotations provides a method to annotate specific resources in order to provide some metadata |
| `name` | `string` | Name stores the name of the resource object |
| `properties` | `object` | Properties of the resource. This is used to transmit fields and values to the integration class |
| `subtype` | `string` | Subtype of resource associated with the object |
| `type` | `string` | Type of resource associated with the object |

### [#](#specartifactcleanupspecresourcesubresourcesannotations).spec.artifactCleanupSpec.resource.subResources[].annotations

描述Annotations provides a method to annotate specific resources in order to provide some metadata类型`object`### [#](#specartifactcleanupspecresourcesubresourcesproperties).spec.artifactCleanupSpec.resource.subResources[].properties

描述Properties of the resource. This is used to transmit fields and values to the integration class类型`object`### [#](#specartifactcleanupspectriggers).spec.artifactCleanupSpec.triggers

描述all triggers defined for triggering current artifactcleanup类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `cronTriggers` | `array` | List of timed triggers |

### [#](#specartifactcleanupspectriggerscrontriggers).spec.artifactCleanupSpec.triggers.cronTriggers

描述List of timed triggers类型`array`### [#](#specartifactcleanupspectriggerscrontriggers-1).spec.artifactCleanupSpec.triggers.cronTriggers[]

描述ArtifactCleanupCronTrigger defines cronTrigger.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `annotations` | `object` | Annotations is an unstructured key value map stored with a resource that may be
set by external tools to store and retrieve arbitrary metadata. They are not
queryable and should be preserved when modifying objects.
More info: [http://kubernetes.io/docs/user-guide/annotations](http://kubernetes.io/docs/user-guide/annotations) |
| `name` | `string` | The name of the timed trigger |
| `spec` | `object` | Trigger the desired property periodically. |

### [#](#specartifactcleanupspectriggerscrontriggersannotations).spec.artifactCleanupSpec.triggers.cronTriggers[].annotations

描述Annotations is an unstructured key value map stored with a resource that may be
set by external tools to store and retrieve arbitrary metadata. They are not
queryable and should be preserved when modifying objects.
More info: http://kubernetes.io/docs/user-guide/annotations类型`object`### [#](#specartifactcleanupspectriggerscrontriggersspec).spec.artifactCleanupSpec.triggers.cronTriggers[].spec

描述Trigger the desired property periodically.类型`object`必填`schedule`| 属性 | 类型 | 描述 |
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

描述Params for rendering runnable template类型`array`### [#](#specartifactcleanupspectriggerscrontriggersspecparams-1).spec.artifactCleanupSpec.triggers.cronTriggers[].spec.params[]

描述TriggerValueBinding represent values that will bind to template类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `const` | `boolean` | If true, indicates that value is a constant, not an expression. |
| `name` | `string` | name of template parameter |
| `value` | `string` | value of template parameter
do we only need type of string |

### [#](#specartifactcleanupspectriggerscrontriggersspecrunnableref).spec.artifactCleanupSpec.triggers.cronTriggers[].spec.runnableRef

描述reference of runnabledefinition类型`object`| 属性 | 类型 | 描述 |
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

描述Inline spec for runnable template.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `kube` | `object` | Uses a yaml format to create a template for resource |

### [#](#specartifactcleanupspectriggerscrontriggersspecrunnablespeckube).spec.artifactCleanupSpec.triggers.cronTriggers[].spec.runnableSpec.kube

描述Uses a yaml format to create a template for resource类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `parameters` | `array` | Parameters used to generate the resource with jsonpath replacement rules |
| `template` | `object` | Raw resource definition yaml |

### [#](#specartifactcleanupspectriggerscrontriggersspecrunnablespeckubeparameters).spec.artifactCleanupSpec.triggers.cronTriggers[].spec.runnableSpec.kube.parameters

描述Parameters used to generate the resource with jsonpath replacement rules类型`array`### [#](#specartifactcleanupspectriggerscrontriggersspecrunnablespeckubeparameters-1).spec.artifactCleanupSpec.triggers.cronTriggers[].spec.runnableSpec.kube.parameters[]

描述KubeParameter used to generate the resource with jsonpath replacement rules类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `fieldPaths` | `array` | FieldPaths is jsonpath for replacing the parameter value into the resource at render time |
| `name` | `string` | Unique parameter name |
| `required` | `boolean` | Parameter required, Defaults to false |
| `type` | `string` | Parameter value type, one of [string, number, boolean], default is string |

### [#](#specartifactcleanupspectriggerscrontriggersspecrunnablespeckubeparametersfieldpaths).spec.artifactCleanupSpec.triggers.cronTriggers[].spec.runnableSpec.kube.parameters[].fieldPaths

描述FieldPaths is jsonpath for replacing the parameter value into the resource at render time类型`array`### [#](#specartifactcleanupspectriggerscrontriggersspecrunnablespeckubeparametersfieldpaths-1).spec.artifactCleanupSpec.triggers.cronTriggers[].spec.runnableSpec.kube.parameters[].fieldPaths[]

类型`string`### [#](#specartifactcleanupspectriggerscrontriggersspecrunnablespeckubetemplate).spec.artifactCleanupSpec.triggers.cronTriggers[].spec.runnableSpec.kube.template

描述Raw resource definition yaml类型`object`### [#](#status).status

描述ArtifactCleanupRunStatus defines the observed state of ArtifactCleanupRun类型`object`| 属性 | 类型 | 描述 |
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

描述Annotations is additional Status fields for the Resource to save some
additional State as well as convey more information to the user. This is
roughly akin to Annotations on any k8s resource, just the reconciler conveying
richer information outwards.类型`object`### [#](#statusartifactcleanupspec).status.artifactCleanupSpec

描述When spec.artifactCleanupRef is used, the spec will be stored here for future reference类型`object`| 属性 | 类型 | 描述 |
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

描述Address stores the integrated service API address类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `CACerts` | `string` | CACerts is the Certification Authority (CA) certificates in PEM format
according to [https://www.rfc-editor.org/rfc/rfc7468](https://www.rfc-editor.org/rfc/rfc7468). |
| `name` | `string` | Name is the name of the address. |
| `url` | `string` |  |

### [#](#statusartifactcleanupspechistorylimits).status.artifactCleanupSpec.historyLimits

描述HistoryLimits limits the number of executed items are preserved
It only calculates already completed items类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `count` | `integer` | Sets a hard count for all finished items
to be cleared from storage |

### [#](#statusartifactcleanupspecintegrationref).status.artifactCleanupSpec.integrationRef

描述Reference to specific integration that contains the tool API define.类型`object`| 属性 | 类型 | 描述 |
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

描述List of strategies.类型`array`### [#](#statusartifactcleanupspecpolicies-1).status.artifactCleanupSpec.policies[]

描述Policy A detailed description of the policy, including warehouse, cleanup rules, and retention rules.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `cleanupRules` | `array` | Clean up the list of rules. |
| `repository` | `object` | A list of Repository to match. Regular expressions are supported. |
| `retentionRules` | `array` | Retention a list of rules. |

### [#](#statusartifactcleanupspecpoliciescleanuprules).status.artifactCleanupSpec.policies[].cleanupRules

描述Clean up the list of rules.类型`array`### [#](#statusartifactcleanupspecpoliciescleanuprules-1).status.artifactCleanupSpec.policies[].cleanupRules[]

描述Rule Describes the parameters of the rule.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `duration` | `string` | The interval for saving time type rules. |
| `name` | `string` | Rule names are for display purposes only. |
| `quantity` | `integer` | Quantity value used to hold quantity type rules. |
| `regexp` | `string` | The regular expression used to hold the match type rules. |
| `type` | `string` | Rule type |

### [#](#statusartifactcleanupspecpoliciesrepository).status.artifactCleanupSpec.policies[].repository

描述A list of Repository to match. Regular expressions are supported.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `name` | `string` | Matches the warehouse rule name, for display only. |
| `regexp` | `string` | Regular expression that matches the repository. |

### [#](#statusartifactcleanupspecpoliciesretentionrules).status.artifactCleanupSpec.policies[].retentionRules

描述Retention a list of rules.类型`array`### [#](#statusartifactcleanupspecpoliciesretentionrules-1).status.artifactCleanupSpec.policies[].retentionRules[]

描述Rule Describes the parameters of the rule.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `duration` | `string` | The interval for saving time type rules. |
| `name` | `string` | Rule names are for display purposes only. |
| `quantity` | `integer` | Quantity value used to hold quantity type rules. |
| `regexp` | `string` | The regular expression used to hold the match type rules. |
| `type` | `string` | Rule type |

### [#](#statusartifactcleanupspecresource).status.artifactCleanupSpec.resource

描述Resources array of predefined resources to be used类型`object`必填`name``type`| 属性 | 类型 | 描述 |
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

描述Annotations provides a method to annotate specific resources in order to provide some metadata类型`object`### [#](#statusartifactcleanupspecresourceproperties).status.artifactCleanupSpec.resource.properties

描述Properties of the resource. This is used to transmit fields and values to the integration class类型`object`### [#](#statusartifactcleanupspecresourcereplicationpolicyref).status.artifactCleanupSpec.resource.replicationPolicyRef

描述ReplicationPolicyRef stores a reference to a policy that generated this resource
used by the ClusterIntegration object when replicating and creating Integration objects类型`object`| 属性 | 类型 | 描述 |
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

描述SubResources sub resource to be used in resource类型`array`### [#](#statusartifactcleanupspecresourcesubresources-1).status.artifactCleanupSpec.resource.subResources[]

类型`object`必填`name``type`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `annotations` | `object` | Annotations provides a method to annotate specific resources in order to provide some metadata |
| `name` | `string` | Name stores the name of the resource object |
| `properties` | `object` | Properties of the resource. This is used to transmit fields and values to the integration class |
| `subtype` | `string` | Subtype of resource associated with the object |
| `type` | `string` | Type of resource associated with the object |

### [#](#statusartifactcleanupspecresourcesubresourcesannotations).status.artifactCleanupSpec.resource.subResources[].annotations

描述Annotations provides a method to annotate specific resources in order to provide some metadata类型`object`### [#](#statusartifactcleanupspecresourcesubresourcesproperties).status.artifactCleanupSpec.resource.subResources[].properties

描述Properties of the resource. This is used to transmit fields and values to the integration class类型`object`### [#](#statusartifactcleanupspectriggers).status.artifactCleanupSpec.triggers

描述all triggers defined for triggering current artifactcleanup类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `cronTriggers` | `array` | List of timed triggers |

### [#](#statusartifactcleanupspectriggerscrontriggers).status.artifactCleanupSpec.triggers.cronTriggers

描述List of timed triggers类型`array`### [#](#statusartifactcleanupspectriggerscrontriggers-1).status.artifactCleanupSpec.triggers.cronTriggers[]

描述ArtifactCleanupCronTrigger defines cronTrigger.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `annotations` | `object` | Annotations is an unstructured key value map stored with a resource that may be
set by external tools to store and retrieve arbitrary metadata. They are not
queryable and should be preserved when modifying objects.
More info: [http://kubernetes.io/docs/user-guide/annotations](http://kubernetes.io/docs/user-guide/annotations) |
| `name` | `string` | The name of the timed trigger |
| `spec` | `object` | Trigger the desired property periodically. |

### [#](#statusartifactcleanupspectriggerscrontriggersannotations).status.artifactCleanupSpec.triggers.cronTriggers[].annotations

描述Annotations is an unstructured key value map stored with a resource that may be
set by external tools to store and retrieve arbitrary metadata. They are not
queryable and should be preserved when modifying objects.
More info: http://kubernetes.io/docs/user-guide/annotations类型`object`### [#](#statusartifactcleanupspectriggerscrontriggersspec).status.artifactCleanupSpec.triggers.cronTriggers[].spec

描述Trigger the desired property periodically.类型`object`必填`schedule`| 属性 | 类型 | 描述 |
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

描述Params for rendering runnable template类型`array`### [#](#statusartifactcleanupspectriggerscrontriggersspecparams-1).status.artifactCleanupSpec.triggers.cronTriggers[].spec.params[]

描述TriggerValueBinding represent values that will bind to template类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `const` | `boolean` | If true, indicates that value is a constant, not an expression. |
| `name` | `string` | name of template parameter |
| `value` | `string` | value of template parameter
do we only need type of string |

### [#](#statusartifactcleanupspectriggerscrontriggersspecrunnableref).status.artifactCleanupSpec.triggers.cronTriggers[].spec.runnableRef

描述reference of runnabledefinition类型`object`| 属性 | 类型 | 描述 |
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

描述Inline spec for runnable template.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `kube` | `object` | Uses a yaml format to create a template for resource |

### [#](#statusartifactcleanupspectriggerscrontriggersspecrunnablespeckube).status.artifactCleanupSpec.triggers.cronTriggers[].spec.runnableSpec.kube

描述Uses a yaml format to create a template for resource类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `parameters` | `array` | Parameters used to generate the resource with jsonpath replacement rules |
| `template` | `object` | Raw resource definition yaml |

### [#](#statusartifactcleanupspectriggerscrontriggersspecrunnablespeckubeparameters).status.artifactCleanupSpec.triggers.cronTriggers[].spec.runnableSpec.kube.parameters

描述Parameters used to generate the resource with jsonpath replacement rules类型`array`### [#](#statusartifactcleanupspectriggerscrontriggersspecrunnablespeckubeparameters-1).status.artifactCleanupSpec.triggers.cronTriggers[].spec.runnableSpec.kube.parameters[]

描述KubeParameter used to generate the resource with jsonpath replacement rules类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `fieldPaths` | `array` | FieldPaths is jsonpath for replacing the parameter value into the resource at render time |
| `name` | `string` | Unique parameter name |
| `required` | `boolean` | Parameter required, Defaults to false |
| `type` | `string` | Parameter value type, one of [string, number, boolean], default is string |

### [#](#statusartifactcleanupspectriggerscrontriggersspecrunnablespeckubeparametersfieldpaths).status.artifactCleanupSpec.triggers.cronTriggers[].spec.runnableSpec.kube.parameters[].fieldPaths

描述FieldPaths is jsonpath for replacing the parameter value into the resource at render time类型`array`### [#](#statusartifactcleanupspectriggerscrontriggersspecrunnablespeckubeparametersfieldpaths-1).status.artifactCleanupSpec.triggers.cronTriggers[].spec.runnableSpec.kube.parameters[].fieldPaths[]

类型`string`### [#](#statusartifactcleanupspectriggerscrontriggersspecrunnablespeckubetemplate).status.artifactCleanupSpec.triggers.cronTriggers[].spec.runnableSpec.kube.template

描述Raw resource definition yaml类型`object`### [#](#statusconditions).status.conditions

描述Conditions the latest available observations of a resource's current state.类型`array`### [#](#statusconditions-1).status.conditions[]

描述Condition defines a readiness condition for a Knative resource.
See: https://github.com/kubernetes/community/blob/master/contributors/devel/sig-architecture/api-conventions.md#typical-status-properties类型`object`必填`status``type`| 属性 | 类型 | 描述 |
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

描述Resources stores a list of clean record.类型`array`### [#](#statusresources-1).status.resources[]

描述Resource A detailed description of the cleanup reocrd.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `message` | `string` | Description of reason info. |
| `reason` | `string` | Describes the reason for the status, such as Cancelled, InternalServerError, DryRun. |
| `repository` | `string` | A list of repositories to match. Regular expressions are supported. |
| `status` | `string` | Describes the cleanup state. (Unknown, True, False) |
| `tags` | `array` | Retation a list of rules. |
| `version` | `string` | Clean up the list of rules. |

### [#](#statusresourcestags).status.resources[].tags

描述Retation a list of rules.类型`array`### [#](#statusresourcestags-1).status.resources[].tags[]

类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `name` | `string` | tag name |
| `pullTime` | `string` | tag push time, if Name is empty, the pushtime of the version |
| `pushTime` | `string` | tag pull time, if Name is empty, the pulltime of the version |

### [#](#statussummary).status.summary

描述Describe the overall result of the cleanup. Record success, failure, ignore the number of records.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `failed` | `integer` | Failed records the total number of cleanup failures. |
| `skiped` | `integer` | Skiped records the total number of cleanup ignores. |
| `succeeded` | `integer` | Succeeded records the total number of successful cleanups. |

### [#](#statustriggeredby).status.triggeredBy

描述TriggeredBy stores a list of triggered information.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `cloudEvent` | `object` | Cloud Event data for the event that triggered. |
| `ref` | `object` | Reference to another object that might have triggered this object |
| `triggeredTimestamp` | `string` | Date time of creation of triggered event. Will match a resource's metadata.creationTimestamp
it is added here for convinience only |
| `triggeredType` | `string` | Indicates trigger type, such as Manual Automated. |
| `user` | `object` | Reference to the user that triggered the object. Any Kubernetes `Subject` is accepted. |

### [#](#statustriggeredbycloudevent).status.triggeredBy.cloudEvent

描述Cloud Event data for the event that triggered.类型`object`| 属性 | 类型 | 描述 |
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

类型`object`### [#](#statustriggeredbyref).status.triggeredBy.ref

描述Reference to another object that might have triggered this object类型`object`| 属性 | 类型 | 描述 |
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

描述Reference to the user that triggered the object. Any Kubernetes `Subject` is accepted.类型`object`必填`kind``name`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `apiGroup` | `string` | APIGroup holds the API group of the referenced subject.
Defaults to "" for ServiceAccount subjects.
Defaults to "rbac.authorization.k8s.io" for User and Group subjects. |
| `kind` | `string` | Kind of object being referenced. Values defined by this API group are "User", "Group", and "ServiceAccount".
If the Authorizer does not recognized the kind value, the Authorizer should report an error. |
| `name` | `string` | Name of the object being referenced. |
| `namespace` | `string` | Namespace of the referenced object.  If the object kind is non-namespace, such as "User" or "Group", and this value is not empty
the Authorizer should report an error. |

## API 端点

可用的 API 端点如下：

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

HTTP 方法`DELETE`描述delete collection of ArtifactCleanupRunHTTP 响应| HTTP 状态码 | 响应体 |
| --- | --- |
| 200 - OK | `[Status](/apis/references/Status.html)` schema |
| 401 - Unauthorized | Empty |

HTTP 方法`GET`描述list objects of kind ArtifactCleanupRunHTTP 响应| HTTP 状态码 | 响应体 |
| --- | --- |
| 200 - OK | `ArtifactCleanupRunList` schema |
| 401 - Unauthorized | Empty |

HTTP 方法`POST`描述create a new ArtifactCleanupRun查询参数| 参数 | 类型 | 描述 |
| --- | --- | --- |
| `dryRun` | `string` | When present, indicates that modifications should not be persisted. An invalid or unrecognized dryRun directive will result in an error response and no further processing of the request. Valid values are: - All: all dry run stages will be processed |
| `fieldValidation` | `string` | fieldValidation instructs the server on how to handle objects in the request (POST/PUT/PATCH) containing unknown or duplicate fields. Valid values are: - Ignore: This will ignore any unknown fields that are silently dropped from the object, and will ignore all but the last duplicate field that the decoder encounters. This is the default behavior prior to v1.23. - Warn: This will send a warning via the standard warning response header for each unknown field that is dropped from the object, and for each duplicate field that is encountered. The request will still succeed if there are no other errors, and will only persist the last of any duplicate fields. This is the default in v1.23+ - Strict: This will fail the request with a BadRequest error if any unknown fields would be dropped from the object, or if any duplicate fields are present. The error returned from the server will contain all unknown and duplicate fields encountered. |

请求体参数| 参数 | 类型 | 描述 |
| --- | --- | --- |
| `body` | `ArtifactCleanupRun` schema | `application/json` formatted |

HTTP 响应| HTTP 状态码 | 响应体 |
| --- | --- |
| 200 - OK | `ArtifactCleanupRun` schema |
| 201 - Created | `ArtifactCleanupRun` schema |
| 202 - Accepted | `ArtifactCleanupRun` schema |
| 401 - Unauthorized | Empty |

### /apis/artifacts.katanomi.dev/v1alpha1/namespaces/{namespace}/artifactcleanupruns/{name}

HTTP 方法`DELETE`描述delete the specified ArtifactCleanupRun查询参数| 参数 | 类型 | 描述 |
| --- | --- | --- |
| `dryRun` | `string` | When present, indicates that modifications should not be persisted. An invalid or unrecognized dryRun directive will result in an error response and no further processing of the request. Valid values are: - All: all dry run stages will be processed |

HTTP 响应| HTTP 状态码 | 响应体 |
| --- | --- |
| 200 - OK | `[Status](/apis/references/Status.html)` schema |
| 202 - Accepted | `[Status](/apis/references/Status.html)` schema |
| 401 - Unauthorized | Empty |

HTTP 方法`GET`描述read the specified ArtifactCleanupRunHTTP 响应| HTTP 状态码 | 响应体 |
| --- | --- |
| 200 - OK | `ArtifactCleanupRun` schema |
| 401 - Unauthorized | Empty |

HTTP 方法`PATCH`描述partially update the specified ArtifactCleanupRun查询参数| 参数 | 类型 | 描述 |
| --- | --- | --- |
| `dryRun` | `string` | When present, indicates that modifications should not be persisted. An invalid or unrecognized dryRun directive will result in an error response and no further processing of the request. Valid values are: - All: all dry run stages will be processed |
| `fieldValidation` | `string` | fieldValidation instructs the server on how to handle objects in the request (POST/PUT/PATCH) containing unknown or duplicate fields. Valid values are: - Ignore: This will ignore any unknown fields that are silently dropped from the object, and will ignore all but the last duplicate field that the decoder encounters. This is the default behavior prior to v1.23. - Warn: This will send a warning via the standard warning response header for each unknown field that is dropped from the object, and for each duplicate field that is encountered. The request will still succeed if there are no other errors, and will only persist the last of any duplicate fields. This is the default in v1.23+ - Strict: This will fail the request with a BadRequest error if any unknown fields would be dropped from the object, or if any duplicate fields are present. The error returned from the server will contain all unknown and duplicate fields encountered. |

HTTP 响应| HTTP 状态码 | 响应体 |
| --- | --- |
| 200 - OK | `ArtifactCleanupRun` schema |
| 401 - Unauthorized | Empty |

HTTP 方法`PUT`描述replace the specified ArtifactCleanupRun查询参数| 参数 | 类型 | 描述 |
| --- | --- | --- |
| `dryRun` | `string` | When present, indicates that modifications should not be persisted. An invalid or unrecognized dryRun directive will result in an error response and no further processing of the request. Valid values are: - All: all dry run stages will be processed |
| `fieldValidation` | `string` | fieldValidation instructs the server on how to handle objects in the request (POST/PUT/PATCH) containing unknown or duplicate fields. Valid values are: - Ignore: This will ignore any unknown fields that are silently dropped from the object, and will ignore all but the last duplicate field that the decoder encounters. This is the default behavior prior to v1.23. - Warn: This will send a warning via the standard warning response header for each unknown field that is dropped from the object, and for each duplicate field that is encountered. The request will still succeed if there are no other errors, and will only persist the last of any duplicate fields. This is the default in v1.23+ - Strict: This will fail the request with a BadRequest error if any unknown fields would be dropped from the object, or if any duplicate fields are present. The error returned from the server will contain all unknown and duplicate fields encountered. |

请求体参数| 参数 | 类型 | 描述 |
| --- | --- | --- |
| `body` | `ArtifactCleanupRun` schema | `application/json` formatted |

HTTP 响应| HTTP 状态码 | 响应体 |
| --- | --- |
| 200 - OK | `ArtifactCleanupRun` schema |
| 201 - Created | `ArtifactCleanupRun` schema |
| 401 - Unauthorized | Empty |

### /apis/artifacts.katanomi.dev/v1alpha1/namespaces/{namespace}/artifactcleanupruns/{name}/status

HTTP 方法`GET`描述read status of the specified ArtifactCleanupRunHTTP 响应| HTTP 状态码 | 响应体 |
| --- | --- |
| 200 - OK | `ArtifactCleanupRun` schema |
| 401 - Unauthorized | Empty |

HTTP 方法`PATCH`描述partially update status of the specified ArtifactCleanupRun查询参数| 参数 | 类型 | 描述 |
| --- | --- | --- |
| `dryRun` | `string` | When present, indicates that modifications should not be persisted. An invalid or unrecognized dryRun directive will result in an error response and no further processing of the request. Valid values are: - All: all dry run stages will be processed |
| `fieldValidation` | `string` | fieldValidation instructs the server on how to handle objects in the request (POST/PUT/PATCH) containing unknown or duplicate fields. Valid values are: - Ignore: This will ignore any unknown fields that are silently dropped from the object, and will ignore all but the last duplicate field that the decoder encounters. This is the default behavior prior to v1.23. - Warn: This will send a warning via the standard warning response header for each unknown field that is dropped from the object, and for each duplicate field that is encountered. The request will still succeed if there are no other errors, and will only persist the last of any duplicate fields. This is the default in v1.23+ - Strict: This will fail the request with a BadRequest error if any unknown fields would be dropped from the object, or if any duplicate fields are present. The error returned from the server will contain all unknown and duplicate fields encountered. |

HTTP 响应| HTTP 状态码 | 响应体 |
| --- | --- |
| 200 - OK | `ArtifactCleanupRun` schema |
| 401 - Unauthorized | Empty |

HTTP 方法`PUT`描述replace status of the specified ArtifactCleanupRun查询参数| 参数 | 类型 | 描述 |
| --- | --- | --- |
| `dryRun` | `string` | When present, indicates that modifications should not be persisted. An invalid or unrecognized dryRun directive will result in an error response and no further processing of the request. Valid values are: - All: all dry run stages will be processed |
| `fieldValidation` | `string` | fieldValidation instructs the server on how to handle objects in the request (POST/PUT/PATCH) containing unknown or duplicate fields. Valid values are: - Ignore: This will ignore any unknown fields that are silently dropped from the object, and will ignore all but the last duplicate field that the decoder encounters. This is the default behavior prior to v1.23. - Warn: This will send a warning via the standard warning response header for each unknown field that is dropped from the object, and for each duplicate field that is encountered. The request will still succeed if there are no other errors, and will only persist the last of any duplicate fields. This is the default in v1.23+ - Strict: This will fail the request with a BadRequest error if any unknown fields would be dropped from the object, or if any duplicate fields are present. The error returned from the server will contain all unknown and duplicate fields encountered. |

请求体参数| 参数 | 类型 | 描述 |
| --- | --- | --- |
| `body` | `ArtifactCleanupRun` schema | `application/json` formatted |

HTTP 响应| HTTP 状态码 | 响应体 |
| --- | --- |
| 200 - OK | `ArtifactCleanupRun` schema |
| 201 - Created | `ArtifactCleanupRun` schema |
| 401 - Unauthorized | Empty |

