# DaemonSet \[apps/v1]

描述DaemonSet represents the configuration of a daemon set.类型`object`## [#](#规格)规格

| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `apiVersion` | `string` | APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: [https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources](https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources) |
| `kind` | `string` | Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: [https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds](https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds) |
| `metadata` | `[ObjectMeta](/apis/references/ObjectMeta.html)` | ObjectMeta is metadata that all persisted resources must have, which includes all objects users must create. |
| `spec` | `object` | DaemonSetSpec is the specification of a daemon set. |
| `status` | `object` | DaemonSetStatus represents the current status of a daemon set. |

### [#](#spec).spec

描述DaemonSetSpec is the specification of a daemon set.类型`object`必填`selector``template`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `minReadySeconds` | `integer` | The minimum number of seconds for which a newly created DaemonSet pod should be ready without any of its container crashing, for it to be considered available. Defaults to 0 (pod will be considered available as soon as it is ready). |
| `revisionHistoryLimit` | `integer` | The number of old history to retain to allow rollback. This is a pointer to distinguish between explicit zero and not specified. Defaults to 10. |
| `selector` | `object` | A label selector is a label query over a set of resources. The result of matchLabels and matchExpressions are ANDed. An empty label selector matches all objects. A null label selector matches no objects. |
| `template` | `object` | PodTemplateSpec describes the data a pod should have when created from a template |
| `updateStrategy` | `object` | DaemonSetUpdateStrategy is a struct used to control the update strategy for a DaemonSet. |

### [#](#specselector).spec.selector

描述A label selector is a label query over a set of resources. The result of matchLabels and matchExpressions are ANDed. An empty label selector matches all objects. A null label selector matches no objects.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `matchExpressions` | `array` | matchExpressions is a list of label selector requirements. The requirements are ANDed. |
| `matchLabels` | `object` | matchLabels is a map of {key,value} pairs. A single {key,value} in the matchLabels map is equivalent to an element of matchExpressions, whose key field is "key", the operator is "In", and the values array contains only "value". The requirements are ANDed. |

### [#](#specselectormatchexpressions).spec.selector.matchExpressions

描述matchExpressions is a list of label selector requirements. The requirements are ANDed.类型`array`### [#](#specselectormatchexpressions-1).spec.selector.matchExpressions[]

描述A label selector requirement is a selector that contains values, a key, and an operator that relates the key and values.类型`object`必填`key``operator`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `key` | `string` | key is the label key that the selector applies to. |
| `operator` | `string` | operator represents a key's relationship to a set of values. Valid operators are In, NotIn, Exists and DoesNotExist. |
| `values` | `array` | values is an array of string values. If the operator is In or NotIn, the values array must be non-empty. If the operator is Exists or DoesNotExist, the values array must be empty. This array is replaced during a strategic merge patch. |

### [#](#specselectormatchexpressionsvalues).spec.selector.matchExpressions[].values

描述values is an array of string values. If the operator is In or NotIn, the values array must be non-empty. If the operator is Exists or DoesNotExist, the values array must be empty. This array is replaced during a strategic merge patch.类型`array`### [#](#specselectormatchexpressionsvalues-1).spec.selector.matchExpressions[].values[]

类型`string`### [#](#specselectormatchlabels).spec.selector.matchLabels

描述matchLabels is a map of {key,value} pairs. A single {key,value} in the matchLabels map is equivalent to an element of matchExpressions, whose key field is "key", the operator is "In", and the values array contains only "value". The requirements are ANDed.类型`object`### [#](#spectemplate).spec.template

描述PodTemplateSpec describes the data a pod should have when created from a template类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `metadata` | `[ObjectMeta](/apis/references/ObjectMeta.html)` | ObjectMeta is metadata that all persisted resources must have, which includes all objects users must create. |
| `spec` | `object` | PodSpec is a description of a pod. |

### [#](#spectemplatespec).spec.template.spec

描述PodSpec is a description of a pod.类型`object`必填`containers`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `activeDeadlineSeconds` | `integer` | Optional duration in seconds the pod may be active on the node relative to StartTime before the system will actively try to mark it failed and kill associated containers. Value must be a positive integer. |
| `affinity` | `object` | Affinity is a group of affinity scheduling rules. |
| `automountServiceAccountToken` | `boolean` | AutomountServiceAccountToken indicates whether a service account token should be automatically mounted. |
| `containers` | `array` | List of containers belonging to the pod. Containers cannot currently be added or removed. There must be at least one container in a Pod. Cannot be updated. |
| `dnsConfig` | `object` | PodDNSConfig defines the DNS parameters of a pod in addition to those generated from DNSPolicy. |
| `dnsPolicy` | `string` | Set DNS policy for the pod. Defaults to "ClusterFirst". Valid values are 'ClusterFirstWithHostNet', 'ClusterFirst', 'Default' or 'None'. DNS parameters given in DNSConfig will be merged with the policy selected with DNSPolicy. To have DNS options set along with hostNetwork, you have to specify DNS policy explicitly to 'ClusterFirstWithHostNet'.


Possible enum values:



- `"ClusterFirst"` indicates that the pod should use cluster DNS first unless hostNetwork is true, if it is available, then fall back on the default (as determined by kubelet) DNS settings.

- `"ClusterFirstWithHostNet"` indicates that the pod should use cluster DNS first, if it is available, then fall back on the default (as determined by kubelet) DNS settings.

- `"Default"` indicates that the pod should use the default (as determined by kubelet) DNS settings.

- `"None"` indicates that the pod should use empty DNS settings. DNS parameters such as nameservers and search paths should be defined via DNSConfig. |
| `enableServiceLinks` | `boolean` | EnableServiceLinks indicates whether information about services should be injected into pod's environment variables, matching the syntax of Docker links. Optional: Defaults to true. |
| `ephemeralContainers` | `array` | List of ephemeral containers run in this pod. Ephemeral containers may be run in an existing pod to perform user-initiated actions such as debugging. This list cannot be specified when creating a pod, and it cannot be modified by updating the pod spec. In order to add an ephemeral container to an existing pod, use the pod's ephemeralcontainers subresource. |
| `hostAliases` | `array` | HostAliases is an optional list of hosts and IPs that will be injected into the pod's hosts file if specified. |
| `hostIPC` | `boolean` | Use the host's ipc namespace. Optional: Default to false. |
| `hostNetwork` | `boolean` | Host networking requested for this pod. Use the host's network namespace. If this option is set, the ports that will be used must be specified. Default to false. |
| `hostPID` | `boolean` | Use the host's pid namespace. Optional: Default to false. |
| `hostUsers` | `boolean` | Use the host's user namespace. Optional: Default to true. If set to true or not present, the pod will be run in the host user namespace, useful for when the pod needs a feature only available to the host user namespace, such as loading a kernel module with CAP_SYS_MODULE. When set to false, a new userns is created for the pod. Setting false is useful for mitigating container breakout vulnerabilities even allowing users to run their containers as root without actually having root privileges on the host. This field is alpha-level and is only honored by servers that enable the UserNamespacesSupport feature. |
| `hostname` | `string` | Specifies the hostname of the Pod If not specified, the pod's hostname will be set to a system-defined value. |
| `imagePullSecrets` | `array` | ImagePullSecrets is an optional list of references to secrets in the same namespace to use for pulling any of the images used by this PodSpec. If specified, these secrets will be passed to individual puller implementations for them to use. More info: [https://kubernetes.io/docs/concepts/containers/images#specifying-imagepullsecrets-on-a-pod](https://kubernetes.io/docs/concepts/containers/images#specifying-imagepullsecrets-on-a-pod) |
| `initContainers` | `array` | List of initialization containers belonging to the pod. Init containers are executed in order prior to containers being started. If any init container fails, the pod is considered to have failed and is handled according to its restartPolicy. The name for an init container or normal container must be unique among all containers. Init containers may not have Lifecycle actions, Readiness probes, Liveness probes, or Startup probes. The resourceRequirements of an init container are taken into account during scheduling by finding the highest request/limit for each resource type, and then using the max of of that value or the sum of the normal containers. Limits are applied to init containers in a similar fashion. Init containers cannot currently be added or removed. Cannot be updated. More info: [https://kubernetes.io/docs/concepts/workloads/pods/init-containers/](https://kubernetes.io/docs/concepts/workloads/pods/init-containers/) |
| `nodeName` | `string` | NodeName indicates in which node this pod is scheduled. If empty, this pod is a candidate for scheduling by the scheduler defined in schedulerName. Once this field is set, the kubelet for this node becomes responsible for the lifecycle of this pod. This field should not be used to express a desire for the pod to be scheduled on a specific node. [https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#nodename](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#nodename) |
| `nodeSelector` | `object` | NodeSelector is a selector which must be true for the pod to fit on a node. Selector which must match a node's labels for the pod to be scheduled on that node. More info: [https://kubernetes.io/docs/concepts/configuration/assign-pod-node/](https://kubernetes.io/docs/concepts/configuration/assign-pod-node/) |
| `os` | `object` | PodOS defines the OS parameters of a pod. |
| `overhead` | `object` | Overhead represents the resource overhead associated with running a pod for a given RuntimeClass. This field will be autopopulated at admission time by the RuntimeClass admission controller. If the RuntimeClass admission controller is enabled, overhead must not be set in Pod create requests. The RuntimeClass admission controller will reject Pod create requests which have the overhead already set. If RuntimeClass is configured and selected in the PodSpec, Overhead will be set to the value defined in the corresponding RuntimeClass, otherwise it will remain unset and treated as zero. More info: [https://git.k8s.io/enhancements/keps/sig-node/688-pod-overhead/README.md](https://git.k8s.io/enhancements/keps/sig-node/688-pod-overhead/README.md) |
| `preemptionPolicy` | `string` | PreemptionPolicy is the Policy for preempting pods with lower priority. One of Never, PreemptLowerPriority. Defaults to PreemptLowerPriority if unset.


Possible enum values:



- `"Never"` means that pod never preempts other pods with lower priority.

- `"PreemptLowerPriority"` means that pod can preempt other pods with lower priority. |
| `priority` | `integer` | The priority value. Various system components use this field to find the priority of the pod. When Priority Admission Controller is enabled, it prevents users from setting this field. The admission controller populates this field from PriorityClassName. The higher the value, the higher the priority. |
| `priorityClassName` | `string` | If specified, indicates the pod's priority. "system-node-critical" and "system-cluster-critical" are two special keywords which indicate the highest priorities with the former being the highest priority. Any other name must be defined by creating a PriorityClass object with that name. If not specified, the pod priority will be default or zero if there is no default. |
| `readinessGates` | `array` | If specified, all readiness gates will be evaluated for pod readiness. A pod is ready when all its containers are ready AND all conditions specified in the readiness gates have status equal to "True" More info: [https://git.k8s.io/enhancements/keps/sig-network/580-pod-readiness-gates](https://git.k8s.io/enhancements/keps/sig-network/580-pod-readiness-gates) |
| `resourceClaims` | `array` | ResourceClaims defines which ResourceClaims must be allocated and reserved before the Pod is allowed to start. The resources will be made available to those containers which consume them by name.


This is an alpha field and requires enabling the DynamicResourceAllocation feature gate.


This field is immutable. |
| `resources` | `object` | ResourceRequirements describes the compute resource requirements. |
| `restartPolicy` | `string` | Restart policy for all containers within the pod. One of Always, OnFailure, Never. In some contexts, only a subset of those values may be permitted. Default to Always. More info: [https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#restart-policy](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#restart-policy)


Possible enum values:



- `"Always"`

- `"Never"`

- `"OnFailure"` |
| `runtimeClassName` | `string` | RuntimeClassName refers to a RuntimeClass object in the node.k8s.io group, which should be used to run this pod.  If no RuntimeClass resource matches the named class, the pod will not be run. If unset or empty, the "legacy" RuntimeClass will be used, which is an implicit class with an empty definition that uses the default runtime handler. More info: [https://git.k8s.io/enhancements/keps/sig-node/585-runtime-class](https://git.k8s.io/enhancements/keps/sig-node/585-runtime-class) |
| `schedulerName` | `string` | If specified, the pod will be dispatched by specified scheduler. If not specified, the pod will be dispatched by default scheduler. |
| `schedulingGates` | `array` | SchedulingGates is an opaque list of values that if specified will block scheduling the pod. If schedulingGates is not empty, the pod will stay in the SchedulingGated state and the scheduler will not attempt to schedule the pod.


SchedulingGates can only be set at pod creation time, and be removed only afterwards. |
| `securityContext` | `object` | PodSecurityContext holds pod-level security attributes and common container settings. Some fields are also present in container.securityContext.  Field values of container.securityContext take precedence over field values of PodSecurityContext. |
| `serviceAccount` | `string` | DeprecatedServiceAccount is a deprecated alias for ServiceAccountName. Deprecated: Use serviceAccountName instead. |
| `serviceAccountName` | `string` | ServiceAccountName is the name of the ServiceAccount to use to run this pod. More info: [https://kubernetes.io/docs/tasks/configure-pod-container/configure-service-account/](https://kubernetes.io/docs/tasks/configure-pod-container/configure-service-account/) |
| `setHostnameAsFQDN` | `boolean` | If true the pod's hostname will be configured as the pod's FQDN, rather than the leaf name (the default). In Linux containers, this means setting the FQDN in the hostname field of the kernel (the nodename field of struct utsname). In Windows containers, this means setting the registry value of hostname for the registry key HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters to FQDN. If a pod does not have FQDN, this has no effect. Default to false. |
| `shareProcessNamespace` | `boolean` | Share a single process namespace between all of the containers in a pod. When this is set containers will be able to view and signal processes from other containers in the same pod, and the first process in each container will not be assigned PID 1. HostPID and ShareProcessNamespace cannot both be set. Optional: Default to false. |
| `subdomain` | `string` | If specified, the fully qualified Pod hostname will be "...svc.". If not specified, the pod will not have a domainname at all. |
| `terminationGracePeriodSeconds` | `integer` | Optional duration in seconds the pod needs to terminate gracefully. May be decreased in delete request. Value must be non-negative integer. The value zero indicates stop immediately via the kill signal (no opportunity to shut down). If this value is nil, the default grace period will be used instead. The grace period is the duration in seconds after the processes running in the pod are sent a termination signal and the time when the processes are forcibly halted with a kill signal. Set this value longer than the expected cleanup time for your process. Defaults to 30 seconds. |
| `tolerations` | `array` | If specified, the pod's tolerations. |
| `topologySpreadConstraints` | `array` | TopologySpreadConstraints describes how a group of pods ought to spread across topology domains. Scheduler will schedule pods in a way which abides by the constraints. All topologySpreadConstraints are ANDed. |
| `volumes` | `array` | List of volumes that can be mounted by containers belonging to the pod. More info: [https://kubernetes.io/docs/concepts/storage/volumes](https://kubernetes.io/docs/concepts/storage/volumes) |

### [#](#spectemplatespecaffinity).spec.template.spec.affinity

描述Affinity is a group of affinity scheduling rules.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `nodeAffinity` | `object` | Node affinity is a group of node affinity scheduling rules. |
| `podAffinity` | `object` | Pod affinity is a group of inter pod affinity scheduling rules. |
| `podAntiAffinity` | `object` | Pod anti affinity is a group of inter pod anti affinity scheduling rules. |

### [#](#spectemplatespecaffinitynodeaffinity).spec.template.spec.affinity.nodeAffinity

描述Node affinity is a group of node affinity scheduling rules.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `preferredDuringSchedulingIgnoredDuringExecution` | `array` | The scheduler will prefer to schedule pods to nodes that satisfy the affinity expressions specified by this field, but it may choose a node that violates one or more of the expressions. The node that is most preferred is the one with the greatest sum of weights, i.e. for each node that meets all of the scheduling requirements (resource request, requiredDuringScheduling affinity expressions, etc.), compute a sum by iterating through the elements of this field and adding "weight" to the sum if the node matches the corresponding matchExpressions; the node(s) with the highest sum are the most preferred. |
| `requiredDuringSchedulingIgnoredDuringExecution` | `object` | A node selector represents the union of the results of one or more label queries over a set of nodes; that is, it represents the OR of the selectors represented by the node selector terms. |

### [#](#spectemplatespecaffinitynodeaffinitypreferredduringschedulingignoredduringexecution).spec.template.spec.affinity.nodeAffinity.preferredDuringSchedulingIgnoredDuringExecution

描述The scheduler will prefer to schedule pods to nodes that satisfy the affinity expressions specified by this field, but it may choose a node that violates one or more of the expressions. The node that is most preferred is the one with the greatest sum of weights, i.e. for each node that meets all of the scheduling requirements (resource request, requiredDuringScheduling affinity expressions, etc.), compute a sum by iterating through the elements of this field and adding "weight" to the sum if the node matches the corresponding matchExpressions; the node(s) with the highest sum are the most preferred.类型`array`### [#](#spectemplatespecaffinitynodeaffinitypreferredduringschedulingignoredduringexecution-1).spec.template.spec.affinity.nodeAffinity.preferredDuringSchedulingIgnoredDuringExecution[]

描述An empty preferred scheduling term matches all objects with implicit weight 0 (i.e. it's a no-op). A null preferred scheduling term matches no objects (i.e. is also a no-op).类型`object`必填`weight``preference`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `preference` | `object` | A null or empty node selector term matches no objects. The requirements of them are ANDed. The TopologySelectorTerm type implements a subset of the NodeSelectorTerm. |
| `weight` | `integer` | Weight associated with matching the corresponding nodeSelectorTerm, in the range 1-100. |

### [#](#spectemplatespecaffinitynodeaffinitypreferredduringschedulingignoredduringexecutionpreference).spec.template.spec.affinity.nodeAffinity.preferredDuringSchedulingIgnoredDuringExecution[].preference

描述A null or empty node selector term matches no objects. The requirements of them are ANDed. The TopologySelectorTerm type implements a subset of the NodeSelectorTerm.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `matchExpressions` | `array` | A list of node selector requirements by node's labels. |
| `matchFields` | `array` | A list of node selector requirements by node's fields. |

### [#](#spectemplatespecaffinitynodeaffinitypreferredduringschedulingignoredduringexecutionpreferencematchexpressions).spec.template.spec.affinity.nodeAffinity.preferredDuringSchedulingIgnoredDuringExecution[].preference.matchExpressions

描述A list of node selector requirements by node's labels.类型`array`### [#](#spectemplatespecaffinitynodeaffinitypreferredduringschedulingignoredduringexecutionpreferencematchexpressions-1).spec.template.spec.affinity.nodeAffinity.preferredDuringSchedulingIgnoredDuringExecution[].preference.matchExpressions[]

描述A node selector requirement is a selector that contains values, a key, and an operator that relates the key and values.类型`object`必填`key``operator`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `key` | `string` | The label key that the selector applies to. |
| `operator` | `string` | Represents a key's relationship to a set of values. Valid operators are In, NotIn, Exists, DoesNotExist. Gt, and Lt.


Possible enum values:



- `"DoesNotExist"`

- `"Exists"`

- `"Gt"`

- `"In"`

- `"Lt"`

- `"NotIn"` |
| `values` | `array` | An array of string values. If the operator is In or NotIn, the values array must be non-empty. If the operator is Exists or DoesNotExist, the values array must be empty. If the operator is Gt or Lt, the values array must have a single element, which will be interpreted as an integer. This array is replaced during a strategic merge patch. |

### [#](#spectemplatespecaffinitynodeaffinitypreferredduringschedulingignoredduringexecutionpreferencematchexpressionsvalues).spec.template.spec.affinity.nodeAffinity.preferredDuringSchedulingIgnoredDuringExecution[].preference.matchExpressions[].values

描述An array of string values. If the operator is In or NotIn, the values array must be non-empty. If the operator is Exists or DoesNotExist, the values array must be empty. If the operator is Gt or Lt, the values array must have a single element, which will be interpreted as an integer. This array is replaced during a strategic merge patch.类型`array`### [#](#spectemplatespecaffinitynodeaffinitypreferredduringschedulingignoredduringexecutionpreferencematchexpressionsvalues-1).spec.template.spec.affinity.nodeAffinity.preferredDuringSchedulingIgnoredDuringExecution[].preference.matchExpressions[].values[]

类型`string`### [#](#spectemplatespecaffinitynodeaffinitypreferredduringschedulingignoredduringexecutionpreferencematchfields).spec.template.spec.affinity.nodeAffinity.preferredDuringSchedulingIgnoredDuringExecution[].preference.matchFields

描述A list of node selector requirements by node's fields.类型`array`### [#](#spectemplatespecaffinitynodeaffinitypreferredduringschedulingignoredduringexecutionpreferencematchfields-1).spec.template.spec.affinity.nodeAffinity.preferredDuringSchedulingIgnoredDuringExecution[].preference.matchFields[]

描述A node selector requirement is a selector that contains values, a key, and an operator that relates the key and values.类型`object`必填`key``operator`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `key` | `string` | The label key that the selector applies to. |
| `operator` | `string` | Represents a key's relationship to a set of values. Valid operators are In, NotIn, Exists, DoesNotExist. Gt, and Lt.


Possible enum values:



- `"DoesNotExist"`

- `"Exists"`

- `"Gt"`

- `"In"`

- `"Lt"`

- `"NotIn"` |
| `values` | `array` | An array of string values. If the operator is In or NotIn, the values array must be non-empty. If the operator is Exists or DoesNotExist, the values array must be empty. If the operator is Gt or Lt, the values array must have a single element, which will be interpreted as an integer. This array is replaced during a strategic merge patch. |

### [#](#spectemplatespecaffinitynodeaffinitypreferredduringschedulingignoredduringexecutionpreferencematchfieldsvalues).spec.template.spec.affinity.nodeAffinity.preferredDuringSchedulingIgnoredDuringExecution[].preference.matchFields[].values

描述An array of string values. If the operator is In or NotIn, the values array must be non-empty. If the operator is Exists or DoesNotExist, the values array must be empty. If the operator is Gt or Lt, the values array must have a single element, which will be interpreted as an integer. This array is replaced during a strategic merge patch.类型`array`### [#](#spectemplatespecaffinitynodeaffinitypreferredduringschedulingignoredduringexecutionpreferencematchfieldsvalues-1).spec.template.spec.affinity.nodeAffinity.preferredDuringSchedulingIgnoredDuringExecution[].preference.matchFields[].values[]

类型`string`### [#](#spectemplatespecaffinitynodeaffinityrequiredduringschedulingignoredduringexecution).spec.template.spec.affinity.nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution

描述A node selector represents the union of the results of one or more label queries over a set of nodes; that is, it represents the OR of the selectors represented by the node selector terms.类型`object`必填`nodeSelectorTerms`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `nodeSelectorTerms` | `array` | Required. A list of node selector terms. The terms are ORed. |

### [#](#spectemplatespecaffinitynodeaffinityrequiredduringschedulingignoredduringexecutionnodeselectorterms).spec.template.spec.affinity.nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution.nodeSelectorTerms

描述Required. A list of node selector terms. The terms are ORed.类型`array`### [#](#spectemplatespecaffinitynodeaffinityrequiredduringschedulingignoredduringexecutionnodeselectorterms-1).spec.template.spec.affinity.nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution.nodeSelectorTerms[]

描述A null or empty node selector term matches no objects. The requirements of them are ANDed. The TopologySelectorTerm type implements a subset of the NodeSelectorTerm.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `matchExpressions` | `array` | A list of node selector requirements by node's labels. |
| `matchFields` | `array` | A list of node selector requirements by node's fields. |

### [#](#spectemplatespecaffinitynodeaffinityrequiredduringschedulingignoredduringexecutionnodeselectortermsmatchexpressions).spec.template.spec.affinity.nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution.nodeSelectorTerms[].matchExpressions

描述A list of node selector requirements by node's labels.类型`array`### [#](#spectemplatespecaffinitynodeaffinityrequiredduringschedulingignoredduringexecutionnodeselectortermsmatchexpressions-1).spec.template.spec.affinity.nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution.nodeSelectorTerms[].matchExpressions[]

描述A node selector requirement is a selector that contains values, a key, and an operator that relates the key and values.类型`object`必填`key``operator`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `key` | `string` | The label key that the selector applies to. |
| `operator` | `string` | Represents a key's relationship to a set of values. Valid operators are In, NotIn, Exists, DoesNotExist. Gt, and Lt.


Possible enum values:



- `"DoesNotExist"`

- `"Exists"`

- `"Gt"`

- `"In"`

- `"Lt"`

- `"NotIn"` |
| `values` | `array` | An array of string values. If the operator is In or NotIn, the values array must be non-empty. If the operator is Exists or DoesNotExist, the values array must be empty. If the operator is Gt or Lt, the values array must have a single element, which will be interpreted as an integer. This array is replaced during a strategic merge patch. |

### [#](#spectemplatespecaffinitynodeaffinityrequiredduringschedulingignoredduringexecutionnodeselectortermsmatchexpressionsvalues).spec.template.spec.affinity.nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution.nodeSelectorTerms[].matchExpressions[].values

描述An array of string values. If the operator is In or NotIn, the values array must be non-empty. If the operator is Exists or DoesNotExist, the values array must be empty. If the operator is Gt or Lt, the values array must have a single element, which will be interpreted as an integer. This array is replaced during a strategic merge patch.类型`array`### [#](#spectemplatespecaffinitynodeaffinityrequiredduringschedulingignoredduringexecutionnodeselectortermsmatchexpressionsvalues-1).spec.template.spec.affinity.nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution.nodeSelectorTerms[].matchExpressions[].values[]

类型`string`### [#](#spectemplatespecaffinitynodeaffinityrequiredduringschedulingignoredduringexecutionnodeselectortermsmatchfields).spec.template.spec.affinity.nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution.nodeSelectorTerms[].matchFields

描述A list of node selector requirements by node's fields.类型`array`### [#](#spectemplatespecaffinitynodeaffinityrequiredduringschedulingignoredduringexecutionnodeselectortermsmatchfields-1).spec.template.spec.affinity.nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution.nodeSelectorTerms[].matchFields[]

描述A node selector requirement is a selector that contains values, a key, and an operator that relates the key and values.类型`object`必填`key``operator`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `key` | `string` | The label key that the selector applies to. |
| `operator` | `string` | Represents a key's relationship to a set of values. Valid operators are In, NotIn, Exists, DoesNotExist. Gt, and Lt.


Possible enum values:



- `"DoesNotExist"`

- `"Exists"`

- `"Gt"`

- `"In"`

- `"Lt"`

- `"NotIn"` |
| `values` | `array` | An array of string values. If the operator is In or NotIn, the values array must be non-empty. If the operator is Exists or DoesNotExist, the values array must be empty. If the operator is Gt or Lt, the values array must have a single element, which will be interpreted as an integer. This array is replaced during a strategic merge patch. |

### [#](#spectemplatespecaffinitynodeaffinityrequiredduringschedulingignoredduringexecutionnodeselectortermsmatchfieldsvalues).spec.template.spec.affinity.nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution.nodeSelectorTerms[].matchFields[].values

描述An array of string values. If the operator is In or NotIn, the values array must be non-empty. If the operator is Exists or DoesNotExist, the values array must be empty. If the operator is Gt or Lt, the values array must have a single element, which will be interpreted as an integer. This array is replaced during a strategic merge patch.类型`array`### [#](#spectemplatespecaffinitynodeaffinityrequiredduringschedulingignoredduringexecutionnodeselectortermsmatchfieldsvalues-1).spec.template.spec.affinity.nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution.nodeSelectorTerms[].matchFields[].values[]

类型`string`### [#](#spectemplatespecaffinitypodaffinity).spec.template.spec.affinity.podAffinity

描述Pod affinity is a group of inter pod affinity scheduling rules.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `preferredDuringSchedulingIgnoredDuringExecution` | `array` | The scheduler will prefer to schedule pods to nodes that satisfy the affinity expressions specified by this field, but it may choose a node that violates one or more of the expressions. The node that is most preferred is the one with the greatest sum of weights, i.e. for each node that meets all of the scheduling requirements (resource request, requiredDuringScheduling affinity expressions, etc.), compute a sum by iterating through the elements of this field and adding "weight" to the sum if the node has pods which matches the corresponding podAffinityTerm; the node(s) with the highest sum are the most preferred. |
| `requiredDuringSchedulingIgnoredDuringExecution` | `array` | If the affinity requirements specified by this field are not met at scheduling time, the pod will not be scheduled onto the node. If the affinity requirements specified by this field cease to be met at some point during pod execution (e.g. due to a pod label update), the system may or may not try to eventually evict the pod from its node. When there are multiple elements, the lists of nodes corresponding to each podAffinityTerm are intersected, i.e. all terms must be satisfied. |

### [#](#spectemplatespecaffinitypodaffinitypreferredduringschedulingignoredduringexecution).spec.template.spec.affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution

描述The scheduler will prefer to schedule pods to nodes that satisfy the affinity expressions specified by this field, but it may choose a node that violates one or more of the expressions. The node that is most preferred is the one with the greatest sum of weights, i.e. for each node that meets all of the scheduling requirements (resource request, requiredDuringScheduling affinity expressions, etc.), compute a sum by iterating through the elements of this field and adding "weight" to the sum if the node has pods which matches the corresponding podAffinityTerm; the node(s) with the highest sum are the most preferred.类型`array`### [#](#spectemplatespecaffinitypodaffinitypreferredduringschedulingignoredduringexecution-1).spec.template.spec.affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution[]

描述The weights of all of the matched WeightedPodAffinityTerm fields are added per-node to find the most preferred node(s)类型`object`必填`weight``podAffinityTerm`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `podAffinityTerm` | `object` | Defines a set of pods (namely those matching the labelSelector relative to the given namespace(s)) that this pod should be co-located (affinity) or not co-located (anti-affinity) with, where co-located is defined as running on a node whose value of the label with key  matches that of any node on which a pod of the set of pods is running |
| `weight` | `integer` | weight associated with matching the corresponding podAffinityTerm, in the range 1-100. |

### [#](#spectemplatespecaffinitypodaffinitypreferredduringschedulingignoredduringexecutionpodaffinityterm).spec.template.spec.affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution[].podAffinityTerm

描述Defines a set of pods (namely those matching the labelSelector relative to the given namespace(s)) that this pod should be co-located (affinity) or not co-located (anti-affinity) with, where co-located is defined as running on a node whose value of the label with key <topologyKey> matches that of any node on which a pod of the set of pods is running类型`object`必填`topologyKey`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `labelSelector` | `object` | A label selector is a label query over a set of resources. The result of matchLabels and matchExpressions are ANDed. An empty label selector matches all objects. A null label selector matches no objects. |
| `matchLabelKeys` | `array` | MatchLabelKeys is a set of pod label keys to select which pods will be taken into consideration. The keys are used to lookup values from the incoming pod labels, those key-value labels are merged with `labelSelector` as `key in (value)` to select the group of existing pods which pods will be taken into consideration for the incoming pod's pod (anti) affinity. Keys that don't exist in the incoming pod labels will be ignored. The default value is empty. The same key is forbidden to exist in both matchLabelKeys and labelSelector. Also, matchLabelKeys cannot be set when labelSelector isn't set. This is a beta field and requires enabling MatchLabelKeysInPodAffinity feature gate (enabled by default). |
| `mismatchLabelKeys` | `array` | MismatchLabelKeys is a set of pod label keys to select which pods will be taken into consideration. The keys are used to lookup values from the incoming pod labels, those key-value labels are merged with `labelSelector` as `key notin (value)` to select the group of existing pods which pods will be taken into consideration for the incoming pod's pod (anti) affinity. Keys that don't exist in the incoming pod labels will be ignored. The default value is empty. The same key is forbidden to exist in both mismatchLabelKeys and labelSelector. Also, mismatchLabelKeys cannot be set when labelSelector isn't set. This is a beta field and requires enabling MatchLabelKeysInPodAffinity feature gate (enabled by default). |
| `namespaceSelector` | `object` | A label selector is a label query over a set of resources. The result of matchLabels and matchExpressions are ANDed. An empty label selector matches all objects. A null label selector matches no objects. |
| `namespaces` | `array` | namespaces specifies a static list of namespace names that the term applies to. The term is applied to the union of the namespaces listed in this field and the ones selected by namespaceSelector. null or empty namespaces list and null namespaceSelector means "this pod's namespace". |
| `topologyKey` | `string` | This pod should be co-located (affinity) or not co-located (anti-affinity) with the pods matching the labelSelector in the specified namespaces, where co-located is defined as running on a node whose value of the label with key topologyKey matches that of any node on which any of the selected pods is running. Empty topologyKey is not allowed. |

### [#](#spectemplatespecaffinitypodaffinitypreferredduringschedulingignoredduringexecutionpodaffinitytermlabelselector).spec.template.spec.affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution[].podAffinityTerm.labelSelector

描述A label selector is a label query over a set of resources. The result of matchLabels and matchExpressions are ANDed. An empty label selector matches all objects. A null label selector matches no objects.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `matchExpressions` | `array` | matchExpressions is a list of label selector requirements. The requirements are ANDed. |
| `matchLabels` | `object` | matchLabels is a map of {key,value} pairs. A single {key,value} in the matchLabels map is equivalent to an element of matchExpressions, whose key field is "key", the operator is "In", and the values array contains only "value". The requirements are ANDed. |

### [#](#spectemplatespecaffinitypodaffinitypreferredduringschedulingignoredduringexecutionpodaffinitytermlabelselectormatchexpressions).spec.template.spec.affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution[].podAffinityTerm.labelSelector.matchExpressions

描述matchExpressions is a list of label selector requirements. The requirements are ANDed.类型`array`### [#](#spectemplatespecaffinitypodaffinitypreferredduringschedulingignoredduringexecutionpodaffinitytermlabelselectormatchexpressions-1).spec.template.spec.affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution[].podAffinityTerm.labelSelector.matchExpressions[]

描述A label selector requirement is a selector that contains values, a key, and an operator that relates the key and values.类型`object`必填`key``operator`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `key` | `string` | key is the label key that the selector applies to. |
| `operator` | `string` | operator represents a key's relationship to a set of values. Valid operators are In, NotIn, Exists and DoesNotExist. |
| `values` | `array` | values is an array of string values. If the operator is In or NotIn, the values array must be non-empty. If the operator is Exists or DoesNotExist, the values array must be empty. This array is replaced during a strategic merge patch. |

### [#](#spectemplatespecaffinitypodaffinitypreferredduringschedulingignoredduringexecutionpodaffinitytermlabelselectormatchexpressionsvalues).spec.template.spec.affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution[].podAffinityTerm.labelSelector.matchExpressions[].values

描述values is an array of string values. If the operator is In or NotIn, the values array must be non-empty. If the operator is Exists or DoesNotExist, the values array must be empty. This array is replaced during a strategic merge patch.类型`array`### [#](#spectemplatespecaffinitypodaffinitypreferredduringschedulingignoredduringexecutionpodaffinitytermlabelselectormatchexpressionsvalues-1).spec.template.spec.affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution[].podAffinityTerm.labelSelector.matchExpressions[].values[]

类型`string`### [#](#spectemplatespecaffinitypodaffinitypreferredduringschedulingignoredduringexecutionpodaffinitytermlabelselectormatchlabels).spec.template.spec.affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution[].podAffinityTerm.labelSelector.matchLabels

描述matchLabels is a map of {key,value} pairs. A single {key,value} in the matchLabels map is equivalent to an element of matchExpressions, whose key field is "key", the operator is "In", and the values array contains only "value". The requirements are ANDed.类型`object`### [#](#spectemplatespecaffinitypodaffinitypreferredduringschedulingignoredduringexecutionpodaffinitytermmatchlabelkeys).spec.template.spec.affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution[].podAffinityTerm.matchLabelKeys

描述MatchLabelKeys is a set of pod label keys to select which pods will be taken into consideration. The keys are used to lookup values from the incoming pod labels, those key-value labels are merged with `labelSelector` as `key in (value)` to select the group of existing pods which pods will be taken into consideration for the incoming pod's pod (anti) affinity. Keys that don't exist in the incoming pod labels will be ignored. The default value is empty. The same key is forbidden to exist in both matchLabelKeys and labelSelector. Also, matchLabelKeys cannot be set when labelSelector isn't set. This is a beta field and requires enabling MatchLabelKeysInPodAffinity feature gate (enabled by default).类型`array`### [#](#spectemplatespecaffinitypodaffinitypreferredduringschedulingignoredduringexecutionpodaffinitytermmatchlabelkeys-1).spec.template.spec.affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution[].podAffinityTerm.matchLabelKeys[]

类型`string`### [#](#spectemplatespecaffinitypodaffinitypreferredduringschedulingignoredduringexecutionpodaffinitytermmismatchlabelkeys).spec.template.spec.affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution[].podAffinityTerm.mismatchLabelKeys

描述MismatchLabelKeys is a set of pod label keys to select which pods will be taken into consideration. The keys are used to lookup values from the incoming pod labels, those key-value labels are merged with `labelSelector` as `key notin (value)` to select the group of existing pods which pods will be taken into consideration for the incoming pod's pod (anti) affinity. Keys that don't exist in the incoming pod labels will be ignored. The default value is empty. The same key is forbidden to exist in both mismatchLabelKeys and labelSelector. Also, mismatchLabelKeys cannot be set when labelSelector isn't set. This is a beta field and requires enabling MatchLabelKeysInPodAffinity feature gate (enabled by default).类型`array`### [#](#spectemplatespecaffinitypodaffinitypreferredduringschedulingignoredduringexecutionpodaffinitytermmismatchlabelkeys-1).spec.template.spec.affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution[].podAffinityTerm.mismatchLabelKeys[]

类型`string`### [#](#spectemplatespecaffinitypodaffinitypreferredduringschedulingignoredduringexecutionpodaffinitytermnamespaceselector).spec.template.spec.affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution[].podAffinityTerm.namespaceSelector

描述A label selector is a label query over a set of resources. The result of matchLabels and matchExpressions are ANDed. An empty label selector matches all objects. A null label selector matches no objects.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `matchExpressions` | `array` | matchExpressions is a list of label selector requirements. The requirements are ANDed. |
| `matchLabels` | `object` | matchLabels is a map of {key,value} pairs. A single {key,value} in the matchLabels map is equivalent to an element of matchExpressions, whose key field is "key", the operator is "In", and the values array contains only "value". The requirements are ANDed. |

### [#](#spectemplatespecaffinitypodaffinitypreferredduringschedulingignoredduringexecutionpodaffinitytermnamespaceselectormatchexpressions).spec.template.spec.affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution[].podAffinityTerm.namespaceSelector.matchExpressions

描述matchExpressions is a list of label selector requirements. The requirements are ANDed.类型`array`### [#](#spectemplatespecaffinitypodaffinitypreferredduringschedulingignoredduringexecutionpodaffinitytermnamespaceselectormatchexpressions-1).spec.template.spec.affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution[].podAffinityTerm.namespaceSelector.matchExpressions[]

描述A label selector requirement is a selector that contains values, a key, and an operator that relates the key and values.类型`object`必填`key``operator`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `key` | `string` | key is the label key that the selector applies to. |
| `operator` | `string` | operator represents a key's relationship to a set of values. Valid operators are In, NotIn, Exists and DoesNotExist. |
| `values` | `array` | values is an array of string values. If the operator is In or NotIn, the values array must be non-empty. If the operator is Exists or DoesNotExist, the values array must be empty. This array is replaced during a strategic merge patch. |

### [#](#spectemplatespecaffinitypodaffinitypreferredduringschedulingignoredduringexecutionpodaffinitytermnamespaceselectormatchexpressionsvalues).spec.template.spec.affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution[].podAffinityTerm.namespaceSelector.matchExpressions[].values

描述values is an array of string values. If the operator is In or NotIn, the values array must be non-empty. If the operator is Exists or DoesNotExist, the values array must be empty. This array is replaced during a strategic merge patch.类型`array`### [#](#spectemplatespecaffinitypodaffinitypreferredduringschedulingignoredduringexecutionpodaffinitytermnamespaceselectormatchexpressionsvalues-1).spec.template.spec.affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution[].podAffinityTerm.namespaceSelector.matchExpressions[].values[]

类型`string`### [#](#spectemplatespecaffinitypodaffinitypreferredduringschedulingignoredduringexecutionpodaffinitytermnamespaceselectormatchlabels).spec.template.spec.affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution[].podAffinityTerm.namespaceSelector.matchLabels

描述matchLabels is a map of {key,value} pairs. A single {key,value} in the matchLabels map is equivalent to an element of matchExpressions, whose key field is "key", the operator is "In", and the values array contains only "value". The requirements are ANDed.类型`object`### [#](#spectemplatespecaffinitypodaffinitypreferredduringschedulingignoredduringexecutionpodaffinitytermnamespaces).spec.template.spec.affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution[].podAffinityTerm.namespaces

描述namespaces specifies a static list of namespace names that the term applies to. The term is applied to the union of the namespaces listed in this field and the ones selected by namespaceSelector. null or empty namespaces list and null namespaceSelector means "this pod's namespace".类型`array`### [#](#spectemplatespecaffinitypodaffinitypreferredduringschedulingignoredduringexecutionpodaffinitytermnamespaces-1).spec.template.spec.affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution[].podAffinityTerm.namespaces[]

类型`string`### [#](#spectemplatespecaffinitypodaffinityrequiredduringschedulingignoredduringexecution).spec.template.spec.affinity.podAffinity.requiredDuringSchedulingIgnoredDuringExecution

描述If the affinity requirements specified by this field are not met at scheduling time, the pod will not be scheduled onto the node. If the affinity requirements specified by this field cease to be met at some point during pod execution (e.g. due to a pod label update), the system may or may not try to eventually evict the pod from its node. When there are multiple elements, the lists of nodes corresponding to each podAffinityTerm are intersected, i.e. all terms must be satisfied.类型`array`### [#](#spectemplatespecaffinitypodaffinityrequiredduringschedulingignoredduringexecution-1).spec.template.spec.affinity.podAffinity.requiredDuringSchedulingIgnoredDuringExecution[]

描述Defines a set of pods (namely those matching the labelSelector relative to the given namespace(s)) that this pod should be co-located (affinity) or not co-located (anti-affinity) with, where co-located is defined as running on a node whose value of the label with key <topologyKey> matches that of any node on which a pod of the set of pods is running类型`object`必填`topologyKey`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `labelSelector` | `object` | A label selector is a label query over a set of resources. The result of matchLabels and matchExpressions are ANDed. An empty label selector matches all objects. A null label selector matches no objects. |
| `matchLabelKeys` | `array` | MatchLabelKeys is a set of pod label keys to select which pods will be taken into consideration. The keys are used to lookup values from the incoming pod labels, those key-value labels are merged with `labelSelector` as `key in (value)` to select the group of existing pods which pods will be taken into consideration for the incoming pod's pod (anti) affinity. Keys that don't exist in the incoming pod labels will be ignored. The default value is empty. The same key is forbidden to exist in both matchLabelKeys and labelSelector. Also, matchLabelKeys cannot be set when labelSelector isn't set. This is a beta field and requires enabling MatchLabelKeysInPodAffinity feature gate (enabled by default). |
| `mismatchLabelKeys` | `array` | MismatchLabelKeys is a set of pod label keys to select which pods will be taken into consideration. The keys are used to lookup values from the incoming pod labels, those key-value labels are merged with `labelSelector` as `key notin (value)` to select the group of existing pods which pods will be taken into consideration for the incoming pod's pod (anti) affinity. Keys that don't exist in the incoming pod labels will be ignored. The default value is empty. The same key is forbidden to exist in both mismatchLabelKeys and labelSelector. Also, mismatchLabelKeys cannot be set when labelSelector isn't set. This is a beta field and requires enabling MatchLabelKeysInPodAffinity feature gate (enabled by default). |
| `namespaceSelector` | `object` | A label selector is a label query over a set of resources. The result of matchLabels and matchExpressions are ANDed. An empty label selector matches all objects. A null label selector matches no objects. |
| `namespaces` | `array` | namespaces specifies a static list of namespace names that the term applies to. The term is applied to the union of the namespaces listed in this field and the ones selected by namespaceSelector. null or empty namespaces list and null namespaceSelector means "this pod's namespace". |
| `topologyKey` | `string` | This pod should be co-located (affinity) or not co-located (anti-affinity) with the pods matching the labelSelector in the specified namespaces, where co-located is defined as running on a node whose value of the label with key topologyKey matches that of any node on which any of the selected pods is running. Empty topologyKey is not allowed. |

### [#](#spectemplatespecaffinitypodaffinityrequiredduringschedulingignoredduringexecutionlabelselector).spec.template.spec.affinity.podAffinity.requiredDuringSchedulingIgnoredDuringExecution[].labelSelector

描述A label selector is a label query over a set of resources. The result of matchLabels and matchExpressions are ANDed. An empty label selector matches all objects. A null label selector matches no objects.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `matchExpressions` | `array` | matchExpressions is a list of label selector requirements. The requirements are ANDed. |
| `matchLabels` | `object` | matchLabels is a map of {key,value} pairs. A single {key,value} in the matchLabels map is equivalent to an element of matchExpressions, whose key field is "key", the operator is "In", and the values array contains only "value". The requirements are ANDed. |

### [#](#spectemplatespecaffinitypodaffinityrequiredduringschedulingignoredduringexecutionlabelselectormatchexpressions).spec.template.spec.affinity.podAffinity.requiredDuringSchedulingIgnoredDuringExecution[].labelSelector.matchExpressions

描述matchExpressions is a list of label selector requirements. The requirements are ANDed.类型`array`### [#](#spectemplatespecaffinitypodaffinityrequiredduringschedulingignoredduringexecutionlabelselectormatchexpressions-1).spec.template.spec.affinity.podAffinity.requiredDuringSchedulingIgnoredDuringExecution[].labelSelector.matchExpressions[]

描述A label selector requirement is a selector that contains values, a key, and an operator that relates the key and values.类型`object`必填`key``operator`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `key` | `string` | key is the label key that the selector applies to. |
| `operator` | `string` | operator represents a key's relationship to a set of values. Valid operators are In, NotIn, Exists and DoesNotExist. |
| `values` | `array` | values is an array of string values. If the operator is In or NotIn, the values array must be non-empty. If the operator is Exists or DoesNotExist, the values array must be empty. This array is replaced during a strategic merge patch. |

### [#](#spectemplatespecaffinitypodaffinityrequiredduringschedulingignoredduringexecutionlabelselectormatchexpressionsvalues).spec.template.spec.affinity.podAffinity.requiredDuringSchedulingIgnoredDuringExecution[].labelSelector.matchExpressions[].values

描述values is an array of string values. If the operator is In or NotIn, the values array must be non-empty. If the operator is Exists or DoesNotExist, the values array must be empty. This array is replaced during a strategic merge patch.类型`array`### [#](#spectemplatespecaffinitypodaffinityrequiredduringschedulingignoredduringexecutionlabelselectormatchexpressionsvalues-1).spec.template.spec.affinity.podAffinity.requiredDuringSchedulingIgnoredDuringExecution[].labelSelector.matchExpressions[].values[]

类型`string`### [#](#spectemplatespecaffinitypodaffinityrequiredduringschedulingignoredduringexecutionlabelselectormatchlabels).spec.template.spec.affinity.podAffinity.requiredDuringSchedulingIgnoredDuringExecution[].labelSelector.matchLabels

描述matchLabels is a map of {key,value} pairs. A single {key,value} in the matchLabels map is equivalent to an element of matchExpressions, whose key field is "key", the operator is "In", and the values array contains only "value". The requirements are ANDed.类型`object`### [#](#spectemplatespecaffinitypodaffinityrequiredduringschedulingignoredduringexecutionmatchlabelkeys).spec.template.spec.affinity.podAffinity.requiredDuringSchedulingIgnoredDuringExecution[].matchLabelKeys

描述MatchLabelKeys is a set of pod label keys to select which pods will be taken into consideration. The keys are used to lookup values from the incoming pod labels, those key-value labels are merged with `labelSelector` as `key in (value)` to select the group of existing pods which pods will be taken into consideration for the incoming pod's pod (anti) affinity. Keys that don't exist in the incoming pod labels will be ignored. The default value is empty. The same key is forbidden to exist in both matchLabelKeys and labelSelector. Also, matchLabelKeys cannot be set when labelSelector isn't set. This is a beta field and requires enabling MatchLabelKeysInPodAffinity feature gate (enabled by default).类型`array`### [#](#spectemplatespecaffinitypodaffinityrequiredduringschedulingignoredduringexecutionmatchlabelkeys-1).spec.template.spec.affinity.podAffinity.requiredDuringSchedulingIgnoredDuringExecution[].matchLabelKeys[]

类型`string`### [#](#spectemplatespecaffinitypodaffinityrequiredduringschedulingignoredduringexecutionmismatchlabelkeys).spec.template.spec.affinity.podAffinity.requiredDuringSchedulingIgnoredDuringExecution[].mismatchLabelKeys

描述MismatchLabelKeys is a set of pod label keys to select which pods will be taken into consideration. The keys are used to lookup values from the incoming pod labels, those key-value labels are merged with `labelSelector` as `key notin (value)` to select the group of existing pods which pods will be taken into consideration for the incoming pod's pod (anti) affinity. Keys that don't exist in the incoming pod labels will be ignored. The default value is empty. The same key is forbidden to exist in both mismatchLabelKeys and labelSelector. Also, mismatchLabelKeys cannot be set when labelSelector isn't set. This is a beta field and requires enabling MatchLabelKeysInPodAffinity feature gate (enabled by default).类型`array`### [#](#spectemplatespecaffinitypodaffinityrequiredduringschedulingignoredduringexecutionmismatchlabelkeys-1).spec.template.spec.affinity.podAffinity.requiredDuringSchedulingIgnoredDuringExecution[].mismatchLabelKeys[]

类型`string`### [#](#spectemplatespecaffinitypodaffinityrequiredduringschedulingignoredduringexecutionnamespaceselector).spec.template.spec.affinity.podAffinity.requiredDuringSchedulingIgnoredDuringExecution[].namespaceSelector

描述A label selector is a label query over a set of resources. The result of matchLabels and matchExpressions are ANDed. An empty label selector matches all objects. A null label selector matches no objects.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `matchExpressions` | `array` | matchExpressions is a list of label selector requirements. The requirements are ANDed. |
| `matchLabels` | `object` | matchLabels is a map of {key,value} pairs. A single {key,value} in the matchLabels map is equivalent to an element of matchExpressions, whose key field is "key", the operator is "In", and the values array contains only "value". The requirements are ANDed. |

### [#](#spectemplatespecaffinitypodaffinityrequiredduringschedulingignoredduringexecutionnamespaceselectormatchexpressions).spec.template.spec.affinity.podAffinity.requiredDuringSchedulingIgnoredDuringExecution[].namespaceSelector.matchExpressions

描述matchExpressions is a list of label selector requirements. The requirements are ANDed.类型`array`### [#](#spectemplatespecaffinitypodaffinityrequiredduringschedulingignoredduringexecutionnamespaceselectormatchexpressions-1).spec.template.spec.affinity.podAffinity.requiredDuringSchedulingIgnoredDuringExecution[].namespaceSelector.matchExpressions[]

描述A label selector requirement is a selector that contains values, a key, and an operator that relates the key and values.类型`object`必填`key``operator`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `key` | `string` | key is the label key that the selector applies to. |
| `operator` | `string` | operator represents a key's relationship to a set of values. Valid operators are In, NotIn, Exists and DoesNotExist. |
| `values` | `array` | values is an array of string values. If the operator is In or NotIn, the values array must be non-empty. If the operator is Exists or DoesNotExist, the values array must be empty. This array is replaced during a strategic merge patch. |

### [#](#spectemplatespecaffinitypodaffinityrequiredduringschedulingignoredduringexecutionnamespaceselectormatchexpressionsvalues).spec.template.spec.affinity.podAffinity.requiredDuringSchedulingIgnoredDuringExecution[].namespaceSelector.matchExpressions[].values

描述values is an array of string values. If the operator is In or NotIn, the values array must be non-empty. If the operator is Exists or DoesNotExist, the values array must be empty. This array is replaced during a strategic merge patch.类型`array`### [#](#spectemplatespecaffinitypodaffinityrequiredduringschedulingignoredduringexecutionnamespaceselectormatchexpressionsvalues-1).spec.template.spec.affinity.podAffinity.requiredDuringSchedulingIgnoredDuringExecution[].namespaceSelector.matchExpressions[].values[]

类型`string`### [#](#spectemplatespecaffinitypodaffinityrequiredduringschedulingignoredduringexecutionnamespaceselectormatchlabels).spec.template.spec.affinity.podAffinity.requiredDuringSchedulingIgnoredDuringExecution[].namespaceSelector.matchLabels

描述matchLabels is a map of {key,value} pairs. A single {key,value} in the matchLabels map is equivalent to an element of matchExpressions, whose key field is "key", the operator is "In", and the values array contains only "value". The requirements are ANDed.类型`object`### [#](#spectemplatespecaffinitypodaffinityrequiredduringschedulingignoredduringexecutionnamespaces).spec.template.spec.affinity.podAffinity.requiredDuringSchedulingIgnoredDuringExecution[].namespaces

描述namespaces specifies a static list of namespace names that the term applies to. The term is applied to the union of the namespaces listed in this field and the ones selected by namespaceSelector. null or empty namespaces list and null namespaceSelector means "this pod's namespace".类型`array`### [#](#spectemplatespecaffinitypodaffinityrequiredduringschedulingignoredduringexecutionnamespaces-1).spec.template.spec.affinity.podAffinity.requiredDuringSchedulingIgnoredDuringExecution[].namespaces[]

类型`string`### [#](#spectemplatespecaffinitypodantiaffinity).spec.template.spec.affinity.podAntiAffinity

描述Pod anti affinity is a group of inter pod anti affinity scheduling rules.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `preferredDuringSchedulingIgnoredDuringExecution` | `array` | The scheduler will prefer to schedule pods to nodes that satisfy the anti-affinity expressions specified by this field, but it may choose a node that violates one or more of the expressions. The node that is most preferred is the one with the greatest sum of weights, i.e. for each node that meets all of the scheduling requirements (resource request, requiredDuringScheduling anti-affinity expressions, etc.), compute a sum by iterating through the elements of this field and adding "weight" to the sum if the node has pods which matches the corresponding podAffinityTerm; the node(s) with the highest sum are the most preferred. |
| `requiredDuringSchedulingIgnoredDuringExecution` | `array` | If the anti-affinity requirements specified by this field are not met at scheduling time, the pod will not be scheduled onto the node. If the anti-affinity requirements specified by this field cease to be met at some point during pod execution (e.g. due to a pod label update), the system may or may not try to eventually evict the pod from its node. When there are multiple elements, the lists of nodes corresponding to each podAffinityTerm are intersected, i.e. all terms must be satisfied. |

### [#](#spectemplatespecaffinitypodantiaffinitypreferredduringschedulingignoredduringexecution).spec.template.spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution

描述The scheduler will prefer to schedule pods to nodes that satisfy the anti-affinity expressions specified by this field, but it may choose a node that violates one or more of the expressions. The node that is most preferred is the one with the greatest sum of weights, i.e. for each node that meets all of the scheduling requirements (resource request, requiredDuringScheduling anti-affinity expressions, etc.), compute a sum by iterating through the elements of this field and adding "weight" to the sum if the node has pods which matches the corresponding podAffinityTerm; the node(s) with the highest sum are the most preferred.类型`array`### [#](#spectemplatespecaffinitypodantiaffinitypreferredduringschedulingignoredduringexecution-1).spec.template.spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution[]

描述The weights of all of the matched WeightedPodAffinityTerm fields are added per-node to find the most preferred node(s)类型`object`必填`weight``podAffinityTerm`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `podAffinityTerm` | `object` | Defines a set of pods (namely those matching the labelSelector relative to the given namespace(s)) that this pod should be co-located (affinity) or not co-located (anti-affinity) with, where co-located is defined as running on a node whose value of the label with key  matches that of any node on which a pod of the set of pods is running |
| `weight` | `integer` | weight associated with matching the corresponding podAffinityTerm, in the range 1-100. |

### [#](#spectemplatespecaffinitypodantiaffinitypreferredduringschedulingignoredduringexecutionpodaffinityterm).spec.template.spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution[].podAffinityTerm

描述Defines a set of pods (namely those matching the labelSelector relative to the given namespace(s)) that this pod should be co-located (affinity) or not co-located (anti-affinity) with, where co-located is defined as running on a node whose value of the label with key <topologyKey> matches that of any node on which a pod of the set of pods is running类型`object`必填`topologyKey`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `labelSelector` | `object` | A label selector is a label query over a set of resources. The result of matchLabels and matchExpressions are ANDed. An empty label selector matches all objects. A null label selector matches no objects. |
| `matchLabelKeys` | `array` | MatchLabelKeys is a set of pod label keys to select which pods will be taken into consideration. The keys are used to lookup values from the incoming pod labels, those key-value labels are merged with `labelSelector` as `key in (value)` to select the group of existing pods which pods will be taken into consideration for the incoming pod's pod (anti) affinity. Keys that don't exist in the incoming pod labels will be ignored. The default value is empty. The same key is forbidden to exist in both matchLabelKeys and labelSelector. Also, matchLabelKeys cannot be set when labelSelector isn't set. This is a beta field and requires enabling MatchLabelKeysInPodAffinity feature gate (enabled by default). |
| `mismatchLabelKeys` | `array` | MismatchLabelKeys is a set of pod label keys to select which pods will be taken into consideration. The keys are used to lookup values from the incoming pod labels, those key-value labels are merged with `labelSelector` as `key notin (value)` to select the group of existing pods which pods will be taken into consideration for the incoming pod's pod (anti) affinity. Keys that don't exist in the incoming pod labels will be ignored. The default value is empty. The same key is forbidden to exist in both mismatchLabelKeys and labelSelector. Also, mismatchLabelKeys cannot be set when labelSelector isn't set. This is a beta field and requires enabling MatchLabelKeysInPodAffinity feature gate (enabled by default). |
| `namespaceSelector` | `object` | A label selector is a label query over a set of resources. The result of matchLabels and matchExpressions are ANDed. An empty label selector matches all objects. A null label selector matches no objects. |
| `namespaces` | `array` | namespaces specifies a static list of namespace names that the term applies to. The term is applied to the union of the namespaces listed in this field and the ones selected by namespaceSelector. null or empty namespaces list and null namespaceSelector means "this pod's namespace". |
| `topologyKey` | `string` | This pod should be co-located (affinity) or not co-located (anti-affinity) with the pods matching the labelSelector in the specified namespaces, where co-located is defined as running on a node whose value of the label with key topologyKey matches that of any node on which any of the selected pods is running. Empty topologyKey is not allowed. |

### [#](#spectemplatespecaffinitypodantiaffinitypreferredduringschedulingignoredduringexecutionpodaffinitytermlabelselector).spec.template.spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution[].podAffinityTerm.labelSelector

描述A label selector is a label query over a set of resources. The result of matchLabels and matchExpressions are ANDed. An empty label selector matches all objects. A null label selector matches no objects.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `matchExpressions` | `array` | matchExpressions is a list of label selector requirements. The requirements are ANDed. |
| `matchLabels` | `object` | matchLabels is a map of {key,value} pairs. A single {key,value} in the matchLabels map is equivalent to an element of matchExpressions, whose key field is "key", the operator is "In", and the values array contains only "value". The requirements are ANDed. |

### [#](#spectemplatespecaffinitypodantiaffinitypreferredduringschedulingignoredduringexecutionpodaffinitytermlabelselectormatchexpressions).spec.template.spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution[].podAffinityTerm.labelSelector.matchExpressions

描述matchExpressions is a list of label selector requirements. The requirements are ANDed.类型`array`### [#](#spectemplatespecaffinitypodantiaffinitypreferredduringschedulingignoredduringexecutionpodaffinitytermlabelselectormatchexpressions-1).spec.template.spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution[].podAffinityTerm.labelSelector.matchExpressions[]

描述A label selector requirement is a selector that contains values, a key, and an operator that relates the key and values.类型`object`必填`key``operator`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `key` | `string` | key is the label key that the selector applies to. |
| `operator` | `string` | operator represents a key's relationship to a set of values. Valid operators are In, NotIn, Exists and DoesNotExist. |
| `values` | `array` | values is an array of string values. If the operator is In or NotIn, the values array must be non-empty. If the operator is Exists or DoesNotExist, the values array must be empty. This array is replaced during a strategic merge patch. |

### [#](#spectemplatespecaffinitypodantiaffinitypreferredduringschedulingignoredduringexecutionpodaffinitytermlabelselectormatchexpressionsvalues).spec.template.spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution[].podAffinityTerm.labelSelector.matchExpressions[].values

描述values is an array of string values. If the operator is In or NotIn, the values array must be non-empty. If the operator is Exists or DoesNotExist, the values array must be empty. This array is replaced during a strategic merge patch.类型`array`### [#](#spectemplatespecaffinitypodantiaffinitypreferredduringschedulingignoredduringexecutionpodaffinitytermlabelselectormatchexpressionsvalues-1).spec.template.spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution[].podAffinityTerm.labelSelector.matchExpressions[].values[]

类型`string`### [#](#spectemplatespecaffinitypodantiaffinitypreferredduringschedulingignoredduringexecutionpodaffinitytermlabelselectormatchlabels).spec.template.spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution[].podAffinityTerm.labelSelector.matchLabels

描述matchLabels is a map of {key,value} pairs. A single {key,value} in the matchLabels map is equivalent to an element of matchExpressions, whose key field is "key", the operator is "In", and the values array contains only "value". The requirements are ANDed.类型`object`### [#](#spectemplatespecaffinitypodantiaffinitypreferredduringschedulingignoredduringexecutionpodaffinitytermmatchlabelkeys).spec.template.spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution[].podAffinityTerm.matchLabelKeys

描述MatchLabelKeys is a set of pod label keys to select which pods will be taken into consideration. The keys are used to lookup values from the incoming pod labels, those key-value labels are merged with `labelSelector` as `key in (value)` to select the group of existing pods which pods will be taken into consideration for the incoming pod's pod (anti) affinity. Keys that don't exist in the incoming pod labels will be ignored. The default value is empty. The same key is forbidden to exist in both matchLabelKeys and labelSelector. Also, matchLabelKeys cannot be set when labelSelector isn't set. This is a beta field and requires enabling MatchLabelKeysInPodAffinity feature gate (enabled by default).类型`array`### [#](#spectemplatespecaffinitypodantiaffinitypreferredduringschedulingignoredduringexecutionpodaffinitytermmatchlabelkeys-1).spec.template.spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution[].podAffinityTerm.matchLabelKeys[]

类型`string`### [#](#spectemplatespecaffinitypodantiaffinitypreferredduringschedulingignoredduringexecutionpodaffinitytermmismatchlabelkeys).spec.template.spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution[].podAffinityTerm.mismatchLabelKeys

描述MismatchLabelKeys is a set of pod label keys to select which pods will be taken into consideration. The keys are used to lookup values from the incoming pod labels, those key-value labels are merged with `labelSelector` as `key notin (value)` to select the group of existing pods which pods will be taken into consideration for the incoming pod's pod (anti) affinity. Keys that don't exist in the incoming pod labels will be ignored. The default value is empty. The same key is forbidden to exist in both mismatchLabelKeys and labelSelector. Also, mismatchLabelKeys cannot be set when labelSelector isn't set. This is a beta field and requires enabling MatchLabelKeysInPodAffinity feature gate (enabled by default).类型`array`### [#](#spectemplatespecaffinitypodantiaffinitypreferredduringschedulingignoredduringexecutionpodaffinitytermmismatchlabelkeys-1).spec.template.spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution[].podAffinityTerm.mismatchLabelKeys[]

类型`string`### [#](#spectemplatespecaffinitypodantiaffinitypreferredduringschedulingignoredduringexecutionpodaffinitytermnamespaceselector).spec.template.spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution[].podAffinityTerm.namespaceSelector

描述A label selector is a label query over a set of resources. The result of matchLabels and matchExpressions are ANDed. An empty label selector matches all objects. A null label selector matches no objects.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `matchExpressions` | `array` | matchExpressions is a list of label selector requirements. The requirements are ANDed. |
| `matchLabels` | `object` | matchLabels is a map of {key,value} pairs. A single {key,value} in the matchLabels map is equivalent to an element of matchExpressions, whose key field is "key", the operator is "In", and the values array contains only "value". The requirements are ANDed. |

### [#](#spectemplatespecaffinitypodantiaffinitypreferredduringschedulingignoredduringexecutionpodaffinitytermnamespaceselectormatchexpressions).spec.template.spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution[].podAffinityTerm.namespaceSelector.matchExpressions

描述matchExpressions is a list of label selector requirements. The requirements are ANDed.类型`array`### [#](#spectemplatespecaffinitypodantiaffinitypreferredduringschedulingignoredduringexecutionpodaffinitytermnamespaceselectormatchexpressions-1).spec.template.spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution[].podAffinityTerm.namespaceSelector.matchExpressions[]

描述A label selector requirement is a selector that contains values, a key, and an operator that relates the key and values.类型`object`必填`key``operator`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `key` | `string` | key is the label key that the selector applies to. |
| `operator` | `string` | operator represents a key's relationship to a set of values. Valid operators are In, NotIn, Exists and DoesNotExist. |
| `values` | `array` | values is an array of string values. If the operator is In or NotIn, the values array must be non-empty. If the operator is Exists or DoesNotExist, the values array must be empty. This array is replaced during a strategic merge patch. |

### [#](#spectemplatespecaffinitypodantiaffinitypreferredduringschedulingignoredduringexecutionpodaffinitytermnamespaceselectormatchexpressionsvalues).spec.template.spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution[].podAffinityTerm.namespaceSelector.matchExpressions[].values

描述values is an array of string values. If the operator is In or NotIn, the values array must be non-empty. If the operator is Exists or DoesNotExist, the values array must be empty. This array is replaced during a strategic merge patch.类型`array`### [#](#spectemplatespecaffinitypodantiaffinitypreferredduringschedulingignoredduringexecutionpodaffinitytermnamespaceselectormatchexpressionsvalues-1).spec.template.spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution[].podAffinityTerm.namespaceSelector.matchExpressions[].values[]

类型`string`### [#](#spectemplatespecaffinitypodantiaffinitypreferredduringschedulingignoredduringexecutionpodaffinitytermnamespaceselectormatchlabels).spec.template.spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution[].podAffinityTerm.namespaceSelector.matchLabels

描述matchLabels is a map of {key,value} pairs. A single {key,value} in the matchLabels map is equivalent to an element of matchExpressions, whose key field is "key", the operator is "In", and the values array contains only "value". The requirements are ANDed.类型`object`### [#](#spectemplatespecaffinitypodantiaffinitypreferredduringschedulingignoredduringexecutionpodaffinitytermnamespaces).spec.template.spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution[].podAffinityTerm.namespaces

描述namespaces specifies a static list of namespace names that the term applies to. The term is applied to the union of the namespaces listed in this field and the ones selected by namespaceSelector. null or empty namespaces list and null namespaceSelector means "this pod's namespace".类型`array`### [#](#spectemplatespecaffinitypodantiaffinitypreferredduringschedulingignoredduringexecutionpodaffinitytermnamespaces-1).spec.template.spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution[].podAffinityTerm.namespaces[]

类型`string`### [#](#spectemplatespecaffinitypodantiaffinityrequiredduringschedulingignoredduringexecution).spec.template.spec.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution

描述If the anti-affinity requirements specified by this field are not met at scheduling time, the pod will not be scheduled onto the node. If the anti-affinity requirements specified by this field cease to be met at some point during pod execution (e.g. due to a pod label update), the system may or may not try to eventually evict the pod from its node. When there are multiple elements, the lists of nodes corresponding to each podAffinityTerm are intersected, i.e. all terms must be satisfied.类型`array`### [#](#spectemplatespecaffinitypodantiaffinityrequiredduringschedulingignoredduringexecution-1).spec.template.spec.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution[]

描述Defines a set of pods (namely those matching the labelSelector relative to the given namespace(s)) that this pod should be co-located (affinity) or not co-located (anti-affinity) with, where co-located is defined as running on a node whose value of the label with key <topologyKey> matches that of any node on which a pod of the set of pods is running类型`object`必填`topologyKey`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `labelSelector` | `object` | A label selector is a label query over a set of resources. The result of matchLabels and matchExpressions are ANDed. An empty label selector matches all objects. A null label selector matches no objects. |
| `matchLabelKeys` | `array` | MatchLabelKeys is a set of pod label keys to select which pods will be taken into consideration. The keys are used to lookup values from the incoming pod labels, those key-value labels are merged with `labelSelector` as `key in (value)` to select the group of existing pods which pods will be taken into consideration for the incoming pod's pod (anti) affinity. Keys that don't exist in the incoming pod labels will be ignored. The default value is empty. The same key is forbidden to exist in both matchLabelKeys and labelSelector. Also, matchLabelKeys cannot be set when labelSelector isn't set. This is a beta field and requires enabling MatchLabelKeysInPodAffinity feature gate (enabled by default). |
| `mismatchLabelKeys` | `array` | MismatchLabelKeys is a set of pod label keys to select which pods will be taken into consideration. The keys are used to lookup values from the incoming pod labels, those key-value labels are merged with `labelSelector` as `key notin (value)` to select the group of existing pods which pods will be taken into consideration for the incoming pod's pod (anti) affinity. Keys that don't exist in the incoming pod labels will be ignored. The default value is empty. The same key is forbidden to exist in both mismatchLabelKeys and labelSelector. Also, mismatchLabelKeys cannot be set when labelSelector isn't set. This is a beta field and requires enabling MatchLabelKeysInPodAffinity feature gate (enabled by default). |
| `namespaceSelector` | `object` | A label selector is a label query over a set of resources. The result of matchLabels and matchExpressions are ANDed. An empty label selector matches all objects. A null label selector matches no objects. |
| `namespaces` | `array` | namespaces specifies a static list of namespace names that the term applies to. The term is applied to the union of the namespaces listed in this field and the ones selected by namespaceSelector. null or empty namespaces list and null namespaceSelector means "this pod's namespace". |
| `topologyKey` | `string` | This pod should be co-located (affinity) or not co-located (anti-affinity) with the pods matching the labelSelector in the specified namespaces, where co-located is defined as running on a node whose value of the label with key topologyKey matches that of any node on which any of the selected pods is running. Empty topologyKey is not allowed. |

### [#](#spectemplatespecaffinitypodantiaffinityrequiredduringschedulingignoredduringexecutionlabelselector).spec.template.spec.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution[].labelSelector

描述A label selector is a label query over a set of resources. The result of matchLabels and matchExpressions are ANDed. An empty label selector matches all objects. A null label selector matches no objects.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `matchExpressions` | `array` | matchExpressions is a list of label selector requirements. The requirements are ANDed. |
| `matchLabels` | `object` | matchLabels is a map of {key,value} pairs. A single {key,value} in the matchLabels map is equivalent to an element of matchExpressions, whose key field is "key", the operator is "In", and the values array contains only "value". The requirements are ANDed. |

### [#](#spectemplatespecaffinitypodantiaffinityrequiredduringschedulingignoredduringexecutionlabelselectormatchexpressions).spec.template.spec.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution[].labelSelector.matchExpressions

描述matchExpressions is a list of label selector requirements. The requirements are ANDed.类型`array`### [#](#spectemplatespecaffinitypodantiaffinityrequiredduringschedulingignoredduringexecutionlabelselectormatchexpressions-1).spec.template.spec.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution[].labelSelector.matchExpressions[]

描述A label selector requirement is a selector that contains values, a key, and an operator that relates the key and values.类型`object`必填`key``operator`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `key` | `string` | key is the label key that the selector applies to. |
| `operator` | `string` | operator represents a key's relationship to a set of values. Valid operators are In, NotIn, Exists and DoesNotExist. |
| `values` | `array` | values is an array of string values. If the operator is In or NotIn, the values array must be non-empty. If the operator is Exists or DoesNotExist, the values array must be empty. This array is replaced during a strategic merge patch. |

### [#](#spectemplatespecaffinitypodantiaffinityrequiredduringschedulingignoredduringexecutionlabelselectormatchexpressionsvalues).spec.template.spec.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution[].labelSelector.matchExpressions[].values

描述values is an array of string values. If the operator is In or NotIn, the values array must be non-empty. If the operator is Exists or DoesNotExist, the values array must be empty. This array is replaced during a strategic merge patch.类型`array`### [#](#spectemplatespecaffinitypodantiaffinityrequiredduringschedulingignoredduringexecutionlabelselectormatchexpressionsvalues-1).spec.template.spec.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution[].labelSelector.matchExpressions[].values[]

类型`string`### [#](#spectemplatespecaffinitypodantiaffinityrequiredduringschedulingignoredduringexecutionlabelselectormatchlabels).spec.template.spec.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution[].labelSelector.matchLabels

描述matchLabels is a map of {key,value} pairs. A single {key,value} in the matchLabels map is equivalent to an element of matchExpressions, whose key field is "key", the operator is "In", and the values array contains only "value". The requirements are ANDed.类型`object`### [#](#spectemplatespecaffinitypodantiaffinityrequiredduringschedulingignoredduringexecutionmatchlabelkeys).spec.template.spec.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution[].matchLabelKeys

描述MatchLabelKeys is a set of pod label keys to select which pods will be taken into consideration. The keys are used to lookup values from the incoming pod labels, those key-value labels are merged with `labelSelector` as `key in (value)` to select the group of existing pods which pods will be taken into consideration for the incoming pod's pod (anti) affinity. Keys that don't exist in the incoming pod labels will be ignored. The default value is empty. The same key is forbidden to exist in both matchLabelKeys and labelSelector. Also, matchLabelKeys cannot be set when labelSelector isn't set. This is a beta field and requires enabling MatchLabelKeysInPodAffinity feature gate (enabled by default).类型`array`### [#](#spectemplatespecaffinitypodantiaffinityrequiredduringschedulingignoredduringexecutionmatchlabelkeys-1).spec.template.spec.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution[].matchLabelKeys[]

类型`string`### [#](#spectemplatespecaffinitypodantiaffinityrequiredduringschedulingignoredduringexecutionmismatchlabelkeys).spec.template.spec.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution[].mismatchLabelKeys

描述MismatchLabelKeys is a set of pod label keys to select which pods will be taken into consideration. The keys are used to lookup values from the incoming pod labels, those key-value labels are merged with `labelSelector` as `key notin (value)` to select the group of existing pods which pods will be taken into consideration for the incoming pod's pod (anti) affinity. Keys that don't exist in the incoming pod labels will be ignored. The default value is empty. The same key is forbidden to exist in both mismatchLabelKeys and labelSelector. Also, mismatchLabelKeys cannot be set when labelSelector isn't set. This is a beta field and requires enabling MatchLabelKeysInPodAffinity feature gate (enabled by default).类型`array`### [#](#spectemplatespecaffinitypodantiaffinityrequiredduringschedulingignoredduringexecutionmismatchlabelkeys-1).spec.template.spec.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution[].mismatchLabelKeys[]

类型`string`### [#](#spectemplatespecaffinitypodantiaffinityrequiredduringschedulingignoredduringexecutionnamespaceselector).spec.template.spec.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution[].namespaceSelector

描述A label selector is a label query over a set of resources. The result of matchLabels and matchExpressions are ANDed. An empty label selector matches all objects. A null label selector matches no objects.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `matchExpressions` | `array` | matchExpressions is a list of label selector requirements. The requirements are ANDed. |
| `matchLabels` | `object` | matchLabels is a map of {key,value} pairs. A single {key,value} in the matchLabels map is equivalent to an element of matchExpressions, whose key field is "key", the operator is "In", and the values array contains only "value". The requirements are ANDed. |

### [#](#spectemplatespecaffinitypodantiaffinityrequiredduringschedulingignoredduringexecutionnamespaceselectormatchexpressions).spec.template.spec.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution[].namespaceSelector.matchExpressions

描述matchExpressions is a list of label selector requirements. The requirements are ANDed.类型`array`### [#](#spectemplatespecaffinitypodantiaffinityrequiredduringschedulingignoredduringexecutionnamespaceselectormatchexpressions-1).spec.template.spec.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution[].namespaceSelector.matchExpressions[]

描述A label selector requirement is a selector that contains values, a key, and an operator that relates the key and values.类型`object`必填`key``operator`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `key` | `string` | key is the label key that the selector applies to. |
| `operator` | `string` | operator represents a key's relationship to a set of values. Valid operators are In, NotIn, Exists and DoesNotExist. |
| `values` | `array` | values is an array of string values. If the operator is In or NotIn, the values array must be non-empty. If the operator is Exists or DoesNotExist, the values array must be empty. This array is replaced during a strategic merge patch. |

### [#](#spectemplatespecaffinitypodantiaffinityrequiredduringschedulingignoredduringexecutionnamespaceselectormatchexpressionsvalues).spec.template.spec.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution[].namespaceSelector.matchExpressions[].values

描述values is an array of string values. If the operator is In or NotIn, the values array must be non-empty. If the operator is Exists or DoesNotExist, the values array must be empty. This array is replaced during a strategic merge patch.类型`array`### [#](#spectemplatespecaffinitypodantiaffinityrequiredduringschedulingignoredduringexecutionnamespaceselectormatchexpressionsvalues-1).spec.template.spec.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution[].namespaceSelector.matchExpressions[].values[]

类型`string`### [#](#spectemplatespecaffinitypodantiaffinityrequiredduringschedulingignoredduringexecutionnamespaceselectormatchlabels).spec.template.spec.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution[].namespaceSelector.matchLabels

描述matchLabels is a map of {key,value} pairs. A single {key,value} in the matchLabels map is equivalent to an element of matchExpressions, whose key field is "key", the operator is "In", and the values array contains only "value". The requirements are ANDed.类型`object`### [#](#spectemplatespecaffinitypodantiaffinityrequiredduringschedulingignoredduringexecutionnamespaces).spec.template.spec.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution[].namespaces

描述namespaces specifies a static list of namespace names that the term applies to. The term is applied to the union of the namespaces listed in this field and the ones selected by namespaceSelector. null or empty namespaces list and null namespaceSelector means "this pod's namespace".类型`array`### [#](#spectemplatespecaffinitypodantiaffinityrequiredduringschedulingignoredduringexecutionnamespaces-1).spec.template.spec.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution[].namespaces[]

类型`string`### [#](#spectemplatespeccontainers).spec.template.spec.containers

描述List of containers belonging to the pod. Containers cannot currently be added or removed. There must be at least one container in a Pod. Cannot be updated.类型`array`### [#](#spectemplatespeccontainers-1).spec.template.spec.containers[]

描述A single application container that you want to run within a pod.类型`object`必填`name`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `args` | `array` | Arguments to the entrypoint. The container image's CMD is used if this is not provided. Variable references $(VAR_NAME) are expanded using the container's environment. If a variable cannot be resolved, the reference in the input string will be unchanged. Double $$ are reduced to a single $, which allows for escaping the $(VAR_NAME) syntax: i.e. "$$(VAR_NAME)" will produce the string literal "$(VAR_NAME)". Escaped references will never be expanded, regardless of whether the variable exists or not. Cannot be updated. More info: [https://kubernetes.io/docs/tasks/inject-data-application/define-command-argument-container/#running-a-command-in-a-shell](https://kubernetes.io/docs/tasks/inject-data-application/define-command-argument-container/#running-a-command-in-a-shell) |
| `command` | `array` | Entrypoint array. Not executed within a shell. The container image's ENTRYPOINT is used if this is not provided. Variable references $(VAR_NAME) are expanded using the container's environment. If a variable cannot be resolved, the reference in the input string will be unchanged. Double $$ are reduced to a single $, which allows for escaping the $(VAR_NAME) syntax: i.e. "$$(VAR_NAME)" will produce the string literal "$(VAR_NAME)". Escaped references will never be expanded, regardless of whether the variable exists or not. Cannot be updated. More info: [https://kubernetes.io/docs/tasks/inject-data-application/define-command-argument-container/#running-a-command-in-a-shell](https://kubernetes.io/docs/tasks/inject-data-application/define-command-argument-container/#running-a-command-in-a-shell) |
| `env` | `array` | List of environment variables to set in the container. Cannot be updated. |
| `envFrom` | `array` | List of sources to populate environment variables in the container. The keys defined within a source must be a C_IDENTIFIER. All invalid keys will be reported as an event when the container is starting. When a key exists in multiple sources, the value associated with the last source will take precedence. Values defined by an Env with a duplicate key will take precedence. Cannot be updated. |
| `image` | `string` | Container image name. More info: [https://kubernetes.io/docs/concepts/containers/images](https://kubernetes.io/docs/concepts/containers/images) This field is optional to allow higher level config management to default or override container images in workload controllers like Deployments and StatefulSets. |
| `imagePullPolicy` | `string` | Image pull policy. One of Always, Never, IfNotPresent. Defaults to Always if :latest tag is specified, or IfNotPresent otherwise. Cannot be updated. More info: [https://kubernetes.io/docs/concepts/containers/images#updating-images](https://kubernetes.io/docs/concepts/containers/images#updating-images)


Possible enum values:



- `"Always"` means that kubelet always attempts to pull the latest image. Container will fail If the pull fails.

- `"IfNotPresent"` means that kubelet pulls if the image isn't present on disk. Container will fail if the image isn't present and the pull fails.

- `"Never"` means that kubelet never pulls an image, but only uses a local image. Container will fail if the image isn't present |
| `lifecycle` | `object` | Lifecycle describes actions that the management system should take in response to container lifecycle events. For the PostStart and PreStop lifecycle handlers, management of the container blocks until the action is complete, unless the container process fails, in which case the handler is aborted. |
| `livenessProbe` | `object` | Probe describes a health check to be performed against a container to determine whether it is alive or ready to receive traffic. |
| `name` | `string` | Name of the container specified as a DNS_LABEL. Each container in a pod must have a unique name (DNS_LABEL). Cannot be updated. |
| `ports` | `array` | List of ports to expose from the container. Not specifying a port here DOES NOT prevent that port from being exposed. Any port which is listening on the default "0.0.0.0" address inside a container will be accessible from the network. Modifying this array with strategic merge patch may corrupt the data. For more information See [https://github.com/kubernetes/kubernetes/issues/108255](https://github.com/kubernetes/kubernetes/issues/108255). Cannot be updated. |
| `readinessProbe` | `object` | Probe describes a health check to be performed against a container to determine whether it is alive or ready to receive traffic. |
| `resizePolicy` | `array` | Resources resize policy for the container. |
| `resources` | `object` | ResourceRequirements describes the compute resource requirements. |
| `restartPolicy` | `string` | RestartPolicy defines the restart behavior of individual containers in a pod. This field may only be set for init containers, and the only allowed value is "Always". For non-init containers or when this field is not specified, the restart behavior is defined by the Pod's restart policy and the container type. Setting the RestartPolicy as "Always" for the init container will have the following effect: this init container will be continually restarted on exit until all regular containers have terminated. Once all regular containers have completed, all init containers with restartPolicy "Always" will be shut down. This lifecycle differs from normal init containers and is often referred to as a "sidecar" container. Although this init container still starts in the init container sequence, it does not wait for the container to complete before proceeding to the next init container. Instead, the next init container starts immediately after this init container is started, or after any startupProbe has successfully completed. |
| `securityContext` | `object` | SecurityContext holds security configuration that will be applied to a container. Some fields are present in both SecurityContext and PodSecurityContext.  When both are set, the values in SecurityContext take precedence. |
| `startupProbe` | `object` | Probe describes a health check to be performed against a container to determine whether it is alive or ready to receive traffic. |
| `stdin` | `boolean` | Whether this container should allocate a buffer for stdin in the container runtime. If this is not set, reads from stdin in the container will always result in EOF. Default is false. |
| `stdinOnce` | `boolean` | Whether the container runtime should close the stdin channel after it has been opened by a single attach. When stdin is true the stdin stream will remain open across multiple attach sessions. If stdinOnce is set to true, stdin is opened on container start, is empty until the first client attaches to stdin, and then remains open and accepts data until the client disconnects, at which time stdin is closed and remains closed until the container is restarted. If this flag is false, a container processes that reads from stdin will never receive an EOF. Default is false |
| `terminationMessagePath` | `string` | Optional: Path at which the file to which the container's termination message will be written is mounted into the container's filesystem. Message written is intended to be brief final status, such as an assertion failure message. Will be truncated by the node if greater than 4096 bytes. The total message length across all containers will be limited to 12kb. Defaults to /dev/termination-log. Cannot be updated. |
| `terminationMessagePolicy` | `string` | Indicate how the termination message should be populated. File will use the contents of terminationMessagePath to populate the container status message on both success and failure. FallbackToLogsOnError will use the last chunk of container log output if the termination message file is empty and the container exited with an error. The log output is limited to 2048 bytes or 80 lines, whichever is smaller. Defaults to File. Cannot be updated.


Possible enum values:



- `"FallbackToLogsOnError"` will read the most recent contents of the container logs for the container status message when the container exits with an error and the terminationMessagePath has no contents.

- `"File"` is the default behavior and will set the container status message to the contents of the container's terminationMessagePath when the container exits. |
| `tty` | `boolean` | Whether this container should allocate a TTY for itself, also requires 'stdin' to be true. Default is false. |
| `volumeDevices` | `array` | volumeDevices is the list of block devices to be used by the container. |
| `volumeMounts` | `array` | Pod volumes to mount into the container's filesystem. Cannot be updated. |
| `workingDir` | `string` | Container's working directory. If not specified, the container runtime's default will be used, which might be configured in the container image. Cannot be updated. |

### [#](#spectemplatespeccontainersargs).spec.template.spec.containers[].args

描述Arguments to the entrypoint. The container image's CMD is used if this is not provided. Variable references $(VAR_NAME) are expanded using the container's environment. If a variable cannot be resolved, the reference in the input string will be unchanged. Double $$ are reduced to a single $, which allows for escaping the $(VAR_NAME) syntax: i.e. "$$(VAR_NAME)" will produce the string literal "$(VAR_NAME)". Escaped references will never be expanded, regardless of whether the variable exists or not. Cannot be updated. More info: https://kubernetes.io/docs/tasks/inject-data-application/define-command-argument-container/#running-a-command-in-a-shell类型`array`### [#](#spectemplatespeccontainersargs-1).spec.template.spec.containers[].args[]

类型`string`### [#](#spectemplatespeccontainerscommand).spec.template.spec.containers[].command

描述Entrypoint array. Not executed within a shell. The container image's ENTRYPOINT is used if this is not provided. Variable references $(VAR_NAME) are expanded using the container's environment. If a variable cannot be resolved, the reference in the input string will be unchanged. Double $$ are reduced to a single $, which allows for escaping the $(VAR_NAME) syntax: i.e. "$$(VAR_NAME)" will produce the string literal "$(VAR_NAME)". Escaped references will never be expanded, regardless of whether the variable exists or not. Cannot be updated. More info: https://kubernetes.io/docs/tasks/inject-data-application/define-command-argument-container/#running-a-command-in-a-shell类型`array`### [#](#spectemplatespeccontainerscommand-1).spec.template.spec.containers[].command[]

类型`string`### [#](#spectemplatespeccontainersenv).spec.template.spec.containers[].env

描述List of environment variables to set in the container. Cannot be updated.类型`array`### [#](#spectemplatespeccontainersenv-1).spec.template.spec.containers[].env[]

描述EnvVar represents an environment variable present in a Container.类型`object`必填`name`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `name` | `string` | Name of the environment variable. Must be a C_IDENTIFIER. |
| `value` | `string` | Variable references $(VAR_NAME) are expanded using the previously defined environment variables in the container and any service environment variables. If a variable cannot be resolved, the reference in the input string will be unchanged. Double $$ are reduced to a single $, which allows for escaping the $(VAR_NAME) syntax: i.e. "$$(VAR_NAME)" will produce the string literal "$(VAR_NAME)". Escaped references will never be expanded, regardless of whether the variable exists or not. Defaults to "". |
| `valueFrom` | `object` | EnvVarSource represents a source for the value of an EnvVar. |

### [#](#spectemplatespeccontainersenvvaluefrom).spec.template.spec.containers[].env[].valueFrom

描述EnvVarSource represents a source for the value of an EnvVar.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `configMapKeyRef` | `object` | Selects a key from a ConfigMap. |
| `fieldRef` | `object` | ObjectFieldSelector selects an APIVersioned field of an object. |
| `resourceFieldRef` | `object` | ResourceFieldSelector represents container resources (cpu, memory) and their output format |
| `secretKeyRef` | `object` | SecretKeySelector selects a key of a Secret. |

### [#](#spectemplatespeccontainersenvvaluefromconfigmapkeyref).spec.template.spec.containers[].env[].valueFrom.configMapKeyRef

描述Selects a key from a ConfigMap.类型`object`必填`key`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `key` | `string` | The key to select. |
| `name` | `string` | Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names) |
| `optional` | `boolean` | Specify whether the ConfigMap or its key must be defined |

### [#](#spectemplatespeccontainersenvvaluefromfieldref).spec.template.spec.containers[].env[].valueFrom.fieldRef

描述ObjectFieldSelector selects an APIVersioned field of an object.类型`object`必填`fieldPath`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `apiVersion` | `string` | Version of the schema the FieldPath is written in terms of, defaults to "v1". |
| `fieldPath` | `string` | Path of the field to select in the specified API version. |

### [#](#spectemplatespeccontainersenvvaluefromresourcefieldref).spec.template.spec.containers[].env[].valueFrom.resourceFieldRef

描述ResourceFieldSelector represents container resources (cpu, memory) and their output format类型`object`必填`resource`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `containerName` | `string` | Container name: required for volumes, optional for env vars |
| `divisor` | `string|number` | Quantity is a fixed-point representation of a number. It provides convenient marshaling/unmarshaling in JSON and YAML, in addition to String() and AsInt64() accessors.


The serialization format is:



````

	(Note that <suffix> may be empty, from the "" case in <decimalSI>.)

<digit>           ::= 0 | 1 | ... | 9 <digits>          ::= <digit> | <digit><digits> <number>          ::= <digits> | <digits>.<digits> | <digits>. | .<digits> <sign>            ::= "+" | "-" <signedNumber>    ::= <number> | <sign><number> <suffix>          ::= <binarySI> | <decimalExponent> | <decimalSI> <binarySI>        ::= Ki | Mi | Gi | Ti | Pi | Ei

	(International System of units; See: http://physics.nist.gov/cuu/Units/binary.html)

<decimalSI>       ::= m | "" | k | M | G | T | P | E

	(Note that 1024 = 1Ki but 1000 = 1k; I didn't choose the capitalization.)

<decimalExponent> ::= "e" <signedNumber> | "E" <signedNumber> ```

No matter which of the three exponent forms is used, no quantity may represent a number greater than 2^63-1 in magnitude, nor may it have more than 3 decimal places. Numbers larger or more precise will be capped or rounded up. (E.g.: 0.1m will rounded up to 1m.) This may be extended in the future if we require larger or smaller quantities.

When a Quantity is parsed from a string, it will remember the type of suffix it had, and will use the same type again when it is serialized.

Before serializing, Quantity will be put in "canonical form". This means that Exponent/suffix will be adjusted up or down (with a corresponding increase or decrease in Mantissa) such that:

- No precision is lost - No fractional digits will be emitted - The exponent (or suffix) is as large as possible.

The sign will be omitted unless the number is negative.

Examples:

- 1.5 will be serialized as "1500m" - 1.5Gi will be serialized as "1536Mi"

Note that the quantity will NEVER be internally represented by a floating point number. That is the whole point of this exercise.

Non-canonical values will still parse as long as they are well formed, but will be re-emitted in their canonical form. (So always use canonical form, or don't diff.)

This format is intended to make it difficult to use these numbers without writing some sort of special handling code in the hopes that that will cause implementors to also use a fixed point implementation.

```` |
| `resource` | `string` | Required: resource to select |

### [#](#spectemplatespeccontainersenvvaluefromsecretkeyref).spec.template.spec.containers[].env[].valueFrom.secretKeyRef

描述SecretKeySelector selects a key of a Secret.类型`object`必填`key`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `key` | `string` | The key of the secret to select from.  Must be a valid secret key. |
| `name` | `string` | Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names) |
| `optional` | `boolean` | Specify whether the Secret or its key must be defined |

### [#](#spectemplatespeccontainersenvfrom).spec.template.spec.containers[].envFrom

描述List of sources to populate environment variables in the container. The keys defined within a source must be a C_IDENTIFIER. All invalid keys will be reported as an event when the container is starting. When a key exists in multiple sources, the value associated with the last source will take precedence. Values defined by an Env with a duplicate key will take precedence. Cannot be updated.类型`array`### [#](#spectemplatespeccontainersenvfrom-1).spec.template.spec.containers[].envFrom[]

描述EnvFromSource represents the source of a set of ConfigMaps类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `configMapRef` | `object` | ConfigMapEnvSource selects a ConfigMap to populate the environment variables with.


The contents of the target ConfigMap's Data field will represent the key-value pairs as environment variables. |
| `prefix` | `string` | An optional identifier to prepend to each key in the ConfigMap. Must be a C_IDENTIFIER. |
| `secretRef` | `object` | SecretEnvSource selects a Secret to populate the environment variables with.


The contents of the target Secret's Data field will represent the key-value pairs as environment variables. |

### [#](#spectemplatespeccontainersenvfromconfigmapref).spec.template.spec.containers[].envFrom[].configMapRef

描述ConfigMapEnvSource selects a ConfigMap to populate the environment variables with.

The contents of the target ConfigMap's Data field will represent the key-value pairs as environment variables.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `name` | `string` | Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names) |
| `optional` | `boolean` | Specify whether the ConfigMap must be defined |

### [#](#spectemplatespeccontainersenvfromsecretref).spec.template.spec.containers[].envFrom[].secretRef

描述SecretEnvSource selects a Secret to populate the environment variables with.

The contents of the target Secret's Data field will represent the key-value pairs as environment variables.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `name` | `string` | Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names) |
| `optional` | `boolean` | Specify whether the Secret must be defined |

### [#](#spectemplatespeccontainerslifecycle).spec.template.spec.containers[].lifecycle

描述Lifecycle describes actions that the management system should take in response to container lifecycle events. For the PostStart and PreStop lifecycle handlers, management of the container blocks until the action is complete, unless the container process fails, in which case the handler is aborted.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `postStart` | `object` | LifecycleHandler defines a specific action that should be taken in a lifecycle hook. One and only one of the fields, except TCPSocket must be specified. |
| `preStop` | `object` | LifecycleHandler defines a specific action that should be taken in a lifecycle hook. One and only one of the fields, except TCPSocket must be specified. |

### [#](#spectemplatespeccontainerslifecyclepoststart).spec.template.spec.containers[].lifecycle.postStart

描述LifecycleHandler defines a specific action that should be taken in a lifecycle hook. One and only one of the fields, except TCPSocket must be specified.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `exec` | `object` | ExecAction describes a "run in container" action. |
| `httpGet` | `object` | HTTPGetAction describes an action based on HTTP Get requests. |
| `sleep` | `object` | SleepAction describes a "sleep" action. |
| `tcpSocket` | `object` | TCPSocketAction describes an action based on opening a socket |

### [#](#spectemplatespeccontainerslifecyclepoststartexec).spec.template.spec.containers[].lifecycle.postStart.exec

描述ExecAction describes a "run in container" action.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `command` | `array` | Command is the command line to execute inside the container, the working directory for the command  is root ('/') in the container's filesystem. The command is simply exec'd, it is not run inside a shell, so traditional shell instructions ('|', etc) won't work. To use a shell, you need to explicitly call out to that shell. Exit status of 0 is treated as live/healthy and non-zero is unhealthy. |

### [#](#spectemplatespeccontainerslifecyclepoststartexeccommand).spec.template.spec.containers[].lifecycle.postStart.exec.command

描述Command is the command line to execute inside the container, the working directory for the command  is root ('/') in the container's filesystem. The command is simply exec'd, it is not run inside a shell, so traditional shell instructions ('|', etc) won't work. To use a shell, you need to explicitly call out to that shell. Exit status of 0 is treated as live/healthy and non-zero is unhealthy.类型`array`### [#](#spectemplatespeccontainerslifecyclepoststartexeccommand-1).spec.template.spec.containers[].lifecycle.postStart.exec.command[]

类型`string`### [#](#spectemplatespeccontainerslifecyclepoststarthttpget).spec.template.spec.containers[].lifecycle.postStart.httpGet

描述HTTPGetAction describes an action based on HTTP Get requests.类型`object`必填`port`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `host` | `string` | Host name to connect to, defaults to the pod IP. You probably want to set "Host" in httpHeaders instead. |
| `httpHeaders` | `array` | Custom headers to set in the request. HTTP allows repeated headers. |
| `path` | `string` | Path to access on the HTTP server. |
| `port` | `integer|string` | IntOrString is a type that can hold an int32 or a string.  When used in JSON or YAML marshalling and unmarshalling, it produces or consumes the inner type.  This allows you to have, for example, a JSON field that can accept a name or number. |
| `scheme` | `string` | Scheme to use for connecting to the host. Defaults to HTTP.


Possible enum values:



- `"HTTP"` means that the scheme used will be http://

- `"HTTPS"` means that the scheme used will be https:// |

### [#](#spectemplatespeccontainerslifecyclepoststarthttpgethttpheaders).spec.template.spec.containers[].lifecycle.postStart.httpGet.httpHeaders

描述Custom headers to set in the request. HTTP allows repeated headers.类型`array`### [#](#spectemplatespeccontainerslifecyclepoststarthttpgethttpheaders-1).spec.template.spec.containers[].lifecycle.postStart.httpGet.httpHeaders[]

描述HTTPHeader describes a custom header to be used in HTTP probes类型`object`必填`name``value`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `name` | `string` | The header field name. This will be canonicalized upon output, so case-variant names will be understood as the same header. |
| `value` | `string` | The header field value |

### [#](#spectemplatespeccontainerslifecyclepoststartsleep).spec.template.spec.containers[].lifecycle.postStart.sleep

描述SleepAction describes a "sleep" action.类型`object`必填`seconds`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `seconds` | `integer` | Seconds is the number of seconds to sleep. |

### [#](#spectemplatespeccontainerslifecyclepoststarttcpsocket).spec.template.spec.containers[].lifecycle.postStart.tcpSocket

描述TCPSocketAction describes an action based on opening a socket类型`object`必填`port`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `host` | `string` | Optional: Host name to connect to, defaults to the pod IP. |
| `port` | `integer|string` | IntOrString is a type that can hold an int32 or a string.  When used in JSON or YAML marshalling and unmarshalling, it produces or consumes the inner type.  This allows you to have, for example, a JSON field that can accept a name or number. |

### [#](#spectemplatespeccontainerslifecycleprestop).spec.template.spec.containers[].lifecycle.preStop

描述LifecycleHandler defines a specific action that should be taken in a lifecycle hook. One and only one of the fields, except TCPSocket must be specified.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `exec` | `object` | ExecAction describes a "run in container" action. |
| `httpGet` | `object` | HTTPGetAction describes an action based on HTTP Get requests. |
| `sleep` | `object` | SleepAction describes a "sleep" action. |
| `tcpSocket` | `object` | TCPSocketAction describes an action based on opening a socket |

### [#](#spectemplatespeccontainerslifecycleprestopexec).spec.template.spec.containers[].lifecycle.preStop.exec

描述ExecAction describes a "run in container" action.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `command` | `array` | Command is the command line to execute inside the container, the working directory for the command  is root ('/') in the container's filesystem. The command is simply exec'd, it is not run inside a shell, so traditional shell instructions ('|', etc) won't work. To use a shell, you need to explicitly call out to that shell. Exit status of 0 is treated as live/healthy and non-zero is unhealthy. |

### [#](#spectemplatespeccontainerslifecycleprestopexeccommand).spec.template.spec.containers[].lifecycle.preStop.exec.command

描述Command is the command line to execute inside the container, the working directory for the command  is root ('/') in the container's filesystem. The command is simply exec'd, it is not run inside a shell, so traditional shell instructions ('|', etc) won't work. To use a shell, you need to explicitly call out to that shell. Exit status of 0 is treated as live/healthy and non-zero is unhealthy.类型`array`### [#](#spectemplatespeccontainerslifecycleprestopexeccommand-1).spec.template.spec.containers[].lifecycle.preStop.exec.command[]

类型`string`### [#](#spectemplatespeccontainerslifecycleprestophttpget).spec.template.spec.containers[].lifecycle.preStop.httpGet

描述HTTPGetAction describes an action based on HTTP Get requests.类型`object`必填`port`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `host` | `string` | Host name to connect to, defaults to the pod IP. You probably want to set "Host" in httpHeaders instead. |
| `httpHeaders` | `array` | Custom headers to set in the request. HTTP allows repeated headers. |
| `path` | `string` | Path to access on the HTTP server. |
| `port` | `integer|string` | IntOrString is a type that can hold an int32 or a string.  When used in JSON or YAML marshalling and unmarshalling, it produces or consumes the inner type.  This allows you to have, for example, a JSON field that can accept a name or number. |
| `scheme` | `string` | Scheme to use for connecting to the host. Defaults to HTTP.


Possible enum values:



- `"HTTP"` means that the scheme used will be http://

- `"HTTPS"` means that the scheme used will be https:// |

### [#](#spectemplatespeccontainerslifecycleprestophttpgethttpheaders).spec.template.spec.containers[].lifecycle.preStop.httpGet.httpHeaders

描述Custom headers to set in the request. HTTP allows repeated headers.类型`array`### [#](#spectemplatespeccontainerslifecycleprestophttpgethttpheaders-1).spec.template.spec.containers[].lifecycle.preStop.httpGet.httpHeaders[]

描述HTTPHeader describes a custom header to be used in HTTP probes类型`object`必填`name``value`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `name` | `string` | The header field name. This will be canonicalized upon output, so case-variant names will be understood as the same header. |
| `value` | `string` | The header field value |

### [#](#spectemplatespeccontainerslifecycleprestopsleep).spec.template.spec.containers[].lifecycle.preStop.sleep

描述SleepAction describes a "sleep" action.类型`object`必填`seconds`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `seconds` | `integer` | Seconds is the number of seconds to sleep. |

### [#](#spectemplatespeccontainerslifecycleprestoptcpsocket).spec.template.spec.containers[].lifecycle.preStop.tcpSocket

描述TCPSocketAction describes an action based on opening a socket类型`object`必填`port`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `host` | `string` | Optional: Host name to connect to, defaults to the pod IP. |
| `port` | `integer|string` | IntOrString is a type that can hold an int32 or a string.  When used in JSON or YAML marshalling and unmarshalling, it produces or consumes the inner type.  This allows you to have, for example, a JSON field that can accept a name or number. |

### [#](#spectemplatespeccontainerslivenessprobe).spec.template.spec.containers[].livenessProbe

描述Probe describes a health check to be performed against a container to determine whether it is alive or ready to receive traffic.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `exec` | `object` | ExecAction describes a "run in container" action. |
| `failureThreshold` | `integer` | Minimum consecutive failures for the probe to be considered failed after having succeeded. Defaults to 3. Minimum value is 1. |
| `grpc` | `object` | GRPCAction specifies an action involving a GRPC service. |
| `httpGet` | `object` | HTTPGetAction describes an action based on HTTP Get requests. |
| `initialDelaySeconds` | `integer` | Number of seconds after the container has started before liveness probes are initiated. More info: [https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle#container-probes](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle#container-probes) |
| `periodSeconds` | `integer` | How often (in seconds) to perform the probe. Default to 10 seconds. Minimum value is 1. |
| `successThreshold` | `integer` | Minimum consecutive successes for the probe to be considered successful after having failed. Defaults to 1. Must be 1 for liveness and startup. Minimum value is 1. |
| `tcpSocket` | `object` | TCPSocketAction describes an action based on opening a socket |
| `terminationGracePeriodSeconds` | `integer` | Optional duration in seconds the pod needs to terminate gracefully upon probe failure. The grace period is the duration in seconds after the processes running in the pod are sent a termination signal and the time when the processes are forcibly halted with a kill signal. Set this value longer than the expected cleanup time for your process. If this value is nil, the pod's terminationGracePeriodSeconds will be used. Otherwise, this value overrides the value provided by the pod spec. Value must be non-negative integer. The value zero indicates stop immediately via the kill signal (no opportunity to shut down). This is a beta field and requires enabling ProbeTerminationGracePeriod feature gate. Minimum value is 1. spec.terminationGracePeriodSeconds is used if unset. |
| `timeoutSeconds` | `integer` | Number of seconds after which the probe times out. Defaults to 1 second. Minimum value is 1. More info: [https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle#container-probes](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle#container-probes) |

### [#](#spectemplatespeccontainerslivenessprobeexec).spec.template.spec.containers[].livenessProbe.exec

描述ExecAction describes a "run in container" action.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `command` | `array` | Command is the command line to execute inside the container, the working directory for the command  is root ('/') in the container's filesystem. The command is simply exec'd, it is not run inside a shell, so traditional shell instructions ('|', etc) won't work. To use a shell, you need to explicitly call out to that shell. Exit status of 0 is treated as live/healthy and non-zero is unhealthy. |

### [#](#spectemplatespeccontainerslivenessprobeexeccommand).spec.template.spec.containers[].livenessProbe.exec.command

描述Command is the command line to execute inside the container, the working directory for the command  is root ('/') in the container's filesystem. The command is simply exec'd, it is not run inside a shell, so traditional shell instructions ('|', etc) won't work. To use a shell, you need to explicitly call out to that shell. Exit status of 0 is treated as live/healthy and non-zero is unhealthy.类型`array`### [#](#spectemplatespeccontainerslivenessprobeexeccommand-1).spec.template.spec.containers[].livenessProbe.exec.command[]

类型`string`### [#](#spectemplatespeccontainerslivenessprobegrpc).spec.template.spec.containers[].livenessProbe.grpc

描述GRPCAction specifies an action involving a GRPC service.类型`object`必填`port`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `port` | `integer` | Port number of the gRPC service. Number must be in the range 1 to 65535. |
| `service` | `string` | Service is the name of the service to place in the gRPC HealthCheckRequest (see [https://github.com/grpc/grpc/blob/master/doc/health-checking.md](https://github.com/grpc/grpc/blob/master/doc/health-checking.md)).


If this is not specified, the default behavior is defined by gRPC. |

### [#](#spectemplatespeccontainerslivenessprobehttpget).spec.template.spec.containers[].livenessProbe.httpGet

描述HTTPGetAction describes an action based on HTTP Get requests.类型`object`必填`port`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `host` | `string` | Host name to connect to, defaults to the pod IP. You probably want to set "Host" in httpHeaders instead. |
| `httpHeaders` | `array` | Custom headers to set in the request. HTTP allows repeated headers. |
| `path` | `string` | Path to access on the HTTP server. |
| `port` | `integer|string` | IntOrString is a type that can hold an int32 or a string.  When used in JSON or YAML marshalling and unmarshalling, it produces or consumes the inner type.  This allows you to have, for example, a JSON field that can accept a name or number. |
| `scheme` | `string` | Scheme to use for connecting to the host. Defaults to HTTP.


Possible enum values:



- `"HTTP"` means that the scheme used will be http://

- `"HTTPS"` means that the scheme used will be https:// |

### [#](#spectemplatespeccontainerslivenessprobehttpgethttpheaders).spec.template.spec.containers[].livenessProbe.httpGet.httpHeaders

描述Custom headers to set in the request. HTTP allows repeated headers.类型`array`### [#](#spectemplatespeccontainerslivenessprobehttpgethttpheaders-1).spec.template.spec.containers[].livenessProbe.httpGet.httpHeaders[]

描述HTTPHeader describes a custom header to be used in HTTP probes类型`object`必填`name``value`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `name` | `string` | The header field name. This will be canonicalized upon output, so case-variant names will be understood as the same header. |
| `value` | `string` | The header field value |

### [#](#spectemplatespeccontainerslivenessprobetcpsocket).spec.template.spec.containers[].livenessProbe.tcpSocket

描述TCPSocketAction describes an action based on opening a socket类型`object`必填`port`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `host` | `string` | Optional: Host name to connect to, defaults to the pod IP. |
| `port` | `integer|string` | IntOrString is a type that can hold an int32 or a string.  When used in JSON or YAML marshalling and unmarshalling, it produces or consumes the inner type.  This allows you to have, for example, a JSON field that can accept a name or number. |

### [#](#spectemplatespeccontainersports).spec.template.spec.containers[].ports

描述List of ports to expose from the container. Not specifying a port here DOES NOT prevent that port from being exposed. Any port which is listening on the default "0.0.0.0" address inside a container will be accessible from the network. Modifying this array with strategic merge patch may corrupt the data. For more information See https://github.com/kubernetes/kubernetes/issues/108255. Cannot be updated.类型`array`### [#](#spectemplatespeccontainersports-1).spec.template.spec.containers[].ports[]

描述ContainerPort represents a network port in a single container.类型`object`必填`containerPort`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `containerPort` | `integer` | Number of port to expose on the pod's IP address. This must be a valid port number, 0 < x < 65536. |
| `hostIP` | `string` | What host IP to bind the external port to. |
| `hostPort` | `integer` | Number of port to expose on the host. If specified, this must be a valid port number, 0 < x < 65536. If HostNetwork is specified, this must match ContainerPort. Most containers do not need this. |
| `name` | `string` | If specified, this must be an IANA_SVC_NAME and unique within the pod. Each named port in a pod must have a unique name. Name for the port that can be referred to by services. |
| `protocol` | `string` | Protocol for port. Must be UDP, TCP, or SCTP. Defaults to "TCP".


Possible enum values:



- `"SCTP"` is the SCTP protocol.

- `"TCP"` is the TCP protocol.

- `"UDP"` is the UDP protocol. |

### [#](#spectemplatespeccontainersreadinessprobe).spec.template.spec.containers[].readinessProbe

描述Probe describes a health check to be performed against a container to determine whether it is alive or ready to receive traffic.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `exec` | `object` | ExecAction describes a "run in container" action. |
| `failureThreshold` | `integer` | Minimum consecutive failures for the probe to be considered failed after having succeeded. Defaults to 3. Minimum value is 1. |
| `grpc` | `object` | GRPCAction specifies an action involving a GRPC service. |
| `httpGet` | `object` | HTTPGetAction describes an action based on HTTP Get requests. |
| `initialDelaySeconds` | `integer` | Number of seconds after the container has started before liveness probes are initiated. More info: [https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle#container-probes](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle#container-probes) |
| `periodSeconds` | `integer` | How often (in seconds) to perform the probe. Default to 10 seconds. Minimum value is 1. |
| `successThreshold` | `integer` | Minimum consecutive successes for the probe to be considered successful after having failed. Defaults to 1. Must be 1 for liveness and startup. Minimum value is 1. |
| `tcpSocket` | `object` | TCPSocketAction describes an action based on opening a socket |
| `terminationGracePeriodSeconds` | `integer` | Optional duration in seconds the pod needs to terminate gracefully upon probe failure. The grace period is the duration in seconds after the processes running in the pod are sent a termination signal and the time when the processes are forcibly halted with a kill signal. Set this value longer than the expected cleanup time for your process. If this value is nil, the pod's terminationGracePeriodSeconds will be used. Otherwise, this value overrides the value provided by the pod spec. Value must be non-negative integer. The value zero indicates stop immediately via the kill signal (no opportunity to shut down). This is a beta field and requires enabling ProbeTerminationGracePeriod feature gate. Minimum value is 1. spec.terminationGracePeriodSeconds is used if unset. |
| `timeoutSeconds` | `integer` | Number of seconds after which the probe times out. Defaults to 1 second. Minimum value is 1. More info: [https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle#container-probes](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle#container-probes) |

### [#](#spectemplatespeccontainersreadinessprobeexec).spec.template.spec.containers[].readinessProbe.exec

描述ExecAction describes a "run in container" action.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `command` | `array` | Command is the command line to execute inside the container, the working directory for the command  is root ('/') in the container's filesystem. The command is simply exec'd, it is not run inside a shell, so traditional shell instructions ('|', etc) won't work. To use a shell, you need to explicitly call out to that shell. Exit status of 0 is treated as live/healthy and non-zero is unhealthy. |

### [#](#spectemplatespeccontainersreadinessprobeexeccommand).spec.template.spec.containers[].readinessProbe.exec.command

描述Command is the command line to execute inside the container, the working directory for the command  is root ('/') in the container's filesystem. The command is simply exec'd, it is not run inside a shell, so traditional shell instructions ('|', etc) won't work. To use a shell, you need to explicitly call out to that shell. Exit status of 0 is treated as live/healthy and non-zero is unhealthy.类型`array`### [#](#spectemplatespeccontainersreadinessprobeexeccommand-1).spec.template.spec.containers[].readinessProbe.exec.command[]

类型`string`### [#](#spectemplatespeccontainersreadinessprobegrpc).spec.template.spec.containers[].readinessProbe.grpc

描述GRPCAction specifies an action involving a GRPC service.类型`object`必填`port`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `port` | `integer` | Port number of the gRPC service. Number must be in the range 1 to 65535. |
| `service` | `string` | Service is the name of the service to place in the gRPC HealthCheckRequest (see [https://github.com/grpc/grpc/blob/master/doc/health-checking.md](https://github.com/grpc/grpc/blob/master/doc/health-checking.md)).


If this is not specified, the default behavior is defined by gRPC. |

### [#](#spectemplatespeccontainersreadinessprobehttpget).spec.template.spec.containers[].readinessProbe.httpGet

描述HTTPGetAction describes an action based on HTTP Get requests.类型`object`必填`port`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `host` | `string` | Host name to connect to, defaults to the pod IP. You probably want to set "Host" in httpHeaders instead. |
| `httpHeaders` | `array` | Custom headers to set in the request. HTTP allows repeated headers. |
| `path` | `string` | Path to access on the HTTP server. |
| `port` | `integer|string` | IntOrString is a type that can hold an int32 or a string.  When used in JSON or YAML marshalling and unmarshalling, it produces or consumes the inner type.  This allows you to have, for example, a JSON field that can accept a name or number. |
| `scheme` | `string` | Scheme to use for connecting to the host. Defaults to HTTP.


Possible enum values:



- `"HTTP"` means that the scheme used will be http://

- `"HTTPS"` means that the scheme used will be https:// |

### [#](#spectemplatespeccontainersreadinessprobehttpgethttpheaders).spec.template.spec.containers[].readinessProbe.httpGet.httpHeaders

描述Custom headers to set in the request. HTTP allows repeated headers.类型`array`### [#](#spectemplatespeccontainersreadinessprobehttpgethttpheaders-1).spec.template.spec.containers[].readinessProbe.httpGet.httpHeaders[]

描述HTTPHeader describes a custom header to be used in HTTP probes类型`object`必填`name``value`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `name` | `string` | The header field name. This will be canonicalized upon output, so case-variant names will be understood as the same header. |
| `value` | `string` | The header field value |

### [#](#spectemplatespeccontainersreadinessprobetcpsocket).spec.template.spec.containers[].readinessProbe.tcpSocket

描述TCPSocketAction describes an action based on opening a socket类型`object`必填`port`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `host` | `string` | Optional: Host name to connect to, defaults to the pod IP. |
| `port` | `integer|string` | IntOrString is a type that can hold an int32 or a string.  When used in JSON or YAML marshalling and unmarshalling, it produces or consumes the inner type.  This allows you to have, for example, a JSON field that can accept a name or number. |

### [#](#spectemplatespeccontainersresizepolicy).spec.template.spec.containers[].resizePolicy

描述Resources resize policy for the container.类型`array`### [#](#spectemplatespeccontainersresizepolicy-1).spec.template.spec.containers[].resizePolicy[]

描述ContainerResizePolicy represents resource resize policy for the container.类型`object`必填`resourceName``restartPolicy`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `resourceName` | `string` | Name of the resource to which this resource resize policy applies. Supported values: cpu, memory. |
| `restartPolicy` | `string` | Restart policy to apply when specified resource is resized. If not specified, it defaults to NotRequired. |

### [#](#spectemplatespeccontainersresources).spec.template.spec.containers[].resources

描述ResourceRequirements describes the compute resource requirements.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `claims` | `array` | Claims lists the names of resources, defined in spec.resourceClaims, that are used by this container.


This is an alpha field and requires enabling the DynamicResourceAllocation feature gate.


This field is immutable. It can only be set for containers. |
| `limits` | `object` | Limits describes the maximum amount of compute resources allowed. More info: [https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/) |
| `requests` | `object` | Requests describes the minimum amount of compute resources required. If Requests is omitted for a container, it defaults to Limits if that is explicitly specified, otherwise to an implementation-defined value. Requests cannot exceed Limits. More info: [https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/) |

### [#](#spectemplatespeccontainersresourcesclaims).spec.template.spec.containers[].resources.claims

描述Claims lists the names of resources, defined in spec.resourceClaims, that are used by this container.

This is an alpha field and requires enabling the DynamicResourceAllocation feature gate.

This field is immutable. It can only be set for containers.类型`array`### [#](#spectemplatespeccontainersresourcesclaims-1).spec.template.spec.containers[].resources.claims[]

描述ResourceClaim references one entry in PodSpec.ResourceClaims.类型`object`必填`name`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `name` | `string` | Name must match the name of one entry in pod.spec.resourceClaims of the Pod where this field is used. It makes that resource available inside a container. |
| `request` | `string` | Request is the name chosen for a request in the referenced claim. If empty, everything from the claim is made available, otherwise only the result of this request. |

### [#](#spectemplatespeccontainersresourceslimits).spec.template.spec.containers[].resources.limits

描述Limits describes the maximum amount of compute resources allowed. More info: https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/类型`object`### [#](#spectemplatespeccontainersresourcesrequests).spec.template.spec.containers[].resources.requests

描述Requests describes the minimum amount of compute resources required. If Requests is omitted for a container, it defaults to Limits if that is explicitly specified, otherwise to an implementation-defined value. Requests cannot exceed Limits. More info: https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/类型`object`### [#](#spectemplatespeccontainerssecuritycontext).spec.template.spec.containers[].securityContext

描述SecurityContext holds security configuration that will be applied to a container. Some fields are present in both SecurityContext and PodSecurityContext.  When both are set, the values in SecurityContext take precedence.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `allowPrivilegeEscalation` | `boolean` | AllowPrivilegeEscalation controls whether a process can gain more privileges than its parent process. This bool directly controls if the no_new_privs flag will be set on the container process. AllowPrivilegeEscalation is true always when the container is: 1) run as Privileged 2) has CAP_SYS_ADMIN Note that this field cannot be set when spec.os.name is windows. |
| `appArmorProfile` | `object` | AppArmorProfile defines a pod or container's AppArmor settings. |
| `capabilities` | `object` | Adds and removes POSIX capabilities from running containers. |
| `privileged` | `boolean` | Run container in privileged mode. Processes in privileged containers are essentially equivalent to root on the host. Defaults to false. Note that this field cannot be set when spec.os.name is windows. |
| `procMount` | `string` | procMount denotes the type of proc mount to use for the containers. The default value is Default which uses the container runtime defaults for readonly paths and masked paths. This requires the ProcMountType feature flag to be enabled. Note that this field cannot be set when spec.os.name is windows.


Possible enum values:



- `"Default"` uses the container runtime defaults for readonly and masked paths for /proc. Most container runtimes mask certain paths in /proc to avoid accidental security exposure of special devices or information.

- `"Unmasked"` bypasses the default masking behavior of the container runtime and ensures the newly created /proc the container stays in tact with no modifications. |
| `readOnlyRootFilesystem` | `boolean` | Whether this container has a read-only root filesystem. Default is false. Note that this field cannot be set when spec.os.name is windows. |
| `runAsGroup` | `integer` | The GID to run the entrypoint of the container process. Uses runtime default if unset. May also be set in PodSecurityContext.  If set in both SecurityContext and PodSecurityContext, the value specified in SecurityContext takes precedence. Note that this field cannot be set when spec.os.name is windows. |
| `runAsNonRoot` | `boolean` | Indicates that the container must run as a non-root user. If true, the Kubelet will validate the image at runtime to ensure that it does not run as UID 0 (root) and fail to start the container if it does. If unset or false, no such validation will be performed. May also be set in PodSecurityContext.  If set in both SecurityContext and PodSecurityContext, the value specified in SecurityContext takes precedence. |
| `runAsUser` | `integer` | The UID to run the entrypoint of the container process. Defaults to user specified in image metadata if unspecified. May also be set in PodSecurityContext.  If set in both SecurityContext and PodSecurityContext, the value specified in SecurityContext takes precedence. Note that this field cannot be set when spec.os.name is windows. |
| `seLinuxOptions` | `object` | SELinuxOptions are the labels to be applied to the container |
| `seccompProfile` | `object` | SeccompProfile defines a pod/container's seccomp profile settings. Only one profile source may be set. |
| `windowsOptions` | `object` | WindowsSecurityContextOptions contain Windows-specific options and credentials. |

### [#](#spectemplatespeccontainerssecuritycontextapparmorprofile).spec.template.spec.containers[].securityContext.appArmorProfile

描述AppArmorProfile defines a pod or container's AppArmor settings.类型`object`必填`type`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `localhostProfile` | `string` | localhostProfile indicates a profile loaded on the node that should be used. The profile must be preconfigured on the node to work. Must match the loaded name of the profile. Must be set if and only if type is "Localhost". |
| `type` | `string` | type indicates which kind of AppArmor profile will be applied. Valid options are:
Localhost - a profile pre-loaded on the node.
RuntimeDefault - the container runtime's default profile.
Unconfined - no AppArmor enforcement.


Possible enum values:



- `"Localhost"` indicates that a profile pre-loaded on the node should be used.

- `"RuntimeDefault"` indicates that the container runtime's default AppArmor profile should be used.

- `"Unconfined"` indicates that no AppArmor profile should be enforced. |

### [#](#spectemplatespeccontainerssecuritycontextcapabilities).spec.template.spec.containers[].securityContext.capabilities

描述Adds and removes POSIX capabilities from running containers.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `add` | `array` | Added capabilities |
| `drop` | `array` | Removed capabilities |

### [#](#spectemplatespeccontainerssecuritycontextcapabilitiesadd).spec.template.spec.containers[].securityContext.capabilities.add

描述Added capabilities类型`array`### [#](#spectemplatespeccontainerssecuritycontextcapabilitiesadd-1).spec.template.spec.containers[].securityContext.capabilities.add[]

类型`string`### [#](#spectemplatespeccontainerssecuritycontextcapabilitiesdrop).spec.template.spec.containers[].securityContext.capabilities.drop

描述Removed capabilities类型`array`### [#](#spectemplatespeccontainerssecuritycontextcapabilitiesdrop-1).spec.template.spec.containers[].securityContext.capabilities.drop[]

类型`string`### [#](#spectemplatespeccontainerssecuritycontextselinuxoptions).spec.template.spec.containers[].securityContext.seLinuxOptions

描述SELinuxOptions are the labels to be applied to the container类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `level` | `string` | Level is SELinux level label that applies to the container. |
| `role` | `string` | Role is a SELinux role label that applies to the container. |
| `type` | `string` | Type is a SELinux type label that applies to the container. |
| `user` | `string` | User is a SELinux user label that applies to the container. |

### [#](#spectemplatespeccontainerssecuritycontextseccompprofile).spec.template.spec.containers[].securityContext.seccompProfile

描述SeccompProfile defines a pod/container's seccomp profile settings. Only one profile source may be set.类型`object`必填`type`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `localhostProfile` | `string` | localhostProfile indicates a profile defined in a file on the node should be used. The profile must be preconfigured on the node to work. Must be a descending path, relative to the kubelet's configured seccomp profile location. Must be set if type is "Localhost". Must NOT be set for any other type. |
| `type` | `string` | type indicates which kind of seccomp profile will be applied. Valid options are:


Localhost - a profile defined in a file on the node should be used. RuntimeDefault - the container runtime default profile should be used. Unconfined - no profile should be applied.


Possible enum values:



- `"Localhost"` indicates a profile defined in a file on the node should be used. The file's location relative to /seccomp.

- `"RuntimeDefault"` represents the default container runtime seccomp profile.

- `"Unconfined"` indicates no seccomp profile is applied (A.K.A. unconfined). |

### [#](#spectemplatespeccontainerssecuritycontextwindowsoptions).spec.template.spec.containers[].securityContext.windowsOptions

描述WindowsSecurityContextOptions contain Windows-specific options and credentials.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `gmsaCredentialSpec` | `string` | GMSACredentialSpec is where the GMSA admission webhook ([https://github.com/kubernetes-sigs/windows-gmsa](https://github.com/kubernetes-sigs/windows-gmsa)) inlines the contents of the GMSA credential spec named by the GMSACredentialSpecName field. |
| `gmsaCredentialSpecName` | `string` | GMSACredentialSpecName is the name of the GMSA credential spec to use. |
| `hostProcess` | `boolean` | HostProcess determines if a container should be run as a 'Host Process' container. All of a Pod's containers must have the same effective HostProcess value (it is not allowed to have a mix of HostProcess containers and non-HostProcess containers). In addition, if HostProcess is true then HostNetwork must also be set to true. |
| `runAsUserName` | `string` | The UserName in Windows to run the entrypoint of the container process. Defaults to the user specified in image metadata if unspecified. May also be set in PodSecurityContext. If set in both SecurityContext and PodSecurityContext, the value specified in SecurityContext takes precedence. |

### [#](#spectemplatespeccontainersstartupprobe).spec.template.spec.containers[].startupProbe

描述Probe describes a health check to be performed against a container to determine whether it is alive or ready to receive traffic.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `exec` | `object` | ExecAction describes a "run in container" action. |
| `failureThreshold` | `integer` | Minimum consecutive failures for the probe to be considered failed after having succeeded. Defaults to 3. Minimum value is 1. |
| `grpc` | `object` | GRPCAction specifies an action involving a GRPC service. |
| `httpGet` | `object` | HTTPGetAction describes an action based on HTTP Get requests. |
| `initialDelaySeconds` | `integer` | Number of seconds after the container has started before liveness probes are initiated. More info: [https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle#container-probes](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle#container-probes) |
| `periodSeconds` | `integer` | How often (in seconds) to perform the probe. Default to 10 seconds. Minimum value is 1. |
| `successThreshold` | `integer` | Minimum consecutive successes for the probe to be considered successful after having failed. Defaults to 1. Must be 1 for liveness and startup. Minimum value is 1. |
| `tcpSocket` | `object` | TCPSocketAction describes an action based on opening a socket |
| `terminationGracePeriodSeconds` | `integer` | Optional duration in seconds the pod needs to terminate gracefully upon probe failure. The grace period is the duration in seconds after the processes running in the pod are sent a termination signal and the time when the processes are forcibly halted with a kill signal. Set this value longer than the expected cleanup time for your process. If this value is nil, the pod's terminationGracePeriodSeconds will be used. Otherwise, this value overrides the value provided by the pod spec. Value must be non-negative integer. The value zero indicates stop immediately via the kill signal (no opportunity to shut down). This is a beta field and requires enabling ProbeTerminationGracePeriod feature gate. Minimum value is 1. spec.terminationGracePeriodSeconds is used if unset. |
| `timeoutSeconds` | `integer` | Number of seconds after which the probe times out. Defaults to 1 second. Minimum value is 1. More info: [https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle#container-probes](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle#container-probes) |

### [#](#spectemplatespeccontainersstartupprobeexec).spec.template.spec.containers[].startupProbe.exec

描述ExecAction describes a "run in container" action.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `command` | `array` | Command is the command line to execute inside the container, the working directory for the command  is root ('/') in the container's filesystem. The command is simply exec'd, it is not run inside a shell, so traditional shell instructions ('|', etc) won't work. To use a shell, you need to explicitly call out to that shell. Exit status of 0 is treated as live/healthy and non-zero is unhealthy. |

### [#](#spectemplatespeccontainersstartupprobeexeccommand).spec.template.spec.containers[].startupProbe.exec.command

描述Command is the command line to execute inside the container, the working directory for the command  is root ('/') in the container's filesystem. The command is simply exec'd, it is not run inside a shell, so traditional shell instructions ('|', etc) won't work. To use a shell, you need to explicitly call out to that shell. Exit status of 0 is treated as live/healthy and non-zero is unhealthy.类型`array`### [#](#spectemplatespeccontainersstartupprobeexeccommand-1).spec.template.spec.containers[].startupProbe.exec.command[]

类型`string`### [#](#spectemplatespeccontainersstartupprobegrpc).spec.template.spec.containers[].startupProbe.grpc

描述GRPCAction specifies an action involving a GRPC service.类型`object`必填`port`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `port` | `integer` | Port number of the gRPC service. Number must be in the range 1 to 65535. |
| `service` | `string` | Service is the name of the service to place in the gRPC HealthCheckRequest (see [https://github.com/grpc/grpc/blob/master/doc/health-checking.md](https://github.com/grpc/grpc/blob/master/doc/health-checking.md)).


If this is not specified, the default behavior is defined by gRPC. |

### [#](#spectemplatespeccontainersstartupprobehttpget).spec.template.spec.containers[].startupProbe.httpGet

描述HTTPGetAction describes an action based on HTTP Get requests.类型`object`必填`port`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `host` | `string` | Host name to connect to, defaults to the pod IP. You probably want to set "Host" in httpHeaders instead. |
| `httpHeaders` | `array` | Custom headers to set in the request. HTTP allows repeated headers. |
| `path` | `string` | Path to access on the HTTP server. |
| `port` | `integer|string` | IntOrString is a type that can hold an int32 or a string.  When used in JSON or YAML marshalling and unmarshalling, it produces or consumes the inner type.  This allows you to have, for example, a JSON field that can accept a name or number. |
| `scheme` | `string` | Scheme to use for connecting to the host. Defaults to HTTP.


Possible enum values:



- `"HTTP"` means that the scheme used will be http://

- `"HTTPS"` means that the scheme used will be https:// |

### [#](#spectemplatespeccontainersstartupprobehttpgethttpheaders).spec.template.spec.containers[].startupProbe.httpGet.httpHeaders

描述Custom headers to set in the request. HTTP allows repeated headers.类型`array`### [#](#spectemplatespeccontainersstartupprobehttpgethttpheaders-1).spec.template.spec.containers[].startupProbe.httpGet.httpHeaders[]

描述HTTPHeader describes a custom header to be used in HTTP probes类型`object`必填`name``value`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `name` | `string` | The header field name. This will be canonicalized upon output, so case-variant names will be understood as the same header. |
| `value` | `string` | The header field value |

### [#](#spectemplatespeccontainersstartupprobetcpsocket).spec.template.spec.containers[].startupProbe.tcpSocket

描述TCPSocketAction describes an action based on opening a socket类型`object`必填`port`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `host` | `string` | Optional: Host name to connect to, defaults to the pod IP. |
| `port` | `integer|string` | IntOrString is a type that can hold an int32 or a string.  When used in JSON or YAML marshalling and unmarshalling, it produces or consumes the inner type.  This allows you to have, for example, a JSON field that can accept a name or number. |

### [#](#spectemplatespeccontainersvolumedevices).spec.template.spec.containers[].volumeDevices

描述volumeDevices is the list of block devices to be used by the container.类型`array`### [#](#spectemplatespeccontainersvolumedevices-1).spec.template.spec.containers[].volumeDevices[]

描述volumeDevice describes a mapping of a raw block device within a container.类型`object`必填`name``devicePath`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `devicePath` | `string` | devicePath is the path inside of the container that the device will be mapped to. |
| `name` | `string` | name must match the name of a persistentVolumeClaim in the pod |

### [#](#spectemplatespeccontainersvolumemounts).spec.template.spec.containers[].volumeMounts

描述Pod volumes to mount into the container's filesystem. Cannot be updated.类型`array`### [#](#spectemplatespeccontainersvolumemounts-1).spec.template.spec.containers[].volumeMounts[]

描述VolumeMount describes a mounting of a Volume within a container.类型`object`必填`name``mountPath`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `mountPath` | `string` | Path within the container at which the volume should be mounted.  Must not contain ':'. |
| `mountPropagation` | `string` | mountPropagation determines how mounts are propagated from the host to container and the other way around. When not set, MountPropagationNone is used. This field is beta in 1.10. When RecursiveReadOnly is set to IfPossible or to Enabled, MountPropagation must be None or unspecified (which defaults to None).


Possible enum values:



- `"Bidirectional"` means that the volume in a container will receive new mounts from the host or other containers, and its own mounts will be propagated from the container to the host or other containers. Note that this mode is recursively applied to all mounts in the volume ("rshared" in Linux terminology).

- `"HostToContainer"` means that the volume in a container will receive new mounts from the host or other containers, but filesystems mounted inside the container won't be propagated to the host or other containers. Note that this mode is recursively applied to all mounts in the volume ("rslave" in Linux terminology).

- `"None"` means that the volume in a container will not receive new mounts from the host or other containers, and filesystems mounted inside the container won't be propagated to the host or other containers. Note that this mode corresponds to "private" in Linux terminology. |
| `name` | `string` | This must match the Name of a Volume. |
| `readOnly` | `boolean` | Mounted read-only if true, read-write otherwise (false or unspecified). Defaults to false. |
| `recursiveReadOnly` | `string` | RecursiveReadOnly specifies whether read-only mounts should be handled recursively.


If ReadOnly is false, this field has no meaning and must be unspecified.


If ReadOnly is true, and this field is set to Disabled, the mount is not made recursively read-only.  If this field is set to IfPossible, the mount is made recursively read-only, if it is supported by the container runtime.  If this field is set to Enabled, the mount is made recursively read-only if it is supported by the container runtime, otherwise the pod will not be started and an error will be generated to indicate the reason.


If this field is set to IfPossible or Enabled, MountPropagation must be set to None (or be unspecified, which defaults to None).


If this field is not specified, it is treated as an equivalent of Disabled. |
| `subPath` | `string` | Path within the volume from which the container's volume should be mounted. Defaults to "" (volume's root). |
| `subPathExpr` | `string` | Expanded path within the volume from which the container's volume should be mounted. Behaves similarly to SubPath but environment variable references $(VAR_NAME) are expanded using the container's environment. Defaults to "" (volume's root). SubPathExpr and SubPath are mutually exclusive. |

### [#](#spectemplatespecdnsconfig).spec.template.spec.dnsConfig

描述PodDNSConfig defines the DNS parameters of a pod in addition to those generated from DNSPolicy.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `nameservers` | `array` | A list of DNS name server IP addresses. This will be appended to the base nameservers generated from DNSPolicy. Duplicated nameservers will be removed. |
| `options` | `array` | A list of DNS resolver options. This will be merged with the base options generated from DNSPolicy. Duplicated entries will be removed. Resolution options given in Options will override those that appear in the base DNSPolicy. |
| `searches` | `array` | A list of DNS search domains for host-name lookup. This will be appended to the base search paths generated from DNSPolicy. Duplicated search paths will be removed. |

### [#](#spectemplatespecdnsconfignameservers).spec.template.spec.dnsConfig.nameservers

描述A list of DNS name server IP addresses. This will be appended to the base nameservers generated from DNSPolicy. Duplicated nameservers will be removed.类型`array`### [#](#spectemplatespecdnsconfignameservers-1).spec.template.spec.dnsConfig.nameservers[]

类型`string`### [#](#spectemplatespecdnsconfigoptions).spec.template.spec.dnsConfig.options

描述A list of DNS resolver options. This will be merged with the base options generated from DNSPolicy. Duplicated entries will be removed. Resolution options given in Options will override those that appear in the base DNSPolicy.类型`array`### [#](#spectemplatespecdnsconfigoptions-1).spec.template.spec.dnsConfig.options[]

描述PodDNSConfigOption defines DNS resolver options of a pod.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `name` | `string` | Name is this DNS resolver option's name. Required. |
| `value` | `string` | Value is this DNS resolver option's value. |

### [#](#spectemplatespecdnsconfigsearches).spec.template.spec.dnsConfig.searches

描述A list of DNS search domains for host-name lookup. This will be appended to the base search paths generated from DNSPolicy. Duplicated search paths will be removed.类型`array`### [#](#spectemplatespecdnsconfigsearches-1).spec.template.spec.dnsConfig.searches[]

类型`string`### [#](#spectemplatespecephemeralcontainers).spec.template.spec.ephemeralContainers

描述List of ephemeral containers run in this pod. Ephemeral containers may be run in an existing pod to perform user-initiated actions such as debugging. This list cannot be specified when creating a pod, and it cannot be modified by updating the pod spec. In order to add an ephemeral container to an existing pod, use the pod's ephemeralcontainers subresource.类型`array`### [#](#spectemplatespecephemeralcontainers-1).spec.template.spec.ephemeralContainers[]

描述An EphemeralContainer is a temporary container that you may add to an existing Pod for user-initiated activities such as debugging. Ephemeral containers have no resource or scheduling guarantees, and they will not be restarted when they exit or when a Pod is removed or restarted. The kubelet may evict a Pod if an ephemeral container causes the Pod to exceed its resource allocation.

To add an ephemeral container, use the ephemeralcontainers subresource of an existing Pod. Ephemeral containers may not be removed or restarted.类型`object`必填`name`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `args` | `array` | Arguments to the entrypoint. The image's CMD is used if this is not provided. Variable references $(VAR_NAME) are expanded using the container's environment. If a variable cannot be resolved, the reference in the input string will be unchanged. Double $$ are reduced to a single $, which allows for escaping the $(VAR_NAME) syntax: i.e. "$$(VAR_NAME)" will produce the string literal "$(VAR_NAME)". Escaped references will never be expanded, regardless of whether the variable exists or not. Cannot be updated. More info: [https://kubernetes.io/docs/tasks/inject-data-application/define-command-argument-container/#running-a-command-in-a-shell](https://kubernetes.io/docs/tasks/inject-data-application/define-command-argument-container/#running-a-command-in-a-shell) |
| `command` | `array` | Entrypoint array. Not executed within a shell. The image's ENTRYPOINT is used if this is not provided. Variable references $(VAR_NAME) are expanded using the container's environment. If a variable cannot be resolved, the reference in the input string will be unchanged. Double $$ are reduced to a single $, which allows for escaping the $(VAR_NAME) syntax: i.e. "$$(VAR_NAME)" will produce the string literal "$(VAR_NAME)". Escaped references will never be expanded, regardless of whether the variable exists or not. Cannot be updated. More info: [https://kubernetes.io/docs/tasks/inject-data-application/define-command-argument-container/#running-a-command-in-a-shell](https://kubernetes.io/docs/tasks/inject-data-application/define-command-argument-container/#running-a-command-in-a-shell) |
| `env` | `array` | List of environment variables to set in the container. Cannot be updated. |
| `envFrom` | `array` | List of sources to populate environment variables in the container. The keys defined within a source must be a C_IDENTIFIER. All invalid keys will be reported as an event when the container is starting. When a key exists in multiple sources, the value associated with the last source will take precedence. Values defined by an Env with a duplicate key will take precedence. Cannot be updated. |
| `image` | `string` | Container image name. More info: [https://kubernetes.io/docs/concepts/containers/images](https://kubernetes.io/docs/concepts/containers/images) |
| `imagePullPolicy` | `string` | Image pull policy. One of Always, Never, IfNotPresent. Defaults to Always if :latest tag is specified, or IfNotPresent otherwise. Cannot be updated. More info: [https://kubernetes.io/docs/concepts/containers/images#updating-images](https://kubernetes.io/docs/concepts/containers/images#updating-images)


Possible enum values:



- `"Always"` means that kubelet always attempts to pull the latest image. Container will fail If the pull fails.

- `"IfNotPresent"` means that kubelet pulls if the image isn't present on disk. Container will fail if the image isn't present and the pull fails.

- `"Never"` means that kubelet never pulls an image, but only uses a local image. Container will fail if the image isn't present |
| `lifecycle` | `object` | Lifecycle describes actions that the management system should take in response to container lifecycle events. For the PostStart and PreStop lifecycle handlers, management of the container blocks until the action is complete, unless the container process fails, in which case the handler is aborted. |
| `livenessProbe` | `object` | Probe describes a health check to be performed against a container to determine whether it is alive or ready to receive traffic. |
| `name` | `string` | Name of the ephemeral container specified as a DNS_LABEL. This name must be unique among all containers, init containers and ephemeral containers. |
| `ports` | `array` | Ports are not allowed for ephemeral containers. |
| `readinessProbe` | `object` | Probe describes a health check to be performed against a container to determine whether it is alive or ready to receive traffic. |
| `resizePolicy` | `array` | Resources resize policy for the container. |
| `resources` | `object` | ResourceRequirements describes the compute resource requirements. |
| `restartPolicy` | `string` | Restart policy for the container to manage the restart behavior of each container within a pod. This may only be set for init containers. You cannot set this field on ephemeral containers. |
| `securityContext` | `object` | SecurityContext holds security configuration that will be applied to a container. Some fields are present in both SecurityContext and PodSecurityContext.  When both are set, the values in SecurityContext take precedence. |
| `startupProbe` | `object` | Probe describes a health check to be performed against a container to determine whether it is alive or ready to receive traffic. |
| `stdin` | `boolean` | Whether this container should allocate a buffer for stdin in the container runtime. If this is not set, reads from stdin in the container will always result in EOF. Default is false. |
| `stdinOnce` | `boolean` | Whether the container runtime should close the stdin channel after it has been opened by a single attach. When stdin is true the stdin stream will remain open across multiple attach sessions. If stdinOnce is set to true, stdin is opened on container start, is empty until the first client attaches to stdin, and then remains open and accepts data until the client disconnects, at which time stdin is closed and remains closed until the container is restarted. If this flag is false, a container processes that reads from stdin will never receive an EOF. Default is false |
| `targetContainerName` | `string` | If set, the name of the container from PodSpec that this ephemeral container targets. The ephemeral container will be run in the namespaces (IPC, PID, etc) of this container. If not set then the ephemeral container uses the namespaces configured in the Pod spec.


The container runtime must implement support for this feature. If the runtime does not support namespace targeting then the result of setting this field is undefined. |
| `terminationMessagePath` | `string` | Optional: Path at which the file to which the container's termination message will be written is mounted into the container's filesystem. Message written is intended to be brief final status, such as an assertion failure message. Will be truncated by the node if greater than 4096 bytes. The total message length across all containers will be limited to 12kb. Defaults to /dev/termination-log. Cannot be updated. |
| `terminationMessagePolicy` | `string` | Indicate how the termination message should be populated. File will use the contents of terminationMessagePath to populate the container status message on both success and failure. FallbackToLogsOnError will use the last chunk of container log output if the termination message file is empty and the container exited with an error. The log output is limited to 2048 bytes or 80 lines, whichever is smaller. Defaults to File. Cannot be updated.


Possible enum values:



- `"FallbackToLogsOnError"` will read the most recent contents of the container logs for the container status message when the container exits with an error and the terminationMessagePath has no contents.

- `"File"` is the default behavior and will set the container status message to the contents of the container's terminationMessagePath when the container exits. |
| `tty` | `boolean` | Whether this container should allocate a TTY for itself, also requires 'stdin' to be true. Default is false. |
| `volumeDevices` | `array` | volumeDevices is the list of block devices to be used by the container. |
| `volumeMounts` | `array` | Pod volumes to mount into the container's filesystem. Subpath mounts are not allowed for ephemeral containers. Cannot be updated. |
| `workingDir` | `string` | Container's working directory. If not specified, the container runtime's default will be used, which might be configured in the container image. Cannot be updated. |

### [#](#spectemplatespecephemeralcontainersargs).spec.template.spec.ephemeralContainers[].args

描述Arguments to the entrypoint. The image's CMD is used if this is not provided. Variable references $(VAR_NAME) are expanded using the container's environment. If a variable cannot be resolved, the reference in the input string will be unchanged. Double $$ are reduced to a single $, which allows for escaping the $(VAR_NAME) syntax: i.e. "$$(VAR_NAME)" will produce the string literal "$(VAR_NAME)". Escaped references will never be expanded, regardless of whether the variable exists or not. Cannot be updated. More info: https://kubernetes.io/docs/tasks/inject-data-application/define-command-argument-container/#running-a-command-in-a-shell类型`array`### [#](#spectemplatespecephemeralcontainersargs-1).spec.template.spec.ephemeralContainers[].args[]

类型`string`### [#](#spectemplatespecephemeralcontainerscommand).spec.template.spec.ephemeralContainers[].command

描述Entrypoint array. Not executed within a shell. The image's ENTRYPOINT is used if this is not provided. Variable references $(VAR_NAME) are expanded using the container's environment. If a variable cannot be resolved, the reference in the input string will be unchanged. Double $$ are reduced to a single $, which allows for escaping the $(VAR_NAME) syntax: i.e. "$$(VAR_NAME)" will produce the string literal "$(VAR_NAME)". Escaped references will never be expanded, regardless of whether the variable exists or not. Cannot be updated. More info: https://kubernetes.io/docs/tasks/inject-data-application/define-command-argument-container/#running-a-command-in-a-shell类型`array`### [#](#spectemplatespecephemeralcontainerscommand-1).spec.template.spec.ephemeralContainers[].command[]

类型`string`### [#](#spectemplatespecephemeralcontainersenv).spec.template.spec.ephemeralContainers[].env

描述List of environment variables to set in the container. Cannot be updated.类型`array`### [#](#spectemplatespecephemeralcontainersenv-1).spec.template.spec.ephemeralContainers[].env[]

描述EnvVar represents an environment variable present in a Container.类型`object`必填`name`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `name` | `string` | Name of the environment variable. Must be a C_IDENTIFIER. |
| `value` | `string` | Variable references $(VAR_NAME) are expanded using the previously defined environment variables in the container and any service environment variables. If a variable cannot be resolved, the reference in the input string will be unchanged. Double $$ are reduced to a single $, which allows for escaping the $(VAR_NAME) syntax: i.e. "$$(VAR_NAME)" will produce the string literal "$(VAR_NAME)". Escaped references will never be expanded, regardless of whether the variable exists or not. Defaults to "". |
| `valueFrom` | `object` | EnvVarSource represents a source for the value of an EnvVar. |

### [#](#spectemplatespecephemeralcontainersenvvaluefrom).spec.template.spec.ephemeralContainers[].env[].valueFrom

描述EnvVarSource represents a source for the value of an EnvVar.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `configMapKeyRef` | `object` | Selects a key from a ConfigMap. |
| `fieldRef` | `object` | ObjectFieldSelector selects an APIVersioned field of an object. |
| `resourceFieldRef` | `object` | ResourceFieldSelector represents container resources (cpu, memory) and their output format |
| `secretKeyRef` | `object` | SecretKeySelector selects a key of a Secret. |

### [#](#spectemplatespecephemeralcontainersenvvaluefromconfigmapkeyref).spec.template.spec.ephemeralContainers[].env[].valueFrom.configMapKeyRef

描述Selects a key from a ConfigMap.类型`object`必填`key`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `key` | `string` | The key to select. |
| `name` | `string` | Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names) |
| `optional` | `boolean` | Specify whether the ConfigMap or its key must be defined |

### [#](#spectemplatespecephemeralcontainersenvvaluefromfieldref).spec.template.spec.ephemeralContainers[].env[].valueFrom.fieldRef

描述ObjectFieldSelector selects an APIVersioned field of an object.类型`object`必填`fieldPath`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `apiVersion` | `string` | Version of the schema the FieldPath is written in terms of, defaults to "v1". |
| `fieldPath` | `string` | Path of the field to select in the specified API version. |

### [#](#spectemplatespecephemeralcontainersenvvaluefromresourcefieldref).spec.template.spec.ephemeralContainers[].env[].valueFrom.resourceFieldRef

描述ResourceFieldSelector represents container resources (cpu, memory) and their output format类型`object`必填`resource`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `containerName` | `string` | Container name: required for volumes, optional for env vars |
| `divisor` | `string|number` | Quantity is a fixed-point representation of a number. It provides convenient marshaling/unmarshaling in JSON and YAML, in addition to String() and AsInt64() accessors.


The serialization format is:



````

	(Note that <suffix> may be empty, from the "" case in <decimalSI>.)

<digit>           ::= 0 | 1 | ... | 9 <digits>          ::= <digit> | <digit><digits> <number>          ::= <digits> | <digits>.<digits> | <digits>. | .<digits> <sign>            ::= "+" | "-" <signedNumber>    ::= <number> | <sign><number> <suffix>          ::= <binarySI> | <decimalExponent> | <decimalSI> <binarySI>        ::= Ki | Mi | Gi | Ti | Pi | Ei

	(International System of units; See: http://physics.nist.gov/cuu/Units/binary.html)

<decimalSI>       ::= m | "" | k | M | G | T | P | E

	(Note that 1024 = 1Ki but 1000 = 1k; I didn't choose the capitalization.)

<decimalExponent> ::= "e" <signedNumber> | "E" <signedNumber> ```

No matter which of the three exponent forms is used, no quantity may represent a number greater than 2^63-1 in magnitude, nor may it have more than 3 decimal places. Numbers larger or more precise will be capped or rounded up. (E.g.: 0.1m will rounded up to 1m.) This may be extended in the future if we require larger or smaller quantities.

When a Quantity is parsed from a string, it will remember the type of suffix it had, and will use the same type again when it is serialized.

Before serializing, Quantity will be put in "canonical form". This means that Exponent/suffix will be adjusted up or down (with a corresponding increase or decrease in Mantissa) such that:

- No precision is lost - No fractional digits will be emitted - The exponent (or suffix) is as large as possible.

The sign will be omitted unless the number is negative.

Examples:

- 1.5 will be serialized as "1500m" - 1.5Gi will be serialized as "1536Mi"

Note that the quantity will NEVER be internally represented by a floating point number. That is the whole point of this exercise.

Non-canonical values will still parse as long as they are well formed, but will be re-emitted in their canonical form. (So always use canonical form, or don't diff.)

This format is intended to make it difficult to use these numbers without writing some sort of special handling code in the hopes that that will cause implementors to also use a fixed point implementation.

```` |
| `resource` | `string` | Required: resource to select |

### [#](#spectemplatespecephemeralcontainersenvvaluefromsecretkeyref).spec.template.spec.ephemeralContainers[].env[].valueFrom.secretKeyRef

描述SecretKeySelector selects a key of a Secret.类型`object`必填`key`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `key` | `string` | The key of the secret to select from.  Must be a valid secret key. |
| `name` | `string` | Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names) |
| `optional` | `boolean` | Specify whether the Secret or its key must be defined |

### [#](#spectemplatespecephemeralcontainersenvfrom).spec.template.spec.ephemeralContainers[].envFrom

描述List of sources to populate environment variables in the container. The keys defined within a source must be a C_IDENTIFIER. All invalid keys will be reported as an event when the container is starting. When a key exists in multiple sources, the value associated with the last source will take precedence. Values defined by an Env with a duplicate key will take precedence. Cannot be updated.类型`array`### [#](#spectemplatespecephemeralcontainersenvfrom-1).spec.template.spec.ephemeralContainers[].envFrom[]

描述EnvFromSource represents the source of a set of ConfigMaps类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `configMapRef` | `object` | ConfigMapEnvSource selects a ConfigMap to populate the environment variables with.


The contents of the target ConfigMap's Data field will represent the key-value pairs as environment variables. |
| `prefix` | `string` | An optional identifier to prepend to each key in the ConfigMap. Must be a C_IDENTIFIER. |
| `secretRef` | `object` | SecretEnvSource selects a Secret to populate the environment variables with.


The contents of the target Secret's Data field will represent the key-value pairs as environment variables. |

### [#](#spectemplatespecephemeralcontainersenvfromconfigmapref).spec.template.spec.ephemeralContainers[].envFrom[].configMapRef

描述ConfigMapEnvSource selects a ConfigMap to populate the environment variables with.

The contents of the target ConfigMap's Data field will represent the key-value pairs as environment variables.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `name` | `string` | Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names) |
| `optional` | `boolean` | Specify whether the ConfigMap must be defined |

### [#](#spectemplatespecephemeralcontainersenvfromsecretref).spec.template.spec.ephemeralContainers[].envFrom[].secretRef

描述SecretEnvSource selects a Secret to populate the environment variables with.

The contents of the target Secret's Data field will represent the key-value pairs as environment variables.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `name` | `string` | Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names) |
| `optional` | `boolean` | Specify whether the Secret must be defined |

### [#](#spectemplatespecephemeralcontainerslifecycle).spec.template.spec.ephemeralContainers[].lifecycle

描述Lifecycle describes actions that the management system should take in response to container lifecycle events. For the PostStart and PreStop lifecycle handlers, management of the container blocks until the action is complete, unless the container process fails, in which case the handler is aborted.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `postStart` | `object` | LifecycleHandler defines a specific action that should be taken in a lifecycle hook. One and only one of the fields, except TCPSocket must be specified. |
| `preStop` | `object` | LifecycleHandler defines a specific action that should be taken in a lifecycle hook. One and only one of the fields, except TCPSocket must be specified. |

### [#](#spectemplatespecephemeralcontainerslifecyclepoststart).spec.template.spec.ephemeralContainers[].lifecycle.postStart

描述LifecycleHandler defines a specific action that should be taken in a lifecycle hook. One and only one of the fields, except TCPSocket must be specified.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `exec` | `object` | ExecAction describes a "run in container" action. |
| `httpGet` | `object` | HTTPGetAction describes an action based on HTTP Get requests. |
| `sleep` | `object` | SleepAction describes a "sleep" action. |
| `tcpSocket` | `object` | TCPSocketAction describes an action based on opening a socket |

### [#](#spectemplatespecephemeralcontainerslifecyclepoststartexec).spec.template.spec.ephemeralContainers[].lifecycle.postStart.exec

描述ExecAction describes a "run in container" action.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `command` | `array` | Command is the command line to execute inside the container, the working directory for the command  is root ('/') in the container's filesystem. The command is simply exec'd, it is not run inside a shell, so traditional shell instructions ('|', etc) won't work. To use a shell, you need to explicitly call out to that shell. Exit status of 0 is treated as live/healthy and non-zero is unhealthy. |

### [#](#spectemplatespecephemeralcontainerslifecyclepoststartexeccommand).spec.template.spec.ephemeralContainers[].lifecycle.postStart.exec.command

描述Command is the command line to execute inside the container, the working directory for the command  is root ('/') in the container's filesystem. The command is simply exec'd, it is not run inside a shell, so traditional shell instructions ('|', etc) won't work. To use a shell, you need to explicitly call out to that shell. Exit status of 0 is treated as live/healthy and non-zero is unhealthy.类型`array`### [#](#spectemplatespecephemeralcontainerslifecyclepoststartexeccommand-1).spec.template.spec.ephemeralContainers[].lifecycle.postStart.exec.command[]

类型`string`### [#](#spectemplatespecephemeralcontainerslifecyclepoststarthttpget).spec.template.spec.ephemeralContainers[].lifecycle.postStart.httpGet

描述HTTPGetAction describes an action based on HTTP Get requests.类型`object`必填`port`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `host` | `string` | Host name to connect to, defaults to the pod IP. You probably want to set "Host" in httpHeaders instead. |
| `httpHeaders` | `array` | Custom headers to set in the request. HTTP allows repeated headers. |
| `path` | `string` | Path to access on the HTTP server. |
| `port` | `integer|string` | IntOrString is a type that can hold an int32 or a string.  When used in JSON or YAML marshalling and unmarshalling, it produces or consumes the inner type.  This allows you to have, for example, a JSON field that can accept a name or number. |
| `scheme` | `string` | Scheme to use for connecting to the host. Defaults to HTTP.


Possible enum values:



- `"HTTP"` means that the scheme used will be http://

- `"HTTPS"` means that the scheme used will be https:// |

### [#](#spectemplatespecephemeralcontainerslifecyclepoststarthttpgethttpheaders).spec.template.spec.ephemeralContainers[].lifecycle.postStart.httpGet.httpHeaders

描述Custom headers to set in the request. HTTP allows repeated headers.类型`array`### [#](#spectemplatespecephemeralcontainerslifecyclepoststarthttpgethttpheaders-1).spec.template.spec.ephemeralContainers[].lifecycle.postStart.httpGet.httpHeaders[]

描述HTTPHeader describes a custom header to be used in HTTP probes类型`object`必填`name``value`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `name` | `string` | The header field name. This will be canonicalized upon output, so case-variant names will be understood as the same header. |
| `value` | `string` | The header field value |

### [#](#spectemplatespecephemeralcontainerslifecyclepoststartsleep).spec.template.spec.ephemeralContainers[].lifecycle.postStart.sleep

描述SleepAction describes a "sleep" action.类型`object`必填`seconds`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `seconds` | `integer` | Seconds is the number of seconds to sleep. |

### [#](#spectemplatespecephemeralcontainerslifecyclepoststarttcpsocket).spec.template.spec.ephemeralContainers[].lifecycle.postStart.tcpSocket

描述TCPSocketAction describes an action based on opening a socket类型`object`必填`port`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `host` | `string` | Optional: Host name to connect to, defaults to the pod IP. |
| `port` | `integer|string` | IntOrString is a type that can hold an int32 or a string.  When used in JSON or YAML marshalling and unmarshalling, it produces or consumes the inner type.  This allows you to have, for example, a JSON field that can accept a name or number. |

### [#](#spectemplatespecephemeralcontainerslifecycleprestop).spec.template.spec.ephemeralContainers[].lifecycle.preStop

描述LifecycleHandler defines a specific action that should be taken in a lifecycle hook. One and only one of the fields, except TCPSocket must be specified.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `exec` | `object` | ExecAction describes a "run in container" action. |
| `httpGet` | `object` | HTTPGetAction describes an action based on HTTP Get requests. |
| `sleep` | `object` | SleepAction describes a "sleep" action. |
| `tcpSocket` | `object` | TCPSocketAction describes an action based on opening a socket |

### [#](#spectemplatespecephemeralcontainerslifecycleprestopexec).spec.template.spec.ephemeralContainers[].lifecycle.preStop.exec

描述ExecAction describes a "run in container" action.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `command` | `array` | Command is the command line to execute inside the container, the working directory for the command  is root ('/') in the container's filesystem. The command is simply exec'd, it is not run inside a shell, so traditional shell instructions ('|', etc) won't work. To use a shell, you need to explicitly call out to that shell. Exit status of 0 is treated as live/healthy and non-zero is unhealthy. |

### [#](#spectemplatespecephemeralcontainerslifecycleprestopexeccommand).spec.template.spec.ephemeralContainers[].lifecycle.preStop.exec.command

描述Command is the command line to execute inside the container, the working directory for the command  is root ('/') in the container's filesystem. The command is simply exec'd, it is not run inside a shell, so traditional shell instructions ('|', etc) won't work. To use a shell, you need to explicitly call out to that shell. Exit status of 0 is treated as live/healthy and non-zero is unhealthy.类型`array`### [#](#spectemplatespecephemeralcontainerslifecycleprestopexeccommand-1).spec.template.spec.ephemeralContainers[].lifecycle.preStop.exec.command[]

类型`string`### [#](#spectemplatespecephemeralcontainerslifecycleprestophttpget).spec.template.spec.ephemeralContainers[].lifecycle.preStop.httpGet

描述HTTPGetAction describes an action based on HTTP Get requests.类型`object`必填`port`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `host` | `string` | Host name to connect to, defaults to the pod IP. You probably want to set "Host" in httpHeaders instead. |
| `httpHeaders` | `array` | Custom headers to set in the request. HTTP allows repeated headers. |
| `path` | `string` | Path to access on the HTTP server. |
| `port` | `integer|string` | IntOrString is a type that can hold an int32 or a string.  When used in JSON or YAML marshalling and unmarshalling, it produces or consumes the inner type.  This allows you to have, for example, a JSON field that can accept a name or number. |
| `scheme` | `string` | Scheme to use for connecting to the host. Defaults to HTTP.


Possible enum values:



- `"HTTP"` means that the scheme used will be http://

- `"HTTPS"` means that the scheme used will be https:// |

### [#](#spectemplatespecephemeralcontainerslifecycleprestophttpgethttpheaders).spec.template.spec.ephemeralContainers[].lifecycle.preStop.httpGet.httpHeaders

描述Custom headers to set in the request. HTTP allows repeated headers.类型`array`### [#](#spectemplatespecephemeralcontainerslifecycleprestophttpgethttpheaders-1).spec.template.spec.ephemeralContainers[].lifecycle.preStop.httpGet.httpHeaders[]

描述HTTPHeader describes a custom header to be used in HTTP probes类型`object`必填`name``value`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `name` | `string` | The header field name. This will be canonicalized upon output, so case-variant names will be understood as the same header. |
| `value` | `string` | The header field value |

### [#](#spectemplatespecephemeralcontainerslifecycleprestopsleep).spec.template.spec.ephemeralContainers[].lifecycle.preStop.sleep

描述SleepAction describes a "sleep" action.类型`object`必填`seconds`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `seconds` | `integer` | Seconds is the number of seconds to sleep. |

### [#](#spectemplatespecephemeralcontainerslifecycleprestoptcpsocket).spec.template.spec.ephemeralContainers[].lifecycle.preStop.tcpSocket

描述TCPSocketAction describes an action based on opening a socket类型`object`必填`port`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `host` | `string` | Optional: Host name to connect to, defaults to the pod IP. |
| `port` | `integer|string` | IntOrString is a type that can hold an int32 or a string.  When used in JSON or YAML marshalling and unmarshalling, it produces or consumes the inner type.  This allows you to have, for example, a JSON field that can accept a name or number. |

### [#](#spectemplatespecephemeralcontainerslivenessprobe).spec.template.spec.ephemeralContainers[].livenessProbe

描述Probe describes a health check to be performed against a container to determine whether it is alive or ready to receive traffic.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `exec` | `object` | ExecAction describes a "run in container" action. |
| `failureThreshold` | `integer` | Minimum consecutive failures for the probe to be considered failed after having succeeded. Defaults to 3. Minimum value is 1. |
| `grpc` | `object` | GRPCAction specifies an action involving a GRPC service. |
| `httpGet` | `object` | HTTPGetAction describes an action based on HTTP Get requests. |
| `initialDelaySeconds` | `integer` | Number of seconds after the container has started before liveness probes are initiated. More info: [https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle#container-probes](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle#container-probes) |
| `periodSeconds` | `integer` | How often (in seconds) to perform the probe. Default to 10 seconds. Minimum value is 1. |
| `successThreshold` | `integer` | Minimum consecutive successes for the probe to be considered successful after having failed. Defaults to 1. Must be 1 for liveness and startup. Minimum value is 1. |
| `tcpSocket` | `object` | TCPSocketAction describes an action based on opening a socket |
| `terminationGracePeriodSeconds` | `integer` | Optional duration in seconds the pod needs to terminate gracefully upon probe failure. The grace period is the duration in seconds after the processes running in the pod are sent a termination signal and the time when the processes are forcibly halted with a kill signal. Set this value longer than the expected cleanup time for your process. If this value is nil, the pod's terminationGracePeriodSeconds will be used. Otherwise, this value overrides the value provided by the pod spec. Value must be non-negative integer. The value zero indicates stop immediately via the kill signal (no opportunity to shut down). This is a beta field and requires enabling ProbeTerminationGracePeriod feature gate. Minimum value is 1. spec.terminationGracePeriodSeconds is used if unset. |
| `timeoutSeconds` | `integer` | Number of seconds after which the probe times out. Defaults to 1 second. Minimum value is 1. More info: [https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle#container-probes](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle#container-probes) |

### [#](#spectemplatespecephemeralcontainerslivenessprobeexec).spec.template.spec.ephemeralContainers[].livenessProbe.exec

描述ExecAction describes a "run in container" action.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `command` | `array` | Command is the command line to execute inside the container, the working directory for the command  is root ('/') in the container's filesystem. The command is simply exec'd, it is not run inside a shell, so traditional shell instructions ('|', etc) won't work. To use a shell, you need to explicitly call out to that shell. Exit status of 0 is treated as live/healthy and non-zero is unhealthy. |

### [#](#spectemplatespecephemeralcontainerslivenessprobeexeccommand).spec.template.spec.ephemeralContainers[].livenessProbe.exec.command

描述Command is the command line to execute inside the container, the working directory for the command  is root ('/') in the container's filesystem. The command is simply exec'd, it is not run inside a shell, so traditional shell instructions ('|', etc) won't work. To use a shell, you need to explicitly call out to that shell. Exit status of 0 is treated as live/healthy and non-zero is unhealthy.类型`array`### [#](#spectemplatespecephemeralcontainerslivenessprobeexeccommand-1).spec.template.spec.ephemeralContainers[].livenessProbe.exec.command[]

类型`string`### [#](#spectemplatespecephemeralcontainerslivenessprobegrpc).spec.template.spec.ephemeralContainers[].livenessProbe.grpc

描述GRPCAction specifies an action involving a GRPC service.类型`object`必填`port`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `port` | `integer` | Port number of the gRPC service. Number must be in the range 1 to 65535. |
| `service` | `string` | Service is the name of the service to place in the gRPC HealthCheckRequest (see [https://github.com/grpc/grpc/blob/master/doc/health-checking.md](https://github.com/grpc/grpc/blob/master/doc/health-checking.md)).


If this is not specified, the default behavior is defined by gRPC. |

### [#](#spectemplatespecephemeralcontainerslivenessprobehttpget).spec.template.spec.ephemeralContainers[].livenessProbe.httpGet

描述HTTPGetAction describes an action based on HTTP Get requests.类型`object`必填`port`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `host` | `string` | Host name to connect to, defaults to the pod IP. You probably want to set "Host" in httpHeaders instead. |
| `httpHeaders` | `array` | Custom headers to set in the request. HTTP allows repeated headers. |
| `path` | `string` | Path to access on the HTTP server. |
| `port` | `integer|string` | IntOrString is a type that can hold an int32 or a string.  When used in JSON or YAML marshalling and unmarshalling, it produces or consumes the inner type.  This allows you to have, for example, a JSON field that can accept a name or number. |
| `scheme` | `string` | Scheme to use for connecting to the host. Defaults to HTTP.


Possible enum values:



- `"HTTP"` means that the scheme used will be http://

- `"HTTPS"` means that the scheme used will be https:// |

### [#](#spectemplatespecephemeralcontainerslivenessprobehttpgethttpheaders).spec.template.spec.ephemeralContainers[].livenessProbe.httpGet.httpHeaders

描述Custom headers to set in the request. HTTP allows repeated headers.类型`array`### [#](#spectemplatespecephemeralcontainerslivenessprobehttpgethttpheaders-1).spec.template.spec.ephemeralContainers[].livenessProbe.httpGet.httpHeaders[]

描述HTTPHeader describes a custom header to be used in HTTP probes类型`object`必填`name``value`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `name` | `string` | The header field name. This will be canonicalized upon output, so case-variant names will be understood as the same header. |
| `value` | `string` | The header field value |

### [#](#spectemplatespecephemeralcontainerslivenessprobetcpsocket).spec.template.spec.ephemeralContainers[].livenessProbe.tcpSocket

描述TCPSocketAction describes an action based on opening a socket类型`object`必填`port`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `host` | `string` | Optional: Host name to connect to, defaults to the pod IP. |
| `port` | `integer|string` | IntOrString is a type that can hold an int32 or a string.  When used in JSON or YAML marshalling and unmarshalling, it produces or consumes the inner type.  This allows you to have, for example, a JSON field that can accept a name or number. |

### [#](#spectemplatespecephemeralcontainersports).spec.template.spec.ephemeralContainers[].ports

描述Ports are not allowed for ephemeral containers.类型`array`### [#](#spectemplatespecephemeralcontainersports-1).spec.template.spec.ephemeralContainers[].ports[]

描述ContainerPort represents a network port in a single container.类型`object`必填`containerPort`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `containerPort` | `integer` | Number of port to expose on the pod's IP address. This must be a valid port number, 0 < x < 65536. |
| `hostIP` | `string` | What host IP to bind the external port to. |
| `hostPort` | `integer` | Number of port to expose on the host. If specified, this must be a valid port number, 0 < x < 65536. If HostNetwork is specified, this must match ContainerPort. Most containers do not need this. |
| `name` | `string` | If specified, this must be an IANA_SVC_NAME and unique within the pod. Each named port in a pod must have a unique name. Name for the port that can be referred to by services. |
| `protocol` | `string` | Protocol for port. Must be UDP, TCP, or SCTP. Defaults to "TCP".


Possible enum values:



- `"SCTP"` is the SCTP protocol.

- `"TCP"` is the TCP protocol.

- `"UDP"` is the UDP protocol. |

### [#](#spectemplatespecephemeralcontainersreadinessprobe).spec.template.spec.ephemeralContainers[].readinessProbe

描述Probe describes a health check to be performed against a container to determine whether it is alive or ready to receive traffic.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `exec` | `object` | ExecAction describes a "run in container" action. |
| `failureThreshold` | `integer` | Minimum consecutive failures for the probe to be considered failed after having succeeded. Defaults to 3. Minimum value is 1. |
| `grpc` | `object` | GRPCAction specifies an action involving a GRPC service. |
| `httpGet` | `object` | HTTPGetAction describes an action based on HTTP Get requests. |
| `initialDelaySeconds` | `integer` | Number of seconds after the container has started before liveness probes are initiated. More info: [https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle#container-probes](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle#container-probes) |
| `periodSeconds` | `integer` | How often (in seconds) to perform the probe. Default to 10 seconds. Minimum value is 1. |
| `successThreshold` | `integer` | Minimum consecutive successes for the probe to be considered successful after having failed. Defaults to 1. Must be 1 for liveness and startup. Minimum value is 1. |
| `tcpSocket` | `object` | TCPSocketAction describes an action based on opening a socket |
| `terminationGracePeriodSeconds` | `integer` | Optional duration in seconds the pod needs to terminate gracefully upon probe failure. The grace period is the duration in seconds after the processes running in the pod are sent a termination signal and the time when the processes are forcibly halted with a kill signal. Set this value longer than the expected cleanup time for your process. If this value is nil, the pod's terminationGracePeriodSeconds will be used. Otherwise, this value overrides the value provided by the pod spec. Value must be non-negative integer. The value zero indicates stop immediately via the kill signal (no opportunity to shut down). This is a beta field and requires enabling ProbeTerminationGracePeriod feature gate. Minimum value is 1. spec.terminationGracePeriodSeconds is used if unset. |
| `timeoutSeconds` | `integer` | Number of seconds after which the probe times out. Defaults to 1 second. Minimum value is 1. More info: [https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle#container-probes](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle#container-probes) |

### [#](#spectemplatespecephemeralcontainersreadinessprobeexec).spec.template.spec.ephemeralContainers[].readinessProbe.exec

描述ExecAction describes a "run in container" action.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `command` | `array` | Command is the command line to execute inside the container, the working directory for the command  is root ('/') in the container's filesystem. The command is simply exec'd, it is not run inside a shell, so traditional shell instructions ('|', etc) won't work. To use a shell, you need to explicitly call out to that shell. Exit status of 0 is treated as live/healthy and non-zero is unhealthy. |

### [#](#spectemplatespecephemeralcontainersreadinessprobeexeccommand).spec.template.spec.ephemeralContainers[].readinessProbe.exec.command

描述Command is the command line to execute inside the container, the working directory for the command  is root ('/') in the container's filesystem. The command is simply exec'd, it is not run inside a shell, so traditional shell instructions ('|', etc) won't work. To use a shell, you need to explicitly call out to that shell. Exit status of 0 is treated as live/healthy and non-zero is unhealthy.类型`array`### [#](#spectemplatespecephemeralcontainersreadinessprobeexeccommand-1).spec.template.spec.ephemeralContainers[].readinessProbe.exec.command[]

类型`string`### [#](#spectemplatespecephemeralcontainersreadinessprobegrpc).spec.template.spec.ephemeralContainers[].readinessProbe.grpc

描述GRPCAction specifies an action involving a GRPC service.类型`object`必填`port`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `port` | `integer` | Port number of the gRPC service. Number must be in the range 1 to 65535. |
| `service` | `string` | Service is the name of the service to place in the gRPC HealthCheckRequest (see [https://github.com/grpc/grpc/blob/master/doc/health-checking.md](https://github.com/grpc/grpc/blob/master/doc/health-checking.md)).


If this is not specified, the default behavior is defined by gRPC. |

### [#](#spectemplatespecephemeralcontainersreadinessprobehttpget).spec.template.spec.ephemeralContainers[].readinessProbe.httpGet

描述HTTPGetAction describes an action based on HTTP Get requests.类型`object`必填`port`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `host` | `string` | Host name to connect to, defaults to the pod IP. You probably want to set "Host" in httpHeaders instead. |
| `httpHeaders` | `array` | Custom headers to set in the request. HTTP allows repeated headers. |
| `path` | `string` | Path to access on the HTTP server. |
| `port` | `integer|string` | IntOrString is a type that can hold an int32 or a string.  When used in JSON or YAML marshalling and unmarshalling, it produces or consumes the inner type.  This allows you to have, for example, a JSON field that can accept a name or number. |
| `scheme` | `string` | Scheme to use for connecting to the host. Defaults to HTTP.


Possible enum values:



- `"HTTP"` means that the scheme used will be http://

- `"HTTPS"` means that the scheme used will be https:// |

### [#](#spectemplatespecephemeralcontainersreadinessprobehttpgethttpheaders).spec.template.spec.ephemeralContainers[].readinessProbe.httpGet.httpHeaders

描述Custom headers to set in the request. HTTP allows repeated headers.类型`array`### [#](#spectemplatespecephemeralcontainersreadinessprobehttpgethttpheaders-1).spec.template.spec.ephemeralContainers[].readinessProbe.httpGet.httpHeaders[]

描述HTTPHeader describes a custom header to be used in HTTP probes类型`object`必填`name``value`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `name` | `string` | The header field name. This will be canonicalized upon output, so case-variant names will be understood as the same header. |
| `value` | `string` | The header field value |

### [#](#spectemplatespecephemeralcontainersreadinessprobetcpsocket).spec.template.spec.ephemeralContainers[].readinessProbe.tcpSocket

描述TCPSocketAction describes an action based on opening a socket类型`object`必填`port`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `host` | `string` | Optional: Host name to connect to, defaults to the pod IP. |
| `port` | `integer|string` | IntOrString is a type that can hold an int32 or a string.  When used in JSON or YAML marshalling and unmarshalling, it produces or consumes the inner type.  This allows you to have, for example, a JSON field that can accept a name or number. |

### [#](#spectemplatespecephemeralcontainersresizepolicy).spec.template.spec.ephemeralContainers[].resizePolicy

描述Resources resize policy for the container.类型`array`### [#](#spectemplatespecephemeralcontainersresizepolicy-1).spec.template.spec.ephemeralContainers[].resizePolicy[]

描述ContainerResizePolicy represents resource resize policy for the container.类型`object`必填`resourceName``restartPolicy`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `resourceName` | `string` | Name of the resource to which this resource resize policy applies. Supported values: cpu, memory. |
| `restartPolicy` | `string` | Restart policy to apply when specified resource is resized. If not specified, it defaults to NotRequired. |

### [#](#spectemplatespecephemeralcontainersresources).spec.template.spec.ephemeralContainers[].resources

描述ResourceRequirements describes the compute resource requirements.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `claims` | `array` | Claims lists the names of resources, defined in spec.resourceClaims, that are used by this container.


This is an alpha field and requires enabling the DynamicResourceAllocation feature gate.


This field is immutable. It can only be set for containers. |
| `limits` | `object` | Limits describes the maximum amount of compute resources allowed. More info: [https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/) |
| `requests` | `object` | Requests describes the minimum amount of compute resources required. If Requests is omitted for a container, it defaults to Limits if that is explicitly specified, otherwise to an implementation-defined value. Requests cannot exceed Limits. More info: [https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/) |

### [#](#spectemplatespecephemeralcontainersresourcesclaims).spec.template.spec.ephemeralContainers[].resources.claims

描述Claims lists the names of resources, defined in spec.resourceClaims, that are used by this container.

This is an alpha field and requires enabling the DynamicResourceAllocation feature gate.

This field is immutable. It can only be set for containers.类型`array`### [#](#spectemplatespecephemeralcontainersresourcesclaims-1).spec.template.spec.ephemeralContainers[].resources.claims[]

描述ResourceClaim references one entry in PodSpec.ResourceClaims.类型`object`必填`name`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `name` | `string` | Name must match the name of one entry in pod.spec.resourceClaims of the Pod where this field is used. It makes that resource available inside a container. |
| `request` | `string` | Request is the name chosen for a request in the referenced claim. If empty, everything from the claim is made available, otherwise only the result of this request. |

### [#](#spectemplatespecephemeralcontainersresourceslimits).spec.template.spec.ephemeralContainers[].resources.limits

描述Limits describes the maximum amount of compute resources allowed. More info: https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/类型`object`### [#](#spectemplatespecephemeralcontainersresourcesrequests).spec.template.spec.ephemeralContainers[].resources.requests

描述Requests describes the minimum amount of compute resources required. If Requests is omitted for a container, it defaults to Limits if that is explicitly specified, otherwise to an implementation-defined value. Requests cannot exceed Limits. More info: https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/类型`object`### [#](#spectemplatespecephemeralcontainerssecuritycontext).spec.template.spec.ephemeralContainers[].securityContext

描述SecurityContext holds security configuration that will be applied to a container. Some fields are present in both SecurityContext and PodSecurityContext.  When both are set, the values in SecurityContext take precedence.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `allowPrivilegeEscalation` | `boolean` | AllowPrivilegeEscalation controls whether a process can gain more privileges than its parent process. This bool directly controls if the no_new_privs flag will be set on the container process. AllowPrivilegeEscalation is true always when the container is: 1) run as Privileged 2) has CAP_SYS_ADMIN Note that this field cannot be set when spec.os.name is windows. |
| `appArmorProfile` | `object` | AppArmorProfile defines a pod or container's AppArmor settings. |
| `capabilities` | `object` | Adds and removes POSIX capabilities from running containers. |
| `privileged` | `boolean` | Run container in privileged mode. Processes in privileged containers are essentially equivalent to root on the host. Defaults to false. Note that this field cannot be set when spec.os.name is windows. |
| `procMount` | `string` | procMount denotes the type of proc mount to use for the containers. The default value is Default which uses the container runtime defaults for readonly paths and masked paths. This requires the ProcMountType feature flag to be enabled. Note that this field cannot be set when spec.os.name is windows.


Possible enum values:



- `"Default"` uses the container runtime defaults for readonly and masked paths for /proc. Most container runtimes mask certain paths in /proc to avoid accidental security exposure of special devices or information.

- `"Unmasked"` bypasses the default masking behavior of the container runtime and ensures the newly created /proc the container stays in tact with no modifications. |
| `readOnlyRootFilesystem` | `boolean` | Whether this container has a read-only root filesystem. Default is false. Note that this field cannot be set when spec.os.name is windows. |
| `runAsGroup` | `integer` | The GID to run the entrypoint of the container process. Uses runtime default if unset. May also be set in PodSecurityContext.  If set in both SecurityContext and PodSecurityContext, the value specified in SecurityContext takes precedence. Note that this field cannot be set when spec.os.name is windows. |
| `runAsNonRoot` | `boolean` | Indicates that the container must run as a non-root user. If true, the Kubelet will validate the image at runtime to ensure that it does not run as UID 0 (root) and fail to start the container if it does. If unset or false, no such validation will be performed. May also be set in PodSecurityContext.  If set in both SecurityContext and PodSecurityContext, the value specified in SecurityContext takes precedence. |
| `runAsUser` | `integer` | The UID to run the entrypoint of the container process. Defaults to user specified in image metadata if unspecified. May also be set in PodSecurityContext.  If set in both SecurityContext and PodSecurityContext, the value specified in SecurityContext takes precedence. Note that this field cannot be set when spec.os.name is windows. |
| `seLinuxOptions` | `object` | SELinuxOptions are the labels to be applied to the container |
| `seccompProfile` | `object` | SeccompProfile defines a pod/container's seccomp profile settings. Only one profile source may be set. |
| `windowsOptions` | `object` | WindowsSecurityContextOptions contain Windows-specific options and credentials. |

### [#](#spectemplatespecephemeralcontainerssecuritycontextapparmorprofile).spec.template.spec.ephemeralContainers[].securityContext.appArmorProfile

描述AppArmorProfile defines a pod or container's AppArmor settings.类型`object`必填`type`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `localhostProfile` | `string` | localhostProfile indicates a profile loaded on the node that should be used. The profile must be preconfigured on the node to work. Must match the loaded name of the profile. Must be set if and only if type is "Localhost". |
| `type` | `string` | type indicates which kind of AppArmor profile will be applied. Valid options are:
Localhost - a profile pre-loaded on the node.
RuntimeDefault - the container runtime's default profile.
Unconfined - no AppArmor enforcement.


Possible enum values:



- `"Localhost"` indicates that a profile pre-loaded on the node should be used.

- `"RuntimeDefault"` indicates that the container runtime's default AppArmor profile should be used.

- `"Unconfined"` indicates that no AppArmor profile should be enforced. |

### [#](#spectemplatespecephemeralcontainerssecuritycontextcapabilities).spec.template.spec.ephemeralContainers[].securityContext.capabilities

描述Adds and removes POSIX capabilities from running containers.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `add` | `array` | Added capabilities |
| `drop` | `array` | Removed capabilities |

### [#](#spectemplatespecephemeralcontainerssecuritycontextcapabilitiesadd).spec.template.spec.ephemeralContainers[].securityContext.capabilities.add

描述Added capabilities类型`array`### [#](#spectemplatespecephemeralcontainerssecuritycontextcapabilitiesadd-1).spec.template.spec.ephemeralContainers[].securityContext.capabilities.add[]

类型`string`### [#](#spectemplatespecephemeralcontainerssecuritycontextcapabilitiesdrop).spec.template.spec.ephemeralContainers[].securityContext.capabilities.drop

描述Removed capabilities类型`array`### [#](#spectemplatespecephemeralcontainerssecuritycontextcapabilitiesdrop-1).spec.template.spec.ephemeralContainers[].securityContext.capabilities.drop[]

类型`string`### [#](#spectemplatespecephemeralcontainerssecuritycontextselinuxoptions).spec.template.spec.ephemeralContainers[].securityContext.seLinuxOptions

描述SELinuxOptions are the labels to be applied to the container类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `level` | `string` | Level is SELinux level label that applies to the container. |
| `role` | `string` | Role is a SELinux role label that applies to the container. |
| `type` | `string` | Type is a SELinux type label that applies to the container. |
| `user` | `string` | User is a SELinux user label that applies to the container. |

### [#](#spectemplatespecephemeralcontainerssecuritycontextseccompprofile).spec.template.spec.ephemeralContainers[].securityContext.seccompProfile

描述SeccompProfile defines a pod/container's seccomp profile settings. Only one profile source may be set.类型`object`必填`type`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `localhostProfile` | `string` | localhostProfile indicates a profile defined in a file on the node should be used. The profile must be preconfigured on the node to work. Must be a descending path, relative to the kubelet's configured seccomp profile location. Must be set if type is "Localhost". Must NOT be set for any other type. |
| `type` | `string` | type indicates which kind of seccomp profile will be applied. Valid options are:


Localhost - a profile defined in a file on the node should be used. RuntimeDefault - the container runtime default profile should be used. Unconfined - no profile should be applied.


Possible enum values:



- `"Localhost"` indicates a profile defined in a file on the node should be used. The file's location relative to /seccomp.

- `"RuntimeDefault"` represents the default container runtime seccomp profile.

- `"Unconfined"` indicates no seccomp profile is applied (A.K.A. unconfined). |

### [#](#spectemplatespecephemeralcontainerssecuritycontextwindowsoptions).spec.template.spec.ephemeralContainers[].securityContext.windowsOptions

描述WindowsSecurityContextOptions contain Windows-specific options and credentials.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `gmsaCredentialSpec` | `string` | GMSACredentialSpec is where the GMSA admission webhook ([https://github.com/kubernetes-sigs/windows-gmsa](https://github.com/kubernetes-sigs/windows-gmsa)) inlines the contents of the GMSA credential spec named by the GMSACredentialSpecName field. |
| `gmsaCredentialSpecName` | `string` | GMSACredentialSpecName is the name of the GMSA credential spec to use. |
| `hostProcess` | `boolean` | HostProcess determines if a container should be run as a 'Host Process' container. All of a Pod's containers must have the same effective HostProcess value (it is not allowed to have a mix of HostProcess containers and non-HostProcess containers). In addition, if HostProcess is true then HostNetwork must also be set to true. |
| `runAsUserName` | `string` | The UserName in Windows to run the entrypoint of the container process. Defaults to the user specified in image metadata if unspecified. May also be set in PodSecurityContext. If set in both SecurityContext and PodSecurityContext, the value specified in SecurityContext takes precedence. |

### [#](#spectemplatespecephemeralcontainersstartupprobe).spec.template.spec.ephemeralContainers[].startupProbe

描述Probe describes a health check to be performed against a container to determine whether it is alive or ready to receive traffic.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `exec` | `object` | ExecAction describes a "run in container" action. |
| `failureThreshold` | `integer` | Minimum consecutive failures for the probe to be considered failed after having succeeded. Defaults to 3. Minimum value is 1. |
| `grpc` | `object` | GRPCAction specifies an action involving a GRPC service. |
| `httpGet` | `object` | HTTPGetAction describes an action based on HTTP Get requests. |
| `initialDelaySeconds` | `integer` | Number of seconds after the container has started before liveness probes are initiated. More info: [https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle#container-probes](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle#container-probes) |
| `periodSeconds` | `integer` | How often (in seconds) to perform the probe. Default to 10 seconds. Minimum value is 1. |
| `successThreshold` | `integer` | Minimum consecutive successes for the probe to be considered successful after having failed. Defaults to 1. Must be 1 for liveness and startup. Minimum value is 1. |
| `tcpSocket` | `object` | TCPSocketAction describes an action based on opening a socket |
| `terminationGracePeriodSeconds` | `integer` | Optional duration in seconds the pod needs to terminate gracefully upon probe failure. The grace period is the duration in seconds after the processes running in the pod are sent a termination signal and the time when the processes are forcibly halted with a kill signal. Set this value longer than the expected cleanup time for your process. If this value is nil, the pod's terminationGracePeriodSeconds will be used. Otherwise, this value overrides the value provided by the pod spec. Value must be non-negative integer. The value zero indicates stop immediately via the kill signal (no opportunity to shut down). This is a beta field and requires enabling ProbeTerminationGracePeriod feature gate. Minimum value is 1. spec.terminationGracePeriodSeconds is used if unset. |
| `timeoutSeconds` | `integer` | Number of seconds after which the probe times out. Defaults to 1 second. Minimum value is 1. More info: [https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle#container-probes](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle#container-probes) |

### [#](#spectemplatespecephemeralcontainersstartupprobeexec).spec.template.spec.ephemeralContainers[].startupProbe.exec

描述ExecAction describes a "run in container" action.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `command` | `array` | Command is the command line to execute inside the container, the working directory for the command  is root ('/') in the container's filesystem. The command is simply exec'd, it is not run inside a shell, so traditional shell instructions ('|', etc) won't work. To use a shell, you need to explicitly call out to that shell. Exit status of 0 is treated as live/healthy and non-zero is unhealthy. |

### [#](#spectemplatespecephemeralcontainersstartupprobeexeccommand).spec.template.spec.ephemeralContainers[].startupProbe.exec.command

描述Command is the command line to execute inside the container, the working directory for the command  is root ('/') in the container's filesystem. The command is simply exec'd, it is not run inside a shell, so traditional shell instructions ('|', etc) won't work. To use a shell, you need to explicitly call out to that shell. Exit status of 0 is treated as live/healthy and non-zero is unhealthy.类型`array`### [#](#spectemplatespecephemeralcontainersstartupprobeexeccommand-1).spec.template.spec.ephemeralContainers[].startupProbe.exec.command[]

类型`string`### [#](#spectemplatespecephemeralcontainersstartupprobegrpc).spec.template.spec.ephemeralContainers[].startupProbe.grpc

描述GRPCAction specifies an action involving a GRPC service.类型`object`必填`port`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `port` | `integer` | Port number of the gRPC service. Number must be in the range 1 to 65535. |
| `service` | `string` | Service is the name of the service to place in the gRPC HealthCheckRequest (see [https://github.com/grpc/grpc/blob/master/doc/health-checking.md](https://github.com/grpc/grpc/blob/master/doc/health-checking.md)).


If this is not specified, the default behavior is defined by gRPC. |

### [#](#spectemplatespecephemeralcontainersstartupprobehttpget).spec.template.spec.ephemeralContainers[].startupProbe.httpGet

描述HTTPGetAction describes an action based on HTTP Get requests.类型`object`必填`port`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `host` | `string` | Host name to connect to, defaults to the pod IP. You probably want to set "Host" in httpHeaders instead. |
| `httpHeaders` | `array` | Custom headers to set in the request. HTTP allows repeated headers. |
| `path` | `string` | Path to access on the HTTP server. |
| `port` | `integer|string` | IntOrString is a type that can hold an int32 or a string.  When used in JSON or YAML marshalling and unmarshalling, it produces or consumes the inner type.  This allows you to have, for example, a JSON field that can accept a name or number. |
| `scheme` | `string` | Scheme to use for connecting to the host. Defaults to HTTP.


Possible enum values:



- `"HTTP"` means that the scheme used will be http://

- `"HTTPS"` means that the scheme used will be https:// |

### [#](#spectemplatespecephemeralcontainersstartupprobehttpgethttpheaders).spec.template.spec.ephemeralContainers[].startupProbe.httpGet.httpHeaders

描述Custom headers to set in the request. HTTP allows repeated headers.类型`array`### [#](#spectemplatespecephemeralcontainersstartupprobehttpgethttpheaders-1).spec.template.spec.ephemeralContainers[].startupProbe.httpGet.httpHeaders[]

描述HTTPHeader describes a custom header to be used in HTTP probes类型`object`必填`name``value`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `name` | `string` | The header field name. This will be canonicalized upon output, so case-variant names will be understood as the same header. |
| `value` | `string` | The header field value |

### [#](#spectemplatespecephemeralcontainersstartupprobetcpsocket).spec.template.spec.ephemeralContainers[].startupProbe.tcpSocket

描述TCPSocketAction describes an action based on opening a socket类型`object`必填`port`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `host` | `string` | Optional: Host name to connect to, defaults to the pod IP. |
| `port` | `integer|string` | IntOrString is a type that can hold an int32 or a string.  When used in JSON or YAML marshalling and unmarshalling, it produces or consumes the inner type.  This allows you to have, for example, a JSON field that can accept a name or number. |

### [#](#spectemplatespecephemeralcontainersvolumedevices).spec.template.spec.ephemeralContainers[].volumeDevices

描述volumeDevices is the list of block devices to be used by the container.类型`array`### [#](#spectemplatespecephemeralcontainersvolumedevices-1).spec.template.spec.ephemeralContainers[].volumeDevices[]

描述volumeDevice describes a mapping of a raw block device within a container.类型`object`必填`name``devicePath`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `devicePath` | `string` | devicePath is the path inside of the container that the device will be mapped to. |
| `name` | `string` | name must match the name of a persistentVolumeClaim in the pod |

### [#](#spectemplatespecephemeralcontainersvolumemounts).spec.template.spec.ephemeralContainers[].volumeMounts

描述Pod volumes to mount into the container's filesystem. Subpath mounts are not allowed for ephemeral containers. Cannot be updated.类型`array`### [#](#spectemplatespecephemeralcontainersvolumemounts-1).spec.template.spec.ephemeralContainers[].volumeMounts[]

描述VolumeMount describes a mounting of a Volume within a container.类型`object`必填`name``mountPath`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `mountPath` | `string` | Path within the container at which the volume should be mounted.  Must not contain ':'. |
| `mountPropagation` | `string` | mountPropagation determines how mounts are propagated from the host to container and the other way around. When not set, MountPropagationNone is used. This field is beta in 1.10. When RecursiveReadOnly is set to IfPossible or to Enabled, MountPropagation must be None or unspecified (which defaults to None).


Possible enum values:



- `"Bidirectional"` means that the volume in a container will receive new mounts from the host or other containers, and its own mounts will be propagated from the container to the host or other containers. Note that this mode is recursively applied to all mounts in the volume ("rshared" in Linux terminology).

- `"HostToContainer"` means that the volume in a container will receive new mounts from the host or other containers, but filesystems mounted inside the container won't be propagated to the host or other containers. Note that this mode is recursively applied to all mounts in the volume ("rslave" in Linux terminology).

- `"None"` means that the volume in a container will not receive new mounts from the host or other containers, and filesystems mounted inside the container won't be propagated to the host or other containers. Note that this mode corresponds to "private" in Linux terminology. |
| `name` | `string` | This must match the Name of a Volume. |
| `readOnly` | `boolean` | Mounted read-only if true, read-write otherwise (false or unspecified). Defaults to false. |
| `recursiveReadOnly` | `string` | RecursiveReadOnly specifies whether read-only mounts should be handled recursively.


If ReadOnly is false, this field has no meaning and must be unspecified.


If ReadOnly is true, and this field is set to Disabled, the mount is not made recursively read-only.  If this field is set to IfPossible, the mount is made recursively read-only, if it is supported by the container runtime.  If this field is set to Enabled, the mount is made recursively read-only if it is supported by the container runtime, otherwise the pod will not be started and an error will be generated to indicate the reason.


If this field is set to IfPossible or Enabled, MountPropagation must be set to None (or be unspecified, which defaults to None).


If this field is not specified, it is treated as an equivalent of Disabled. |
| `subPath` | `string` | Path within the volume from which the container's volume should be mounted. Defaults to "" (volume's root). |
| `subPathExpr` | `string` | Expanded path within the volume from which the container's volume should be mounted. Behaves similarly to SubPath but environment variable references $(VAR_NAME) are expanded using the container's environment. Defaults to "" (volume's root). SubPathExpr and SubPath are mutually exclusive. |

### [#](#spectemplatespechostaliases).spec.template.spec.hostAliases

描述HostAliases is an optional list of hosts and IPs that will be injected into the pod's hosts file if specified.类型`array`### [#](#spectemplatespechostaliases-1).spec.template.spec.hostAliases[]

描述HostAlias holds the mapping between IP and hostnames that will be injected as an entry in the pod's hosts file.类型`object`必填`ip`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `hostnames` | `array` | Hostnames for the above IP address. |
| `ip` | `string` | IP address of the host file entry. |

### [#](#spectemplatespechostaliaseshostnames).spec.template.spec.hostAliases[].hostnames

描述Hostnames for the above IP address.类型`array`### [#](#spectemplatespechostaliaseshostnames-1).spec.template.spec.hostAliases[].hostnames[]

类型`string`### [#](#spectemplatespecimagepullsecrets).spec.template.spec.imagePullSecrets

描述ImagePullSecrets is an optional list of references to secrets in the same namespace to use for pulling any of the images used by this PodSpec. If specified, these secrets will be passed to individual puller implementations for them to use. More info: https://kubernetes.io/docs/concepts/containers/images#specifying-imagepullsecrets-on-a-pod类型`array`### [#](#spectemplatespecimagepullsecrets-1).spec.template.spec.imagePullSecrets[]

描述LocalObjectReference contains enough information to let you locate the referenced object inside the same namespace.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `name` | `string` | Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names) |

### [#](#spectemplatespecinitcontainers).spec.template.spec.initContainers

描述List of initialization containers belonging to the pod. Init containers are executed in order prior to containers being started. If any init container fails, the pod is considered to have failed and is handled according to its restartPolicy. The name for an init container or normal container must be unique among all containers. Init containers may not have Lifecycle actions, Readiness probes, Liveness probes, or Startup probes. The resourceRequirements of an init container are taken into account during scheduling by finding the highest request/limit for each resource type, and then using the max of of that value or the sum of the normal containers. Limits are applied to init containers in a similar fashion. Init containers cannot currently be added or removed. Cannot be updated. More info: https://kubernetes.io/docs/concepts/workloads/pods/init-containers/类型`array`### [#](#spectemplatespecinitcontainers-1).spec.template.spec.initContainers[]

描述A single application container that you want to run within a pod.类型`object`必填`name`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `args` | `array` | Arguments to the entrypoint. The container image's CMD is used if this is not provided. Variable references $(VAR_NAME) are expanded using the container's environment. If a variable cannot be resolved, the reference in the input string will be unchanged. Double $$ are reduced to a single $, which allows for escaping the $(VAR_NAME) syntax: i.e. "$$(VAR_NAME)" will produce the string literal "$(VAR_NAME)". Escaped references will never be expanded, regardless of whether the variable exists or not. Cannot be updated. More info: [https://kubernetes.io/docs/tasks/inject-data-application/define-command-argument-container/#running-a-command-in-a-shell](https://kubernetes.io/docs/tasks/inject-data-application/define-command-argument-container/#running-a-command-in-a-shell) |
| `command` | `array` | Entrypoint array. Not executed within a shell. The container image's ENTRYPOINT is used if this is not provided. Variable references $(VAR_NAME) are expanded using the container's environment. If a variable cannot be resolved, the reference in the input string will be unchanged. Double $$ are reduced to a single $, which allows for escaping the $(VAR_NAME) syntax: i.e. "$$(VAR_NAME)" will produce the string literal "$(VAR_NAME)". Escaped references will never be expanded, regardless of whether the variable exists or not. Cannot be updated. More info: [https://kubernetes.io/docs/tasks/inject-data-application/define-command-argument-container/#running-a-command-in-a-shell](https://kubernetes.io/docs/tasks/inject-data-application/define-command-argument-container/#running-a-command-in-a-shell) |
| `env` | `array` | List of environment variables to set in the container. Cannot be updated. |
| `envFrom` | `array` | List of sources to populate environment variables in the container. The keys defined within a source must be a C_IDENTIFIER. All invalid keys will be reported as an event when the container is starting. When a key exists in multiple sources, the value associated with the last source will take precedence. Values defined by an Env with a duplicate key will take precedence. Cannot be updated. |
| `image` | `string` | Container image name. More info: [https://kubernetes.io/docs/concepts/containers/images](https://kubernetes.io/docs/concepts/containers/images) This field is optional to allow higher level config management to default or override container images in workload controllers like Deployments and StatefulSets. |
| `imagePullPolicy` | `string` | Image pull policy. One of Always, Never, IfNotPresent. Defaults to Always if :latest tag is specified, or IfNotPresent otherwise. Cannot be updated. More info: [https://kubernetes.io/docs/concepts/containers/images#updating-images](https://kubernetes.io/docs/concepts/containers/images#updating-images)


Possible enum values:



- `"Always"` means that kubelet always attempts to pull the latest image. Container will fail If the pull fails.

- `"IfNotPresent"` means that kubelet pulls if the image isn't present on disk. Container will fail if the image isn't present and the pull fails.

- `"Never"` means that kubelet never pulls an image, but only uses a local image. Container will fail if the image isn't present |
| `lifecycle` | `object` | Lifecycle describes actions that the management system should take in response to container lifecycle events. For the PostStart and PreStop lifecycle handlers, management of the container blocks until the action is complete, unless the container process fails, in which case the handler is aborted. |
| `livenessProbe` | `object` | Probe describes a health check to be performed against a container to determine whether it is alive or ready to receive traffic. |
| `name` | `string` | Name of the container specified as a DNS_LABEL. Each container in a pod must have a unique name (DNS_LABEL). Cannot be updated. |
| `ports` | `array` | List of ports to expose from the container. Not specifying a port here DOES NOT prevent that port from being exposed. Any port which is listening on the default "0.0.0.0" address inside a container will be accessible from the network. Modifying this array with strategic merge patch may corrupt the data. For more information See [https://github.com/kubernetes/kubernetes/issues/108255](https://github.com/kubernetes/kubernetes/issues/108255). Cannot be updated. |
| `readinessProbe` | `object` | Probe describes a health check to be performed against a container to determine whether it is alive or ready to receive traffic. |
| `resizePolicy` | `array` | Resources resize policy for the container. |
| `resources` | `object` | ResourceRequirements describes the compute resource requirements. |
| `restartPolicy` | `string` | RestartPolicy defines the restart behavior of individual containers in a pod. This field may only be set for init containers, and the only allowed value is "Always". For non-init containers or when this field is not specified, the restart behavior is defined by the Pod's restart policy and the container type. Setting the RestartPolicy as "Always" for the init container will have the following effect: this init container will be continually restarted on exit until all regular containers have terminated. Once all regular containers have completed, all init containers with restartPolicy "Always" will be shut down. This lifecycle differs from normal init containers and is often referred to as a "sidecar" container. Although this init container still starts in the init container sequence, it does not wait for the container to complete before proceeding to the next init container. Instead, the next init container starts immediately after this init container is started, or after any startupProbe has successfully completed. |
| `securityContext` | `object` | SecurityContext holds security configuration that will be applied to a container. Some fields are present in both SecurityContext and PodSecurityContext.  When both are set, the values in SecurityContext take precedence. |
| `startupProbe` | `object` | Probe describes a health check to be performed against a container to determine whether it is alive or ready to receive traffic. |
| `stdin` | `boolean` | Whether this container should allocate a buffer for stdin in the container runtime. If this is not set, reads from stdin in the container will always result in EOF. Default is false. |
| `stdinOnce` | `boolean` | Whether the container runtime should close the stdin channel after it has been opened by a single attach. When stdin is true the stdin stream will remain open across multiple attach sessions. If stdinOnce is set to true, stdin is opened on container start, is empty until the first client attaches to stdin, and then remains open and accepts data until the client disconnects, at which time stdin is closed and remains closed until the container is restarted. If this flag is false, a container processes that reads from stdin will never receive an EOF. Default is false |
| `terminationMessagePath` | `string` | Optional: Path at which the file to which the container's termination message will be written is mounted into the container's filesystem. Message written is intended to be brief final status, such as an assertion failure message. Will be truncated by the node if greater than 4096 bytes. The total message length across all containers will be limited to 12kb. Defaults to /dev/termination-log. Cannot be updated. |
| `terminationMessagePolicy` | `string` | Indicate how the termination message should be populated. File will use the contents of terminationMessagePath to populate the container status message on both success and failure. FallbackToLogsOnError will use the last chunk of container log output if the termination message file is empty and the container exited with an error. The log output is limited to 2048 bytes or 80 lines, whichever is smaller. Defaults to File. Cannot be updated.


Possible enum values:



- `"FallbackToLogsOnError"` will read the most recent contents of the container logs for the container status message when the container exits with an error and the terminationMessagePath has no contents.

- `"File"` is the default behavior and will set the container status message to the contents of the container's terminationMessagePath when the container exits. |
| `tty` | `boolean` | Whether this container should allocate a TTY for itself, also requires 'stdin' to be true. Default is false. |
| `volumeDevices` | `array` | volumeDevices is the list of block devices to be used by the container. |
| `volumeMounts` | `array` | Pod volumes to mount into the container's filesystem. Cannot be updated. |
| `workingDir` | `string` | Container's working directory. If not specified, the container runtime's default will be used, which might be configured in the container image. Cannot be updated. |

### [#](#spectemplatespecinitcontainersargs).spec.template.spec.initContainers[].args

描述Arguments to the entrypoint. The container image's CMD is used if this is not provided. Variable references $(VAR_NAME) are expanded using the container's environment. If a variable cannot be resolved, the reference in the input string will be unchanged. Double $$ are reduced to a single $, which allows for escaping the $(VAR_NAME) syntax: i.e. "$$(VAR_NAME)" will produce the string literal "$(VAR_NAME)". Escaped references will never be expanded, regardless of whether the variable exists or not. Cannot be updated. More info: https://kubernetes.io/docs/tasks/inject-data-application/define-command-argument-container/#running-a-command-in-a-shell类型`array`### [#](#spectemplatespecinitcontainersargs-1).spec.template.spec.initContainers[].args[]

类型`string`### [#](#spectemplatespecinitcontainerscommand).spec.template.spec.initContainers[].command

描述Entrypoint array. Not executed within a shell. The container image's ENTRYPOINT is used if this is not provided. Variable references $(VAR_NAME) are expanded using the container's environment. If a variable cannot be resolved, the reference in the input string will be unchanged. Double $$ are reduced to a single $, which allows for escaping the $(VAR_NAME) syntax: i.e. "$$(VAR_NAME)" will produce the string literal "$(VAR_NAME)". Escaped references will never be expanded, regardless of whether the variable exists or not. Cannot be updated. More info: https://kubernetes.io/docs/tasks/inject-data-application/define-command-argument-container/#running-a-command-in-a-shell类型`array`### [#](#spectemplatespecinitcontainerscommand-1).spec.template.spec.initContainers[].command[]

类型`string`### [#](#spectemplatespecinitcontainersenv).spec.template.spec.initContainers[].env

描述List of environment variables to set in the container. Cannot be updated.类型`array`### [#](#spectemplatespecinitcontainersenv-1).spec.template.spec.initContainers[].env[]

描述EnvVar represents an environment variable present in a Container.类型`object`必填`name`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `name` | `string` | Name of the environment variable. Must be a C_IDENTIFIER. |
| `value` | `string` | Variable references $(VAR_NAME) are expanded using the previously defined environment variables in the container and any service environment variables. If a variable cannot be resolved, the reference in the input string will be unchanged. Double $$ are reduced to a single $, which allows for escaping the $(VAR_NAME) syntax: i.e. "$$(VAR_NAME)" will produce the string literal "$(VAR_NAME)". Escaped references will never be expanded, regardless of whether the variable exists or not. Defaults to "". |
| `valueFrom` | `object` | EnvVarSource represents a source for the value of an EnvVar. |

### [#](#spectemplatespecinitcontainersenvvaluefrom).spec.template.spec.initContainers[].env[].valueFrom

描述EnvVarSource represents a source for the value of an EnvVar.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `configMapKeyRef` | `object` | Selects a key from a ConfigMap. |
| `fieldRef` | `object` | ObjectFieldSelector selects an APIVersioned field of an object. |
| `resourceFieldRef` | `object` | ResourceFieldSelector represents container resources (cpu, memory) and their output format |
| `secretKeyRef` | `object` | SecretKeySelector selects a key of a Secret. |

### [#](#spectemplatespecinitcontainersenvvaluefromconfigmapkeyref).spec.template.spec.initContainers[].env[].valueFrom.configMapKeyRef

描述Selects a key from a ConfigMap.类型`object`必填`key`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `key` | `string` | The key to select. |
| `name` | `string` | Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names) |
| `optional` | `boolean` | Specify whether the ConfigMap or its key must be defined |

### [#](#spectemplatespecinitcontainersenvvaluefromfieldref).spec.template.spec.initContainers[].env[].valueFrom.fieldRef

描述ObjectFieldSelector selects an APIVersioned field of an object.类型`object`必填`fieldPath`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `apiVersion` | `string` | Version of the schema the FieldPath is written in terms of, defaults to "v1". |
| `fieldPath` | `string` | Path of the field to select in the specified API version. |

### [#](#spectemplatespecinitcontainersenvvaluefromresourcefieldref).spec.template.spec.initContainers[].env[].valueFrom.resourceFieldRef

描述ResourceFieldSelector represents container resources (cpu, memory) and their output format类型`object`必填`resource`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `containerName` | `string` | Container name: required for volumes, optional for env vars |
| `divisor` | `string|number` | Quantity is a fixed-point representation of a number. It provides convenient marshaling/unmarshaling in JSON and YAML, in addition to String() and AsInt64() accessors.


The serialization format is:



````

	(Note that <suffix> may be empty, from the "" case in <decimalSI>.)

<digit>           ::= 0 | 1 | ... | 9 <digits>          ::= <digit> | <digit><digits> <number>          ::= <digits> | <digits>.<digits> | <digits>. | .<digits> <sign>            ::= "+" | "-" <signedNumber>    ::= <number> | <sign><number> <suffix>          ::= <binarySI> | <decimalExponent> | <decimalSI> <binarySI>        ::= Ki | Mi | Gi | Ti | Pi | Ei

	(International System of units; See: http://physics.nist.gov/cuu/Units/binary.html)

<decimalSI>       ::= m | "" | k | M | G | T | P | E

	(Note that 1024 = 1Ki but 1000 = 1k; I didn't choose the capitalization.)

<decimalExponent> ::= "e" <signedNumber> | "E" <signedNumber> ```

No matter which of the three exponent forms is used, no quantity may represent a number greater than 2^63-1 in magnitude, nor may it have more than 3 decimal places. Numbers larger or more precise will be capped or rounded up. (E.g.: 0.1m will rounded up to 1m.) This may be extended in the future if we require larger or smaller quantities.

When a Quantity is parsed from a string, it will remember the type of suffix it had, and will use the same type again when it is serialized.

Before serializing, Quantity will be put in "canonical form". This means that Exponent/suffix will be adjusted up or down (with a corresponding increase or decrease in Mantissa) such that:

- No precision is lost - No fractional digits will be emitted - The exponent (or suffix) is as large as possible.

The sign will be omitted unless the number is negative.

Examples:

- 1.5 will be serialized as "1500m" - 1.5Gi will be serialized as "1536Mi"

Note that the quantity will NEVER be internally represented by a floating point number. That is the whole point of this exercise.

Non-canonical values will still parse as long as they are well formed, but will be re-emitted in their canonical form. (So always use canonical form, or don't diff.)

This format is intended to make it difficult to use these numbers without writing some sort of special handling code in the hopes that that will cause implementors to also use a fixed point implementation.

```` |
| `resource` | `string` | Required: resource to select |

### [#](#spectemplatespecinitcontainersenvvaluefromsecretkeyref).spec.template.spec.initContainers[].env[].valueFrom.secretKeyRef

描述SecretKeySelector selects a key of a Secret.类型`object`必填`key`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `key` | `string` | The key of the secret to select from.  Must be a valid secret key. |
| `name` | `string` | Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names) |
| `optional` | `boolean` | Specify whether the Secret or its key must be defined |

### [#](#spectemplatespecinitcontainersenvfrom).spec.template.spec.initContainers[].envFrom

描述List of sources to populate environment variables in the container. The keys defined within a source must be a C_IDENTIFIER. All invalid keys will be reported as an event when the container is starting. When a key exists in multiple sources, the value associated with the last source will take precedence. Values defined by an Env with a duplicate key will take precedence. Cannot be updated.类型`array`### [#](#spectemplatespecinitcontainersenvfrom-1).spec.template.spec.initContainers[].envFrom[]

描述EnvFromSource represents the source of a set of ConfigMaps类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `configMapRef` | `object` | ConfigMapEnvSource selects a ConfigMap to populate the environment variables with.


The contents of the target ConfigMap's Data field will represent the key-value pairs as environment variables. |
| `prefix` | `string` | An optional identifier to prepend to each key in the ConfigMap. Must be a C_IDENTIFIER. |
| `secretRef` | `object` | SecretEnvSource selects a Secret to populate the environment variables with.


The contents of the target Secret's Data field will represent the key-value pairs as environment variables. |

### [#](#spectemplatespecinitcontainersenvfromconfigmapref).spec.template.spec.initContainers[].envFrom[].configMapRef

描述ConfigMapEnvSource selects a ConfigMap to populate the environment variables with.

The contents of the target ConfigMap's Data field will represent the key-value pairs as environment variables.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `name` | `string` | Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names) |
| `optional` | `boolean` | Specify whether the ConfigMap must be defined |

### [#](#spectemplatespecinitcontainersenvfromsecretref).spec.template.spec.initContainers[].envFrom[].secretRef

描述SecretEnvSource selects a Secret to populate the environment variables with.

The contents of the target Secret's Data field will represent the key-value pairs as environment variables.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `name` | `string` | Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names) |
| `optional` | `boolean` | Specify whether the Secret must be defined |

### [#](#spectemplatespecinitcontainerslifecycle).spec.template.spec.initContainers[].lifecycle

描述Lifecycle describes actions that the management system should take in response to container lifecycle events. For the PostStart and PreStop lifecycle handlers, management of the container blocks until the action is complete, unless the container process fails, in which case the handler is aborted.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `postStart` | `object` | LifecycleHandler defines a specific action that should be taken in a lifecycle hook. One and only one of the fields, except TCPSocket must be specified. |
| `preStop` | `object` | LifecycleHandler defines a specific action that should be taken in a lifecycle hook. One and only one of the fields, except TCPSocket must be specified. |

### [#](#spectemplatespecinitcontainerslifecyclepoststart).spec.template.spec.initContainers[].lifecycle.postStart

描述LifecycleHandler defines a specific action that should be taken in a lifecycle hook. One and only one of the fields, except TCPSocket must be specified.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `exec` | `object` | ExecAction describes a "run in container" action. |
| `httpGet` | `object` | HTTPGetAction describes an action based on HTTP Get requests. |
| `sleep` | `object` | SleepAction describes a "sleep" action. |
| `tcpSocket` | `object` | TCPSocketAction describes an action based on opening a socket |

### [#](#spectemplatespecinitcontainerslifecyclepoststartexec).spec.template.spec.initContainers[].lifecycle.postStart.exec

描述ExecAction describes a "run in container" action.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `command` | `array` | Command is the command line to execute inside the container, the working directory for the command  is root ('/') in the container's filesystem. The command is simply exec'd, it is not run inside a shell, so traditional shell instructions ('|', etc) won't work. To use a shell, you need to explicitly call out to that shell. Exit status of 0 is treated as live/healthy and non-zero is unhealthy. |

### [#](#spectemplatespecinitcontainerslifecyclepoststartexeccommand).spec.template.spec.initContainers[].lifecycle.postStart.exec.command

描述Command is the command line to execute inside the container, the working directory for the command  is root ('/') in the container's filesystem. The command is simply exec'd, it is not run inside a shell, so traditional shell instructions ('|', etc) won't work. To use a shell, you need to explicitly call out to that shell. Exit status of 0 is treated as live/healthy and non-zero is unhealthy.类型`array`### [#](#spectemplatespecinitcontainerslifecyclepoststartexeccommand-1).spec.template.spec.initContainers[].lifecycle.postStart.exec.command[]

类型`string`### [#](#spectemplatespecinitcontainerslifecyclepoststarthttpget).spec.template.spec.initContainers[].lifecycle.postStart.httpGet

描述HTTPGetAction describes an action based on HTTP Get requests.类型`object`必填`port`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `host` | `string` | Host name to connect to, defaults to the pod IP. You probably want to set "Host" in httpHeaders instead. |
| `httpHeaders` | `array` | Custom headers to set in the request. HTTP allows repeated headers. |
| `path` | `string` | Path to access on the HTTP server. |
| `port` | `integer|string` | IntOrString is a type that can hold an int32 or a string.  When used in JSON or YAML marshalling and unmarshalling, it produces or consumes the inner type.  This allows you to have, for example, a JSON field that can accept a name or number. |
| `scheme` | `string` | Scheme to use for connecting to the host. Defaults to HTTP.


Possible enum values:



- `"HTTP"` means that the scheme used will be http://

- `"HTTPS"` means that the scheme used will be https:// |

### [#](#spectemplatespecinitcontainerslifecyclepoststarthttpgethttpheaders).spec.template.spec.initContainers[].lifecycle.postStart.httpGet.httpHeaders

描述Custom headers to set in the request. HTTP allows repeated headers.类型`array`### [#](#spectemplatespecinitcontainerslifecyclepoststarthttpgethttpheaders-1).spec.template.spec.initContainers[].lifecycle.postStart.httpGet.httpHeaders[]

描述HTTPHeader describes a custom header to be used in HTTP probes类型`object`必填`name``value`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `name` | `string` | The header field name. This will be canonicalized upon output, so case-variant names will be understood as the same header. |
| `value` | `string` | The header field value |

### [#](#spectemplatespecinitcontainerslifecyclepoststartsleep).spec.template.spec.initContainers[].lifecycle.postStart.sleep

描述SleepAction describes a "sleep" action.类型`object`必填`seconds`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `seconds` | `integer` | Seconds is the number of seconds to sleep. |

### [#](#spectemplatespecinitcontainerslifecyclepoststarttcpsocket).spec.template.spec.initContainers[].lifecycle.postStart.tcpSocket

描述TCPSocketAction describes an action based on opening a socket类型`object`必填`port`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `host` | `string` | Optional: Host name to connect to, defaults to the pod IP. |
| `port` | `integer|string` | IntOrString is a type that can hold an int32 or a string.  When used in JSON or YAML marshalling and unmarshalling, it produces or consumes the inner type.  This allows you to have, for example, a JSON field that can accept a name or number. |

### [#](#spectemplatespecinitcontainerslifecycleprestop).spec.template.spec.initContainers[].lifecycle.preStop

描述LifecycleHandler defines a specific action that should be taken in a lifecycle hook. One and only one of the fields, except TCPSocket must be specified.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `exec` | `object` | ExecAction describes a "run in container" action. |
| `httpGet` | `object` | HTTPGetAction describes an action based on HTTP Get requests. |
| `sleep` | `object` | SleepAction describes a "sleep" action. |
| `tcpSocket` | `object` | TCPSocketAction describes an action based on opening a socket |

### [#](#spectemplatespecinitcontainerslifecycleprestopexec).spec.template.spec.initContainers[].lifecycle.preStop.exec

描述ExecAction describes a "run in container" action.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `command` | `array` | Command is the command line to execute inside the container, the working directory for the command  is root ('/') in the container's filesystem. The command is simply exec'd, it is not run inside a shell, so traditional shell instructions ('|', etc) won't work. To use a shell, you need to explicitly call out to that shell. Exit status of 0 is treated as live/healthy and non-zero is unhealthy. |

### [#](#spectemplatespecinitcontainerslifecycleprestopexeccommand).spec.template.spec.initContainers[].lifecycle.preStop.exec.command

描述Command is the command line to execute inside the container, the working directory for the command  is root ('/') in the container's filesystem. The command is simply exec'd, it is not run inside a shell, so traditional shell instructions ('|', etc) won't work. To use a shell, you need to explicitly call out to that shell. Exit status of 0 is treated as live/healthy and non-zero is unhealthy.类型`array`### [#](#spectemplatespecinitcontainerslifecycleprestopexeccommand-1).spec.template.spec.initContainers[].lifecycle.preStop.exec.command[]

类型`string`### [#](#spectemplatespecinitcontainerslifecycleprestophttpget).spec.template.spec.initContainers[].lifecycle.preStop.httpGet

描述HTTPGetAction describes an action based on HTTP Get requests.类型`object`必填`port`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `host` | `string` | Host name to connect to, defaults to the pod IP. You probably want to set "Host" in httpHeaders instead. |
| `httpHeaders` | `array` | Custom headers to set in the request. HTTP allows repeated headers. |
| `path` | `string` | Path to access on the HTTP server. |
| `port` | `integer|string` | IntOrString is a type that can hold an int32 or a string.  When used in JSON or YAML marshalling and unmarshalling, it produces or consumes the inner type.  This allows you to have, for example, a JSON field that can accept a name or number. |
| `scheme` | `string` | Scheme to use for connecting to the host. Defaults to HTTP.


Possible enum values:



- `"HTTP"` means that the scheme used will be http://

- `"HTTPS"` means that the scheme used will be https:// |

### [#](#spectemplatespecinitcontainerslifecycleprestophttpgethttpheaders).spec.template.spec.initContainers[].lifecycle.preStop.httpGet.httpHeaders

描述Custom headers to set in the request. HTTP allows repeated headers.类型`array`### [#](#spectemplatespecinitcontainerslifecycleprestophttpgethttpheaders-1).spec.template.spec.initContainers[].lifecycle.preStop.httpGet.httpHeaders[]

描述HTTPHeader describes a custom header to be used in HTTP probes类型`object`必填`name``value`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `name` | `string` | The header field name. This will be canonicalized upon output, so case-variant names will be understood as the same header. |
| `value` | `string` | The header field value |

### [#](#spectemplatespecinitcontainerslifecycleprestopsleep).spec.template.spec.initContainers[].lifecycle.preStop.sleep

描述SleepAction describes a "sleep" action.类型`object`必填`seconds`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `seconds` | `integer` | Seconds is the number of seconds to sleep. |

### [#](#spectemplatespecinitcontainerslifecycleprestoptcpsocket).spec.template.spec.initContainers[].lifecycle.preStop.tcpSocket

描述TCPSocketAction describes an action based on opening a socket类型`object`必填`port`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `host` | `string` | Optional: Host name to connect to, defaults to the pod IP. |
| `port` | `integer|string` | IntOrString is a type that can hold an int32 or a string.  When used in JSON or YAML marshalling and unmarshalling, it produces or consumes the inner type.  This allows you to have, for example, a JSON field that can accept a name or number. |

### [#](#spectemplatespecinitcontainerslivenessprobe).spec.template.spec.initContainers[].livenessProbe

描述Probe describes a health check to be performed against a container to determine whether it is alive or ready to receive traffic.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `exec` | `object` | ExecAction describes a "run in container" action. |
| `failureThreshold` | `integer` | Minimum consecutive failures for the probe to be considered failed after having succeeded. Defaults to 3. Minimum value is 1. |
| `grpc` | `object` | GRPCAction specifies an action involving a GRPC service. |
| `httpGet` | `object` | HTTPGetAction describes an action based on HTTP Get requests. |
| `initialDelaySeconds` | `integer` | Number of seconds after the container has started before liveness probes are initiated. More info: [https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle#container-probes](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle#container-probes) |
| `periodSeconds` | `integer` | How often (in seconds) to perform the probe. Default to 10 seconds. Minimum value is 1. |
| `successThreshold` | `integer` | Minimum consecutive successes for the probe to be considered successful after having failed. Defaults to 1. Must be 1 for liveness and startup. Minimum value is 1. |
| `tcpSocket` | `object` | TCPSocketAction describes an action based on opening a socket |
| `terminationGracePeriodSeconds` | `integer` | Optional duration in seconds the pod needs to terminate gracefully upon probe failure. The grace period is the duration in seconds after the processes running in the pod are sent a termination signal and the time when the processes are forcibly halted with a kill signal. Set this value longer than the expected cleanup time for your process. If this value is nil, the pod's terminationGracePeriodSeconds will be used. Otherwise, this value overrides the value provided by the pod spec. Value must be non-negative integer. The value zero indicates stop immediately via the kill signal (no opportunity to shut down). This is a beta field and requires enabling ProbeTerminationGracePeriod feature gate. Minimum value is 1. spec.terminationGracePeriodSeconds is used if unset. |
| `timeoutSeconds` | `integer` | Number of seconds after which the probe times out. Defaults to 1 second. Minimum value is 1. More info: [https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle#container-probes](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle#container-probes) |

### [#](#spectemplatespecinitcontainerslivenessprobeexec).spec.template.spec.initContainers[].livenessProbe.exec

描述ExecAction describes a "run in container" action.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `command` | `array` | Command is the command line to execute inside the container, the working directory for the command  is root ('/') in the container's filesystem. The command is simply exec'd, it is not run inside a shell, so traditional shell instructions ('|', etc) won't work. To use a shell, you need to explicitly call out to that shell. Exit status of 0 is treated as live/healthy and non-zero is unhealthy. |

### [#](#spectemplatespecinitcontainerslivenessprobeexeccommand).spec.template.spec.initContainers[].livenessProbe.exec.command

描述Command is the command line to execute inside the container, the working directory for the command  is root ('/') in the container's filesystem. The command is simply exec'd, it is not run inside a shell, so traditional shell instructions ('|', etc) won't work. To use a shell, you need to explicitly call out to that shell. Exit status of 0 is treated as live/healthy and non-zero is unhealthy.类型`array`### [#](#spectemplatespecinitcontainerslivenessprobeexeccommand-1).spec.template.spec.initContainers[].livenessProbe.exec.command[]

类型`string`### [#](#spectemplatespecinitcontainerslivenessprobegrpc).spec.template.spec.initContainers[].livenessProbe.grpc

描述GRPCAction specifies an action involving a GRPC service.类型`object`必填`port`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `port` | `integer` | Port number of the gRPC service. Number must be in the range 1 to 65535. |
| `service` | `string` | Service is the name of the service to place in the gRPC HealthCheckRequest (see [https://github.com/grpc/grpc/blob/master/doc/health-checking.md](https://github.com/grpc/grpc/blob/master/doc/health-checking.md)).


If this is not specified, the default behavior is defined by gRPC. |

### [#](#spectemplatespecinitcontainerslivenessprobehttpget).spec.template.spec.initContainers[].livenessProbe.httpGet

描述HTTPGetAction describes an action based on HTTP Get requests.类型`object`必填`port`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `host` | `string` | Host name to connect to, defaults to the pod IP. You probably want to set "Host" in httpHeaders instead. |
| `httpHeaders` | `array` | Custom headers to set in the request. HTTP allows repeated headers. |
| `path` | `string` | Path to access on the HTTP server. |
| `port` | `integer|string` | IntOrString is a type that can hold an int32 or a string.  When used in JSON or YAML marshalling and unmarshalling, it produces or consumes the inner type.  This allows you to have, for example, a JSON field that can accept a name or number. |
| `scheme` | `string` | Scheme to use for connecting to the host. Defaults to HTTP.


Possible enum values:



- `"HTTP"` means that the scheme used will be http://

- `"HTTPS"` means that the scheme used will be https:// |

### [#](#spectemplatespecinitcontainerslivenessprobehttpgethttpheaders).spec.template.spec.initContainers[].livenessProbe.httpGet.httpHeaders

描述Custom headers to set in the request. HTTP allows repeated headers.类型`array`### [#](#spectemplatespecinitcontainerslivenessprobehttpgethttpheaders-1).spec.template.spec.initContainers[].livenessProbe.httpGet.httpHeaders[]

描述HTTPHeader describes a custom header to be used in HTTP probes类型`object`必填`name``value`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `name` | `string` | The header field name. This will be canonicalized upon output, so case-variant names will be understood as the same header. |
| `value` | `string` | The header field value |

### [#](#spectemplatespecinitcontainerslivenessprobetcpsocket).spec.template.spec.initContainers[].livenessProbe.tcpSocket

描述TCPSocketAction describes an action based on opening a socket类型`object`必填`port`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `host` | `string` | Optional: Host name to connect to, defaults to the pod IP. |
| `port` | `integer|string` | IntOrString is a type that can hold an int32 or a string.  When used in JSON or YAML marshalling and unmarshalling, it produces or consumes the inner type.  This allows you to have, for example, a JSON field that can accept a name or number. |

### [#](#spectemplatespecinitcontainersports).spec.template.spec.initContainers[].ports

描述List of ports to expose from the container. Not specifying a port here DOES NOT prevent that port from being exposed. Any port which is listening on the default "0.0.0.0" address inside a container will be accessible from the network. Modifying this array with strategic merge patch may corrupt the data. For more information See https://github.com/kubernetes/kubernetes/issues/108255. Cannot be updated.类型`array`### [#](#spectemplatespecinitcontainersports-1).spec.template.spec.initContainers[].ports[]

描述ContainerPort represents a network port in a single container.类型`object`必填`containerPort`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `containerPort` | `integer` | Number of port to expose on the pod's IP address. This must be a valid port number, 0 < x < 65536. |
| `hostIP` | `string` | What host IP to bind the external port to. |
| `hostPort` | `integer` | Number of port to expose on the host. If specified, this must be a valid port number, 0 < x < 65536. If HostNetwork is specified, this must match ContainerPort. Most containers do not need this. |
| `name` | `string` | If specified, this must be an IANA_SVC_NAME and unique within the pod. Each named port in a pod must have a unique name. Name for the port that can be referred to by services. |
| `protocol` | `string` | Protocol for port. Must be UDP, TCP, or SCTP. Defaults to "TCP".


Possible enum values:



- `"SCTP"` is the SCTP protocol.

- `"TCP"` is the TCP protocol.

- `"UDP"` is the UDP protocol. |

### [#](#spectemplatespecinitcontainersreadinessprobe).spec.template.spec.initContainers[].readinessProbe

描述Probe describes a health check to be performed against a container to determine whether it is alive or ready to receive traffic.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `exec` | `object` | ExecAction describes a "run in container" action. |
| `failureThreshold` | `integer` | Minimum consecutive failures for the probe to be considered failed after having succeeded. Defaults to 3. Minimum value is 1. |
| `grpc` | `object` | GRPCAction specifies an action involving a GRPC service. |
| `httpGet` | `object` | HTTPGetAction describes an action based on HTTP Get requests. |
| `initialDelaySeconds` | `integer` | Number of seconds after the container has started before liveness probes are initiated. More info: [https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle#container-probes](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle#container-probes) |
| `periodSeconds` | `integer` | How often (in seconds) to perform the probe. Default to 10 seconds. Minimum value is 1. |
| `successThreshold` | `integer` | Minimum consecutive successes for the probe to be considered successful after having failed. Defaults to 1. Must be 1 for liveness and startup. Minimum value is 1. |
| `tcpSocket` | `object` | TCPSocketAction describes an action based on opening a socket |
| `terminationGracePeriodSeconds` | `integer` | Optional duration in seconds the pod needs to terminate gracefully upon probe failure. The grace period is the duration in seconds after the processes running in the pod are sent a termination signal and the time when the processes are forcibly halted with a kill signal. Set this value longer than the expected cleanup time for your process. If this value is nil, the pod's terminationGracePeriodSeconds will be used. Otherwise, this value overrides the value provided by the pod spec. Value must be non-negative integer. The value zero indicates stop immediately via the kill signal (no opportunity to shut down). This is a beta field and requires enabling ProbeTerminationGracePeriod feature gate. Minimum value is 1. spec.terminationGracePeriodSeconds is used if unset. |
| `timeoutSeconds` | `integer` | Number of seconds after which the probe times out. Defaults to 1 second. Minimum value is 1. More info: [https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle#container-probes](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle#container-probes) |

### [#](#spectemplatespecinitcontainersreadinessprobeexec).spec.template.spec.initContainers[].readinessProbe.exec

描述ExecAction describes a "run in container" action.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `command` | `array` | Command is the command line to execute inside the container, the working directory for the command  is root ('/') in the container's filesystem. The command is simply exec'd, it is not run inside a shell, so traditional shell instructions ('|', etc) won't work. To use a shell, you need to explicitly call out to that shell. Exit status of 0 is treated as live/healthy and non-zero is unhealthy. |

### [#](#spectemplatespecinitcontainersreadinessprobeexeccommand).spec.template.spec.initContainers[].readinessProbe.exec.command

描述Command is the command line to execute inside the container, the working directory for the command  is root ('/') in the container's filesystem. The command is simply exec'd, it is not run inside a shell, so traditional shell instructions ('|', etc) won't work. To use a shell, you need to explicitly call out to that shell. Exit status of 0 is treated as live/healthy and non-zero is unhealthy.类型`array`### [#](#spectemplatespecinitcontainersreadinessprobeexeccommand-1).spec.template.spec.initContainers[].readinessProbe.exec.command[]

类型`string`### [#](#spectemplatespecinitcontainersreadinessprobegrpc).spec.template.spec.initContainers[].readinessProbe.grpc

描述GRPCAction specifies an action involving a GRPC service.类型`object`必填`port`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `port` | `integer` | Port number of the gRPC service. Number must be in the range 1 to 65535. |
| `service` | `string` | Service is the name of the service to place in the gRPC HealthCheckRequest (see [https://github.com/grpc/grpc/blob/master/doc/health-checking.md](https://github.com/grpc/grpc/blob/master/doc/health-checking.md)).


If this is not specified, the default behavior is defined by gRPC. |

### [#](#spectemplatespecinitcontainersreadinessprobehttpget).spec.template.spec.initContainers[].readinessProbe.httpGet

描述HTTPGetAction describes an action based on HTTP Get requests.类型`object`必填`port`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `host` | `string` | Host name to connect to, defaults to the pod IP. You probably want to set "Host" in httpHeaders instead. |
| `httpHeaders` | `array` | Custom headers to set in the request. HTTP allows repeated headers. |
| `path` | `string` | Path to access on the HTTP server. |
| `port` | `integer|string` | IntOrString is a type that can hold an int32 or a string.  When used in JSON or YAML marshalling and unmarshalling, it produces or consumes the inner type.  This allows you to have, for example, a JSON field that can accept a name or number. |
| `scheme` | `string` | Scheme to use for connecting to the host. Defaults to HTTP.


Possible enum values:



- `"HTTP"` means that the scheme used will be http://

- `"HTTPS"` means that the scheme used will be https:// |

### [#](#spectemplatespecinitcontainersreadinessprobehttpgethttpheaders).spec.template.spec.initContainers[].readinessProbe.httpGet.httpHeaders

描述Custom headers to set in the request. HTTP allows repeated headers.类型`array`### [#](#spectemplatespecinitcontainersreadinessprobehttpgethttpheaders-1).spec.template.spec.initContainers[].readinessProbe.httpGet.httpHeaders[]

描述HTTPHeader describes a custom header to be used in HTTP probes类型`object`必填`name``value`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `name` | `string` | The header field name. This will be canonicalized upon output, so case-variant names will be understood as the same header. |
| `value` | `string` | The header field value |

### [#](#spectemplatespecinitcontainersreadinessprobetcpsocket).spec.template.spec.initContainers[].readinessProbe.tcpSocket

描述TCPSocketAction describes an action based on opening a socket类型`object`必填`port`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `host` | `string` | Optional: Host name to connect to, defaults to the pod IP. |
| `port` | `integer|string` | IntOrString is a type that can hold an int32 or a string.  When used in JSON or YAML marshalling and unmarshalling, it produces or consumes the inner type.  This allows you to have, for example, a JSON field that can accept a name or number. |

### [#](#spectemplatespecinitcontainersresizepolicy).spec.template.spec.initContainers[].resizePolicy

描述Resources resize policy for the container.类型`array`### [#](#spectemplatespecinitcontainersresizepolicy-1).spec.template.spec.initContainers[].resizePolicy[]

描述ContainerResizePolicy represents resource resize policy for the container.类型`object`必填`resourceName``restartPolicy`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `resourceName` | `string` | Name of the resource to which this resource resize policy applies. Supported values: cpu, memory. |
| `restartPolicy` | `string` | Restart policy to apply when specified resource is resized. If not specified, it defaults to NotRequired. |

### [#](#spectemplatespecinitcontainersresources).spec.template.spec.initContainers[].resources

描述ResourceRequirements describes the compute resource requirements.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `claims` | `array` | Claims lists the names of resources, defined in spec.resourceClaims, that are used by this container.


This is an alpha field and requires enabling the DynamicResourceAllocation feature gate.


This field is immutable. It can only be set for containers. |
| `limits` | `object` | Limits describes the maximum amount of compute resources allowed. More info: [https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/) |
| `requests` | `object` | Requests describes the minimum amount of compute resources required. If Requests is omitted for a container, it defaults to Limits if that is explicitly specified, otherwise to an implementation-defined value. Requests cannot exceed Limits. More info: [https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/) |

### [#](#spectemplatespecinitcontainersresourcesclaims).spec.template.spec.initContainers[].resources.claims

描述Claims lists the names of resources, defined in spec.resourceClaims, that are used by this container.

This is an alpha field and requires enabling the DynamicResourceAllocation feature gate.

This field is immutable. It can only be set for containers.类型`array`### [#](#spectemplatespecinitcontainersresourcesclaims-1).spec.template.spec.initContainers[].resources.claims[]

描述ResourceClaim references one entry in PodSpec.ResourceClaims.类型`object`必填`name`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `name` | `string` | Name must match the name of one entry in pod.spec.resourceClaims of the Pod where this field is used. It makes that resource available inside a container. |
| `request` | `string` | Request is the name chosen for a request in the referenced claim. If empty, everything from the claim is made available, otherwise only the result of this request. |

### [#](#spectemplatespecinitcontainersresourceslimits).spec.template.spec.initContainers[].resources.limits

描述Limits describes the maximum amount of compute resources allowed. More info: https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/类型`object`### [#](#spectemplatespecinitcontainersresourcesrequests).spec.template.spec.initContainers[].resources.requests

描述Requests describes the minimum amount of compute resources required. If Requests is omitted for a container, it defaults to Limits if that is explicitly specified, otherwise to an implementation-defined value. Requests cannot exceed Limits. More info: https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/类型`object`### [#](#spectemplatespecinitcontainerssecuritycontext).spec.template.spec.initContainers[].securityContext

描述SecurityContext holds security configuration that will be applied to a container. Some fields are present in both SecurityContext and PodSecurityContext.  When both are set, the values in SecurityContext take precedence.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `allowPrivilegeEscalation` | `boolean` | AllowPrivilegeEscalation controls whether a process can gain more privileges than its parent process. This bool directly controls if the no_new_privs flag will be set on the container process. AllowPrivilegeEscalation is true always when the container is: 1) run as Privileged 2) has CAP_SYS_ADMIN Note that this field cannot be set when spec.os.name is windows. |
| `appArmorProfile` | `object` | AppArmorProfile defines a pod or container's AppArmor settings. |
| `capabilities` | `object` | Adds and removes POSIX capabilities from running containers. |
| `privileged` | `boolean` | Run container in privileged mode. Processes in privileged containers are essentially equivalent to root on the host. Defaults to false. Note that this field cannot be set when spec.os.name is windows. |
| `procMount` | `string` | procMount denotes the type of proc mount to use for the containers. The default value is Default which uses the container runtime defaults for readonly paths and masked paths. This requires the ProcMountType feature flag to be enabled. Note that this field cannot be set when spec.os.name is windows.


Possible enum values:



- `"Default"` uses the container runtime defaults for readonly and masked paths for /proc. Most container runtimes mask certain paths in /proc to avoid accidental security exposure of special devices or information.

- `"Unmasked"` bypasses the default masking behavior of the container runtime and ensures the newly created /proc the container stays in tact with no modifications. |
| `readOnlyRootFilesystem` | `boolean` | Whether this container has a read-only root filesystem. Default is false. Note that this field cannot be set when spec.os.name is windows. |
| `runAsGroup` | `integer` | The GID to run the entrypoint of the container process. Uses runtime default if unset. May also be set in PodSecurityContext.  If set in both SecurityContext and PodSecurityContext, the value specified in SecurityContext takes precedence. Note that this field cannot be set when spec.os.name is windows. |
| `runAsNonRoot` | `boolean` | Indicates that the container must run as a non-root user. If true, the Kubelet will validate the image at runtime to ensure that it does not run as UID 0 (root) and fail to start the container if it does. If unset or false, no such validation will be performed. May also be set in PodSecurityContext.  If set in both SecurityContext and PodSecurityContext, the value specified in SecurityContext takes precedence. |
| `runAsUser` | `integer` | The UID to run the entrypoint of the container process. Defaults to user specified in image metadata if unspecified. May also be set in PodSecurityContext.  If set in both SecurityContext and PodSecurityContext, the value specified in SecurityContext takes precedence. Note that this field cannot be set when spec.os.name is windows. |
| `seLinuxOptions` | `object` | SELinuxOptions are the labels to be applied to the container |
| `seccompProfile` | `object` | SeccompProfile defines a pod/container's seccomp profile settings. Only one profile source may be set. |
| `windowsOptions` | `object` | WindowsSecurityContextOptions contain Windows-specific options and credentials. |

### [#](#spectemplatespecinitcontainerssecuritycontextapparmorprofile).spec.template.spec.initContainers[].securityContext.appArmorProfile

描述AppArmorProfile defines a pod or container's AppArmor settings.类型`object`必填`type`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `localhostProfile` | `string` | localhostProfile indicates a profile loaded on the node that should be used. The profile must be preconfigured on the node to work. Must match the loaded name of the profile. Must be set if and only if type is "Localhost". |
| `type` | `string` | type indicates which kind of AppArmor profile will be applied. Valid options are:
Localhost - a profile pre-loaded on the node.
RuntimeDefault - the container runtime's default profile.
Unconfined - no AppArmor enforcement.


Possible enum values:



- `"Localhost"` indicates that a profile pre-loaded on the node should be used.

- `"RuntimeDefault"` indicates that the container runtime's default AppArmor profile should be used.

- `"Unconfined"` indicates that no AppArmor profile should be enforced. |

### [#](#spectemplatespecinitcontainerssecuritycontextcapabilities).spec.template.spec.initContainers[].securityContext.capabilities

描述Adds and removes POSIX capabilities from running containers.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `add` | `array` | Added capabilities |
| `drop` | `array` | Removed capabilities |

### [#](#spectemplatespecinitcontainerssecuritycontextcapabilitiesadd).spec.template.spec.initContainers[].securityContext.capabilities.add

描述Added capabilities类型`array`### [#](#spectemplatespecinitcontainerssecuritycontextcapabilitiesadd-1).spec.template.spec.initContainers[].securityContext.capabilities.add[]

类型`string`### [#](#spectemplatespecinitcontainerssecuritycontextcapabilitiesdrop).spec.template.spec.initContainers[].securityContext.capabilities.drop

描述Removed capabilities类型`array`### [#](#spectemplatespecinitcontainerssecuritycontextcapabilitiesdrop-1).spec.template.spec.initContainers[].securityContext.capabilities.drop[]

类型`string`### [#](#spectemplatespecinitcontainerssecuritycontextselinuxoptions).spec.template.spec.initContainers[].securityContext.seLinuxOptions

描述SELinuxOptions are the labels to be applied to the container类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `level` | `string` | Level is SELinux level label that applies to the container. |
| `role` | `string` | Role is a SELinux role label that applies to the container. |
| `type` | `string` | Type is a SELinux type label that applies to the container. |
| `user` | `string` | User is a SELinux user label that applies to the container. |

### [#](#spectemplatespecinitcontainerssecuritycontextseccompprofile).spec.template.spec.initContainers[].securityContext.seccompProfile

描述SeccompProfile defines a pod/container's seccomp profile settings. Only one profile source may be set.类型`object`必填`type`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `localhostProfile` | `string` | localhostProfile indicates a profile defined in a file on the node should be used. The profile must be preconfigured on the node to work. Must be a descending path, relative to the kubelet's configured seccomp profile location. Must be set if type is "Localhost". Must NOT be set for any other type. |
| `type` | `string` | type indicates which kind of seccomp profile will be applied. Valid options are:


Localhost - a profile defined in a file on the node should be used. RuntimeDefault - the container runtime default profile should be used. Unconfined - no profile should be applied.


Possible enum values:



- `"Localhost"` indicates a profile defined in a file on the node should be used. The file's location relative to /seccomp.

- `"RuntimeDefault"` represents the default container runtime seccomp profile.

- `"Unconfined"` indicates no seccomp profile is applied (A.K.A. unconfined). |

### [#](#spectemplatespecinitcontainerssecuritycontextwindowsoptions).spec.template.spec.initContainers[].securityContext.windowsOptions

描述WindowsSecurityContextOptions contain Windows-specific options and credentials.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `gmsaCredentialSpec` | `string` | GMSACredentialSpec is where the GMSA admission webhook ([https://github.com/kubernetes-sigs/windows-gmsa](https://github.com/kubernetes-sigs/windows-gmsa)) inlines the contents of the GMSA credential spec named by the GMSACredentialSpecName field. |
| `gmsaCredentialSpecName` | `string` | GMSACredentialSpecName is the name of the GMSA credential spec to use. |
| `hostProcess` | `boolean` | HostProcess determines if a container should be run as a 'Host Process' container. All of a Pod's containers must have the same effective HostProcess value (it is not allowed to have a mix of HostProcess containers and non-HostProcess containers). In addition, if HostProcess is true then HostNetwork must also be set to true. |
| `runAsUserName` | `string` | The UserName in Windows to run the entrypoint of the container process. Defaults to the user specified in image metadata if unspecified. May also be set in PodSecurityContext. If set in both SecurityContext and PodSecurityContext, the value specified in SecurityContext takes precedence. |

### [#](#spectemplatespecinitcontainersstartupprobe).spec.template.spec.initContainers[].startupProbe

描述Probe describes a health check to be performed against a container to determine whether it is alive or ready to receive traffic.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `exec` | `object` | ExecAction describes a "run in container" action. |
| `failureThreshold` | `integer` | Minimum consecutive failures for the probe to be considered failed after having succeeded. Defaults to 3. Minimum value is 1. |
| `grpc` | `object` | GRPCAction specifies an action involving a GRPC service. |
| `httpGet` | `object` | HTTPGetAction describes an action based on HTTP Get requests. |
| `initialDelaySeconds` | `integer` | Number of seconds after the container has started before liveness probes are initiated. More info: [https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle#container-probes](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle#container-probes) |
| `periodSeconds` | `integer` | How often (in seconds) to perform the probe. Default to 10 seconds. Minimum value is 1. |
| `successThreshold` | `integer` | Minimum consecutive successes for the probe to be considered successful after having failed. Defaults to 1. Must be 1 for liveness and startup. Minimum value is 1. |
| `tcpSocket` | `object` | TCPSocketAction describes an action based on opening a socket |
| `terminationGracePeriodSeconds` | `integer` | Optional duration in seconds the pod needs to terminate gracefully upon probe failure. The grace period is the duration in seconds after the processes running in the pod are sent a termination signal and the time when the processes are forcibly halted with a kill signal. Set this value longer than the expected cleanup time for your process. If this value is nil, the pod's terminationGracePeriodSeconds will be used. Otherwise, this value overrides the value provided by the pod spec. Value must be non-negative integer. The value zero indicates stop immediately via the kill signal (no opportunity to shut down). This is a beta field and requires enabling ProbeTerminationGracePeriod feature gate. Minimum value is 1. spec.terminationGracePeriodSeconds is used if unset. |
| `timeoutSeconds` | `integer` | Number of seconds after which the probe times out. Defaults to 1 second. Minimum value is 1. More info: [https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle#container-probes](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle#container-probes) |

### [#](#spectemplatespecinitcontainersstartupprobeexec).spec.template.spec.initContainers[].startupProbe.exec

描述ExecAction describes a "run in container" action.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `command` | `array` | Command is the command line to execute inside the container, the working directory for the command  is root ('/') in the container's filesystem. The command is simply exec'd, it is not run inside a shell, so traditional shell instructions ('|', etc) won't work. To use a shell, you need to explicitly call out to that shell. Exit status of 0 is treated as live/healthy and non-zero is unhealthy. |

### [#](#spectemplatespecinitcontainersstartupprobeexeccommand).spec.template.spec.initContainers[].startupProbe.exec.command

描述Command is the command line to execute inside the container, the working directory for the command  is root ('/') in the container's filesystem. The command is simply exec'd, it is not run inside a shell, so traditional shell instructions ('|', etc) won't work. To use a shell, you need to explicitly call out to that shell. Exit status of 0 is treated as live/healthy and non-zero is unhealthy.类型`array`### [#](#spectemplatespecinitcontainersstartupprobeexeccommand-1).spec.template.spec.initContainers[].startupProbe.exec.command[]

类型`string`### [#](#spectemplatespecinitcontainersstartupprobegrpc).spec.template.spec.initContainers[].startupProbe.grpc

描述GRPCAction specifies an action involving a GRPC service.类型`object`必填`port`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `port` | `integer` | Port number of the gRPC service. Number must be in the range 1 to 65535. |
| `service` | `string` | Service is the name of the service to place in the gRPC HealthCheckRequest (see [https://github.com/grpc/grpc/blob/master/doc/health-checking.md](https://github.com/grpc/grpc/blob/master/doc/health-checking.md)).


If this is not specified, the default behavior is defined by gRPC. |

### [#](#spectemplatespecinitcontainersstartupprobehttpget).spec.template.spec.initContainers[].startupProbe.httpGet

描述HTTPGetAction describes an action based on HTTP Get requests.类型`object`必填`port`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `host` | `string` | Host name to connect to, defaults to the pod IP. You probably want to set "Host" in httpHeaders instead. |
| `httpHeaders` | `array` | Custom headers to set in the request. HTTP allows repeated headers. |
| `path` | `string` | Path to access on the HTTP server. |
| `port` | `integer|string` | IntOrString is a type that can hold an int32 or a string.  When used in JSON or YAML marshalling and unmarshalling, it produces or consumes the inner type.  This allows you to have, for example, a JSON field that can accept a name or number. |
| `scheme` | `string` | Scheme to use for connecting to the host. Defaults to HTTP.


Possible enum values:



- `"HTTP"` means that the scheme used will be http://

- `"HTTPS"` means that the scheme used will be https:// |

### [#](#spectemplatespecinitcontainersstartupprobehttpgethttpheaders).spec.template.spec.initContainers[].startupProbe.httpGet.httpHeaders

描述Custom headers to set in the request. HTTP allows repeated headers.类型`array`### [#](#spectemplatespecinitcontainersstartupprobehttpgethttpheaders-1).spec.template.spec.initContainers[].startupProbe.httpGet.httpHeaders[]

描述HTTPHeader describes a custom header to be used in HTTP probes类型`object`必填`name``value`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `name` | `string` | The header field name. This will be canonicalized upon output, so case-variant names will be understood as the same header. |
| `value` | `string` | The header field value |

### [#](#spectemplatespecinitcontainersstartupprobetcpsocket).spec.template.spec.initContainers[].startupProbe.tcpSocket

描述TCPSocketAction describes an action based on opening a socket类型`object`必填`port`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `host` | `string` | Optional: Host name to connect to, defaults to the pod IP. |
| `port` | `integer|string` | IntOrString is a type that can hold an int32 or a string.  When used in JSON or YAML marshalling and unmarshalling, it produces or consumes the inner type.  This allows you to have, for example, a JSON field that can accept a name or number. |

### [#](#spectemplatespecinitcontainersvolumedevices).spec.template.spec.initContainers[].volumeDevices

描述volumeDevices is the list of block devices to be used by the container.类型`array`### [#](#spectemplatespecinitcontainersvolumedevices-1).spec.template.spec.initContainers[].volumeDevices[]

描述volumeDevice describes a mapping of a raw block device within a container.类型`object`必填`name``devicePath`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `devicePath` | `string` | devicePath is the path inside of the container that the device will be mapped to. |
| `name` | `string` | name must match the name of a persistentVolumeClaim in the pod |

### [#](#spectemplatespecinitcontainersvolumemounts).spec.template.spec.initContainers[].volumeMounts

描述Pod volumes to mount into the container's filesystem. Cannot be updated.类型`array`### [#](#spectemplatespecinitcontainersvolumemounts-1).spec.template.spec.initContainers[].volumeMounts[]

描述VolumeMount describes a mounting of a Volume within a container.类型`object`必填`name``mountPath`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `mountPath` | `string` | Path within the container at which the volume should be mounted.  Must not contain ':'. |
| `mountPropagation` | `string` | mountPropagation determines how mounts are propagated from the host to container and the other way around. When not set, MountPropagationNone is used. This field is beta in 1.10. When RecursiveReadOnly is set to IfPossible or to Enabled, MountPropagation must be None or unspecified (which defaults to None).


Possible enum values:



- `"Bidirectional"` means that the volume in a container will receive new mounts from the host or other containers, and its own mounts will be propagated from the container to the host or other containers. Note that this mode is recursively applied to all mounts in the volume ("rshared" in Linux terminology).

- `"HostToContainer"` means that the volume in a container will receive new mounts from the host or other containers, but filesystems mounted inside the container won't be propagated to the host or other containers. Note that this mode is recursively applied to all mounts in the volume ("rslave" in Linux terminology).

- `"None"` means that the volume in a container will not receive new mounts from the host or other containers, and filesystems mounted inside the container won't be propagated to the host or other containers. Note that this mode corresponds to "private" in Linux terminology. |
| `name` | `string` | This must match the Name of a Volume. |
| `readOnly` | `boolean` | Mounted read-only if true, read-write otherwise (false or unspecified). Defaults to false. |
| `recursiveReadOnly` | `string` | RecursiveReadOnly specifies whether read-only mounts should be handled recursively.


If ReadOnly is false, this field has no meaning and must be unspecified.


If ReadOnly is true, and this field is set to Disabled, the mount is not made recursively read-only.  If this field is set to IfPossible, the mount is made recursively read-only, if it is supported by the container runtime.  If this field is set to Enabled, the mount is made recursively read-only if it is supported by the container runtime, otherwise the pod will not be started and an error will be generated to indicate the reason.


If this field is set to IfPossible or Enabled, MountPropagation must be set to None (or be unspecified, which defaults to None).


If this field is not specified, it is treated as an equivalent of Disabled. |
| `subPath` | `string` | Path within the volume from which the container's volume should be mounted. Defaults to "" (volume's root). |
| `subPathExpr` | `string` | Expanded path within the volume from which the container's volume should be mounted. Behaves similarly to SubPath but environment variable references $(VAR_NAME) are expanded using the container's environment. Defaults to "" (volume's root). SubPathExpr and SubPath are mutually exclusive. |

### [#](#spectemplatespecnodeselector).spec.template.spec.nodeSelector

描述NodeSelector is a selector which must be true for the pod to fit on a node. Selector which must match a node's labels for the pod to be scheduled on that node. More info: https://kubernetes.io/docs/concepts/configuration/assign-pod-node/类型`object`### [#](#spectemplatespecos).spec.template.spec.os

描述PodOS defines the OS parameters of a pod.类型`object`必填`name`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `name` | `string` | Name is the name of the operating system. The currently supported values are linux and windows. Additional value may be defined in future and can be one of: [https://github.com/opencontainers/runtime-spec/blob/master/config.md#platform-specific-configuration](https://github.com/opencontainers/runtime-spec/blob/master/config.md#platform-specific-configuration) Clients should expect to handle additional values and treat unrecognized values in this field as os: null |

### [#](#spectemplatespecoverhead).spec.template.spec.overhead

描述Overhead represents the resource overhead associated with running a pod for a given RuntimeClass. This field will be autopopulated at admission time by the RuntimeClass admission controller. If the RuntimeClass admission controller is enabled, overhead must not be set in Pod create requests. The RuntimeClass admission controller will reject Pod create requests which have the overhead already set. If RuntimeClass is configured and selected in the PodSpec, Overhead will be set to the value defined in the corresponding RuntimeClass, otherwise it will remain unset and treated as zero. More info: https://git.k8s.io/enhancements/keps/sig-node/688-pod-overhead/README.md类型`object`### [#](#spectemplatespecreadinessgates).spec.template.spec.readinessGates

描述If specified, all readiness gates will be evaluated for pod readiness. A pod is ready when all its containers are ready AND all conditions specified in the readiness gates have status equal to "True" More info: https://git.k8s.io/enhancements/keps/sig-network/580-pod-readiness-gates类型`array`### [#](#spectemplatespecreadinessgates-1).spec.template.spec.readinessGates[]

描述PodReadinessGate contains the reference to a pod condition类型`object`必填`conditionType`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `conditionType` | `string` | ConditionType refers to a condition in the pod's condition list with matching type. |

### [#](#spectemplatespecresourceclaims).spec.template.spec.resourceClaims

描述ResourceClaims defines which ResourceClaims must be allocated and reserved before the Pod is allowed to start. The resources will be made available to those containers which consume them by name.

This is an alpha field and requires enabling the DynamicResourceAllocation feature gate.

This field is immutable.类型`array`### [#](#spectemplatespecresourceclaims-1).spec.template.spec.resourceClaims[]

描述PodResourceClaim references exactly one ResourceClaim, either directly or by naming a ResourceClaimTemplate which is then turned into a ResourceClaim for the pod.

It adds a name to it that uniquely identifies the ResourceClaim inside the Pod. Containers that need access to the ResourceClaim reference it with this name.类型`object`必填`name`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `name` | `string` | Name uniquely identifies this resource claim inside the pod. This must be a DNS_LABEL. |
| `resourceClaimName` | `string` | ResourceClaimName is the name of a ResourceClaim object in the same namespace as this pod.


Exactly one of ResourceClaimName and ResourceClaimTemplateName must be set. |
| `resourceClaimTemplateName` | `string` | ResourceClaimTemplateName is the name of a ResourceClaimTemplate object in the same namespace as this pod.


The template will be used to create a new ResourceClaim, which will be bound to this pod. When this pod is deleted, the ResourceClaim will also be deleted. The pod name and resource name, along with a generated component, will be used to form a unique name for the ResourceClaim, which will be recorded in pod.status.resourceClaimStatuses.


This field is immutable and no changes will be made to the corresponding ResourceClaim by the control plane after creating the ResourceClaim.


Exactly one of ResourceClaimName and ResourceClaimTemplateName must be set. |

### [#](#spectemplatespecresources).spec.template.spec.resources

描述ResourceRequirements describes the compute resource requirements.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `claims` | `array` | Claims lists the names of resources, defined in spec.resourceClaims, that are used by this container.


This is an alpha field and requires enabling the DynamicResourceAllocation feature gate.


This field is immutable. It can only be set for containers. |
| `limits` | `object` | Limits describes the maximum amount of compute resources allowed. More info: [https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/) |
| `requests` | `object` | Requests describes the minimum amount of compute resources required. If Requests is omitted for a container, it defaults to Limits if that is explicitly specified, otherwise to an implementation-defined value. Requests cannot exceed Limits. More info: [https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/) |

### [#](#spectemplatespecresourcesclaims).spec.template.spec.resources.claims

描述Claims lists the names of resources, defined in spec.resourceClaims, that are used by this container.

This is an alpha field and requires enabling the DynamicResourceAllocation feature gate.

This field is immutable. It can only be set for containers.类型`array`### [#](#spectemplatespecresourcesclaims-1).spec.template.spec.resources.claims[]

描述ResourceClaim references one entry in PodSpec.ResourceClaims.类型`object`必填`name`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `name` | `string` | Name must match the name of one entry in pod.spec.resourceClaims of the Pod where this field is used. It makes that resource available inside a container. |
| `request` | `string` | Request is the name chosen for a request in the referenced claim. If empty, everything from the claim is made available, otherwise only the result of this request. |

### [#](#spectemplatespecresourceslimits).spec.template.spec.resources.limits

描述Limits describes the maximum amount of compute resources allowed. More info: https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/类型`object`### [#](#spectemplatespecresourcesrequests).spec.template.spec.resources.requests

描述Requests describes the minimum amount of compute resources required. If Requests is omitted for a container, it defaults to Limits if that is explicitly specified, otherwise to an implementation-defined value. Requests cannot exceed Limits. More info: https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/类型`object`### [#](#spectemplatespecschedulinggates).spec.template.spec.schedulingGates

描述SchedulingGates is an opaque list of values that if specified will block scheduling the pod. If schedulingGates is not empty, the pod will stay in the SchedulingGated state and the scheduler will not attempt to schedule the pod.

SchedulingGates can only be set at pod creation time, and be removed only afterwards.类型`array`### [#](#spectemplatespecschedulinggates-1).spec.template.spec.schedulingGates[]

描述PodSchedulingGate is associated to a Pod to guard its scheduling.类型`object`必填`name`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `name` | `string` | Name of the scheduling gate. Each scheduling gate must have a unique name field. |

### [#](#spectemplatespecsecuritycontext).spec.template.spec.securityContext

描述PodSecurityContext holds pod-level security attributes and common container settings. Some fields are also present in container.securityContext.  Field values of container.securityContext take precedence over field values of PodSecurityContext.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `appArmorProfile` | `object` | AppArmorProfile defines a pod or container's AppArmor settings. |
| `fsGroup` | `integer` | A special supplemental group that applies to all containers in a pod. Some volume types allow the Kubelet to change the ownership of that volume to be owned by the pod:



1. The owning GID will be the FSGroup 2. The setgid bit is set (new files created in the volume will be owned by FSGroup) 3. The permission bits are OR'd with rw-rw----



If unset, the Kubelet will not modify the ownership and permissions of any volume. Note that this field cannot be set when spec.os.name is windows. |
| `fsGroupChangePolicy` | `string` | fsGroupChangePolicy defines behavior of changing ownership and permission of the volume before being exposed inside Pod. This field will only apply to volume types which support fsGroup based ownership(and permissions). It will have no effect on ephemeral volume types such as: secret, configmaps and emptydir. Valid values are "OnRootMismatch" and "Always". If not specified, "Always" is used. Note that this field cannot be set when spec.os.name is windows.


Possible enum values:



- `"Always"` indicates that volume's ownership and permissions should always be changed whenever volume is mounted inside a Pod. This the default behavior.

- `"OnRootMismatch"` indicates that volume's ownership and permissions will be changed only when permission and ownership of root directory does not match with expected permissions on the volume. This can help shorten the time it takes to change ownership and permissions of a volume. |
| `runAsGroup` | `integer` | The GID to run the entrypoint of the container process. Uses runtime default if unset. May also be set in SecurityContext.  If set in both SecurityContext and PodSecurityContext, the value specified in SecurityContext takes precedence for that container. Note that this field cannot be set when spec.os.name is windows. |
| `runAsNonRoot` | `boolean` | Indicates that the container must run as a non-root user. If true, the Kubelet will validate the image at runtime to ensure that it does not run as UID 0 (root) and fail to start the container if it does. If unset or false, no such validation will be performed. May also be set in SecurityContext.  If set in both SecurityContext and PodSecurityContext, the value specified in SecurityContext takes precedence. |
| `runAsUser` | `integer` | The UID to run the entrypoint of the container process. Defaults to user specified in image metadata if unspecified. May also be set in SecurityContext.  If set in both SecurityContext and PodSecurityContext, the value specified in SecurityContext takes precedence for that container. Note that this field cannot be set when spec.os.name is windows. |
| `seLinuxChangePolicy` | `string` | seLinuxChangePolicy defines how the container's SELinux label is applied to all volumes used by the Pod. It has no effect on nodes that do not support SELinux or to volumes does not support SELinux. Valid values are "MountOption" and "Recursive".


"Recursive" means relabeling of all files on all Pod volumes by the container runtime. This may be slow for large volumes, but allows mixing privileged and unprivileged Pods sharing the same volume on the same node.


"MountOption" mounts all eligible Pod volumes with `-o context` mount option. This requires all Pods that share the same volume to use the same SELinux label. It is not possible to share the same volume among privileged and unprivileged Pods. Eligible volumes are in-tree FibreChannel and iSCSI volumes, and all CSI volumes whose CSI driver announces SELinux support by setting spec.seLinuxMount: true in their CSIDriver instance. Other volumes are always re-labelled recursively. "MountOption" value is allowed only when SELinuxMount feature gate is enabled.


If not specified and SELinuxMount feature gate is enabled, "MountOption" is used. If not specified and SELinuxMount feature gate is disabled, "MountOption" is used for ReadWriteOncePod volumes and "Recursive" for all other volumes.


This field affects only Pods that have SELinux label set, either in PodSecurityContext or in SecurityContext of all containers.


All Pods that use the same volume should use the same seLinuxChangePolicy, otherwise some pods can get stuck in ContainerCreating state. Note that this field cannot be set when spec.os.name is windows. |
| `seLinuxOptions` | `object` | SELinuxOptions are the labels to be applied to the container |
| `seccompProfile` | `object` | SeccompProfile defines a pod/container's seccomp profile settings. Only one profile source may be set. |
| `supplementalGroups` | `array` | A list of groups applied to the first process run in each container, in addition to the container's primary GID and fsGroup (if specified).  If the SupplementalGroupsPolicy feature is enabled, the supplementalGroupsPolicy field determines whether these are in addition to or instead of any group memberships defined in the container image. If unspecified, no additional groups are added, though group memberships defined in the container image may still be used, depending on the supplementalGroupsPolicy field. Note that this field cannot be set when spec.os.name is windows. |
| `supplementalGroupsPolicy` | `string` | Defines how supplemental groups of the first container processes are calculated. Valid values are "Merge" and "Strict". If not specified, "Merge" is used. (Alpha) Using the field requires the SupplementalGroupsPolicy feature gate to be enabled and the container runtime must implement support for this feature. Note that this field cannot be set when spec.os.name is windows.


Possible enum values:



- `"Merge"` means that the container's provided SupplementalGroups and FsGroup (specified in SecurityContext) will be merged with the primary user's groups as defined in the container image (in /etc/group).

- `"Strict"` means that the container's provided SupplementalGroups and FsGroup (specified in SecurityContext) will be used instead of any groups defined in the container image. |
| `sysctls` | `array` | Sysctls hold a list of namespaced sysctls used for the pod. Pods with unsupported sysctls (by the container runtime) might fail to launch. Note that this field cannot be set when spec.os.name is windows. |
| `windowsOptions` | `object` | WindowsSecurityContextOptions contain Windows-specific options and credentials. |

### [#](#spectemplatespecsecuritycontextapparmorprofile).spec.template.spec.securityContext.appArmorProfile

描述AppArmorProfile defines a pod or container's AppArmor settings.类型`object`必填`type`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `localhostProfile` | `string` | localhostProfile indicates a profile loaded on the node that should be used. The profile must be preconfigured on the node to work. Must match the loaded name of the profile. Must be set if and only if type is "Localhost". |
| `type` | `string` | type indicates which kind of AppArmor profile will be applied. Valid options are:
Localhost - a profile pre-loaded on the node.
RuntimeDefault - the container runtime's default profile.
Unconfined - no AppArmor enforcement.


Possible enum values:



- `"Localhost"` indicates that a profile pre-loaded on the node should be used.

- `"RuntimeDefault"` indicates that the container runtime's default AppArmor profile should be used.

- `"Unconfined"` indicates that no AppArmor profile should be enforced. |

### [#](#spectemplatespecsecuritycontextselinuxoptions).spec.template.spec.securityContext.seLinuxOptions

描述SELinuxOptions are the labels to be applied to the container类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `level` | `string` | Level is SELinux level label that applies to the container. |
| `role` | `string` | Role is a SELinux role label that applies to the container. |
| `type` | `string` | Type is a SELinux type label that applies to the container. |
| `user` | `string` | User is a SELinux user label that applies to the container. |

### [#](#spectemplatespecsecuritycontextseccompprofile).spec.template.spec.securityContext.seccompProfile

描述SeccompProfile defines a pod/container's seccomp profile settings. Only one profile source may be set.类型`object`必填`type`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `localhostProfile` | `string` | localhostProfile indicates a profile defined in a file on the node should be used. The profile must be preconfigured on the node to work. Must be a descending path, relative to the kubelet's configured seccomp profile location. Must be set if type is "Localhost". Must NOT be set for any other type. |
| `type` | `string` | type indicates which kind of seccomp profile will be applied. Valid options are:


Localhost - a profile defined in a file on the node should be used. RuntimeDefault - the container runtime default profile should be used. Unconfined - no profile should be applied.


Possible enum values:



- `"Localhost"` indicates a profile defined in a file on the node should be used. The file's location relative to /seccomp.

- `"RuntimeDefault"` represents the default container runtime seccomp profile.

- `"Unconfined"` indicates no seccomp profile is applied (A.K.A. unconfined). |

### [#](#spectemplatespecsecuritycontextsupplementalgroups).spec.template.spec.securityContext.supplementalGroups

描述A list of groups applied to the first process run in each container, in addition to the container's primary GID and fsGroup (if specified).  If the SupplementalGroupsPolicy feature is enabled, the supplementalGroupsPolicy field determines whether these are in addition to or instead of any group memberships defined in the container image. If unspecified, no additional groups are added, though group memberships defined in the container image may still be used, depending on the supplementalGroupsPolicy field. Note that this field cannot be set when spec.os.name is windows.类型`array`### [#](#spectemplatespecsecuritycontextsupplementalgroups-1).spec.template.spec.securityContext.supplementalGroups[]

类型`integer`### [#](#spectemplatespecsecuritycontextsysctls).spec.template.spec.securityContext.sysctls

描述Sysctls hold a list of namespaced sysctls used for the pod. Pods with unsupported sysctls (by the container runtime) might fail to launch. Note that this field cannot be set when spec.os.name is windows.类型`array`### [#](#spectemplatespecsecuritycontextsysctls-1).spec.template.spec.securityContext.sysctls[]

描述Sysctl defines a kernel parameter to be set类型`object`必填`name``value`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `name` | `string` | Name of a property to set |
| `value` | `string` | Value of a property to set |

### [#](#spectemplatespecsecuritycontextwindowsoptions).spec.template.spec.securityContext.windowsOptions

描述WindowsSecurityContextOptions contain Windows-specific options and credentials.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `gmsaCredentialSpec` | `string` | GMSACredentialSpec is where the GMSA admission webhook ([https://github.com/kubernetes-sigs/windows-gmsa](https://github.com/kubernetes-sigs/windows-gmsa)) inlines the contents of the GMSA credential spec named by the GMSACredentialSpecName field. |
| `gmsaCredentialSpecName` | `string` | GMSACredentialSpecName is the name of the GMSA credential spec to use. |
| `hostProcess` | `boolean` | HostProcess determines if a container should be run as a 'Host Process' container. All of a Pod's containers must have the same effective HostProcess value (it is not allowed to have a mix of HostProcess containers and non-HostProcess containers). In addition, if HostProcess is true then HostNetwork must also be set to true. |
| `runAsUserName` | `string` | The UserName in Windows to run the entrypoint of the container process. Defaults to the user specified in image metadata if unspecified. May also be set in PodSecurityContext. If set in both SecurityContext and PodSecurityContext, the value specified in SecurityContext takes precedence. |

### [#](#spectemplatespectolerations).spec.template.spec.tolerations

描述If specified, the pod's tolerations.类型`array`### [#](#spectemplatespectolerations-1).spec.template.spec.tolerations[]

描述The pod this Toleration is attached to tolerates any taint that matches the triple <key,value,effect> using the matching operator <operator>.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `effect` | `string` | Effect indicates the taint effect to match. Empty means match all taint effects. When specified, allowed values are NoSchedule, PreferNoSchedule and NoExecute.


Possible enum values:



- `"NoExecute"` Evict any already-running pods that do not tolerate the taint. Currently enforced by NodeController.

- `"NoSchedule"` Do not allow new pods to schedule onto the node unless they tolerate the taint, but allow all pods submitted to Kubelet without going through the scheduler to start, and allow all already-running pods to continue running. Enforced by the scheduler.

- `"PreferNoSchedule"` Like TaintEffectNoSchedule, but the scheduler tries not to schedule new pods onto the node, rather than prohibiting new pods from scheduling onto the node entirely. Enforced by the scheduler. |
| `key` | `string` | Key is the taint key that the toleration applies to. Empty means match all taint keys. If the key is empty, operator must be Exists; this combination means to match all values and all keys. |
| `operator` | `string` | Operator represents a key's relationship to the value. Valid operators are Exists and Equal. Defaults to Equal. Exists is equivalent to wildcard for value, so that a pod can tolerate all taints of a particular category.


Possible enum values:



- `"Equal"`

- `"Exists"` |
| `tolerationSeconds` | `integer` | TolerationSeconds represents the period of time the toleration (which must be of effect NoExecute, otherwise this field is ignored) tolerates the taint. By default, it is not set, which means tolerate the taint forever (do not evict). Zero and negative values will be treated as 0 (evict immediately) by the system. |
| `value` | `string` | Value is the taint value the toleration matches to. If the operator is Exists, the value should be empty, otherwise just a regular string. |

### [#](#spectemplatespectopologyspreadconstraints).spec.template.spec.topologySpreadConstraints

描述TopologySpreadConstraints describes how a group of pods ought to spread across topology domains. Scheduler will schedule pods in a way which abides by the constraints. All topologySpreadConstraints are ANDed.类型`array`### [#](#spectemplatespectopologyspreadconstraints-1).spec.template.spec.topologySpreadConstraints[]

描述TopologySpreadConstraint specifies how to spread matching pods among the given topology.类型`object`必填`maxSkew``topologyKey``whenUnsatisfiable`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `labelSelector` | `object` | A label selector is a label query over a set of resources. The result of matchLabels and matchExpressions are ANDed. An empty label selector matches all objects. A null label selector matches no objects. |
| `matchLabelKeys` | `array` | MatchLabelKeys is a set of pod label keys to select the pods over which spreading will be calculated. The keys are used to lookup values from the incoming pod labels, those key-value labels are ANDed with labelSelector to select the group of existing pods over which spreading will be calculated for the incoming pod. The same key is forbidden to exist in both MatchLabelKeys and LabelSelector. MatchLabelKeys cannot be set when LabelSelector isn't set. Keys that don't exist in the incoming pod labels will be ignored. A null or empty list means only match against labelSelector.


This is a beta field and requires the MatchLabelKeysInPodTopologySpread feature gate to be enabled (enabled by default). |
| `maxSkew` | `integer` | MaxSkew describes the degree to which pods may be unevenly distributed. When `whenUnsatisfiable=DoNotSchedule`, it is the maximum permitted difference between the number of matching pods in the target topology and the global minimum. The global minimum is the minimum number of matching pods in an eligible domain or zero if the number of eligible domains is less than MinDomains. For example, in a 3-zone cluster, MaxSkew is set to 1, and pods with the same labelSelector spread as 2/2/1: In this case, the global minimum is 1. | zone1 | zone2 | zone3 | |  P P  |  P P  |   P   | - if MaxSkew is 1, incoming pod can only be scheduled to zone3 to become 2/2/2; scheduling it onto zone1(zone2) would make the ActualSkew(3-1) on zone1(zone2) violate MaxSkew(1). - if MaxSkew is 2, incoming pod can be scheduled onto any zone. When `whenUnsatisfiable=ScheduleAnyway`, it is used to give higher precedence to topologies that satisfy it. It's a required field. Default value is 1 and 0 is not allowed. |
| `minDomains` | `integer` | MinDomains indicates a minimum number of eligible domains. When the number of eligible domains with matching topology keys is less than minDomains, Pod Topology Spread treats "global minimum" as 0, and then the calculation of Skew is performed. And when the number of eligible domains with matching topology keys equals or greater than minDomains, this value has no effect on scheduling. As a result, when the number of eligible domains is less than minDomains, scheduler won't schedule more than maxSkew Pods to those domains. If value is nil, the constraint behaves as if MinDomains is equal to 1. Valid values are integers greater than 0. When value is not nil, WhenUnsatisfiable must be DoNotSchedule.


For example, in a 3-zone cluster, MaxSkew is set to 2, MinDomains is set to 5 and pods with the same labelSelector spread as 2/2/2: | zone1 | zone2 | zone3 | |  P P  |  P P  |  P P  | The number of domains is less than 5(MinDomains), so "global minimum" is treated as 0. In this situation, new pod with the same labelSelector cannot be scheduled, because computed skew will be 3(3 - 0) if new Pod is scheduled to any of the three zones, it will violate MaxSkew. |
| `nodeAffinityPolicy` | `string` | NodeAffinityPolicy indicates how we will treat Pod's nodeAffinity/nodeSelector when calculating pod topology spread skew. Options are: - Honor: only nodes matching nodeAffinity/nodeSelector are included in the calculations. - Ignore: nodeAffinity/nodeSelector are ignored. All nodes are included in the calculations.


If this value is nil, the behavior is equivalent to the Honor policy. This is a beta-level feature default enabled by the NodeInclusionPolicyInPodTopologySpread feature flag.


Possible enum values:



- `"Honor"` means use this scheduling directive when calculating pod topology spread skew.

- `"Ignore"` means ignore this scheduling directive when calculating pod topology spread skew. |
| `nodeTaintsPolicy` | `string` | NodeTaintsPolicy indicates how we will treat node taints when calculating pod topology spread skew. Options are: - Honor: nodes without taints, along with tainted nodes for which the incoming pod has a toleration, are included. - Ignore: node taints are ignored. All nodes are included.


If this value is nil, the behavior is equivalent to the Ignore policy. This is a beta-level feature default enabled by the NodeInclusionPolicyInPodTopologySpread feature flag.


Possible enum values:



- `"Honor"` means use this scheduling directive when calculating pod topology spread skew.

- `"Ignore"` means ignore this scheduling directive when calculating pod topology spread skew. |
| `topologyKey` | `string` | TopologyKey is the key of node labels. Nodes that have a label with this key and identical values are considered to be in the same topology. We consider each <key, value> as a "bucket", and try to put balanced number of pods into each bucket. We define a domain as a particular instance of a topology. Also, we define an eligible domain as a domain whose nodes meet the requirements of nodeAffinityPolicy and nodeTaintsPolicy. e.g. If TopologyKey is "kubernetes.io/hostname", each Node is a domain of that topology. And, if TopologyKey is "topology.kubernetes.io/zone", each zone is a domain of that topology. It's a required field. |
| `whenUnsatisfiable` | `string` | WhenUnsatisfiable indicates how to deal with a pod if it doesn't satisfy the spread constraint. - DoNotSchedule (default) tells the scheduler not to schedule it. - ScheduleAnyway tells the scheduler to schedule the pod in any location,
but giving higher precedence to topologies that would help reduce the
skew.
A constraint is considered "Unsatisfiable" for an incoming pod if and only if every possible node assignment for that pod would violate "MaxSkew" on some topology. For example, in a 3-zone cluster, MaxSkew is set to 1, and pods with the same labelSelector spread as 3/1/1: | zone1 | zone2 | zone3 | | P P P |   P   |   P   | If WhenUnsatisfiable is set to DoNotSchedule, incoming pod can only be scheduled to zone2(zone3) to become 3/2/1(3/1/2) as ActualSkew(2-1) on zone2(zone3) satisfies MaxSkew(1). In other words, the cluster can still be imbalanced, but scheduler won't make it *more* imbalanced. It's a required field.


Possible enum values:



- `"DoNotSchedule"` instructs the scheduler not to schedule the pod when constraints are not satisfied.

- `"ScheduleAnyway"` instructs the scheduler to schedule the pod even if constraints are not satisfied. |

### [#](#spectemplatespectopologyspreadconstraintslabelselector).spec.template.spec.topologySpreadConstraints[].labelSelector

描述A label selector is a label query over a set of resources. The result of matchLabels and matchExpressions are ANDed. An empty label selector matches all objects. A null label selector matches no objects.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `matchExpressions` | `array` | matchExpressions is a list of label selector requirements. The requirements are ANDed. |
| `matchLabels` | `object` | matchLabels is a map of {key,value} pairs. A single {key,value} in the matchLabels map is equivalent to an element of matchExpressions, whose key field is "key", the operator is "In", and the values array contains only "value". The requirements are ANDed. |

### [#](#spectemplatespectopologyspreadconstraintslabelselectormatchexpressions).spec.template.spec.topologySpreadConstraints[].labelSelector.matchExpressions

描述matchExpressions is a list of label selector requirements. The requirements are ANDed.类型`array`### [#](#spectemplatespectopologyspreadconstraintslabelselectormatchexpressions-1).spec.template.spec.topologySpreadConstraints[].labelSelector.matchExpressions[]

描述A label selector requirement is a selector that contains values, a key, and an operator that relates the key and values.类型`object`必填`key``operator`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `key` | `string` | key is the label key that the selector applies to. |
| `operator` | `string` | operator represents a key's relationship to a set of values. Valid operators are In, NotIn, Exists and DoesNotExist. |
| `values` | `array` | values is an array of string values. If the operator is In or NotIn, the values array must be non-empty. If the operator is Exists or DoesNotExist, the values array must be empty. This array is replaced during a strategic merge patch. |

### [#](#spectemplatespectopologyspreadconstraintslabelselectormatchexpressionsvalues).spec.template.spec.topologySpreadConstraints[].labelSelector.matchExpressions[].values

描述values is an array of string values. If the operator is In or NotIn, the values array must be non-empty. If the operator is Exists or DoesNotExist, the values array must be empty. This array is replaced during a strategic merge patch.类型`array`### [#](#spectemplatespectopologyspreadconstraintslabelselectormatchexpressionsvalues-1).spec.template.spec.topologySpreadConstraints[].labelSelector.matchExpressions[].values[]

类型`string`### [#](#spectemplatespectopologyspreadconstraintslabelselectormatchlabels).spec.template.spec.topologySpreadConstraints[].labelSelector.matchLabels

描述matchLabels is a map of {key,value} pairs. A single {key,value} in the matchLabels map is equivalent to an element of matchExpressions, whose key field is "key", the operator is "In", and the values array contains only "value". The requirements are ANDed.类型`object`### [#](#spectemplatespectopologyspreadconstraintsmatchlabelkeys).spec.template.spec.topologySpreadConstraints[].matchLabelKeys

描述MatchLabelKeys is a set of pod label keys to select the pods over which spreading will be calculated. The keys are used to lookup values from the incoming pod labels, those key-value labels are ANDed with labelSelector to select the group of existing pods over which spreading will be calculated for the incoming pod. The same key is forbidden to exist in both MatchLabelKeys and LabelSelector. MatchLabelKeys cannot be set when LabelSelector isn't set. Keys that don't exist in the incoming pod labels will be ignored. A null or empty list means only match against labelSelector.

This is a beta field and requires the MatchLabelKeysInPodTopologySpread feature gate to be enabled (enabled by default).类型`array`### [#](#spectemplatespectopologyspreadconstraintsmatchlabelkeys-1).spec.template.spec.topologySpreadConstraints[].matchLabelKeys[]

类型`string`### [#](#spectemplatespecvolumes).spec.template.spec.volumes

描述List of volumes that can be mounted by containers belonging to the pod. More info: https://kubernetes.io/docs/concepts/storage/volumes类型`array`### [#](#spectemplatespecvolumes-1).spec.template.spec.volumes[]

描述Volume represents a named volume in a pod that may be accessed by any container in the pod.类型`object`必填`name`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `awsElasticBlockStore` | `object` | Represents a Persistent Disk resource in AWS.


An AWS EBS disk must exist before mounting to a container. The disk must also be in the same AWS zone as the kubelet. An AWS EBS disk can only be mounted as read/write once. AWS EBS volumes support ownership management and SELinux relabeling. |
| `azureDisk` | `object` | AzureDisk represents an Azure Data Disk mount on the host and bind mount to the pod. |
| `azureFile` | `object` | AzureFile represents an Azure File Service mount on the host and bind mount to the pod. |
| `cephfs` | `object` | Represents a Ceph Filesystem mount that lasts the lifetime of a pod Cephfs volumes do not support ownership management or SELinux relabeling. |
| `cinder` | `object` | Represents a cinder volume resource in Openstack. A Cinder volume must exist before mounting to a container. The volume must also be in the same region as the kubelet. Cinder volumes support ownership management and SELinux relabeling. |
| `configMap` | `object` | Adapts a ConfigMap into a volume.


The contents of the target ConfigMap's Data field will be presented in a volume as files using the keys in the Data field as the file names, unless the items element is populated with specific mappings of keys to paths. ConfigMap volumes support ownership management and SELinux relabeling. |
| `csi` | `object` | Represents a source location of a volume to mount, managed by an external CSI driver |
| `downwardAPI` | `object` | DownwardAPIVolumeSource represents a volume containing downward API info. Downward API volumes support ownership management and SELinux relabeling. |
| `emptyDir` | `object` | Represents an empty directory for a pod. Empty directory volumes support ownership management and SELinux relabeling. |
| `ephemeral` | `object` | Represents an ephemeral volume that is handled by a normal storage driver. |
| `fc` | `object` | Represents a Fibre Channel volume. Fibre Channel volumes can only be mounted as read/write once. Fibre Channel volumes support ownership management and SELinux relabeling. |
| `flexVolume` | `object` | FlexVolume represents a generic volume resource that is provisioned/attached using an exec based plugin. |
| `flocker` | `object` | Represents a Flocker volume mounted by the Flocker agent. One and only one of datasetName and datasetUUID should be set. Flocker volumes do not support ownership management or SELinux relabeling. |
| `gcePersistentDisk` | `object` | Represents a Persistent Disk resource in Google Compute Engine.


A GCE PD must exist before mounting to a container. The disk must also be in the same GCE project and zone as the kubelet. A GCE PD can only be mounted as read/write once or read-only many times. GCE PDs support ownership management and SELinux relabeling. |
| `gitRepo` | `object` | Represents a volume that is populated with the contents of a git repository. Git repo volumes do not support ownership management. Git repo volumes support SELinux relabeling.


DEPRECATED: GitRepo is deprecated. To provision a container with a git repo, mount an EmptyDir into an InitContainer that clones the repo using git, then mount the EmptyDir into the Pod's container. |
| `glusterfs` | `object` | Represents a Glusterfs mount that lasts the lifetime of a pod. Glusterfs volumes do not support ownership management or SELinux relabeling. |
| `hostPath` | `object` | Represents a host path mapped into a pod. Host path volumes do not support ownership management or SELinux relabeling. |
| `image` | `object` | ImageVolumeSource represents a image volume resource. |
| `iscsi` | `object` | Represents an ISCSI disk. ISCSI volumes can only be mounted as read/write once. ISCSI volumes support ownership management and SELinux relabeling. |
| `name` | `string` | name of the volume. Must be a DNS_LABEL and unique within the pod. More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names) |
| `nfs` | `object` | Represents an NFS mount that lasts the lifetime of a pod. NFS volumes do not support ownership management or SELinux relabeling. |
| `persistentVolumeClaim` | `object` | PersistentVolumeClaimVolumeSource references the user's PVC in the same namespace. This volume finds the bound PV and mounts that volume for the pod. A PersistentVolumeClaimVolumeSource is, essentially, a wrapper around another type of volume that is owned by someone else (the system). |
| `photonPersistentDisk` | `object` | Represents a Photon Controller persistent disk resource. |
| `portworxVolume` | `object` | PortworxVolumeSource represents a Portworx volume resource. |
| `projected` | `object` | Represents a projected volume source |
| `quobyte` | `object` | Represents a Quobyte mount that lasts the lifetime of a pod. Quobyte volumes do not support ownership management or SELinux relabeling. |
| `rbd` | `object` | Represents a Rados Block Device mount that lasts the lifetime of a pod. RBD volumes support ownership management and SELinux relabeling. |
| `scaleIO` | `object` | ScaleIOVolumeSource represents a persistent ScaleIO volume |
| `secret` | `object` | Adapts a Secret into a volume.


The contents of the target Secret's Data field will be presented in a volume as files using the keys in the Data field as the file names. Secret volumes support ownership management and SELinux relabeling. |
| `storageos` | `object` | Represents a StorageOS persistent volume resource. |
| `vsphereVolume` | `object` | Represents a vSphere volume resource. |

### [#](#spectemplatespecvolumesawselasticblockstore).spec.template.spec.volumes[].awsElasticBlockStore

描述Represents a Persistent Disk resource in AWS.

An AWS EBS disk must exist before mounting to a container. The disk must also be in the same AWS zone as the kubelet. An AWS EBS disk can only be mounted as read/write once. AWS EBS volumes support ownership management and SELinux relabeling.类型`object`必填`volumeID`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `fsType` | `string` | fsType is the filesystem type of the volume that you want to mount. Tip: Ensure that the filesystem type is supported by the host operating system. Examples: "ext4", "xfs", "ntfs". Implicitly inferred to be "ext4" if unspecified. More info: [https://kubernetes.io/docs/concepts/storage/volumes#awselasticblockstore](https://kubernetes.io/docs/concepts/storage/volumes#awselasticblockstore) |
| `partition` | `integer` | partition is the partition in the volume that you want to mount. If omitted, the default is to mount by volume name. Examples: For volume /dev/sda1, you specify the partition as "1". Similarly, the volume partition for /dev/sda is "0" (or you can leave the property empty). |
| `readOnly` | `boolean` | readOnly value true will force the readOnly setting in VolumeMounts. More info: [https://kubernetes.io/docs/concepts/storage/volumes#awselasticblockstore](https://kubernetes.io/docs/concepts/storage/volumes#awselasticblockstore) |
| `volumeID` | `string` | volumeID is unique ID of the persistent disk resource in AWS (Amazon EBS volume). More info: [https://kubernetes.io/docs/concepts/storage/volumes#awselasticblockstore](https://kubernetes.io/docs/concepts/storage/volumes#awselasticblockstore) |

### [#](#spectemplatespecvolumesazuredisk).spec.template.spec.volumes[].azureDisk

描述AzureDisk represents an Azure Data Disk mount on the host and bind mount to the pod.类型`object`必填`diskName``diskURI`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `cachingMode` | `string` | cachingMode is the Host Caching mode: None, Read Only, Read Write.


Possible enum values:



- `"None"`

- `"ReadOnly"`

- `"ReadWrite"` |
| `diskName` | `string` | diskName is the Name of the data disk in the blob storage |
| `diskURI` | `string` | diskURI is the URI of data disk in the blob storage |
| `fsType` | `string` | fsType is Filesystem type to mount. Must be a filesystem type supported by the host operating system. Ex. "ext4", "xfs", "ntfs". Implicitly inferred to be "ext4" if unspecified. |
| `kind` | `string` | kind expected values are Shared: multiple blob disks per storage account  Dedicated: single blob disk per storage account  Managed: azure managed data disk (only in managed availability set). defaults to shared


Possible enum values:



- `"Dedicated"`

- `"Managed"`

- `"Shared"` |
| `readOnly` | `boolean` | readOnly Defaults to false (read/write). ReadOnly here will force the ReadOnly setting in VolumeMounts. |

### [#](#spectemplatespecvolumesazurefile).spec.template.spec.volumes[].azureFile

描述AzureFile represents an Azure File Service mount on the host and bind mount to the pod.类型`object`必填`secretName``shareName`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `readOnly` | `boolean` | readOnly defaults to false (read/write). ReadOnly here will force the ReadOnly setting in VolumeMounts. |
| `secretName` | `string` | secretName is the  name of secret that contains Azure Storage Account Name and Key |
| `shareName` | `string` | shareName is the azure share Name |

### [#](#spectemplatespecvolumescephfs).spec.template.spec.volumes[].cephfs

描述Represents a Ceph Filesystem mount that lasts the lifetime of a pod Cephfs volumes do not support ownership management or SELinux relabeling.类型`object`必填`monitors`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `monitors` | `array` | monitors is Required: Monitors is a collection of Ceph monitors More info: [https://examples.k8s.io/volumes/cephfs/README.md#how-to-use-it](https://examples.k8s.io/volumes/cephfs/README.md#how-to-use-it) |
| `path` | `string` | path is Optional: Used as the mounted root, rather than the full Ceph tree, default is / |
| `readOnly` | `boolean` | readOnly is Optional: Defaults to false (read/write). ReadOnly here will force the ReadOnly setting in VolumeMounts. More info: [https://examples.k8s.io/volumes/cephfs/README.md#how-to-use-it](https://examples.k8s.io/volumes/cephfs/README.md#how-to-use-it) |
| `secretFile` | `string` | secretFile is Optional: SecretFile is the path to key ring for User, default is /etc/ceph/user.secret More info: [https://examples.k8s.io/volumes/cephfs/README.md#how-to-use-it](https://examples.k8s.io/volumes/cephfs/README.md#how-to-use-it) |
| `secretRef` | `object` | LocalObjectReference contains enough information to let you locate the referenced object inside the same namespace. |
| `user` | `string` | user is optional: User is the rados user name, default is admin More info: [https://examples.k8s.io/volumes/cephfs/README.md#how-to-use-it](https://examples.k8s.io/volumes/cephfs/README.md#how-to-use-it) |

### [#](#spectemplatespecvolumescephfsmonitors).spec.template.spec.volumes[].cephfs.monitors

描述monitors is Required: Monitors is a collection of Ceph monitors More info: https://examples.k8s.io/volumes/cephfs/README.md#how-to-use-it类型`array`### [#](#spectemplatespecvolumescephfsmonitors-1).spec.template.spec.volumes[].cephfs.monitors[]

类型`string`### [#](#spectemplatespecvolumescephfssecretref).spec.template.spec.volumes[].cephfs.secretRef

描述LocalObjectReference contains enough information to let you locate the referenced object inside the same namespace.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `name` | `string` | Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names) |

### [#](#spectemplatespecvolumescinder).spec.template.spec.volumes[].cinder

描述Represents a cinder volume resource in Openstack. A Cinder volume must exist before mounting to a container. The volume must also be in the same region as the kubelet. Cinder volumes support ownership management and SELinux relabeling.类型`object`必填`volumeID`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `fsType` | `string` | fsType is the filesystem type to mount. Must be a filesystem type supported by the host operating system. Examples: "ext4", "xfs", "ntfs". Implicitly inferred to be "ext4" if unspecified. More info: [https://examples.k8s.io/mysql-cinder-pd/README.md](https://examples.k8s.io/mysql-cinder-pd/README.md) |
| `readOnly` | `boolean` | readOnly defaults to false (read/write). ReadOnly here will force the ReadOnly setting in VolumeMounts. More info: [https://examples.k8s.io/mysql-cinder-pd/README.md](https://examples.k8s.io/mysql-cinder-pd/README.md) |
| `secretRef` | `object` | LocalObjectReference contains enough information to let you locate the referenced object inside the same namespace. |
| `volumeID` | `string` | volumeID used to identify the volume in cinder. More info: [https://examples.k8s.io/mysql-cinder-pd/README.md](https://examples.k8s.io/mysql-cinder-pd/README.md) |

### [#](#spectemplatespecvolumescindersecretref).spec.template.spec.volumes[].cinder.secretRef

描述LocalObjectReference contains enough information to let you locate the referenced object inside the same namespace.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `name` | `string` | Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names) |

### [#](#spectemplatespecvolumesconfigmap).spec.template.spec.volumes[].configMap

描述Adapts a ConfigMap into a volume.

The contents of the target ConfigMap's Data field will be presented in a volume as files using the keys in the Data field as the file names, unless the items element is populated with specific mappings of keys to paths. ConfigMap volumes support ownership management and SELinux relabeling.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `defaultMode` | `integer` | defaultMode is optional: mode bits used to set permissions on created files by default. Must be an octal value between 0000 and 0777 or a decimal value between 0 and 511. YAML accepts both octal and decimal values, JSON requires decimal values for mode bits. Defaults to 0644. Directories within the path are not affected by this setting. This might be in conflict with other options that affect the file mode, like fsGroup, and the result can be other mode bits set. |
| `items` | `array` | items if unspecified, each key-value pair in the Data field of the referenced ConfigMap will be projected into the volume as a file whose name is the key and content is the value. If specified, the listed keys will be projected into the specified paths, and unlisted keys will not be present. If a key is specified which is not present in the ConfigMap, the volume setup will error unless it is marked optional. Paths must be relative and may not contain the '..' path or start with '..'. |
| `name` | `string` | Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names) |
| `optional` | `boolean` | optional specify whether the ConfigMap or its keys must be defined |

### [#](#spectemplatespecvolumesconfigmapitems).spec.template.spec.volumes[].configMap.items

描述items if unspecified, each key-value pair in the Data field of the referenced ConfigMap will be projected into the volume as a file whose name is the key and content is the value. If specified, the listed keys will be projected into the specified paths, and unlisted keys will not be present. If a key is specified which is not present in the ConfigMap, the volume setup will error unless it is marked optional. Paths must be relative and may not contain the '..' path or start with '..'.类型`array`### [#](#spectemplatespecvolumesconfigmapitems-1).spec.template.spec.volumes[].configMap.items[]

描述Maps a string key to a path within a volume.类型`object`必填`key``path`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `key` | `string` | key is the key to project. |
| `mode` | `integer` | mode is Optional: mode bits used to set permissions on this file. Must be an octal value between 0000 and 0777 or a decimal value between 0 and 511. YAML accepts both octal and decimal values, JSON requires decimal values for mode bits. If not specified, the volume defaultMode will be used. This might be in conflict with other options that affect the file mode, like fsGroup, and the result can be other mode bits set. |
| `path` | `string` | path is the relative path of the file to map the key to. May not be an absolute path. May not contain the path element '..'. May not start with the string '..'. |

### [#](#spectemplatespecvolumescsi).spec.template.spec.volumes[].csi

描述Represents a source location of a volume to mount, managed by an external CSI driver类型`object`必填`driver`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `driver` | `string` | driver is the name of the CSI driver that handles this volume. Consult with your admin for the correct name as registered in the cluster. |
| `fsType` | `string` | fsType to mount. Ex. "ext4", "xfs", "ntfs". If not provided, the empty value is passed to the associated CSI driver which will determine the default filesystem to apply. |
| `nodePublishSecretRef` | `object` | LocalObjectReference contains enough information to let you locate the referenced object inside the same namespace. |
| `readOnly` | `boolean` | readOnly specifies a read-only configuration for the volume. Defaults to false (read/write). |
| `volumeAttributes` | `object` | volumeAttributes stores driver-specific properties that are passed to the CSI driver. Consult your driver's documentation for supported values. |

### [#](#spectemplatespecvolumescsinodepublishsecretref).spec.template.spec.volumes[].csi.nodePublishSecretRef

描述LocalObjectReference contains enough information to let you locate the referenced object inside the same namespace.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `name` | `string` | Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names) |

### [#](#spectemplatespecvolumescsivolumeattributes).spec.template.spec.volumes[].csi.volumeAttributes

描述volumeAttributes stores driver-specific properties that are passed to the CSI driver. Consult your driver's documentation for supported values.类型`object`### [#](#spectemplatespecvolumesdownwardapi).spec.template.spec.volumes[].downwardAPI

描述DownwardAPIVolumeSource represents a volume containing downward API info. Downward API volumes support ownership management and SELinux relabeling.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `defaultMode` | `integer` | Optional: mode bits to use on created files by default. Must be a Optional: mode bits used to set permissions on created files by default. Must be an octal value between 0000 and 0777 or a decimal value between 0 and 511. YAML accepts both octal and decimal values, JSON requires decimal values for mode bits. Defaults to 0644. Directories within the path are not affected by this setting. This might be in conflict with other options that affect the file mode, like fsGroup, and the result can be other mode bits set. |
| `items` | `array` | Items is a list of downward API volume file |

### [#](#spectemplatespecvolumesdownwardapiitems).spec.template.spec.volumes[].downwardAPI.items

描述Items is a list of downward API volume file类型`array`### [#](#spectemplatespecvolumesdownwardapiitems-1).spec.template.spec.volumes[].downwardAPI.items[]

描述DownwardAPIVolumeFile represents information to create the file containing the pod field类型`object`必填`path`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `fieldRef` | `object` | ObjectFieldSelector selects an APIVersioned field of an object. |
| `mode` | `integer` | Optional: mode bits used to set permissions on this file, must be an octal value between 0000 and 0777 or a decimal value between 0 and 511. YAML accepts both octal and decimal values, JSON requires decimal values for mode bits. If not specified, the volume defaultMode will be used. This might be in conflict with other options that affect the file mode, like fsGroup, and the result can be other mode bits set. |
| `path` | `string` | Required: Path is  the relative path name of the file to be created. Must not be absolute or contain the '..' path. Must be utf-8 encoded. The first item of the relative path must not start with '..' |
| `resourceFieldRef` | `object` | ResourceFieldSelector represents container resources (cpu, memory) and their output format |

### [#](#spectemplatespecvolumesdownwardapiitemsfieldref).spec.template.spec.volumes[].downwardAPI.items[].fieldRef

描述ObjectFieldSelector selects an APIVersioned field of an object.类型`object`必填`fieldPath`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `apiVersion` | `string` | Version of the schema the FieldPath is written in terms of, defaults to "v1". |
| `fieldPath` | `string` | Path of the field to select in the specified API version. |

### [#](#spectemplatespecvolumesdownwardapiitemsresourcefieldref).spec.template.spec.volumes[].downwardAPI.items[].resourceFieldRef

描述ResourceFieldSelector represents container resources (cpu, memory) and their output format类型`object`必填`resource`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `containerName` | `string` | Container name: required for volumes, optional for env vars |
| `divisor` | `string|number` | Quantity is a fixed-point representation of a number. It provides convenient marshaling/unmarshaling in JSON and YAML, in addition to String() and AsInt64() accessors.


The serialization format is:



````

	(Note that <suffix> may be empty, from the "" case in <decimalSI>.)

<digit>           ::= 0 | 1 | ... | 9 <digits>          ::= <digit> | <digit><digits> <number>          ::= <digits> | <digits>.<digits> | <digits>. | .<digits> <sign>            ::= "+" | "-" <signedNumber>    ::= <number> | <sign><number> <suffix>          ::= <binarySI> | <decimalExponent> | <decimalSI> <binarySI>        ::= Ki | Mi | Gi | Ti | Pi | Ei

	(International System of units; See: http://physics.nist.gov/cuu/Units/binary.html)

<decimalSI>       ::= m | "" | k | M | G | T | P | E

	(Note that 1024 = 1Ki but 1000 = 1k; I didn't choose the capitalization.)

<decimalExponent> ::= "e" <signedNumber> | "E" <signedNumber> ```

No matter which of the three exponent forms is used, no quantity may represent a number greater than 2^63-1 in magnitude, nor may it have more than 3 decimal places. Numbers larger or more precise will be capped or rounded up. (E.g.: 0.1m will rounded up to 1m.) This may be extended in the future if we require larger or smaller quantities.

When a Quantity is parsed from a string, it will remember the type of suffix it had, and will use the same type again when it is serialized.

Before serializing, Quantity will be put in "canonical form". This means that Exponent/suffix will be adjusted up or down (with a corresponding increase or decrease in Mantissa) such that:

- No precision is lost - No fractional digits will be emitted - The exponent (or suffix) is as large as possible.

The sign will be omitted unless the number is negative.

Examples:

- 1.5 will be serialized as "1500m" - 1.5Gi will be serialized as "1536Mi"

Note that the quantity will NEVER be internally represented by a floating point number. That is the whole point of this exercise.

Non-canonical values will still parse as long as they are well formed, but will be re-emitted in their canonical form. (So always use canonical form, or don't diff.)

This format is intended to make it difficult to use these numbers without writing some sort of special handling code in the hopes that that will cause implementors to also use a fixed point implementation.

```` |
| `resource` | `string` | Required: resource to select |

### [#](#spectemplatespecvolumesemptydir).spec.template.spec.volumes[].emptyDir

描述Represents an empty directory for a pod. Empty directory volumes support ownership management and SELinux relabeling.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `medium` | `string` | medium represents what type of storage medium should back this directory. The default is "" which means to use the node's default medium. Must be an empty string (default) or Memory. More info: [https://kubernetes.io/docs/concepts/storage/volumes#emptydir](https://kubernetes.io/docs/concepts/storage/volumes#emptydir) |
| `sizeLimit` | `string|number` | Quantity is a fixed-point representation of a number. It provides convenient marshaling/unmarshaling in JSON and YAML, in addition to String() and AsInt64() accessors.


The serialization format is:



````

	(Note that <suffix> may be empty, from the "" case in <decimalSI>.)

<digit>           ::= 0 | 1 | ... | 9 <digits>          ::= <digit> | <digit><digits> <number>          ::= <digits> | <digits>.<digits> | <digits>. | .<digits> <sign>            ::= "+" | "-" <signedNumber>    ::= <number> | <sign><number> <suffix>          ::= <binarySI> | <decimalExponent> | <decimalSI> <binarySI>        ::= Ki | Mi | Gi | Ti | Pi | Ei

	(International System of units; See: http://physics.nist.gov/cuu/Units/binary.html)

<decimalSI>       ::= m | "" | k | M | G | T | P | E

	(Note that 1024 = 1Ki but 1000 = 1k; I didn't choose the capitalization.)

<decimalExponent> ::= "e" <signedNumber> | "E" <signedNumber> ```

No matter which of the three exponent forms is used, no quantity may represent a number greater than 2^63-1 in magnitude, nor may it have more than 3 decimal places. Numbers larger or more precise will be capped or rounded up. (E.g.: 0.1m will rounded up to 1m.) This may be extended in the future if we require larger or smaller quantities.

When a Quantity is parsed from a string, it will remember the type of suffix it had, and will use the same type again when it is serialized.

Before serializing, Quantity will be put in "canonical form". This means that Exponent/suffix will be adjusted up or down (with a corresponding increase or decrease in Mantissa) such that:

- No precision is lost - No fractional digits will be emitted - The exponent (or suffix) is as large as possible.

The sign will be omitted unless the number is negative.

Examples:

- 1.5 will be serialized as "1500m" - 1.5Gi will be serialized as "1536Mi"

Note that the quantity will NEVER be internally represented by a floating point number. That is the whole point of this exercise.

Non-canonical values will still parse as long as they are well formed, but will be re-emitted in their canonical form. (So always use canonical form, or don't diff.)

This format is intended to make it difficult to use these numbers without writing some sort of special handling code in the hopes that that will cause implementors to also use a fixed point implementation.

```` |

### [#](#spectemplatespecvolumesephemeral).spec.template.spec.volumes[].ephemeral

描述Represents an ephemeral volume that is handled by a normal storage driver.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `volumeClaimTemplate` | `object` | PersistentVolumeClaimTemplate is used to produce PersistentVolumeClaim objects as part of an EphemeralVolumeSource. |

### [#](#spectemplatespecvolumesephemeralvolumeclaimtemplate).spec.template.spec.volumes[].ephemeral.volumeClaimTemplate

描述PersistentVolumeClaimTemplate is used to produce PersistentVolumeClaim objects as part of an EphemeralVolumeSource.类型`object`必填`spec`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `metadata` | `[ObjectMeta](/apis/references/ObjectMeta.html)` | ObjectMeta is metadata that all persisted resources must have, which includes all objects users must create. |
| `spec` | `object` | PersistentVolumeClaimSpec describes the common attributes of storage devices and allows a Source for provider-specific attributes |

### [#](#spectemplatespecvolumesephemeralvolumeclaimtemplatespec).spec.template.spec.volumes[].ephemeral.volumeClaimTemplate.spec

描述PersistentVolumeClaimSpec describes the common attributes of storage devices and allows a Source for provider-specific attributes类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `accessModes` | `array` | accessModes contains the desired access modes the volume should have. More info: [https://kubernetes.io/docs/concepts/storage/persistent-volumes#access-modes-1](https://kubernetes.io/docs/concepts/storage/persistent-volumes#access-modes-1) |
| `dataSource` | `object` | TypedLocalObjectReference contains enough information to let you locate the typed referenced object inside the same namespace. |
| `dataSourceRef` | `object` | TypedObjectReference contains enough information to let you locate the typed referenced object |
| `resources` | `object` | VolumeResourceRequirements describes the storage resource requirements for a volume. |
| `selector` | `object` | A label selector is a label query over a set of resources. The result of matchLabels and matchExpressions are ANDed. An empty label selector matches all objects. A null label selector matches no objects. |
| `storageClassName` | `string` | storageClassName is the name of the StorageClass required by the claim. More info: [https://kubernetes.io/docs/concepts/storage/persistent-volumes#class-1](https://kubernetes.io/docs/concepts/storage/persistent-volumes#class-1) |
| `volumeAttributesClassName` | `string` | volumeAttributesClassName may be used to set the VolumeAttributesClass used by this claim. If specified, the CSI driver will create or update the volume with the attributes defined in the corresponding VolumeAttributesClass. This has a different purpose than storageClassName, it can be changed after the claim is created. An empty string value means that no VolumeAttributesClass will be applied to the claim but it's not allowed to reset this field to empty string once it is set. If unspecified and the PersistentVolumeClaim is unbound, the default VolumeAttributesClass will be set by the persistentvolume controller if it exists. If the resource referred to by volumeAttributesClass does not exist, this PersistentVolumeClaim will be set to a Pending state, as reflected by the modifyVolumeStatus field, until such as a resource exists. More info: [https://kubernetes.io/docs/concepts/storage/volume-attributes-classes/](https://kubernetes.io/docs/concepts/storage/volume-attributes-classes/) (Beta) Using this field requires the VolumeAttributesClass feature gate to be enabled (off by default). |
| `volumeMode` | `string` | volumeMode defines what type of volume is required by the claim. Value of Filesystem is implied when not included in claim spec.


Possible enum values:



- `"Block"` means the volume will not be formatted with a filesystem and will remain a raw block device.

- `"Filesystem"` means the volume will be or is formatted with a filesystem. |
| `volumeName` | `string` | volumeName is the binding reference to the PersistentVolume backing this claim. |

### [#](#spectemplatespecvolumesephemeralvolumeclaimtemplatespecaccessmodes).spec.template.spec.volumes[].ephemeral.volumeClaimTemplate.spec.accessModes

描述accessModes contains the desired access modes the volume should have. More info: https://kubernetes.io/docs/concepts/storage/persistent-volumes#access-modes-1类型`array`### [#](#spectemplatespecvolumesephemeralvolumeclaimtemplatespecaccessmodes-1).spec.template.spec.volumes[].ephemeral.volumeClaimTemplate.spec.accessModes[]

类型`string`### [#](#spectemplatespecvolumesephemeralvolumeclaimtemplatespecdatasource).spec.template.spec.volumes[].ephemeral.volumeClaimTemplate.spec.dataSource

描述TypedLocalObjectReference contains enough information to let you locate the typed referenced object inside the same namespace.类型`object`必填`kind``name`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `apiGroup` | `string` | APIGroup is the group for the resource being referenced. If APIGroup is not specified, the specified Kind must be in the core API group. For any other third-party types, APIGroup is required. |
| `kind` | `string` | Kind is the type of resource being referenced |
| `name` | `string` | Name is the name of resource being referenced |

### [#](#spectemplatespecvolumesephemeralvolumeclaimtemplatespecdatasourceref).spec.template.spec.volumes[].ephemeral.volumeClaimTemplate.spec.dataSourceRef

描述TypedObjectReference contains enough information to let you locate the typed referenced object类型`object`必填`kind``name`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `apiGroup` | `string` | APIGroup is the group for the resource being referenced. If APIGroup is not specified, the specified Kind must be in the core API group. For any other third-party types, APIGroup is required. |
| `kind` | `string` | Kind is the type of resource being referenced |
| `name` | `string` | Name is the name of resource being referenced |
| `namespace` | `string` | Namespace is the namespace of resource being referenced Note that when a namespace is specified, a gateway.networking.k8s.io/ReferenceGrant object is required in the referent namespace to allow that namespace's owner to accept the reference. See the ReferenceGrant documentation for details. (Alpha) This field requires the CrossNamespaceVolumeDataSource feature gate to be enabled. |

### [#](#spectemplatespecvolumesephemeralvolumeclaimtemplatespecresources).spec.template.spec.volumes[].ephemeral.volumeClaimTemplate.spec.resources

描述VolumeResourceRequirements describes the storage resource requirements for a volume.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `limits` | `object` | Limits describes the maximum amount of compute resources allowed. More info: [https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/) |
| `requests` | `object` | Requests describes the minimum amount of compute resources required. If Requests is omitted for a container, it defaults to Limits if that is explicitly specified, otherwise to an implementation-defined value. Requests cannot exceed Limits. More info: [https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/) |

### [#](#spectemplatespecvolumesephemeralvolumeclaimtemplatespecresourceslimits).spec.template.spec.volumes[].ephemeral.volumeClaimTemplate.spec.resources.limits

描述Limits describes the maximum amount of compute resources allowed. More info: https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/类型`object`### [#](#spectemplatespecvolumesephemeralvolumeclaimtemplatespecresourcesrequests).spec.template.spec.volumes[].ephemeral.volumeClaimTemplate.spec.resources.requests

描述Requests describes the minimum amount of compute resources required. If Requests is omitted for a container, it defaults to Limits if that is explicitly specified, otherwise to an implementation-defined value. Requests cannot exceed Limits. More info: https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/类型`object`### [#](#spectemplatespecvolumesephemeralvolumeclaimtemplatespecselector).spec.template.spec.volumes[].ephemeral.volumeClaimTemplate.spec.selector

描述A label selector is a label query over a set of resources. The result of matchLabels and matchExpressions are ANDed. An empty label selector matches all objects. A null label selector matches no objects.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `matchExpressions` | `array` | matchExpressions is a list of label selector requirements. The requirements are ANDed. |
| `matchLabels` | `object` | matchLabels is a map of {key,value} pairs. A single {key,value} in the matchLabels map is equivalent to an element of matchExpressions, whose key field is "key", the operator is "In", and the values array contains only "value". The requirements are ANDed. |

### [#](#spectemplatespecvolumesephemeralvolumeclaimtemplatespecselectormatchexpressions).spec.template.spec.volumes[].ephemeral.volumeClaimTemplate.spec.selector.matchExpressions

描述matchExpressions is a list of label selector requirements. The requirements are ANDed.类型`array`### [#](#spectemplatespecvolumesephemeralvolumeclaimtemplatespecselectormatchexpressions-1).spec.template.spec.volumes[].ephemeral.volumeClaimTemplate.spec.selector.matchExpressions[]

描述A label selector requirement is a selector that contains values, a key, and an operator that relates the key and values.类型`object`必填`key``operator`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `key` | `string` | key is the label key that the selector applies to. |
| `operator` | `string` | operator represents a key's relationship to a set of values. Valid operators are In, NotIn, Exists and DoesNotExist. |
| `values` | `array` | values is an array of string values. If the operator is In or NotIn, the values array must be non-empty. If the operator is Exists or DoesNotExist, the values array must be empty. This array is replaced during a strategic merge patch. |

### [#](#spectemplatespecvolumesephemeralvolumeclaimtemplatespecselectormatchexpressionsvalues).spec.template.spec.volumes[].ephemeral.volumeClaimTemplate.spec.selector.matchExpressions[].values

描述values is an array of string values. If the operator is In or NotIn, the values array must be non-empty. If the operator is Exists or DoesNotExist, the values array must be empty. This array is replaced during a strategic merge patch.类型`array`### [#](#spectemplatespecvolumesephemeralvolumeclaimtemplatespecselectormatchexpressionsvalues-1).spec.template.spec.volumes[].ephemeral.volumeClaimTemplate.spec.selector.matchExpressions[].values[]

类型`string`### [#](#spectemplatespecvolumesephemeralvolumeclaimtemplatespecselectormatchlabels).spec.template.spec.volumes[].ephemeral.volumeClaimTemplate.spec.selector.matchLabels

描述matchLabels is a map of {key,value} pairs. A single {key,value} in the matchLabels map is equivalent to an element of matchExpressions, whose key field is "key", the operator is "In", and the values array contains only "value". The requirements are ANDed.类型`object`### [#](#spectemplatespecvolumesfc).spec.template.spec.volumes[].fc

描述Represents a Fibre Channel volume. Fibre Channel volumes can only be mounted as read/write once. Fibre Channel volumes support ownership management and SELinux relabeling.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `fsType` | `string` | fsType is the filesystem type to mount. Must be a filesystem type supported by the host operating system. Ex. "ext4", "xfs", "ntfs". Implicitly inferred to be "ext4" if unspecified. |
| `lun` | `integer` | lun is Optional: FC target lun number |
| `readOnly` | `boolean` | readOnly is Optional: Defaults to false (read/write). ReadOnly here will force the ReadOnly setting in VolumeMounts. |
| `targetWWNs` | `array` | targetWWNs is Optional: FC target worldwide names (WWNs) |
| `wwids` | `array` | wwids Optional: FC volume world wide identifiers (wwids) Either wwids or combination of targetWWNs and lun must be set, but not both simultaneously. |

### [#](#spectemplatespecvolumesfctargetwwns).spec.template.spec.volumes[].fc.targetWWNs

描述targetWWNs is Optional: FC target worldwide names (WWNs)类型`array`### [#](#spectemplatespecvolumesfctargetwwns-1).spec.template.spec.volumes[].fc.targetWWNs[]

类型`string`### [#](#spectemplatespecvolumesfcwwids).spec.template.spec.volumes[].fc.wwids

描述wwids Optional: FC volume world wide identifiers (wwids) Either wwids or combination of targetWWNs and lun must be set, but not both simultaneously.类型`array`### [#](#spectemplatespecvolumesfcwwids-1).spec.template.spec.volumes[].fc.wwids[]

类型`string`### [#](#spectemplatespecvolumesflexvolume).spec.template.spec.volumes[].flexVolume

描述FlexVolume represents a generic volume resource that is provisioned/attached using an exec based plugin.类型`object`必填`driver`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `driver` | `string` | driver is the name of the driver to use for this volume. |
| `fsType` | `string` | fsType is the filesystem type to mount. Must be a filesystem type supported by the host operating system. Ex. "ext4", "xfs", "ntfs". The default filesystem depends on FlexVolume script. |
| `options` | `object` | options is Optional: this field holds extra command options if any. |
| `readOnly` | `boolean` | readOnly is Optional: defaults to false (read/write). ReadOnly here will force the ReadOnly setting in VolumeMounts. |
| `secretRef` | `object` | LocalObjectReference contains enough information to let you locate the referenced object inside the same namespace. |

### [#](#spectemplatespecvolumesflexvolumeoptions).spec.template.spec.volumes[].flexVolume.options

描述options is Optional: this field holds extra command options if any.类型`object`### [#](#spectemplatespecvolumesflexvolumesecretref).spec.template.spec.volumes[].flexVolume.secretRef

描述LocalObjectReference contains enough information to let you locate the referenced object inside the same namespace.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `name` | `string` | Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names) |

### [#](#spectemplatespecvolumesflocker).spec.template.spec.volumes[].flocker

描述Represents a Flocker volume mounted by the Flocker agent. One and only one of datasetName and datasetUUID should be set. Flocker volumes do not support ownership management or SELinux relabeling.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `datasetName` | `string` | datasetName is Name of the dataset stored as metadata -> name on the dataset for Flocker should be considered as deprecated |
| `datasetUUID` | `string` | datasetUUID is the UUID of the dataset. This is unique identifier of a Flocker dataset |

### [#](#spectemplatespecvolumesgcepersistentdisk).spec.template.spec.volumes[].gcePersistentDisk

描述Represents a Persistent Disk resource in Google Compute Engine.

A GCE PD must exist before mounting to a container. The disk must also be in the same GCE project and zone as the kubelet. A GCE PD can only be mounted as read/write once or read-only many times. GCE PDs support ownership management and SELinux relabeling.类型`object`必填`pdName`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `fsType` | `string` | fsType is filesystem type of the volume that you want to mount. Tip: Ensure that the filesystem type is supported by the host operating system. Examples: "ext4", "xfs", "ntfs". Implicitly inferred to be "ext4" if unspecified. More info: [https://kubernetes.io/docs/concepts/storage/volumes#gcepersistentdisk](https://kubernetes.io/docs/concepts/storage/volumes#gcepersistentdisk) |
| `partition` | `integer` | partition is the partition in the volume that you want to mount. If omitted, the default is to mount by volume name. Examples: For volume /dev/sda1, you specify the partition as "1". Similarly, the volume partition for /dev/sda is "0" (or you can leave the property empty). More info: [https://kubernetes.io/docs/concepts/storage/volumes#gcepersistentdisk](https://kubernetes.io/docs/concepts/storage/volumes#gcepersistentdisk) |
| `pdName` | `string` | pdName is unique name of the PD resource in GCE. Used to identify the disk in GCE. More info: [https://kubernetes.io/docs/concepts/storage/volumes#gcepersistentdisk](https://kubernetes.io/docs/concepts/storage/volumes#gcepersistentdisk) |
| `readOnly` | `boolean` | readOnly here will force the ReadOnly setting in VolumeMounts. Defaults to false. More info: [https://kubernetes.io/docs/concepts/storage/volumes#gcepersistentdisk](https://kubernetes.io/docs/concepts/storage/volumes#gcepersistentdisk) |

### [#](#spectemplatespecvolumesgitrepo).spec.template.spec.volumes[].gitRepo

描述Represents a volume that is populated with the contents of a git repository. Git repo volumes do not support ownership management. Git repo volumes support SELinux relabeling.

DEPRECATED: GitRepo is deprecated. To provision a container with a git repo, mount an EmptyDir into an InitContainer that clones the repo using git, then mount the EmptyDir into the Pod's container.类型`object`必填`repository`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `directory` | `string` | directory is the target directory name. Must not contain or start with '..'.  If '.' is supplied, the volume directory will be the git repository.  Otherwise, if specified, the volume will contain the git repository in the subdirectory with the given name. |
| `repository` | `string` | repository is the URL |
| `revision` | `string` | revision is the commit hash for the specified revision. |

### [#](#spectemplatespecvolumesglusterfs).spec.template.spec.volumes[].glusterfs

描述Represents a Glusterfs mount that lasts the lifetime of a pod. Glusterfs volumes do not support ownership management or SELinux relabeling.类型`object`必填`endpoints``path`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `endpoints` | `string` | endpoints is the endpoint name that details Glusterfs topology. More info: [https://examples.k8s.io/volumes/glusterfs/README.md#create-a-pod](https://examples.k8s.io/volumes/glusterfs/README.md#create-a-pod) |
| `path` | `string` | path is the Glusterfs volume path. More info: [https://examples.k8s.io/volumes/glusterfs/README.md#create-a-pod](https://examples.k8s.io/volumes/glusterfs/README.md#create-a-pod) |
| `readOnly` | `boolean` | readOnly here will force the Glusterfs volume to be mounted with read-only permissions. Defaults to false. More info: [https://examples.k8s.io/volumes/glusterfs/README.md#create-a-pod](https://examples.k8s.io/volumes/glusterfs/README.md#create-a-pod) |

### [#](#spectemplatespecvolumeshostpath).spec.template.spec.volumes[].hostPath

描述Represents a host path mapped into a pod. Host path volumes do not support ownership management or SELinux relabeling.类型`object`必填`path`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `path` | `string` | path of the directory on the host. If the path is a symlink, it will follow the link to the real path. More info: [https://kubernetes.io/docs/concepts/storage/volumes#hostpath](https://kubernetes.io/docs/concepts/storage/volumes#hostpath) |
| `type` | `string` | type for HostPath Volume Defaults to "" More info: [https://kubernetes.io/docs/concepts/storage/volumes#hostpath](https://kubernetes.io/docs/concepts/storage/volumes#hostpath)


Possible enum values:



- `""` For backwards compatible, leave it empty if unset

- `"BlockDevice"` A block device must exist at the given path

- `"CharDevice"` A character device must exist at the given path

- `"Directory"` A directory must exist at the given path

- `"DirectoryOrCreate"` If nothing exists at the given path, an empty directory will be created there as needed with file mode 0755, having the same group and ownership with Kubelet.

- `"File"` A file must exist at the given path

- `"FileOrCreate"` If nothing exists at the given path, an empty file will be created there as needed with file mode 0644, having the same group and ownership with Kubelet.

- `"Socket"` A UNIX socket must exist at the given path |

### [#](#spectemplatespecvolumesimage).spec.template.spec.volumes[].image

描述ImageVolumeSource represents a image volume resource.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `pullPolicy` | `string` | Policy for pulling OCI objects. Possible values are: Always: the kubelet always attempts to pull the reference. Container creation will fail If the pull fails. Never: the kubelet never pulls the reference and only uses a local image or artifact. Container creation will fail if the reference isn't present. IfNotPresent: the kubelet pulls if the reference isn't already present on disk. Container creation will fail if the reference isn't present and the pull fails. Defaults to Always if :latest tag is specified, or IfNotPresent otherwise.


Possible enum values:



- `"Always"` means that kubelet always attempts to pull the latest image. Container will fail If the pull fails.

- `"IfNotPresent"` means that kubelet pulls if the image isn't present on disk. Container will fail if the image isn't present and the pull fails.

- `"Never"` means that kubelet never pulls an image, but only uses a local image. Container will fail if the image isn't present |
| `reference` | `string` | Required: Image or artifact reference to be used. Behaves in the same way as pod.spec.containers[*].image. Pull secrets will be assembled in the same way as for the container image by looking up node credentials, SA image pull secrets, and pod spec image pull secrets. More info: [https://kubernetes.io/docs/concepts/containers/images](https://kubernetes.io/docs/concepts/containers/images) This field is optional to allow higher level config management to default or override container images in workload controllers like Deployments and StatefulSets. |

### [#](#spectemplatespecvolumesiscsi).spec.template.spec.volumes[].iscsi

描述Represents an ISCSI disk. ISCSI volumes can only be mounted as read/write once. ISCSI volumes support ownership management and SELinux relabeling.类型`object`必填`targetPortal``iqn``lun`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `chapAuthDiscovery` | `boolean` | chapAuthDiscovery defines whether support iSCSI Discovery CHAP authentication |
| `chapAuthSession` | `boolean` | chapAuthSession defines whether support iSCSI Session CHAP authentication |
| `fsType` | `string` | fsType is the filesystem type of the volume that you want to mount. Tip: Ensure that the filesystem type is supported by the host operating system. Examples: "ext4", "xfs", "ntfs". Implicitly inferred to be "ext4" if unspecified. More info: [https://kubernetes.io/docs/concepts/storage/volumes#iscsi](https://kubernetes.io/docs/concepts/storage/volumes#iscsi) |
| `initiatorName` | `string` | initiatorName is the custom iSCSI Initiator Name. If initiatorName is specified with iscsiInterface simultaneously, new iSCSI interface : will be created for the connection. |
| `iqn` | `string` | iqn is the target iSCSI Qualified Name. |
| `iscsiInterface` | `string` | iscsiInterface is the interface Name that uses an iSCSI transport. Defaults to 'default' (tcp). |
| `lun` | `integer` | lun represents iSCSI Target Lun number. |
| `portals` | `array` | portals is the iSCSI Target Portal List. The portal is either an IP or ip_addr:port if the port is other than default (typically TCP ports 860 and 3260). |
| `readOnly` | `boolean` | readOnly here will force the ReadOnly setting in VolumeMounts. Defaults to false. |
| `secretRef` | `object` | LocalObjectReference contains enough information to let you locate the referenced object inside the same namespace. |
| `targetPortal` | `string` | targetPortal is iSCSI Target Portal. The Portal is either an IP or ip_addr:port if the port is other than default (typically TCP ports 860 and 3260). |

### [#](#spectemplatespecvolumesiscsiportals).spec.template.spec.volumes[].iscsi.portals

描述portals is the iSCSI Target Portal List. The portal is either an IP or ip_addr:port if the port is other than default (typically TCP ports 860 and 3260).类型`array`### [#](#spectemplatespecvolumesiscsiportals-1).spec.template.spec.volumes[].iscsi.portals[]

类型`string`### [#](#spectemplatespecvolumesiscsisecretref).spec.template.spec.volumes[].iscsi.secretRef

描述LocalObjectReference contains enough information to let you locate the referenced object inside the same namespace.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `name` | `string` | Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names) |

### [#](#spectemplatespecvolumesnfs).spec.template.spec.volumes[].nfs

描述Represents an NFS mount that lasts the lifetime of a pod. NFS volumes do not support ownership management or SELinux relabeling.类型`object`必填`server``path`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `path` | `string` | path that is exported by the NFS server. More info: [https://kubernetes.io/docs/concepts/storage/volumes#nfs](https://kubernetes.io/docs/concepts/storage/volumes#nfs) |
| `readOnly` | `boolean` | readOnly here will force the NFS export to be mounted with read-only permissions. Defaults to false. More info: [https://kubernetes.io/docs/concepts/storage/volumes#nfs](https://kubernetes.io/docs/concepts/storage/volumes#nfs) |
| `server` | `string` | server is the hostname or IP address of the NFS server. More info: [https://kubernetes.io/docs/concepts/storage/volumes#nfs](https://kubernetes.io/docs/concepts/storage/volumes#nfs) |

### [#](#spectemplatespecvolumespersistentvolumeclaim).spec.template.spec.volumes[].persistentVolumeClaim

描述PersistentVolumeClaimVolumeSource references the user's PVC in the same namespace. This volume finds the bound PV and mounts that volume for the pod. A PersistentVolumeClaimVolumeSource is, essentially, a wrapper around another type of volume that is owned by someone else (the system).类型`object`必填`claimName`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `claimName` | `string` | claimName is the name of a PersistentVolumeClaim in the same namespace as the pod using this volume. More info: [https://kubernetes.io/docs/concepts/storage/persistent-volumes#persistentvolumeclaims](https://kubernetes.io/docs/concepts/storage/persistent-volumes#persistentvolumeclaims) |
| `readOnly` | `boolean` | readOnly Will force the ReadOnly setting in VolumeMounts. Default false. |

### [#](#spectemplatespecvolumesphotonpersistentdisk).spec.template.spec.volumes[].photonPersistentDisk

描述Represents a Photon Controller persistent disk resource.类型`object`必填`pdID`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `fsType` | `string` | fsType is the filesystem type to mount. Must be a filesystem type supported by the host operating system. Ex. "ext4", "xfs", "ntfs". Implicitly inferred to be "ext4" if unspecified. |
| `pdID` | `string` | pdID is the ID that identifies Photon Controller persistent disk |

### [#](#spectemplatespecvolumesportworxvolume).spec.template.spec.volumes[].portworxVolume

描述PortworxVolumeSource represents a Portworx volume resource.类型`object`必填`volumeID`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `fsType` | `string` | fSType represents the filesystem type to mount Must be a filesystem type supported by the host operating system. Ex. "ext4", "xfs". Implicitly inferred to be "ext4" if unspecified. |
| `readOnly` | `boolean` | readOnly defaults to false (read/write). ReadOnly here will force the ReadOnly setting in VolumeMounts. |
| `volumeID` | `string` | volumeID uniquely identifies a Portworx volume |

### [#](#spectemplatespecvolumesprojected).spec.template.spec.volumes[].projected

描述Represents a projected volume source类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `defaultMode` | `integer` | defaultMode are the mode bits used to set permissions on created files by default. Must be an octal value between 0000 and 0777 or a decimal value between 0 and 511. YAML accepts both octal and decimal values, JSON requires decimal values for mode bits. Directories within the path are not affected by this setting. This might be in conflict with other options that affect the file mode, like fsGroup, and the result can be other mode bits set. |
| `sources` | `array` | sources is the list of volume projections. Each entry in this list handles one source. |

### [#](#spectemplatespecvolumesprojectedsources).spec.template.spec.volumes[].projected.sources

描述sources is the list of volume projections. Each entry in this list handles one source.类型`array`### [#](#spectemplatespecvolumesprojectedsources-1).spec.template.spec.volumes[].projected.sources[]

描述Projection that may be projected along with other supported volume types. Exactly one of these fields must be set.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `clusterTrustBundle` | `object` | ClusterTrustBundleProjection describes how to select a set of ClusterTrustBundle objects and project their contents into the pod filesystem. |
| `configMap` | `object` | Adapts a ConfigMap into a projected volume.


The contents of the target ConfigMap's Data field will be presented in a projected volume as files using the keys in the Data field as the file names, unless the items element is populated with specific mappings of keys to paths. Note that this is identical to a configmap volume source without the default mode. |
| `downwardAPI` | `object` | Represents downward API info for projecting into a projected volume. Note that this is identical to a downwardAPI volume source without the default mode. |
| `secret` | `object` | Adapts a secret into a projected volume.


The contents of the target Secret's Data field will be presented in a projected volume as files using the keys in the Data field as the file names. Note that this is identical to a secret volume source without the default mode. |
| `serviceAccountToken` | `object` | ServiceAccountTokenProjection represents a projected service account token volume. This projection can be used to insert a service account token into the pods runtime filesystem for use against APIs (Kubernetes API Server or otherwise). |

### [#](#spectemplatespecvolumesprojectedsourcesclustertrustbundle).spec.template.spec.volumes[].projected.sources[].clusterTrustBundle

描述ClusterTrustBundleProjection describes how to select a set of ClusterTrustBundle objects and project their contents into the pod filesystem.类型`object`必填`path`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `labelSelector` | `object` | A label selector is a label query over a set of resources. The result of matchLabels and matchExpressions are ANDed. An empty label selector matches all objects. A null label selector matches no objects. |
| `name` | `string` | Select a single ClusterTrustBundle by object name.  Mutually-exclusive with signerName and labelSelector. |
| `optional` | `boolean` | If true, don't block pod startup if the referenced ClusterTrustBundle(s) aren't available.  If using name, then the named ClusterTrustBundle is allowed not to exist.  If using signerName, then the combination of signerName and labelSelector is allowed to match zero ClusterTrustBundles. |
| `path` | `string` | Relative path from the volume root to write the bundle. |
| `signerName` | `string` | Select all ClusterTrustBundles that match this signer name. Mutually-exclusive with name.  The contents of all selected ClusterTrustBundles will be unified and deduplicated. |

### [#](#spectemplatespecvolumesprojectedsourcesclustertrustbundlelabelselector).spec.template.spec.volumes[].projected.sources[].clusterTrustBundle.labelSelector

描述A label selector is a label query over a set of resources. The result of matchLabels and matchExpressions are ANDed. An empty label selector matches all objects. A null label selector matches no objects.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `matchExpressions` | `array` | matchExpressions is a list of label selector requirements. The requirements are ANDed. |
| `matchLabels` | `object` | matchLabels is a map of {key,value} pairs. A single {key,value} in the matchLabels map is equivalent to an element of matchExpressions, whose key field is "key", the operator is "In", and the values array contains only "value". The requirements are ANDed. |

### [#](#spectemplatespecvolumesprojectedsourcesclustertrustbundlelabelselectormatchexpressions).spec.template.spec.volumes[].projected.sources[].clusterTrustBundle.labelSelector.matchExpressions

描述matchExpressions is a list of label selector requirements. The requirements are ANDed.类型`array`### [#](#spectemplatespecvolumesprojectedsourcesclustertrustbundlelabelselectormatchexpressions-1).spec.template.spec.volumes[].projected.sources[].clusterTrustBundle.labelSelector.matchExpressions[]

描述A label selector requirement is a selector that contains values, a key, and an operator that relates the key and values.类型`object`必填`key``operator`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `key` | `string` | key is the label key that the selector applies to. |
| `operator` | `string` | operator represents a key's relationship to a set of values. Valid operators are In, NotIn, Exists and DoesNotExist. |
| `values` | `array` | values is an array of string values. If the operator is In or NotIn, the values array must be non-empty. If the operator is Exists or DoesNotExist, the values array must be empty. This array is replaced during a strategic merge patch. |

### [#](#spectemplatespecvolumesprojectedsourcesclustertrustbundlelabelselectormatchexpressionsvalues).spec.template.spec.volumes[].projected.sources[].clusterTrustBundle.labelSelector.matchExpressions[].values

描述values is an array of string values. If the operator is In or NotIn, the values array must be non-empty. If the operator is Exists or DoesNotExist, the values array must be empty. This array is replaced during a strategic merge patch.类型`array`### [#](#spectemplatespecvolumesprojectedsourcesclustertrustbundlelabelselectormatchexpressionsvalues-1).spec.template.spec.volumes[].projected.sources[].clusterTrustBundle.labelSelector.matchExpressions[].values[]

类型`string`### [#](#spectemplatespecvolumesprojectedsourcesclustertrustbundlelabelselectormatchlabels).spec.template.spec.volumes[].projected.sources[].clusterTrustBundle.labelSelector.matchLabels

描述matchLabels is a map of {key,value} pairs. A single {key,value} in the matchLabels map is equivalent to an element of matchExpressions, whose key field is "key", the operator is "In", and the values array contains only "value". The requirements are ANDed.类型`object`### [#](#spectemplatespecvolumesprojectedsourcesconfigmap).spec.template.spec.volumes[].projected.sources[].configMap

描述Adapts a ConfigMap into a projected volume.

The contents of the target ConfigMap's Data field will be presented in a projected volume as files using the keys in the Data field as the file names, unless the items element is populated with specific mappings of keys to paths. Note that this is identical to a configmap volume source without the default mode.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `items` | `array` | items if unspecified, each key-value pair in the Data field of the referenced ConfigMap will be projected into the volume as a file whose name is the key and content is the value. If specified, the listed keys will be projected into the specified paths, and unlisted keys will not be present. If a key is specified which is not present in the ConfigMap, the volume setup will error unless it is marked optional. Paths must be relative and may not contain the '..' path or start with '..'. |
| `name` | `string` | Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names) |
| `optional` | `boolean` | optional specify whether the ConfigMap or its keys must be defined |

### [#](#spectemplatespecvolumesprojectedsourcesconfigmapitems).spec.template.spec.volumes[].projected.sources[].configMap.items

描述items if unspecified, each key-value pair in the Data field of the referenced ConfigMap will be projected into the volume as a file whose name is the key and content is the value. If specified, the listed keys will be projected into the specified paths, and unlisted keys will not be present. If a key is specified which is not present in the ConfigMap, the volume setup will error unless it is marked optional. Paths must be relative and may not contain the '..' path or start with '..'.类型`array`### [#](#spectemplatespecvolumesprojectedsourcesconfigmapitems-1).spec.template.spec.volumes[].projected.sources[].configMap.items[]

描述Maps a string key to a path within a volume.类型`object`必填`key``path`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `key` | `string` | key is the key to project. |
| `mode` | `integer` | mode is Optional: mode bits used to set permissions on this file. Must be an octal value between 0000 and 0777 or a decimal value between 0 and 511. YAML accepts both octal and decimal values, JSON requires decimal values for mode bits. If not specified, the volume defaultMode will be used. This might be in conflict with other options that affect the file mode, like fsGroup, and the result can be other mode bits set. |
| `path` | `string` | path is the relative path of the file to map the key to. May not be an absolute path. May not contain the path element '..'. May not start with the string '..'. |

### [#](#spectemplatespecvolumesprojectedsourcesdownwardapi).spec.template.spec.volumes[].projected.sources[].downwardAPI

描述Represents downward API info for projecting into a projected volume. Note that this is identical to a downwardAPI volume source without the default mode.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `items` | `array` | Items is a list of DownwardAPIVolume file |

### [#](#spectemplatespecvolumesprojectedsourcesdownwardapiitems).spec.template.spec.volumes[].projected.sources[].downwardAPI.items

描述Items is a list of DownwardAPIVolume file类型`array`### [#](#spectemplatespecvolumesprojectedsourcesdownwardapiitems-1).spec.template.spec.volumes[].projected.sources[].downwardAPI.items[]

描述DownwardAPIVolumeFile represents information to create the file containing the pod field类型`object`必填`path`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `fieldRef` | `object` | ObjectFieldSelector selects an APIVersioned field of an object. |
| `mode` | `integer` | Optional: mode bits used to set permissions on this file, must be an octal value between 0000 and 0777 or a decimal value between 0 and 511. YAML accepts both octal and decimal values, JSON requires decimal values for mode bits. If not specified, the volume defaultMode will be used. This might be in conflict with other options that affect the file mode, like fsGroup, and the result can be other mode bits set. |
| `path` | `string` | Required: Path is  the relative path name of the file to be created. Must not be absolute or contain the '..' path. Must be utf-8 encoded. The first item of the relative path must not start with '..' |
| `resourceFieldRef` | `object` | ResourceFieldSelector represents container resources (cpu, memory) and their output format |

### [#](#spectemplatespecvolumesprojectedsourcesdownwardapiitemsfieldref).spec.template.spec.volumes[].projected.sources[].downwardAPI.items[].fieldRef

描述ObjectFieldSelector selects an APIVersioned field of an object.类型`object`必填`fieldPath`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `apiVersion` | `string` | Version of the schema the FieldPath is written in terms of, defaults to "v1". |
| `fieldPath` | `string` | Path of the field to select in the specified API version. |

### [#](#spectemplatespecvolumesprojectedsourcesdownwardapiitemsresourcefieldref).spec.template.spec.volumes[].projected.sources[].downwardAPI.items[].resourceFieldRef

描述ResourceFieldSelector represents container resources (cpu, memory) and their output format类型`object`必填`resource`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `containerName` | `string` | Container name: required for volumes, optional for env vars |
| `divisor` | `string|number` | Quantity is a fixed-point representation of a number. It provides convenient marshaling/unmarshaling in JSON and YAML, in addition to String() and AsInt64() accessors.


The serialization format is:



````

	(Note that <suffix> may be empty, from the "" case in <decimalSI>.)

<digit>           ::= 0 | 1 | ... | 9 <digits>          ::= <digit> | <digit><digits> <number>          ::= <digits> | <digits>.<digits> | <digits>. | .<digits> <sign>            ::= "+" | "-" <signedNumber>    ::= <number> | <sign><number> <suffix>          ::= <binarySI> | <decimalExponent> | <decimalSI> <binarySI>        ::= Ki | Mi | Gi | Ti | Pi | Ei

	(International System of units; See: http://physics.nist.gov/cuu/Units/binary.html)

<decimalSI>       ::= m | "" | k | M | G | T | P | E

	(Note that 1024 = 1Ki but 1000 = 1k; I didn't choose the capitalization.)

<decimalExponent> ::= "e" <signedNumber> | "E" <signedNumber> ```

No matter which of the three exponent forms is used, no quantity may represent a number greater than 2^63-1 in magnitude, nor may it have more than 3 decimal places. Numbers larger or more precise will be capped or rounded up. (E.g.: 0.1m will rounded up to 1m.) This may be extended in the future if we require larger or smaller quantities.

When a Quantity is parsed from a string, it will remember the type of suffix it had, and will use the same type again when it is serialized.

Before serializing, Quantity will be put in "canonical form". This means that Exponent/suffix will be adjusted up or down (with a corresponding increase or decrease in Mantissa) such that:

- No precision is lost - No fractional digits will be emitted - The exponent (or suffix) is as large as possible.

The sign will be omitted unless the number is negative.

Examples:

- 1.5 will be serialized as "1500m" - 1.5Gi will be serialized as "1536Mi"

Note that the quantity will NEVER be internally represented by a floating point number. That is the whole point of this exercise.

Non-canonical values will still parse as long as they are well formed, but will be re-emitted in their canonical form. (So always use canonical form, or don't diff.)

This format is intended to make it difficult to use these numbers without writing some sort of special handling code in the hopes that that will cause implementors to also use a fixed point implementation.

```` |
| `resource` | `string` | Required: resource to select |

### [#](#spectemplatespecvolumesprojectedsourcessecret).spec.template.spec.volumes[].projected.sources[].secret

描述Adapts a secret into a projected volume.

The contents of the target Secret's Data field will be presented in a projected volume as files using the keys in the Data field as the file names. Note that this is identical to a secret volume source without the default mode.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `items` | `array` | items if unspecified, each key-value pair in the Data field of the referenced Secret will be projected into the volume as a file whose name is the key and content is the value. If specified, the listed keys will be projected into the specified paths, and unlisted keys will not be present. If a key is specified which is not present in the Secret, the volume setup will error unless it is marked optional. Paths must be relative and may not contain the '..' path or start with '..'. |
| `name` | `string` | Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names) |
| `optional` | `boolean` | optional field specify whether the Secret or its key must be defined |

### [#](#spectemplatespecvolumesprojectedsourcessecretitems).spec.template.spec.volumes[].projected.sources[].secret.items

描述items if unspecified, each key-value pair in the Data field of the referenced Secret will be projected into the volume as a file whose name is the key and content is the value. If specified, the listed keys will be projected into the specified paths, and unlisted keys will not be present. If a key is specified which is not present in the Secret, the volume setup will error unless it is marked optional. Paths must be relative and may not contain the '..' path or start with '..'.类型`array`### [#](#spectemplatespecvolumesprojectedsourcessecretitems-1).spec.template.spec.volumes[].projected.sources[].secret.items[]

描述Maps a string key to a path within a volume.类型`object`必填`key``path`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `key` | `string` | key is the key to project. |
| `mode` | `integer` | mode is Optional: mode bits used to set permissions on this file. Must be an octal value between 0000 and 0777 or a decimal value between 0 and 511. YAML accepts both octal and decimal values, JSON requires decimal values for mode bits. If not specified, the volume defaultMode will be used. This might be in conflict with other options that affect the file mode, like fsGroup, and the result can be other mode bits set. |
| `path` | `string` | path is the relative path of the file to map the key to. May not be an absolute path. May not contain the path element '..'. May not start with the string '..'. |

### [#](#spectemplatespecvolumesprojectedsourcesserviceaccounttoken).spec.template.spec.volumes[].projected.sources[].serviceAccountToken

描述ServiceAccountTokenProjection represents a projected service account token volume. This projection can be used to insert a service account token into the pods runtime filesystem for use against APIs (Kubernetes API Server or otherwise).类型`object`必填`path`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `audience` | `string` | audience is the intended audience of the token. A recipient of a token must identify itself with an identifier specified in the audience of the token, and otherwise should reject the token. The audience defaults to the identifier of the apiserver. |
| `expirationSeconds` | `integer` | expirationSeconds is the requested duration of validity of the service account token. As the token approaches expiration, the kubelet volume plugin will proactively rotate the service account token. The kubelet will start trying to rotate the token if the token is older than 80 percent of its time to live or if the token is older than 24 hours.Defaults to 1 hour and must be at least 10 minutes. |
| `path` | `string` | path is the path relative to the mount point of the file to project the token into. |

### [#](#spectemplatespecvolumesquobyte).spec.template.spec.volumes[].quobyte

描述Represents a Quobyte mount that lasts the lifetime of a pod. Quobyte volumes do not support ownership management or SELinux relabeling.类型`object`必填`registry``volume`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `group` | `string` | group to map volume access to Default is no group |
| `readOnly` | `boolean` | readOnly here will force the Quobyte volume to be mounted with read-only permissions. Defaults to false. |
| `registry` | `string` | registry represents a single or multiple Quobyte Registry services specified as a string as host:port pair (multiple entries are separated with commas) which acts as the central registry for volumes |
| `tenant` | `string` | tenant owning the given Quobyte volume in the Backend Used with dynamically provisioned Quobyte volumes, value is set by the plugin |
| `user` | `string` | user to map volume access to Defaults to serivceaccount user |
| `volume` | `string` | volume is a string that references an already created Quobyte volume by name. |

### [#](#spectemplatespecvolumesrbd).spec.template.spec.volumes[].rbd

描述Represents a Rados Block Device mount that lasts the lifetime of a pod. RBD volumes support ownership management and SELinux relabeling.类型`object`必填`monitors``image`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `fsType` | `string` | fsType is the filesystem type of the volume that you want to mount. Tip: Ensure that the filesystem type is supported by the host operating system. Examples: "ext4", "xfs", "ntfs". Implicitly inferred to be "ext4" if unspecified. More info: [https://kubernetes.io/docs/concepts/storage/volumes#rbd](https://kubernetes.io/docs/concepts/storage/volumes#rbd) |
| `image` | `string` | image is the rados image name. More info: [https://examples.k8s.io/volumes/rbd/README.md#how-to-use-it](https://examples.k8s.io/volumes/rbd/README.md#how-to-use-it) |
| `keyring` | `string` | keyring is the path to key ring for RBDUser. Default is /etc/ceph/keyring. More info: [https://examples.k8s.io/volumes/rbd/README.md#how-to-use-it](https://examples.k8s.io/volumes/rbd/README.md#how-to-use-it) |
| `monitors` | `array` | monitors is a collection of Ceph monitors. More info: [https://examples.k8s.io/volumes/rbd/README.md#how-to-use-it](https://examples.k8s.io/volumes/rbd/README.md#how-to-use-it) |
| `pool` | `string` | pool is the rados pool name. Default is rbd. More info: [https://examples.k8s.io/volumes/rbd/README.md#how-to-use-it](https://examples.k8s.io/volumes/rbd/README.md#how-to-use-it) |
| `readOnly` | `boolean` | readOnly here will force the ReadOnly setting in VolumeMounts. Defaults to false. More info: [https://examples.k8s.io/volumes/rbd/README.md#how-to-use-it](https://examples.k8s.io/volumes/rbd/README.md#how-to-use-it) |
| `secretRef` | `object` | LocalObjectReference contains enough information to let you locate the referenced object inside the same namespace. |
| `user` | `string` | user is the rados user name. Default is admin. More info: [https://examples.k8s.io/volumes/rbd/README.md#how-to-use-it](https://examples.k8s.io/volumes/rbd/README.md#how-to-use-it) |

### [#](#spectemplatespecvolumesrbdmonitors).spec.template.spec.volumes[].rbd.monitors

描述monitors is a collection of Ceph monitors. More info: https://examples.k8s.io/volumes/rbd/README.md#how-to-use-it类型`array`### [#](#spectemplatespecvolumesrbdmonitors-1).spec.template.spec.volumes[].rbd.monitors[]

类型`string`### [#](#spectemplatespecvolumesrbdsecretref).spec.template.spec.volumes[].rbd.secretRef

描述LocalObjectReference contains enough information to let you locate the referenced object inside the same namespace.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `name` | `string` | Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names) |

### [#](#spectemplatespecvolumesscaleio).spec.template.spec.volumes[].scaleIO

描述ScaleIOVolumeSource represents a persistent ScaleIO volume类型`object`必填`gateway``system``secretRef`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `fsType` | `string` | fsType is the filesystem type to mount. Must be a filesystem type supported by the host operating system. Ex. "ext4", "xfs", "ntfs". Default is "xfs". |
| `gateway` | `string` | gateway is the host address of the ScaleIO API Gateway. |
| `protectionDomain` | `string` | protectionDomain is the name of the ScaleIO Protection Domain for the configured storage. |
| `readOnly` | `boolean` | readOnly Defaults to false (read/write). ReadOnly here will force the ReadOnly setting in VolumeMounts. |
| `secretRef` | `object` | LocalObjectReference contains enough information to let you locate the referenced object inside the same namespace. |
| `sslEnabled` | `boolean` | sslEnabled Flag enable/disable SSL communication with Gateway, default false |
| `storageMode` | `string` | storageMode indicates whether the storage for a volume should be ThickProvisioned or ThinProvisioned. Default is ThinProvisioned. |
| `storagePool` | `string` | storagePool is the ScaleIO Storage Pool associated with the protection domain. |
| `system` | `string` | system is the name of the storage system as configured in ScaleIO. |
| `volumeName` | `string` | volumeName is the name of a volume already created in the ScaleIO system that is associated with this volume source. |

### [#](#spectemplatespecvolumesscaleiosecretref).spec.template.spec.volumes[].scaleIO.secretRef

描述LocalObjectReference contains enough information to let you locate the referenced object inside the same namespace.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `name` | `string` | Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names) |

### [#](#spectemplatespecvolumessecret).spec.template.spec.volumes[].secret

描述Adapts a Secret into a volume.

The contents of the target Secret's Data field will be presented in a volume as files using the keys in the Data field as the file names. Secret volumes support ownership management and SELinux relabeling.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `defaultMode` | `integer` | defaultMode is Optional: mode bits used to set permissions on created files by default. Must be an octal value between 0000 and 0777 or a decimal value between 0 and 511. YAML accepts both octal and decimal values, JSON requires decimal values for mode bits. Defaults to 0644. Directories within the path are not affected by this setting. This might be in conflict with other options that affect the file mode, like fsGroup, and the result can be other mode bits set. |
| `items` | `array` | items If unspecified, each key-value pair in the Data field of the referenced Secret will be projected into the volume as a file whose name is the key and content is the value. If specified, the listed keys will be projected into the specified paths, and unlisted keys will not be present. If a key is specified which is not present in the Secret, the volume setup will error unless it is marked optional. Paths must be relative and may not contain the '..' path or start with '..'. |
| `optional` | `boolean` | optional field specify whether the Secret or its keys must be defined |
| `secretName` | `string` | secretName is the name of the secret in the pod's namespace to use. More info: [https://kubernetes.io/docs/concepts/storage/volumes#secret](https://kubernetes.io/docs/concepts/storage/volumes#secret) |

### [#](#spectemplatespecvolumessecretitems).spec.template.spec.volumes[].secret.items

描述items If unspecified, each key-value pair in the Data field of the referenced Secret will be projected into the volume as a file whose name is the key and content is the value. If specified, the listed keys will be projected into the specified paths, and unlisted keys will not be present. If a key is specified which is not present in the Secret, the volume setup will error unless it is marked optional. Paths must be relative and may not contain the '..' path or start with '..'.类型`array`### [#](#spectemplatespecvolumessecretitems-1).spec.template.spec.volumes[].secret.items[]

描述Maps a string key to a path within a volume.类型`object`必填`key``path`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `key` | `string` | key is the key to project. |
| `mode` | `integer` | mode is Optional: mode bits used to set permissions on this file. Must be an octal value between 0000 and 0777 or a decimal value between 0 and 511. YAML accepts both octal and decimal values, JSON requires decimal values for mode bits. If not specified, the volume defaultMode will be used. This might be in conflict with other options that affect the file mode, like fsGroup, and the result can be other mode bits set. |
| `path` | `string` | path is the relative path of the file to map the key to. May not be an absolute path. May not contain the path element '..'. May not start with the string '..'. |

### [#](#spectemplatespecvolumesstorageos).spec.template.spec.volumes[].storageos

描述Represents a StorageOS persistent volume resource.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `fsType` | `string` | fsType is the filesystem type to mount. Must be a filesystem type supported by the host operating system. Ex. "ext4", "xfs", "ntfs". Implicitly inferred to be "ext4" if unspecified. |
| `readOnly` | `boolean` | readOnly defaults to false (read/write). ReadOnly here will force the ReadOnly setting in VolumeMounts. |
| `secretRef` | `object` | LocalObjectReference contains enough information to let you locate the referenced object inside the same namespace. |
| `volumeName` | `string` | volumeName is the human-readable name of the StorageOS volume.  Volume names are only unique within a namespace. |
| `volumeNamespace` | `string` | volumeNamespace specifies the scope of the volume within StorageOS.  If no namespace is specified then the Pod's namespace will be used.  This allows the Kubernetes name scoping to be mirrored within StorageOS for tighter integration. Set VolumeName to any name to override the default behaviour. Set to "default" if you are not using namespaces within StorageOS. Namespaces that do not pre-exist within StorageOS will be created. |

### [#](#spectemplatespecvolumesstorageossecretref).spec.template.spec.volumes[].storageos.secretRef

描述LocalObjectReference contains enough information to let you locate the referenced object inside the same namespace.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `name` | `string` | Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names) |

### [#](#spectemplatespecvolumesvspherevolume).spec.template.spec.volumes[].vsphereVolume

描述Represents a vSphere volume resource.类型`object`必填`volumePath`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `fsType` | `string` | fsType is filesystem type to mount. Must be a filesystem type supported by the host operating system. Ex. "ext4", "xfs", "ntfs". Implicitly inferred to be "ext4" if unspecified. |
| `storagePolicyID` | `string` | storagePolicyID is the storage Policy Based Management (SPBM) profile ID associated with the StoragePolicyName. |
| `storagePolicyName` | `string` | storagePolicyName is the storage Policy Based Management (SPBM) profile name. |
| `volumePath` | `string` | volumePath is the path that identifies vSphere volume vmdk |

### [#](#specupdatestrategy).spec.updateStrategy

描述DaemonSetUpdateStrategy is a struct used to control the update strategy for a DaemonSet.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `rollingUpdate` | `object` | Spec to control the desired behavior of daemon set rolling update. |
| `type` | `string` | Type of daemon set update. Can be "RollingUpdate" or "OnDelete". Default is RollingUpdate.


Possible enum values:



- `"OnDelete"` Replace the old daemons only when it's killed

- `"RollingUpdate"` Replace the old daemons by new ones using rolling update i.e replace them on each node one after the other. |

### [#](#specupdatestrategyrollingupdate).spec.updateStrategy.rollingUpdate

描述Spec to control the desired behavior of daemon set rolling update.类型`object`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `maxSurge` | `integer|string` | IntOrString is a type that can hold an int32 or a string.  When used in JSON or YAML marshalling and unmarshalling, it produces or consumes the inner type.  This allows you to have, for example, a JSON field that can accept a name or number. |
| `maxUnavailable` | `integer|string` | IntOrString is a type that can hold an int32 or a string.  When used in JSON or YAML marshalling and unmarshalling, it produces or consumes the inner type.  This allows you to have, for example, a JSON field that can accept a name or number. |

### [#](#status).status

描述DaemonSetStatus represents the current status of a daemon set.类型`object`必填`currentNumberScheduled``numberMisscheduled``desiredNumberScheduled``numberReady`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `collisionCount` | `integer` | Count of hash collisions for the DaemonSet. The DaemonSet controller uses this field as a collision avoidance mechanism when it needs to create the name for the newest ControllerRevision. |
| `conditions` | `array` | Represents the latest available observations of a DaemonSet's current state. |
| `currentNumberScheduled` | `integer` | The number of nodes that are running at least 1 daemon pod and are supposed to run the daemon pod. More info: [https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/](https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/) |
| `desiredNumberScheduled` | `integer` | The total number of nodes that should be running the daemon pod (including nodes correctly running the daemon pod). More info: [https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/](https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/) |
| `numberAvailable` | `integer` | The number of nodes that should be running the daemon pod and have one or more of the daemon pod running and available (ready for at least spec.minReadySeconds) |
| `numberMisscheduled` | `integer` | The number of nodes that are running the daemon pod, but are not supposed to run the daemon pod. More info: [https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/](https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/) |
| `numberReady` | `integer` | numberReady is the number of nodes that should be running the daemon pod and have one or more of the daemon pod running with a Ready Condition. |
| `numberUnavailable` | `integer` | The number of nodes that should be running the daemon pod and have none of the daemon pod running and available (ready for at least spec.minReadySeconds) |
| `observedGeneration` | `integer` | The most recent generation observed by the daemon set controller. |
| `updatedNumberScheduled` | `integer` | The total number of nodes that are running updated daemon pod |

### [#](#statusconditions).status.conditions

描述Represents the latest available observations of a DaemonSet's current state.类型`array`### [#](#statusconditions-1).status.conditions[]

描述DaemonSetCondition describes the state of a DaemonSet at a certain point.类型`object`必填`type``status`| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `lastTransitionTime` | `string` | Time is a wrapper around time.Time which supports correct marshaling to YAML and JSON.  Wrappers are provided for many of the factory methods that the time package offers. |
| `message` | `string` | A human readable message indicating details about the transition. |
| `reason` | `string` | The reason for the condition's last transition. |
| `status` | `string` | Status of the condition, one of True, False, Unknown. |
| `type` | `string` | Type of DaemonSet condition. |

## API 端点

可用的 API 端点如下：

- `/kubernetes/{cluster}/apis/apps/v1/namespaces/{namespace}/daemonsets`- `DELETE`: delete collection of DaemonSet
- `GET`: list objects of kind DaemonSet
- `POST`: create a new DaemonSet


- `/kubernetes/{cluster}/apis/apps/v1/namespaces/{namespace}/daemonsets/{name}`- `DELETE`: delete the specified DaemonSet
- `GET`: read the specified DaemonSet
- `PATCH`: partially update the specified DaemonSet
- `PUT`: replace the specified DaemonSet


- `/kubernetes/{cluster}/apis/apps/v1/namespaces/{namespace}/daemonsets/{name}/status`- `GET`: read status of the specified DaemonSet
- `PATCH`: partially update status of the specified DaemonSet
- `PUT`: replace status of the specified DaemonSet



### /kubernetes/{cluster}/apis/apps/v1/namespaces/{namespace}/daemonsets

HTTP 方法`DELETE`描述delete collection of DaemonSetHTTP 响应| HTTP 状态码 | 响应体 |
| --- | --- |
| 200 - OK | `[Status](/apis/references/Status.html)` schema |
| 401 - Unauthorized | Empty |

HTTP 方法`GET`描述list objects of kind DaemonSetHTTP 响应| HTTP 状态码 | 响应体 |
| --- | --- |
| 200 - OK | `DaemonSetList` schema |
| 401 - Unauthorized | Empty |

HTTP 方法`POST`描述create a new DaemonSet查询参数| 参数 | 类型 | 描述 |
| --- | --- | --- |
| `dryRun` | `string` | When present, indicates that modifications should not be persisted. An invalid or unrecognized dryRun directive will result in an error response and no further processing of the request. Valid values are: - All: all dry run stages will be processed |
| `fieldValidation` | `string` | fieldValidation instructs the server on how to handle objects in the request (POST/PUT/PATCH) containing unknown or duplicate fields. Valid values are: - Ignore: This will ignore any unknown fields that are silently dropped from the object, and will ignore all but the last duplicate field that the decoder encounters. This is the default behavior prior to v1.23. - Warn: This will send a warning via the standard warning response header for each unknown field that is dropped from the object, and for each duplicate field that is encountered. The request will still succeed if there are no other errors, and will only persist the last of any duplicate fields. This is the default in v1.23+ - Strict: This will fail the request with a BadRequest error if any unknown fields would be dropped from the object, or if any duplicate fields are present. The error returned from the server will contain all unknown and duplicate fields encountered. |

请求体参数| 参数 | 类型 | 描述 |
| --- | --- | --- |
| `body` | `DaemonSet` schema | `application/json` formatted |

HTTP 响应| HTTP 状态码 | 响应体 |
| --- | --- |
| 200 - OK | `DaemonSet` schema |
| 201 - Created | `DaemonSet` schema |
| 202 - Accepted | `DaemonSet` schema |
| 401 - Unauthorized | Empty |

### /kubernetes/{cluster}/apis/apps/v1/namespaces/{namespace}/daemonsets/{name}

HTTP 方法`DELETE`描述delete the specified DaemonSet查询参数| 参数 | 类型 | 描述 |
| --- | --- | --- |
| `dryRun` | `string` | When present, indicates that modifications should not be persisted. An invalid or unrecognized dryRun directive will result in an error response and no further processing of the request. Valid values are: - All: all dry run stages will be processed |

HTTP 响应| HTTP 状态码 | 响应体 |
| --- | --- |
| 200 - OK | `[Status](/apis/references/Status.html)` schema |
| 202 - Accepted | `[Status](/apis/references/Status.html)` schema |
| 401 - Unauthorized | Empty |

HTTP 方法`GET`描述read the specified DaemonSetHTTP 响应| HTTP 状态码 | 响应体 |
| --- | --- |
| 200 - OK | `DaemonSet` schema |
| 401 - Unauthorized | Empty |

HTTP 方法`PATCH`描述partially update the specified DaemonSet查询参数| 参数 | 类型 | 描述 |
| --- | --- | --- |
| `dryRun` | `string` | When present, indicates that modifications should not be persisted. An invalid or unrecognized dryRun directive will result in an error response and no further processing of the request. Valid values are: - All: all dry run stages will be processed |
| `fieldValidation` | `string` | fieldValidation instructs the server on how to handle objects in the request (POST/PUT/PATCH) containing unknown or duplicate fields. Valid values are: - Ignore: This will ignore any unknown fields that are silently dropped from the object, and will ignore all but the last duplicate field that the decoder encounters. This is the default behavior prior to v1.23. - Warn: This will send a warning via the standard warning response header for each unknown field that is dropped from the object, and for each duplicate field that is encountered. The request will still succeed if there are no other errors, and will only persist the last of any duplicate fields. This is the default in v1.23+ - Strict: This will fail the request with a BadRequest error if any unknown fields would be dropped from the object, or if any duplicate fields are present. The error returned from the server will contain all unknown and duplicate fields encountered. |

HTTP 响应| HTTP 状态码 | 响应体 |
| --- | --- |
| 200 - OK | `DaemonSet` schema |
| 401 - Unauthorized | Empty |

HTTP 方法`PUT`描述replace the specified DaemonSet查询参数| 参数 | 类型 | 描述 |
| --- | --- | --- |
| `dryRun` | `string` | When present, indicates that modifications should not be persisted. An invalid or unrecognized dryRun directive will result in an error response and no further processing of the request. Valid values are: - All: all dry run stages will be processed |
| `fieldValidation` | `string` | fieldValidation instructs the server on how to handle objects in the request (POST/PUT/PATCH) containing unknown or duplicate fields. Valid values are: - Ignore: This will ignore any unknown fields that are silently dropped from the object, and will ignore all but the last duplicate field that the decoder encounters. This is the default behavior prior to v1.23. - Warn: This will send a warning via the standard warning response header for each unknown field that is dropped from the object, and for each duplicate field that is encountered. The request will still succeed if there are no other errors, and will only persist the last of any duplicate fields. This is the default in v1.23+ - Strict: This will fail the request with a BadRequest error if any unknown fields would be dropped from the object, or if any duplicate fields are present. The error returned from the server will contain all unknown and duplicate fields encountered. |

请求体参数| 参数 | 类型 | 描述 |
| --- | --- | --- |
| `body` | `DaemonSet` schema | `application/json` formatted |

HTTP 响应| HTTP 状态码 | 响应体 |
| --- | --- |
| 200 - OK | `DaemonSet` schema |
| 201 - Created | `DaemonSet` schema |
| 401 - Unauthorized | Empty |

### /kubernetes/{cluster}/apis/apps/v1/namespaces/{namespace}/daemonsets/{name}/status

HTTP 方法`GET`描述read status of the specified DaemonSetHTTP 响应| HTTP 状态码 | 响应体 |
| --- | --- |
| 200 - OK | `DaemonSet` schema |
| 401 - Unauthorized | Empty |

HTTP 方法`PATCH`描述partially update status of the specified DaemonSet查询参数| 参数 | 类型 | 描述 |
| --- | --- | --- |
| `dryRun` | `string` | When present, indicates that modifications should not be persisted. An invalid or unrecognized dryRun directive will result in an error response and no further processing of the request. Valid values are: - All: all dry run stages will be processed |
| `fieldValidation` | `string` | fieldValidation instructs the server on how to handle objects in the request (POST/PUT/PATCH) containing unknown or duplicate fields. Valid values are: - Ignore: This will ignore any unknown fields that are silently dropped from the object, and will ignore all but the last duplicate field that the decoder encounters. This is the default behavior prior to v1.23. - Warn: This will send a warning via the standard warning response header for each unknown field that is dropped from the object, and for each duplicate field that is encountered. The request will still succeed if there are no other errors, and will only persist the last of any duplicate fields. This is the default in v1.23+ - Strict: This will fail the request with a BadRequest error if any unknown fields would be dropped from the object, or if any duplicate fields are present. The error returned from the server will contain all unknown and duplicate fields encountered. |

HTTP 响应| HTTP 状态码 | 响应体 |
| --- | --- |
| 200 - OK | `DaemonSet` schema |
| 401 - Unauthorized | Empty |

HTTP 方法`PUT`描述replace status of the specified DaemonSet查询参数| 参数 | 类型 | 描述 |
| --- | --- | --- |
| `dryRun` | `string` | When present, indicates that modifications should not be persisted. An invalid or unrecognized dryRun directive will result in an error response and no further processing of the request. Valid values are: - All: all dry run stages will be processed |
| `fieldValidation` | `string` | fieldValidation instructs the server on how to handle objects in the request (POST/PUT/PATCH) containing unknown or duplicate fields. Valid values are: - Ignore: This will ignore any unknown fields that are silently dropped from the object, and will ignore all but the last duplicate field that the decoder encounters. This is the default behavior prior to v1.23. - Warn: This will send a warning via the standard warning response header for each unknown field that is dropped from the object, and for each duplicate field that is encountered. The request will still succeed if there are no other errors, and will only persist the last of any duplicate fields. This is the default in v1.23+ - Strict: This will fail the request with a BadRequest error if any unknown fields would be dropped from the object, or if any duplicate fields are present. The error returned from the server will contain all unknown and duplicate fields encountered. |

请求体参数| 参数 | 类型 | 描述 |
| --- | --- | --- |
| `body` | `DaemonSet` schema | `application/json` formatted |

HTTP 响应| HTTP 状态码 | 响应体 |
| --- | --- |
| 200 - OK | `DaemonSet` schema |
| 201 - Created | `DaemonSet` schema |
| 401 - Unauthorized | Empty |

