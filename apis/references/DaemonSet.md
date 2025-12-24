# DaemonSet

## [#](#io.k8s.api.apps.v1.DaemonSet)DaemonSet

DaemonSet represents the configuration of a daemon set.

- `apiVersion`: `string`APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: [https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources](https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources)


- `kind`: `string`Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: [https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds](https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds)


- `metadata`: [ObjectMeta](https://kubernetes.io/docs/reference/kubernetes-api/common-definitions/object-meta/)ObjectMeta is metadata that all persisted resources must have, which includes all objects users must create.


- `spec`: [DaemonSetSpec](#io.k8s.api.apps.v1.DaemonSetSpec)DaemonSetSpec is the specification of a daemon set.


- `status`: [DaemonSetStatus](#io.k8s.api.apps.v1.DaemonSetStatus)DaemonSetStatus represents the current status of a daemon set.



## [#](#io.k8s.api.apps.v1.DaemonSetSpec)DaemonSetSpec

DaemonSetSpec is the specification of a daemon set.

- `minReadySeconds`: `integer`The minimum number of seconds for which a newly created DaemonSet pod should be ready without any of its container crashing, for it to be considered available. Defaults to 0 (pod will be considered available as soon as it is ready).


- `revisionHistoryLimit`: `integer`The number of old history to retain to allow rollback. This is a pointer to distinguish between explicit zero and not specified. Defaults to 10.


- `selector`: [LabelSelector](https://kubernetes.io/docs/reference/kubernetes-api/common-definitions/label-selector/)A label selector is a label query over a set of resources. The result of matchLabels and matchExpressions are ANDed. An empty label selector matches all objects. A null label selector matches no objects.


- `template`: [PodTemplateSpec](#io.k8s.api.core.v1.PodTemplateSpec)PodTemplateSpec describes the data a pod should have when created from a template


- `updateStrategy`: [DaemonSetUpdateStrategy](#io.k8s.api.apps.v1.DaemonSetUpdateStrategy)DaemonSetUpdateStrategy is a struct used to control the update strategy for a DaemonSet.



## [#](#io.k8s.api.core.v1.PodTemplateSpec)PodTemplateSpec

PodTemplateSpec describes the data a pod should have when created from a template

- `metadata`: [ObjectMeta](https://kubernetes.io/docs/reference/kubernetes-api/common-definitions/object-meta/)ObjectMeta is metadata that all persisted resources must have, which includes all objects users must create.


- `spec`: [PodSpec](#io.k8s.api.core.v1.PodSpec)PodSpec is a description of a pod.



## [#](#io.k8s.api.core.v1.PodSpec)PodSpec

PodSpec is a description of a pod.

- `activeDeadlineSeconds`: `integer`Optional duration in seconds the pod may be active on the node relative to StartTime before the system will actively try to mark it failed and kill associated containers. Value must be a positive integer.


- `affinity`: [Affinity](#io.k8s.api.core.v1.Affinity)Affinity is a group of affinity scheduling rules.


- `automountServiceAccountToken`: `boolean`AutomountServiceAccountToken indicates whether a service account token should be automatically mounted.


- `containers`: `[][Container](#io.k8s.api.core.v1.Container)`List of containers belonging to the pod. Containers cannot currently be added or removed. There must be at least one container in a Pod. Cannot be updated.


- `dnsConfig`: [PodDNSConfig](#io.k8s.api.core.v1.PodDNSConfig)PodDNSConfig defines the DNS parameters of a pod in addition to those generated from DNSPolicy.


- `dnsPolicy`: `string`Set DNS policy for the pod. Defaults to "ClusterFirst". Valid values are 'ClusterFirstWithHostNet', 'ClusterFirst', 'Default' or 'None'. DNS parameters given in DNSConfig will be merged with the policy selected with DNSPolicy. To have DNS options set along with hostNetwork, you have to specify DNS policy explicitly to 'ClusterFirstWithHostNet'.


Possible enum values:



- `"ClusterFirst"` indicates that the pod should use cluster DNS first unless hostNetwork is true, if it is available, then fall back on the default (as determined by kubelet) DNS settings.

- `"ClusterFirstWithHostNet"` indicates that the pod should use cluster DNS first, if it is available, then fall back on the default (as determined by kubelet) DNS settings.

- `"Default"` indicates that the pod should use the default (as determined by kubelet) DNS settings.

- `"None"` indicates that the pod should use empty DNS settings. DNS parameters such as nameservers and search paths should be defined via DNSConfig.



- `enableServiceLinks`: `boolean`EnableServiceLinks indicates whether information about services should be injected into pod's environment variables, matching the syntax of Docker links. Optional: Defaults to true.


- `ephemeralContainers`: `[][EphemeralContainer](#io.k8s.api.core.v1.EphemeralContainer)`List of ephemeral containers run in this pod. Ephemeral containers may be run in an existing pod to perform user-initiated actions such as debugging. This list cannot be specified when creating a pod, and it cannot be modified by updating the pod spec. In order to add an ephemeral container to an existing pod, use the pod's ephemeralcontainers subresource.


- `hostAliases`: `[][HostAlias](#io.k8s.api.core.v1.HostAlias)`HostAliases is an optional list of hosts and IPs that will be injected into the pod's hosts file if specified.


- `hostIPC`: `boolean`Use the host's ipc namespace. Optional: Default to false.


- `hostNetwork`: `boolean`Host networking requested for this pod. Use the host's network namespace. If this option is set, the ports that will be used must be specified. Default to false.


- `hostPID`: `boolean`Use the host's pid namespace. Optional: Default to false.


- `hostUsers`: `boolean`Use the host's user namespace. Optional: Default to true. If set to true or not present, the pod will be run in the host user namespace, useful for when the pod needs a feature only available to the host user namespace, such as loading a kernel module with CAP_SYS_MODULE. When set to false, a new userns is created for the pod. Setting false is useful for mitigating container breakout vulnerabilities even allowing users to run their containers as root without actually having root privileges on the host. This field is alpha-level and is only honored by servers that enable the UserNamespacesSupport feature.


- `hostname`: `string`Specifies the hostname of the Pod If not specified, the pod's hostname will be set to a system-defined value.


- `imagePullSecrets`: `[][LocalObjectReference](#io.k8s.api.core.v1.LocalObjectReference)`ImagePullSecrets is an optional list of references to secrets in the same namespace to use for pulling any of the images used by this PodSpec. If specified, these secrets will be passed to individual puller implementations for them to use. More info: [https://kubernetes.io/docs/concepts/containers/images#specifying-imagepullsecrets-on-a-pod](https://kubernetes.io/docs/concepts/containers/images#specifying-imagepullsecrets-on-a-pod)


- `initContainers`: `[][Container](#io.k8s.api.core.v1.Container)`List of initialization containers belonging to the pod. Init containers are executed in order prior to containers being started. If any init container fails, the pod is considered to have failed and is handled according to its restartPolicy. The name for an init container or normal container must be unique among all containers. Init containers may not have Lifecycle actions, Readiness probes, Liveness probes, or Startup probes. The resourceRequirements of an init container are taken into account during scheduling by finding the highest request/limit for each resource type, and then using the max of of that value or the sum of the normal containers. Limits are applied to init containers in a similar fashion. Init containers cannot currently be added or removed. Cannot be updated. More info: [https://kubernetes.io/docs/concepts/workloads/pods/init-containers/](https://kubernetes.io/docs/concepts/workloads/pods/init-containers/)


- `nodeName`: `string`NodeName indicates in which node this pod is scheduled. If empty, this pod is a candidate for scheduling by the scheduler defined in schedulerName. Once this field is set, the kubelet for this node becomes responsible for the lifecycle of this pod. This field should not be used to express a desire for the pod to be scheduled on a specific node. [https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#nodename](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#nodename)


- `nodeSelector`: `map[string]string`NodeSelector is a selector which must be true for the pod to fit on a node. Selector which must match a node's labels for the pod to be scheduled on that node. More info: [https://kubernetes.io/docs/concepts/configuration/assign-pod-node/](https://kubernetes.io/docs/concepts/configuration/assign-pod-node/)


- `os`: [PodOS](#io.k8s.api.core.v1.PodOS)PodOS defines the OS parameters of a pod.


- `overhead`: `map[string][Quantity](#io.k8s.apimachinery.pkg.api.resource.Quantity)`Overhead represents the resource overhead associated with running a pod for a given RuntimeClass. This field will be autopopulated at admission time by the RuntimeClass admission controller. If the RuntimeClass admission controller is enabled, overhead must not be set in Pod create requests. The RuntimeClass admission controller will reject Pod create requests which have the overhead already set. If RuntimeClass is configured and selected in the PodSpec, Overhead will be set to the value defined in the corresponding RuntimeClass, otherwise it will remain unset and treated as zero. More info: [https://git.k8s.io/enhancements/keps/sig-node/688-pod-overhead/README.md](https://git.k8s.io/enhancements/keps/sig-node/688-pod-overhead/README.md)


- `preemptionPolicy`: `string`PreemptionPolicy is the Policy for preempting pods with lower priority. One of Never, PreemptLowerPriority. Defaults to PreemptLowerPriority if unset.


Possible enum values:



- `"Never"` means that pod never preempts other pods with lower priority.

- `"PreemptLowerPriority"` means that pod can preempt other pods with lower priority.



- `priority`: `integer`The priority value. Various system components use this field to find the priority of the pod. When Priority Admission Controller is enabled, it prevents users from setting this field. The admission controller populates this field from PriorityClassName. The higher the value, the higher the priority.


- `priorityClassName`: `string`If specified, indicates the pod's priority. "system-node-critical" and "system-cluster-critical" are two special keywords which indicate the highest priorities with the former being the highest priority. Any other name must be defined by creating a PriorityClass object with that name. If not specified, the pod priority will be default or zero if there is no default.


- `readinessGates`: `[][PodReadinessGate](#io.k8s.api.core.v1.PodReadinessGate)`If specified, all readiness gates will be evaluated for pod readiness. A pod is ready when all its containers are ready AND all conditions specified in the readiness gates have status equal to "True" More info: [https://git.k8s.io/enhancements/keps/sig-network/580-pod-readiness-gates](https://git.k8s.io/enhancements/keps/sig-network/580-pod-readiness-gates)


- `resourceClaims`: `[][PodResourceClaim](#io.k8s.api.core.v1.PodResourceClaim)`ResourceClaims defines which ResourceClaims must be allocated and reserved before the Pod is allowed to start. The resources will be made available to those containers which consume them by name.


This is an alpha field and requires enabling the DynamicResourceAllocation feature gate.


This field is immutable.


- `resources`: [ResourceRequirements](#io.k8s.api.core.v1.ResourceRequirements)ResourceRequirements describes the compute resource requirements.


- `restartPolicy`: `string`Restart policy for all containers within the pod. One of Always, OnFailure, Never. In some contexts, only a subset of those values may be permitted. Default to Always. More info: [https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#restart-policy](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#restart-policy)


Possible enum values:



- `"Always"`

- `"Never"`

- `"OnFailure"`



- `runtimeClassName`: `string`RuntimeClassName refers to a RuntimeClass object in the node.k8s.io group, which should be used to run this pod.  If no RuntimeClass resource matches the named class, the pod will not be run. If unset or empty, the "legacy" RuntimeClass will be used, which is an implicit class with an empty definition that uses the default runtime handler. More info: [https://git.k8s.io/enhancements/keps/sig-node/585-runtime-class](https://git.k8s.io/enhancements/keps/sig-node/585-runtime-class)


- `schedulerName`: `string`If specified, the pod will be dispatched by specified scheduler. If not specified, the pod will be dispatched by default scheduler.


- `schedulingGates`: `[][PodSchedulingGate](#io.k8s.api.core.v1.PodSchedulingGate)`SchedulingGates is an opaque list of values that if specified will block scheduling the pod. If schedulingGates is not empty, the pod will stay in the SchedulingGated state and the scheduler will not attempt to schedule the pod.


SchedulingGates can only be set at pod creation time, and be removed only afterwards.


- `securityContext`: [PodSecurityContext](#io.k8s.api.core.v1.PodSecurityContext)PodSecurityContext holds pod-level security attributes and common container settings. Some fields are also present in container.securityContext.  Field values of container.securityContext take precedence over field values of PodSecurityContext.


- `serviceAccount`: `string`DeprecatedServiceAccount is a deprecated alias for ServiceAccountName. Deprecated: Use serviceAccountName instead.


- `serviceAccountName`: `string`ServiceAccountName is the name of the ServiceAccount to use to run this pod. More info: [https://kubernetes.io/docs/tasks/configure-pod-container/configure-service-account/](https://kubernetes.io/docs/tasks/configure-pod-container/configure-service-account/)


- `setHostnameAsFQDN`: `boolean`If true the pod's hostname will be configured as the pod's FQDN, rather than the leaf name (the default). In Linux containers, this means setting the FQDN in the hostname field of the kernel (the nodename field of struct utsname). In Windows containers, this means setting the registry value of hostname for the registry key HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters to FQDN. If a pod does not have FQDN, this has no effect. Default to false.


- `shareProcessNamespace`: `boolean`Share a single process namespace between all of the containers in a pod. When this is set containers will be able to view and signal processes from other containers in the same pod, and the first process in each container will not be assigned PID 1. HostPID and ShareProcessNamespace cannot both be set. Optional: Default to false.


- `subdomain`: `string`If specified, the fully qualified Pod hostname will be "...svc.". If not specified, the pod will not have a domainname at all.


- `terminationGracePeriodSeconds`: `integer`Optional duration in seconds the pod needs to terminate gracefully. May be decreased in delete request. Value must be non-negative integer. The value zero indicates stop immediately via the kill signal (no opportunity to shut down). If this value is nil, the default grace period will be used instead. The grace period is the duration in seconds after the processes running in the pod are sent a termination signal and the time when the processes are forcibly halted with a kill signal. Set this value longer than the expected cleanup time for your process. Defaults to 30 seconds.


- `tolerations`: `[][Toleration](#io.k8s.api.core.v1.Toleration)`If specified, the pod's tolerations.


- `topologySpreadConstraints`: `[][TopologySpreadConstraint](#io.k8s.api.core.v1.TopologySpreadConstraint)`TopologySpreadConstraints describes how a group of pods ought to spread across topology domains. Scheduler will schedule pods in a way which abides by the constraints. All topologySpreadConstraints are ANDed.


- `volumes`: `[][Volume](#io.k8s.api.core.v1.Volume)`List of volumes that can be mounted by containers belonging to the pod. More info: [https://kubernetes.io/docs/concepts/storage/volumes](https://kubernetes.io/docs/concepts/storage/volumes)



## [#](#io.k8s.api.core.v1.Affinity)Affinity

Affinity is a group of affinity scheduling rules.

- `nodeAffinity`: [NodeAffinity](#io.k8s.api.core.v1.NodeAffinity)Node affinity is a group of node affinity scheduling rules.


- `podAffinity`: [PodAffinity](#io.k8s.api.core.v1.PodAffinity)Pod affinity is a group of inter pod affinity scheduling rules.


- `podAntiAffinity`: [PodAntiAffinity](#io.k8s.api.core.v1.PodAntiAffinity)Pod anti affinity is a group of inter pod anti affinity scheduling rules.



## [#](#io.k8s.api.core.v1.NodeAffinity)NodeAffinity

Node affinity is a group of node affinity scheduling rules.

- `preferredDuringSchedulingIgnoredDuringExecution`: `[][PreferredSchedulingTerm](#io.k8s.api.core.v1.PreferredSchedulingTerm)`The scheduler will prefer to schedule pods to nodes that satisfy the affinity expressions specified by this field, but it may choose a node that violates one or more of the expressions. The node that is most preferred is the one with the greatest sum of weights, i.e. for each node that meets all of the scheduling requirements (resource request, requiredDuringScheduling affinity expressions, etc.), compute a sum by iterating through the elements of this field and adding "weight" to the sum if the node matches the corresponding matchExpressions; the node(s) with the highest sum are the most preferred.


- `requiredDuringSchedulingIgnoredDuringExecution`: [NodeSelector](#io.k8s.api.core.v1.NodeSelector)A node selector represents the union of the results of one or more label queries over a set of nodes; that is, it represents the OR of the selectors represented by the node selector terms.



## [#](#io.k8s.api.core.v1.PreferredSchedulingTerm)PreferredSchedulingTerm

An empty preferred scheduling term matches all objects with implicit weight 0 (i.e. it's a no-op). A null preferred scheduling term matches no objects (i.e. is also a no-op).

- `preference`: [NodeSelectorTerm](#io.k8s.api.core.v1.NodeSelectorTerm)A null or empty node selector term matches no objects. The requirements of them are ANDed. The TopologySelectorTerm type implements a subset of the NodeSelectorTerm.


- `weight`: `integer`Weight associated with matching the corresponding nodeSelectorTerm, in the range 1-100.



## [#](#io.k8s.api.core.v1.NodeSelectorTerm)NodeSelectorTerm

A null or empty node selector term matches no objects. The requirements of them are ANDed. The TopologySelectorTerm type implements a subset of the NodeSelectorTerm.

- `matchExpressions`: `[][NodeSelectorRequirement](#io.k8s.api.core.v1.NodeSelectorRequirement)`A list of node selector requirements by node's labels.


- `matchFields`: `[][NodeSelectorRequirement](#io.k8s.api.core.v1.NodeSelectorRequirement)`A list of node selector requirements by node's fields.



## [#](#io.k8s.api.core.v1.NodeSelectorRequirement)NodeSelectorRequirement

A node selector requirement is a selector that contains values, a key, and an operator that relates the key and values.

- `key`: `string`The label key that the selector applies to.


- `operator`: `string`Represents a key's relationship to a set of values. Valid operators are In, NotIn, Exists, DoesNotExist. Gt, and Lt.


Possible enum values:



- `"DoesNotExist"`

- `"Exists"`

- `"Gt"`

- `"In"`

- `"Lt"`

- `"NotIn"`



- `values`: `[]string`An array of string values. If the operator is In or NotIn, the values array must be non-empty. If the operator is Exists or DoesNotExist, the values array must be empty. If the operator is Gt or Lt, the values array must have a single element, which will be interpreted as an integer. This array is replaced during a strategic merge patch.



## [#](#io.k8s.api.core.v1.NodeSelector)NodeSelector

A node selector represents the union of the results of one or more label queries over a set of nodes; that is, it represents the OR of the selectors represented by the node selector terms.

- `nodeSelectorTerms`: `[][NodeSelectorTerm](#io.k8s.api.core.v1.NodeSelectorTerm)`Required. A list of node selector terms. The terms are ORed.



## [#](#io.k8s.api.core.v1.PodAffinity)PodAffinity

Pod affinity is a group of inter pod affinity scheduling rules.

- `preferredDuringSchedulingIgnoredDuringExecution`: `[][WeightedPodAffinityTerm](#io.k8s.api.core.v1.WeightedPodAffinityTerm)`The scheduler will prefer to schedule pods to nodes that satisfy the affinity expressions specified by this field, but it may choose a node that violates one or more of the expressions. The node that is most preferred is the one with the greatest sum of weights, i.e. for each node that meets all of the scheduling requirements (resource request, requiredDuringScheduling affinity expressions, etc.), compute a sum by iterating through the elements of this field and adding "weight" to the sum if the node has pods which matches the corresponding podAffinityTerm; the node(s) with the highest sum are the most preferred.


- `requiredDuringSchedulingIgnoredDuringExecution`: `[][PodAffinityTerm](#io.k8s.api.core.v1.PodAffinityTerm)`If the affinity requirements specified by this field are not met at scheduling time, the pod will not be scheduled onto the node. If the affinity requirements specified by this field cease to be met at some point during pod execution (e.g. due to a pod label update), the system may or may not try to eventually evict the pod from its node. When there are multiple elements, the lists of nodes corresponding to each podAffinityTerm are intersected, i.e. all terms must be satisfied.



## [#](#io.k8s.api.core.v1.WeightedPodAffinityTerm)WeightedPodAffinityTerm

The weights of all of the matched WeightedPodAffinityTerm fields are added per-node to find the most preferred node(s)

- `podAffinityTerm`: [PodAffinityTerm](#io.k8s.api.core.v1.PodAffinityTerm)Defines a set of pods (namely those matching the labelSelector relative to the given namespace(s)) that this pod should be co-located (affinity) or not co-located (anti-affinity) with, where co-located is defined as running on a node whose value of the label with key  matches that of any node on which a pod of the set of pods is running


- `weight`: `integer`weight associated with matching the corresponding podAffinityTerm, in the range 1-100.



## [#](#io.k8s.api.core.v1.PodAffinityTerm)PodAffinityTerm

Defines a set of pods (namely those matching the labelSelector relative to the given namespace(s)) that this pod should be co-located (affinity) or not co-located (anti-affinity) with, where co-located is defined as running on a node whose value of the label with key  matches that of any node on which a pod of the set of pods is running

- `labelSelector`: [LabelSelector](https://kubernetes.io/docs/reference/kubernetes-api/common-definitions/label-selector/)A label selector is a label query over a set of resources. The result of matchLabels and matchExpressions are ANDed. An empty label selector matches all objects. A null label selector matches no objects.


- `matchLabelKeys`: `[]string`MatchLabelKeys is a set of pod label keys to select which pods will be taken into consideration. The keys are used to lookup values from the incoming pod labels, those key-value labels are merged with `labelSelector` as `key in (value)` to select the group of existing pods which pods will be taken into consideration for the incoming pod's pod (anti) affinity. Keys that don't exist in the incoming pod labels will be ignored. The default value is empty. The same key is forbidden to exist in both matchLabelKeys and labelSelector. Also, matchLabelKeys cannot be set when labelSelector isn't set. This is a beta field and requires enabling MatchLabelKeysInPodAffinity feature gate (enabled by default).


- `mismatchLabelKeys`: `[]string`MismatchLabelKeys is a set of pod label keys to select which pods will be taken into consideration. The keys are used to lookup values from the incoming pod labels, those key-value labels are merged with `labelSelector` as `key notin (value)` to select the group of existing pods which pods will be taken into consideration for the incoming pod's pod (anti) affinity. Keys that don't exist in the incoming pod labels will be ignored. The default value is empty. The same key is forbidden to exist in both mismatchLabelKeys and labelSelector. Also, mismatchLabelKeys cannot be set when labelSelector isn't set. This is a beta field and requires enabling MatchLabelKeysInPodAffinity feature gate (enabled by default).


- `namespaceSelector`: [LabelSelector](https://kubernetes.io/docs/reference/kubernetes-api/common-definitions/label-selector/)A label selector is a label query over a set of resources. The result of matchLabels and matchExpressions are ANDed. An empty label selector matches all objects. A null label selector matches no objects.


- `namespaces`: `[]string`namespaces specifies a static list of namespace names that the term applies to. The term is applied to the union of the namespaces listed in this field and the ones selected by namespaceSelector. null or empty namespaces list and null namespaceSelector means "this pod's namespace".


- `topologyKey`: `string`This pod should be co-located (affinity) or not co-located (anti-affinity) with the pods matching the labelSelector in the specified namespaces, where co-located is defined as running on a node whose value of the label with key topologyKey matches that of any node on which any of the selected pods is running. Empty topologyKey is not allowed.



## [#](#io.k8s.api.core.v1.PodAntiAffinity)PodAntiAffinity

Pod anti affinity is a group of inter pod anti affinity scheduling rules.

- `preferredDuringSchedulingIgnoredDuringExecution`: `[][WeightedPodAffinityTerm](#io.k8s.api.core.v1.WeightedPodAffinityTerm)`The scheduler will prefer to schedule pods to nodes that satisfy the anti-affinity expressions specified by this field, but it may choose a node that violates one or more of the expressions. The node that is most preferred is the one with the greatest sum of weights, i.e. for each node that meets all of the scheduling requirements (resource request, requiredDuringScheduling anti-affinity expressions, etc.), compute a sum by iterating through the elements of this field and adding "weight" to the sum if the node has pods which matches the corresponding podAffinityTerm; the node(s) with the highest sum are the most preferred.


- `requiredDuringSchedulingIgnoredDuringExecution`: `[][PodAffinityTerm](#io.k8s.api.core.v1.PodAffinityTerm)`If the anti-affinity requirements specified by this field are not met at scheduling time, the pod will not be scheduled onto the node. If the anti-affinity requirements specified by this field cease to be met at some point during pod execution (e.g. due to a pod label update), the system may or may not try to eventually evict the pod from its node. When there are multiple elements, the lists of nodes corresponding to each podAffinityTerm are intersected, i.e. all terms must be satisfied.



## [#](#io.k8s.api.core.v1.Container)Container

A single application container that you want to run within a pod.

- `args`: `[]string`Arguments to the entrypoint. The container image's CMD is used if this is not provided. Variable references $(VAR_NAME) are expanded using the container's environment. If a variable cannot be resolved, the reference in the input string will be unchanged. Double $$ are reduced to a single $, which allows for escaping the $(VAR_NAME) syntax: i.e. "$$(VAR_NAME)" will produce the string literal "$(VAR_NAME)". Escaped references will never be expanded, regardless of whether the variable exists or not. Cannot be updated. More info: [https://kubernetes.io/docs/tasks/inject-data-application/define-command-argument-container/#running-a-command-in-a-shell](https://kubernetes.io/docs/tasks/inject-data-application/define-command-argument-container/#running-a-command-in-a-shell)


- `command`: `[]string`Entrypoint array. Not executed within a shell. The container image's ENTRYPOINT is used if this is not provided. Variable references $(VAR_NAME) are expanded using the container's environment. If a variable cannot be resolved, the reference in the input string will be unchanged. Double $$ are reduced to a single $, which allows for escaping the $(VAR_NAME) syntax: i.e. "$$(VAR_NAME)" will produce the string literal "$(VAR_NAME)". Escaped references will never be expanded, regardless of whether the variable exists or not. Cannot be updated. More info: [https://kubernetes.io/docs/tasks/inject-data-application/define-command-argument-container/#running-a-command-in-a-shell](https://kubernetes.io/docs/tasks/inject-data-application/define-command-argument-container/#running-a-command-in-a-shell)


- `env`: `[][EnvVar](#io.k8s.api.core.v1.EnvVar)`List of environment variables to set in the container. Cannot be updated.


- `envFrom`: `[][EnvFromSource](#io.k8s.api.core.v1.EnvFromSource)`List of sources to populate environment variables in the container. The keys defined within a source must be a C_IDENTIFIER. All invalid keys will be reported as an event when the container is starting. When a key exists in multiple sources, the value associated with the last source will take precedence. Values defined by an Env with a duplicate key will take precedence. Cannot be updated.


- `image`: `string`Container image name. More info: [https://kubernetes.io/docs/concepts/containers/images](https://kubernetes.io/docs/concepts/containers/images) This field is optional to allow higher level config management to default or override container images in workload controllers like Deployments and StatefulSets.


- `imagePullPolicy`: `string`Image pull policy. One of Always, Never, IfNotPresent. Defaults to Always if :latest tag is specified, or IfNotPresent otherwise. Cannot be updated. More info: [https://kubernetes.io/docs/concepts/containers/images#updating-images](https://kubernetes.io/docs/concepts/containers/images#updating-images)


Possible enum values:



- `"Always"` means that kubelet always attempts to pull the latest image. Container will fail If the pull fails.

- `"IfNotPresent"` means that kubelet pulls if the image isn't present on disk. Container will fail if the image isn't present and the pull fails.

- `"Never"` means that kubelet never pulls an image, but only uses a local image. Container will fail if the image isn't present



- `lifecycle`: [Lifecycle](#io.k8s.api.core.v1.Lifecycle)Lifecycle describes actions that the management system should take in response to container lifecycle events. For the PostStart and PreStop lifecycle handlers, management of the container blocks until the action is complete, unless the container process fails, in which case the handler is aborted.


- `livenessProbe`: [Probe](#io.k8s.api.core.v1.Probe)Probe describes a health check to be performed against a container to determine whether it is alive or ready to receive traffic.


- `name`: `string`Name of the container specified as a DNS_LABEL. Each container in a pod must have a unique name (DNS_LABEL). Cannot be updated.


- `ports`: `[][ContainerPort](#io.k8s.api.core.v1.ContainerPort)`List of ports to expose from the container. Not specifying a port here DOES NOT prevent that port from being exposed. Any port which is listening on the default "0.0.0.0" address inside a container will be accessible from the network. Modifying this array with strategic merge patch may corrupt the data. For more information See [https://github.com/kubernetes/kubernetes/issues/108255](https://github.com/kubernetes/kubernetes/issues/108255). Cannot be updated.


- `readinessProbe`: [Probe](#io.k8s.api.core.v1.Probe)Probe describes a health check to be performed against a container to determine whether it is alive or ready to receive traffic.


- `resizePolicy`: `[][ContainerResizePolicy](#io.k8s.api.core.v1.ContainerResizePolicy)`Resources resize policy for the container.


- `resources`: [ResourceRequirements](#io.k8s.api.core.v1.ResourceRequirements)ResourceRequirements describes the compute resource requirements.


- `restartPolicy`: `string`RestartPolicy defines the restart behavior of individual containers in a pod. This field may only be set for init containers, and the only allowed value is "Always". For non-init containers or when this field is not specified, the restart behavior is defined by the Pod's restart policy and the container type. Setting the RestartPolicy as "Always" for the init container will have the following effect: this init container will be continually restarted on exit until all regular containers have terminated. Once all regular containers have completed, all init containers with restartPolicy "Always" will be shut down. This lifecycle differs from normal init containers and is often referred to as a "sidecar" container. Although this init container still starts in the init container sequence, it does not wait for the container to complete before proceeding to the next init container. Instead, the next init container starts immediately after this init container is started, or after any startupProbe has successfully completed.


- `securityContext`: [SecurityContext](#io.k8s.api.core.v1.SecurityContext)SecurityContext holds security configuration that will be applied to a container. Some fields are present in both SecurityContext and PodSecurityContext.  When both are set, the values in SecurityContext take precedence.


- `startupProbe`: [Probe](#io.k8s.api.core.v1.Probe)Probe describes a health check to be performed against a container to determine whether it is alive or ready to receive traffic.


- `stdin`: `boolean`Whether this container should allocate a buffer for stdin in the container runtime. If this is not set, reads from stdin in the container will always result in EOF. Default is false.


- `stdinOnce`: `boolean`Whether the container runtime should close the stdin channel after it has been opened by a single attach. When stdin is true the stdin stream will remain open across multiple attach sessions. If stdinOnce is set to true, stdin is opened on container start, is empty until the first client attaches to stdin, and then remains open and accepts data until the client disconnects, at which time stdin is closed and remains closed until the container is restarted. If this flag is false, a container processes that reads from stdin will never receive an EOF. Default is false


- `terminationMessagePath`: `string`Optional: Path at which the file to which the container's termination message will be written is mounted into the container's filesystem. Message written is intended to be brief final status, such as an assertion failure message. Will be truncated by the node if greater than 4096 bytes. The total message length across all containers will be limited to 12kb. Defaults to /dev/termination-log. Cannot be updated.


- `terminationMessagePolicy`: `string`Indicate how the termination message should be populated. File will use the contents of terminationMessagePath to populate the container status message on both success and failure. FallbackToLogsOnError will use the last chunk of container log output if the termination message file is empty and the container exited with an error. The log output is limited to 2048 bytes or 80 lines, whichever is smaller. Defaults to File. Cannot be updated.


Possible enum values:



- `"FallbackToLogsOnError"` will read the most recent contents of the container logs for the container status message when the container exits with an error and the terminationMessagePath has no contents.

- `"File"` is the default behavior and will set the container status message to the contents of the container's terminationMessagePath when the container exits.



- `tty`: `boolean`Whether this container should allocate a TTY for itself, also requires 'stdin' to be true. Default is false.


- `volumeDevices`: `[][VolumeDevice](#io.k8s.api.core.v1.VolumeDevice)`volumeDevices is the list of block devices to be used by the container.


- `volumeMounts`: `[][VolumeMount](#io.k8s.api.core.v1.VolumeMount)`Pod volumes to mount into the container's filesystem. Cannot be updated.


- `workingDir`: `string`Container's working directory. If not specified, the container runtime's default will be used, which might be configured in the container image. Cannot be updated.



## [#](#io.k8s.api.core.v1.EnvVar)EnvVar

EnvVar represents an environment variable present in a Container.

- `name`: `string`Name of the environment variable. Must be a C_IDENTIFIER.


- `value`: `string`Variable references $(VAR_NAME) are expanded using the previously defined environment variables in the container and any service environment variables. If a variable cannot be resolved, the reference in the input string will be unchanged. Double $$ are reduced to a single $, which allows for escaping the $(VAR_NAME) syntax: i.e. "$$(VAR_NAME)" will produce the string literal "$(VAR_NAME)". Escaped references will never be expanded, regardless of whether the variable exists or not. Defaults to "".


- `valueFrom`: [EnvVarSource](#io.k8s.api.core.v1.EnvVarSource)EnvVarSource represents a source for the value of an EnvVar.



## [#](#io.k8s.api.core.v1.EnvVarSource)EnvVarSource

EnvVarSource represents a source for the value of an EnvVar.

- `configMapKeyRef`: [ConfigMapKeySelector](#io.k8s.api.core.v1.ConfigMapKeySelector)Selects a key from a ConfigMap.


- `fieldRef`: [ObjectFieldSelector](https://kubernetes.io/docs/reference/kubernetes-api/common-definitions/object-field-selector/)ObjectFieldSelector selects an APIVersioned field of an object.


- `resourceFieldRef`: [ResourceFieldSelector](#io.k8s.api.core.v1.ResourceFieldSelector)ResourceFieldSelector represents container resources (cpu, memory) and their output format


- `secretKeyRef`: [SecretKeySelector](#io.k8s.api.core.v1.SecretKeySelector)SecretKeySelector selects a key of a Secret.



## [#](#io.k8s.api.core.v1.ConfigMapKeySelector)ConfigMapKeySelector

Selects a key from a ConfigMap.

- `key`: `string`The key to select.


- `name`: `string`Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names)


- `optional`: `boolean`Specify whether the ConfigMap or its key must be defined



## [#](#io.k8s.api.core.v1.ResourceFieldSelector)ResourceFieldSelector

ResourceFieldSelector represents container resources (cpu, memory) and their output format

- `containerName`: `string`Container name: required for volumes, optional for env vars


- `divisor`: [Quantity](#io.k8s.apimachinery.pkg.api.resource.Quantity)Quantity is a fixed-point representation of a number. It provides convenient marshaling/unmarshaling in JSON and YAML, in addition to String() and AsInt64() accessors.


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

````

- `resource`: `string`Required: resource to select



## [#](#io.k8s.apimachinery.pkg.api.resource.Quantity)Quantity

Quantity is a fixed-point representation of a number. It provides convenient marshaling/unmarshaling in JSON and YAML, in addition to String() and AsInt64() accessors.


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

````
## [#](#io.k8s.api.core.v1.SecretKeySelector)SecretKeySelector

SecretKeySelector selects a key of a Secret.

- `key`: `string`The key of the secret to select from.  Must be a valid secret key.


- `name`: `string`Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names)


- `optional`: `boolean`Specify whether the Secret or its key must be defined



## [#](#io.k8s.api.core.v1.EnvFromSource)EnvFromSource

EnvFromSource represents the source of a set of ConfigMaps

- `configMapRef`: [ConfigMapEnvSource](#io.k8s.api.core.v1.ConfigMapEnvSource)ConfigMapEnvSource selects a ConfigMap to populate the environment variables with.


The contents of the target ConfigMap's Data field will represent the key-value pairs as environment variables.


- `prefix`: `string`An optional identifier to prepend to each key in the ConfigMap. Must be a C_IDENTIFIER.


- `secretRef`: [SecretEnvSource](#io.k8s.api.core.v1.SecretEnvSource)SecretEnvSource selects a Secret to populate the environment variables with.


The contents of the target Secret's Data field will represent the key-value pairs as environment variables.



## [#](#io.k8s.api.core.v1.ConfigMapEnvSource)ConfigMapEnvSource

ConfigMapEnvSource selects a ConfigMap to populate the environment variables with.


The contents of the target ConfigMap's Data field will represent the key-value pairs as environment variables.

- `name`: `string`Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names)


- `optional`: `boolean`Specify whether the ConfigMap must be defined



## [#](#io.k8s.api.core.v1.SecretEnvSource)SecretEnvSource

SecretEnvSource selects a Secret to populate the environment variables with.


The contents of the target Secret's Data field will represent the key-value pairs as environment variables.

- `name`: `string`Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names)


- `optional`: `boolean`Specify whether the Secret must be defined



## [#](#io.k8s.api.core.v1.Lifecycle)Lifecycle

Lifecycle describes actions that the management system should take in response to container lifecycle events. For the PostStart and PreStop lifecycle handlers, management of the container blocks until the action is complete, unless the container process fails, in which case the handler is aborted.

- `postStart`: [LifecycleHandler](#io.k8s.api.core.v1.LifecycleHandler)LifecycleHandler defines a specific action that should be taken in a lifecycle hook. One and only one of the fields, except TCPSocket must be specified.


- `preStop`: [LifecycleHandler](#io.k8s.api.core.v1.LifecycleHandler)LifecycleHandler defines a specific action that should be taken in a lifecycle hook. One and only one of the fields, except TCPSocket must be specified.



## [#](#io.k8s.api.core.v1.LifecycleHandler)LifecycleHandler

LifecycleHandler defines a specific action that should be taken in a lifecycle hook. One and only one of the fields, except TCPSocket must be specified.

- `exec`: [ExecAction](#io.k8s.api.core.v1.ExecAction)ExecAction describes a "run in container" action.


- `httpGet`: [HTTPGetAction](#io.k8s.api.core.v1.HTTPGetAction)HTTPGetAction describes an action based on HTTP Get requests.


- `sleep`: [SleepAction](#io.k8s.api.core.v1.SleepAction)SleepAction describes a "sleep" action.


- `tcpSocket`: [TCPSocketAction](#io.k8s.api.core.v1.TCPSocketAction)TCPSocketAction describes an action based on opening a socket



## [#](#io.k8s.api.core.v1.ExecAction)ExecAction

ExecAction describes a "run in container" action.

- `command`: `[]string`Command is the command line to execute inside the container, the working directory for the command  is root ('/') in the container's filesystem. The command is simply exec'd, it is not run inside a shell, so traditional shell instructions ('|', etc) won't work. To use a shell, you need to explicitly call out to that shell. Exit status of 0 is treated as live/healthy and non-zero is unhealthy.



## [#](#io.k8s.api.core.v1.HTTPGetAction)HTTPGetAction

HTTPGetAction describes an action based on HTTP Get requests.

- `host`: `string`Host name to connect to, defaults to the pod IP. You probably want to set "Host" in httpHeaders instead.


- `httpHeaders`: `[][HTTPHeader](#io.k8s.api.core.v1.HTTPHeader)`Custom headers to set in the request. HTTP allows repeated headers.


- `path`: `string`Path to access on the HTTP server.


- `port`: [IntOrString](#io.k8s.apimachinery.pkg.util.intstr.IntOrString)IntOrString is a type that can hold an int32 or a string.  When used in JSON or YAML marshalling and unmarshalling, it produces or consumes the inner type.  This allows you to have, for example, a JSON field that can accept a name or number.


- `scheme`: `string`Scheme to use for connecting to the host. Defaults to HTTP.


Possible enum values:



- `"HTTP"` means that the scheme used will be http://

- `"HTTPS"` means that the scheme used will be https://




## [#](#io.k8s.api.core.v1.HTTPHeader)HTTPHeader

HTTPHeader describes a custom header to be used in HTTP probes

- `name`: `string`The header field name. This will be canonicalized upon output, so case-variant names will be understood as the same header.


- `value`: `string`The header field value



## [#](#io.k8s.apimachinery.pkg.util.intstr.IntOrString)IntOrString

IntOrString is a type that can hold an int32 or a string.  When used in JSON or YAML marshalling and unmarshalling, it produces or consumes the inner type.  This allows you to have, for example, a JSON field that can accept a name or number.

## [#](#io.k8s.api.core.v1.SleepAction)SleepAction

SleepAction describes a "sleep" action.

- `seconds`: `integer`Seconds is the number of seconds to sleep.



## [#](#io.k8s.api.core.v1.TCPSocketAction)TCPSocketAction

TCPSocketAction describes an action based on opening a socket

- `host`: `string`Optional: Host name to connect to, defaults to the pod IP.


- `port`: [IntOrString](#io.k8s.apimachinery.pkg.util.intstr.IntOrString)IntOrString is a type that can hold an int32 or a string.  When used in JSON or YAML marshalling and unmarshalling, it produces or consumes the inner type.  This allows you to have, for example, a JSON field that can accept a name or number.



## [#](#io.k8s.api.core.v1.Probe)Probe

Probe describes a health check to be performed against a container to determine whether it is alive or ready to receive traffic.

- `exec`: [ExecAction](#io.k8s.api.core.v1.ExecAction)ExecAction describes a "run in container" action.


- `failureThreshold`: `integer`Minimum consecutive failures for the probe to be considered failed after having succeeded. Defaults to 3. Minimum value is 1.


- `grpc`: [GRPCAction](#io.k8s.api.core.v1.GRPCAction)GRPCAction specifies an action involving a GRPC service.


- `httpGet`: [HTTPGetAction](#io.k8s.api.core.v1.HTTPGetAction)HTTPGetAction describes an action based on HTTP Get requests.


- `initialDelaySeconds`: `integer`Number of seconds after the container has started before liveness probes are initiated. More info: [https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle#container-probes](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle#container-probes)


- `periodSeconds`: `integer`How often (in seconds) to perform the probe. Default to 10 seconds. Minimum value is 1.


- `successThreshold`: `integer`Minimum consecutive successes for the probe to be considered successful after having failed. Defaults to 1. Must be 1 for liveness and startup. Minimum value is 1.


- `tcpSocket`: [TCPSocketAction](#io.k8s.api.core.v1.TCPSocketAction)TCPSocketAction describes an action based on opening a socket


- `terminationGracePeriodSeconds`: `integer`Optional duration in seconds the pod needs to terminate gracefully upon probe failure. The grace period is the duration in seconds after the processes running in the pod are sent a termination signal and the time when the processes are forcibly halted with a kill signal. Set this value longer than the expected cleanup time for your process. If this value is nil, the pod's terminationGracePeriodSeconds will be used. Otherwise, this value overrides the value provided by the pod spec. Value must be non-negative integer. The value zero indicates stop immediately via the kill signal (no opportunity to shut down). This is a beta field and requires enabling ProbeTerminationGracePeriod feature gate. Minimum value is 1. spec.terminationGracePeriodSeconds is used if unset.


- `timeoutSeconds`: `integer`Number of seconds after which the probe times out. Defaults to 1 second. Minimum value is 1. More info: [https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle#container-probes](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle#container-probes)



## [#](#io.k8s.api.core.v1.GRPCAction)GRPCAction

GRPCAction specifies an action involving a GRPC service.

- `port`: `integer`Port number of the gRPC service. Number must be in the range 1 to 65535.


- `service`: `string`Service is the name of the service to place in the gRPC HealthCheckRequest (see [https://github.com/grpc/grpc/blob/master/doc/health-checking.md](https://github.com/grpc/grpc/blob/master/doc/health-checking.md)).


If this is not specified, the default behavior is defined by gRPC.



## [#](#io.k8s.api.core.v1.ContainerPort)ContainerPort

ContainerPort represents a network port in a single container.

- `containerPort`: `integer`Number of port to expose on the pod's IP address. This must be a valid port number, 0 < x < 65536.


- `hostIP`: `string`What host IP to bind the external port to.


- `hostPort`: `integer`Number of port to expose on the host. If specified, this must be a valid port number, 0 < x < 65536. If HostNetwork is specified, this must match ContainerPort. Most containers do not need this.


- `name`: `string`If specified, this must be an IANA_SVC_NAME and unique within the pod. Each named port in a pod must have a unique name. Name for the port that can be referred to by services.


- `protocol`: `string`Protocol for port. Must be UDP, TCP, or SCTP. Defaults to "TCP".


Possible enum values:



- `"SCTP"` is the SCTP protocol.

- `"TCP"` is the TCP protocol.

- `"UDP"` is the UDP protocol.




## [#](#io.k8s.api.core.v1.ContainerResizePolicy)ContainerResizePolicy

ContainerResizePolicy represents resource resize policy for the container.

- `resourceName`: `string`Name of the resource to which this resource resize policy applies. Supported values: cpu, memory.


- `restartPolicy`: `string`Restart policy to apply when specified resource is resized. If not specified, it defaults to NotRequired.



## [#](#io.k8s.api.core.v1.ResourceRequirements)ResourceRequirements

ResourceRequirements describes the compute resource requirements.

- `claims`: `[][ResourceClaim](#io.k8s.api.core.v1.ResourceClaim)`Claims lists the names of resources, defined in spec.resourceClaims, that are used by this container.


This is an alpha field and requires enabling the DynamicResourceAllocation feature gate.


This field is immutable. It can only be set for containers.


- `limits`: `map[string][Quantity](#io.k8s.apimachinery.pkg.api.resource.Quantity)`Limits describes the maximum amount of compute resources allowed. More info: [https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/)


- `requests`: `map[string][Quantity](#io.k8s.apimachinery.pkg.api.resource.Quantity)`Requests describes the minimum amount of compute resources required. If Requests is omitted for a container, it defaults to Limits if that is explicitly specified, otherwise to an implementation-defined value. Requests cannot exceed Limits. More info: [https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/)



## [#](#io.k8s.api.core.v1.ResourceClaim)ResourceClaim

ResourceClaim references one entry in PodSpec.ResourceClaims.

- `name`: `string`Name must match the name of one entry in pod.spec.resourceClaims of the Pod where this field is used. It makes that resource available inside a container.


- `request`: `string`Request is the name chosen for a request in the referenced claim. If empty, everything from the claim is made available, otherwise only the result of this request.



## [#](#io.k8s.api.core.v1.SecurityContext)SecurityContext

SecurityContext holds security configuration that will be applied to a container. Some fields are present in both SecurityContext and PodSecurityContext.  When both are set, the values in SecurityContext take precedence.

- `allowPrivilegeEscalation`: `boolean`AllowPrivilegeEscalation controls whether a process can gain more privileges than its parent process. This bool directly controls if the no_new_privs flag will be set on the container process. AllowPrivilegeEscalation is true always when the container is: 1) run as Privileged 2) has CAP_SYS_ADMIN Note that this field cannot be set when spec.os.name is windows.


- `appArmorProfile`: [AppArmorProfile](#io.k8s.api.core.v1.AppArmorProfile)AppArmorProfile defines a pod or container's AppArmor settings.


- `capabilities`: [Capabilities](#io.k8s.api.core.v1.Capabilities)Adds and removes POSIX capabilities from running containers.


- `privileged`: `boolean`Run container in privileged mode. Processes in privileged containers are essentially equivalent to root on the host. Defaults to false. Note that this field cannot be set when spec.os.name is windows.


- `procMount`: `string`procMount denotes the type of proc mount to use for the containers. The default value is Default which uses the container runtime defaults for readonly paths and masked paths. This requires the ProcMountType feature flag to be enabled. Note that this field cannot be set when spec.os.name is windows.


Possible enum values:



- `"Default"` uses the container runtime defaults for readonly and masked paths for /proc. Most container runtimes mask certain paths in /proc to avoid accidental security exposure of special devices or information.

- `"Unmasked"` bypasses the default masking behavior of the container runtime and ensures the newly created /proc the container stays in tact with no modifications.



- `readOnlyRootFilesystem`: `boolean`Whether this container has a read-only root filesystem. Default is false. Note that this field cannot be set when spec.os.name is windows.


- `runAsGroup`: `integer`The GID to run the entrypoint of the container process. Uses runtime default if unset. May also be set in PodSecurityContext.  If set in both SecurityContext and PodSecurityContext, the value specified in SecurityContext takes precedence. Note that this field cannot be set when spec.os.name is windows.


- `runAsNonRoot`: `boolean`Indicates that the container must run as a non-root user. If true, the Kubelet will validate the image at runtime to ensure that it does not run as UID 0 (root) and fail to start the container if it does. If unset or false, no such validation will be performed. May also be set in PodSecurityContext.  If set in both SecurityContext and PodSecurityContext, the value specified in SecurityContext takes precedence.


- `runAsUser`: `integer`The UID to run the entrypoint of the container process. Defaults to user specified in image metadata if unspecified. May also be set in PodSecurityContext.  If set in both SecurityContext and PodSecurityContext, the value specified in SecurityContext takes precedence. Note that this field cannot be set when spec.os.name is windows.


- `seLinuxOptions`: [SELinuxOptions](#io.k8s.api.core.v1.SELinuxOptions)SELinuxOptions are the labels to be applied to the container


- `seccompProfile`: [SeccompProfile](#io.k8s.api.core.v1.SeccompProfile)SeccompProfile defines a pod/container's seccomp profile settings. Only one profile source may be set.


- `windowsOptions`: [WindowsSecurityContextOptions](#io.k8s.api.core.v1.WindowsSecurityContextOptions)WindowsSecurityContextOptions contain Windows-specific options and credentials.



## [#](#io.k8s.api.core.v1.AppArmorProfile)AppArmorProfile

AppArmorProfile defines a pod or container's AppArmor settings.

- `localhostProfile`: `string`localhostProfile indicates a profile loaded on the node that should be used. The profile must be preconfigured on the node to work. Must match the loaded name of the profile. Must be set if and only if type is "Localhost".


- `type`: `string`type indicates which kind of AppArmor profile will be applied. Valid options are:
Localhost - a profile pre-loaded on the node.
RuntimeDefault - the container runtime's default profile.
Unconfined - no AppArmor enforcement.


Possible enum values:



- `"Localhost"` indicates that a profile pre-loaded on the node should be used.

- `"RuntimeDefault"` indicates that the container runtime's default AppArmor profile should be used.

- `"Unconfined"` indicates that no AppArmor profile should be enforced.




## [#](#io.k8s.api.core.v1.Capabilities)Capabilities

Adds and removes POSIX capabilities from running containers.

- `add`: `[]string`Added capabilities


- `drop`: `[]string`Removed capabilities



## [#](#io.k8s.api.core.v1.SELinuxOptions)SELinuxOptions

SELinuxOptions are the labels to be applied to the container

- `level`: `string`Level is SELinux level label that applies to the container.


- `role`: `string`Role is a SELinux role label that applies to the container.


- `type`: `string`Type is a SELinux type label that applies to the container.


- `user`: `string`User is a SELinux user label that applies to the container.



## [#](#io.k8s.api.core.v1.SeccompProfile)SeccompProfile

SeccompProfile defines a pod/container's seccomp profile settings. Only one profile source may be set.

- `localhostProfile`: `string`localhostProfile indicates a profile defined in a file on the node should be used. The profile must be preconfigured on the node to work. Must be a descending path, relative to the kubelet's configured seccomp profile location. Must be set if type is "Localhost". Must NOT be set for any other type.


- `type`: `string`type indicates which kind of seccomp profile will be applied. Valid options are:


Localhost - a profile defined in a file on the node should be used. RuntimeDefault - the container runtime default profile should be used. Unconfined - no profile should be applied.


Possible enum values:



- `"Localhost"` indicates a profile defined in a file on the node should be used. The file's location relative to /seccomp.

- `"RuntimeDefault"` represents the default container runtime seccomp profile.

- `"Unconfined"` indicates no seccomp profile is applied (A.K.A. unconfined).




## [#](#io.k8s.api.core.v1.WindowsSecurityContextOptions)WindowsSecurityContextOptions

WindowsSecurityContextOptions contain Windows-specific options and credentials.

- `gmsaCredentialSpec`: `string`GMSACredentialSpec is where the GMSA admission webhook ([https://github.com/kubernetes-sigs/windows-gmsa](https://github.com/kubernetes-sigs/windows-gmsa)) inlines the contents of the GMSA credential spec named by the GMSACredentialSpecName field.


- `gmsaCredentialSpecName`: `string`GMSACredentialSpecName is the name of the GMSA credential spec to use.


- `hostProcess`: `boolean`HostProcess determines if a container should be run as a 'Host Process' container. All of a Pod's containers must have the same effective HostProcess value (it is not allowed to have a mix of HostProcess containers and non-HostProcess containers). In addition, if HostProcess is true then HostNetwork must also be set to true.


- `runAsUserName`: `string`The UserName in Windows to run the entrypoint of the container process. Defaults to the user specified in image metadata if unspecified. May also be set in PodSecurityContext. If set in both SecurityContext and PodSecurityContext, the value specified in SecurityContext takes precedence.



## [#](#io.k8s.api.core.v1.VolumeDevice)VolumeDevice

volumeDevice describes a mapping of a raw block device within a container.

- `devicePath`: `string`devicePath is the path inside of the container that the device will be mapped to.


- `name`: `string`name must match the name of a persistentVolumeClaim in the pod



## [#](#io.k8s.api.core.v1.VolumeMount)VolumeMount

VolumeMount describes a mounting of a Volume within a container.

- `mountPath`: `string`Path within the container at which the volume should be mounted.  Must not contain ':'.


- `mountPropagation`: `string`mountPropagation determines how mounts are propagated from the host to container and the other way around. When not set, MountPropagationNone is used. This field is beta in 1.10. When RecursiveReadOnly is set to IfPossible or to Enabled, MountPropagation must be None or unspecified (which defaults to None).


Possible enum values:



- `"Bidirectional"` means that the volume in a container will receive new mounts from the host or other containers, and its own mounts will be propagated from the container to the host or other containers. Note that this mode is recursively applied to all mounts in the volume ("rshared" in Linux terminology).

- `"HostToContainer"` means that the volume in a container will receive new mounts from the host or other containers, but filesystems mounted inside the container won't be propagated to the host or other containers. Note that this mode is recursively applied to all mounts in the volume ("rslave" in Linux terminology).

- `"None"` means that the volume in a container will not receive new mounts from the host or other containers, and filesystems mounted inside the container won't be propagated to the host or other containers. Note that this mode corresponds to "private" in Linux terminology.



- `name`: `string`This must match the Name of a Volume.


- `readOnly`: `boolean`Mounted read-only if true, read-write otherwise (false or unspecified). Defaults to false.


- `recursiveReadOnly`: `string`RecursiveReadOnly specifies whether read-only mounts should be handled recursively.


If ReadOnly is false, this field has no meaning and must be unspecified.


If ReadOnly is true, and this field is set to Disabled, the mount is not made recursively read-only.  If this field is set to IfPossible, the mount is made recursively read-only, if it is supported by the container runtime.  If this field is set to Enabled, the mount is made recursively read-only if it is supported by the container runtime, otherwise the pod will not be started and an error will be generated to indicate the reason.


If this field is set to IfPossible or Enabled, MountPropagation must be set to None (or be unspecified, which defaults to None).


If this field is not specified, it is treated as an equivalent of Disabled.


- `subPath`: `string`Path within the volume from which the container's volume should be mounted. Defaults to "" (volume's root).


- `subPathExpr`: `string`Expanded path within the volume from which the container's volume should be mounted. Behaves similarly to SubPath but environment variable references $(VAR_NAME) are expanded using the container's environment. Defaults to "" (volume's root). SubPathExpr and SubPath are mutually exclusive.



## [#](#io.k8s.api.core.v1.PodDNSConfig)PodDNSConfig

PodDNSConfig defines the DNS parameters of a pod in addition to those generated from DNSPolicy.

- `nameservers`: `[]string`A list of DNS name server IP addresses. This will be appended to the base nameservers generated from DNSPolicy. Duplicated nameservers will be removed.


- `options`: `[][PodDNSConfigOption](#io.k8s.api.core.v1.PodDNSConfigOption)`A list of DNS resolver options. This will be merged with the base options generated from DNSPolicy. Duplicated entries will be removed. Resolution options given in Options will override those that appear in the base DNSPolicy.


- `searches`: `[]string`A list of DNS search domains for host-name lookup. This will be appended to the base search paths generated from DNSPolicy. Duplicated search paths will be removed.



## [#](#io.k8s.api.core.v1.PodDNSConfigOption)PodDNSConfigOption

PodDNSConfigOption defines DNS resolver options of a pod.

- `name`: `string`Name is this DNS resolver option's name. Required.


- `value`: `string`Value is this DNS resolver option's value.



## [#](#io.k8s.api.core.v1.EphemeralContainer)EphemeralContainer

An EphemeralContainer is a temporary container that you may add to an existing Pod for user-initiated activities such as debugging. Ephemeral containers have no resource or scheduling guarantees, and they will not be restarted when they exit or when a Pod is removed or restarted. The kubelet may evict a Pod if an ephemeral container causes the Pod to exceed its resource allocation.


To add an ephemeral container, use the ephemeralcontainers subresource of an existing Pod. Ephemeral containers may not be removed or restarted.

- `args`: `[]string`Arguments to the entrypoint. The image's CMD is used if this is not provided. Variable references $(VAR_NAME) are expanded using the container's environment. If a variable cannot be resolved, the reference in the input string will be unchanged. Double $$ are reduced to a single $, which allows for escaping the $(VAR_NAME) syntax: i.e. "$$(VAR_NAME)" will produce the string literal "$(VAR_NAME)". Escaped references will never be expanded, regardless of whether the variable exists or not. Cannot be updated. More info: [https://kubernetes.io/docs/tasks/inject-data-application/define-command-argument-container/#running-a-command-in-a-shell](https://kubernetes.io/docs/tasks/inject-data-application/define-command-argument-container/#running-a-command-in-a-shell)


- `command`: `[]string`Entrypoint array. Not executed within a shell. The image's ENTRYPOINT is used if this is not provided. Variable references $(VAR_NAME) are expanded using the container's environment. If a variable cannot be resolved, the reference in the input string will be unchanged. Double $$ are reduced to a single $, which allows for escaping the $(VAR_NAME) syntax: i.e. "$$(VAR_NAME)" will produce the string literal "$(VAR_NAME)". Escaped references will never be expanded, regardless of whether the variable exists or not. Cannot be updated. More info: [https://kubernetes.io/docs/tasks/inject-data-application/define-command-argument-container/#running-a-command-in-a-shell](https://kubernetes.io/docs/tasks/inject-data-application/define-command-argument-container/#running-a-command-in-a-shell)


- `env`: `[][EnvVar](#io.k8s.api.core.v1.EnvVar)`List of environment variables to set in the container. Cannot be updated.


- `envFrom`: `[][EnvFromSource](#io.k8s.api.core.v1.EnvFromSource)`List of sources to populate environment variables in the container. The keys defined within a source must be a C_IDENTIFIER. All invalid keys will be reported as an event when the container is starting. When a key exists in multiple sources, the value associated with the last source will take precedence. Values defined by an Env with a duplicate key will take precedence. Cannot be updated.


- `image`: `string`Container image name. More info: [https://kubernetes.io/docs/concepts/containers/images](https://kubernetes.io/docs/concepts/containers/images)


- `imagePullPolicy`: `string`Image pull policy. One of Always, Never, IfNotPresent. Defaults to Always if :latest tag is specified, or IfNotPresent otherwise. Cannot be updated. More info: [https://kubernetes.io/docs/concepts/containers/images#updating-images](https://kubernetes.io/docs/concepts/containers/images#updating-images)


Possible enum values:



- `"Always"` means that kubelet always attempts to pull the latest image. Container will fail If the pull fails.

- `"IfNotPresent"` means that kubelet pulls if the image isn't present on disk. Container will fail if the image isn't present and the pull fails.

- `"Never"` means that kubelet never pulls an image, but only uses a local image. Container will fail if the image isn't present



- `lifecycle`: [Lifecycle](#io.k8s.api.core.v1.Lifecycle)Lifecycle describes actions that the management system should take in response to container lifecycle events. For the PostStart and PreStop lifecycle handlers, management of the container blocks until the action is complete, unless the container process fails, in which case the handler is aborted.


- `livenessProbe`: [Probe](#io.k8s.api.core.v1.Probe)Probe describes a health check to be performed against a container to determine whether it is alive or ready to receive traffic.


- `name`: `string`Name of the ephemeral container specified as a DNS_LABEL. This name must be unique among all containers, init containers and ephemeral containers.


- `ports`: `[][ContainerPort](#io.k8s.api.core.v1.ContainerPort)`Ports are not allowed for ephemeral containers.


- `readinessProbe`: [Probe](#io.k8s.api.core.v1.Probe)Probe describes a health check to be performed against a container to determine whether it is alive or ready to receive traffic.


- `resizePolicy`: `[][ContainerResizePolicy](#io.k8s.api.core.v1.ContainerResizePolicy)`Resources resize policy for the container.


- `resources`: [ResourceRequirements](#io.k8s.api.core.v1.ResourceRequirements)ResourceRequirements describes the compute resource requirements.


- `restartPolicy`: `string`Restart policy for the container to manage the restart behavior of each container within a pod. This may only be set for init containers. You cannot set this field on ephemeral containers.


- `securityContext`: [SecurityContext](#io.k8s.api.core.v1.SecurityContext)SecurityContext holds security configuration that will be applied to a container. Some fields are present in both SecurityContext and PodSecurityContext.  When both are set, the values in SecurityContext take precedence.


- `startupProbe`: [Probe](#io.k8s.api.core.v1.Probe)Probe describes a health check to be performed against a container to determine whether it is alive or ready to receive traffic.


- `stdin`: `boolean`Whether this container should allocate a buffer for stdin in the container runtime. If this is not set, reads from stdin in the container will always result in EOF. Default is false.


- `stdinOnce`: `boolean`Whether the container runtime should close the stdin channel after it has been opened by a single attach. When stdin is true the stdin stream will remain open across multiple attach sessions. If stdinOnce is set to true, stdin is opened on container start, is empty until the first client attaches to stdin, and then remains open and accepts data until the client disconnects, at which time stdin is closed and remains closed until the container is restarted. If this flag is false, a container processes that reads from stdin will never receive an EOF. Default is false


- `targetContainerName`: `string`If set, the name of the container from PodSpec that this ephemeral container targets. The ephemeral container will be run in the namespaces (IPC, PID, etc) of this container. If not set then the ephemeral container uses the namespaces configured in the Pod spec.


The container runtime must implement support for this feature. If the runtime does not support namespace targeting then the result of setting this field is undefined.


- `terminationMessagePath`: `string`Optional: Path at which the file to which the container's termination message will be written is mounted into the container's filesystem. Message written is intended to be brief final status, such as an assertion failure message. Will be truncated by the node if greater than 4096 bytes. The total message length across all containers will be limited to 12kb. Defaults to /dev/termination-log. Cannot be updated.


- `terminationMessagePolicy`: `string`Indicate how the termination message should be populated. File will use the contents of terminationMessagePath to populate the container status message on both success and failure. FallbackToLogsOnError will use the last chunk of container log output if the termination message file is empty and the container exited with an error. The log output is limited to 2048 bytes or 80 lines, whichever is smaller. Defaults to File. Cannot be updated.


Possible enum values:



- `"FallbackToLogsOnError"` will read the most recent contents of the container logs for the container status message when the container exits with an error and the terminationMessagePath has no contents.

- `"File"` is the default behavior and will set the container status message to the contents of the container's terminationMessagePath when the container exits.



- `tty`: `boolean`Whether this container should allocate a TTY for itself, also requires 'stdin' to be true. Default is false.


- `volumeDevices`: `[][VolumeDevice](#io.k8s.api.core.v1.VolumeDevice)`volumeDevices is the list of block devices to be used by the container.


- `volumeMounts`: `[][VolumeMount](#io.k8s.api.core.v1.VolumeMount)`Pod volumes to mount into the container's filesystem. Subpath mounts are not allowed for ephemeral containers. Cannot be updated.


- `workingDir`: `string`Container's working directory. If not specified, the container runtime's default will be used, which might be configured in the container image. Cannot be updated.



## [#](#io.k8s.api.core.v1.HostAlias)HostAlias

HostAlias holds the mapping between IP and hostnames that will be injected as an entry in the pod's hosts file.

- `hostnames`: `[]string`Hostnames for the above IP address.


- `ip`: `string`IP address of the host file entry.



## [#](#io.k8s.api.core.v1.LocalObjectReference)LocalObjectReference

LocalObjectReference contains enough information to let you locate the referenced object inside the same namespace.

- `name`: `string`Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names)



## [#](#io.k8s.api.core.v1.PodOS)PodOS

PodOS defines the OS parameters of a pod.

- `name`: `string`Name is the name of the operating system. The currently supported values are linux and windows. Additional value may be defined in future and can be one of: [https://github.com/opencontainers/runtime-spec/blob/master/config.md#platform-specific-configuration](https://github.com/opencontainers/runtime-spec/blob/master/config.md#platform-specific-configuration) Clients should expect to handle additional values and treat unrecognized values in this field as os: null



## [#](#io.k8s.api.core.v1.PodReadinessGate)PodReadinessGate

PodReadinessGate contains the reference to a pod condition

- `conditionType`: `string`ConditionType refers to a condition in the pod's condition list with matching type.



## [#](#io.k8s.api.core.v1.PodResourceClaim)PodResourceClaim

PodResourceClaim references exactly one ResourceClaim, either directly or by naming a ResourceClaimTemplate which is then turned into a ResourceClaim for the pod.


It adds a name to it that uniquely identifies the ResourceClaim inside the Pod. Containers that need access to the ResourceClaim reference it with this name.

- `name`: `string`Name uniquely identifies this resource claim inside the pod. This must be a DNS_LABEL.


- `resourceClaimName`: `string`ResourceClaimName is the name of a ResourceClaim object in the same namespace as this pod.


Exactly one of ResourceClaimName and ResourceClaimTemplateName must be set.


- `resourceClaimTemplateName`: `string`ResourceClaimTemplateName is the name of a ResourceClaimTemplate object in the same namespace as this pod.


The template will be used to create a new ResourceClaim, which will be bound to this pod. When this pod is deleted, the ResourceClaim will also be deleted. The pod name and resource name, along with a generated component, will be used to form a unique name for the ResourceClaim, which will be recorded in pod.status.resourceClaimStatuses.


This field is immutable and no changes will be made to the corresponding ResourceClaim by the control plane after creating the ResourceClaim.


Exactly one of ResourceClaimName and ResourceClaimTemplateName must be set.



## [#](#io.k8s.api.core.v1.PodSchedulingGate)PodSchedulingGate

PodSchedulingGate is associated to a Pod to guard its scheduling.

- `name`: `string`Name of the scheduling gate. Each scheduling gate must have a unique name field.



## [#](#io.k8s.api.core.v1.PodSecurityContext)PodSecurityContext

PodSecurityContext holds pod-level security attributes and common container settings. Some fields are also present in container.securityContext.  Field values of container.securityContext take precedence over field values of PodSecurityContext.

- `appArmorProfile`: [AppArmorProfile](#io.k8s.api.core.v1.AppArmorProfile)AppArmorProfile defines a pod or container's AppArmor settings.


- `fsGroup`: `integer`A special supplemental group that applies to all containers in a pod. Some volume types allow the Kubelet to change the ownership of that volume to be owned by the pod:



1. The owning GID will be the FSGroup 2. The setgid bit is set (new files created in the volume will be owned by FSGroup) 3. The permission bits are OR'd with rw-rw----



If unset, the Kubelet will not modify the ownership and permissions of any volume. Note that this field cannot be set when spec.os.name is windows.


- `fsGroupChangePolicy`: `string`fsGroupChangePolicy defines behavior of changing ownership and permission of the volume before being exposed inside Pod. This field will only apply to volume types which support fsGroup based ownership(and permissions). It will have no effect on ephemeral volume types such as: secret, configmaps and emptydir. Valid values are "OnRootMismatch" and "Always". If not specified, "Always" is used. Note that this field cannot be set when spec.os.name is windows.


Possible enum values:



- `"Always"` indicates that volume's ownership and permissions should always be changed whenever volume is mounted inside a Pod. This the default behavior.

- `"OnRootMismatch"` indicates that volume's ownership and permissions will be changed only when permission and ownership of root directory does not match with expected permissions on the volume. This can help shorten the time it takes to change ownership and permissions of a volume.



- `runAsGroup`: `integer`The GID to run the entrypoint of the container process. Uses runtime default if unset. May also be set in SecurityContext.  If set in both SecurityContext and PodSecurityContext, the value specified in SecurityContext takes precedence for that container. Note that this field cannot be set when spec.os.name is windows.


- `runAsNonRoot`: `boolean`Indicates that the container must run as a non-root user. If true, the Kubelet will validate the image at runtime to ensure that it does not run as UID 0 (root) and fail to start the container if it does. If unset or false, no such validation will be performed. May also be set in SecurityContext.  If set in both SecurityContext and PodSecurityContext, the value specified in SecurityContext takes precedence.


- `runAsUser`: `integer`The UID to run the entrypoint of the container process. Defaults to user specified in image metadata if unspecified. May also be set in SecurityContext.  If set in both SecurityContext and PodSecurityContext, the value specified in SecurityContext takes precedence for that container. Note that this field cannot be set when spec.os.name is windows.


- `seLinuxChangePolicy`: `string`seLinuxChangePolicy defines how the container's SELinux label is applied to all volumes used by the Pod. It has no effect on nodes that do not support SELinux or to volumes does not support SELinux. Valid values are "MountOption" and "Recursive".


"Recursive" means relabeling of all files on all Pod volumes by the container runtime. This may be slow for large volumes, but allows mixing privileged and unprivileged Pods sharing the same volume on the same node.


"MountOption" mounts all eligible Pod volumes with `-o context` mount option. This requires all Pods that share the same volume to use the same SELinux label. It is not possible to share the same volume among privileged and unprivileged Pods. Eligible volumes are in-tree FibreChannel and iSCSI volumes, and all CSI volumes whose CSI driver announces SELinux support by setting spec.seLinuxMount: true in their CSIDriver instance. Other volumes are always re-labelled recursively. "MountOption" value is allowed only when SELinuxMount feature gate is enabled.


If not specified and SELinuxMount feature gate is enabled, "MountOption" is used. If not specified and SELinuxMount feature gate is disabled, "MountOption" is used for ReadWriteOncePod volumes and "Recursive" for all other volumes.


This field affects only Pods that have SELinux label set, either in PodSecurityContext or in SecurityContext of all containers.


All Pods that use the same volume should use the same seLinuxChangePolicy, otherwise some pods can get stuck in ContainerCreating state. Note that this field cannot be set when spec.os.name is windows.


- `seLinuxOptions`: [SELinuxOptions](#io.k8s.api.core.v1.SELinuxOptions)SELinuxOptions are the labels to be applied to the container


- `seccompProfile`: [SeccompProfile](#io.k8s.api.core.v1.SeccompProfile)SeccompProfile defines a pod/container's seccomp profile settings. Only one profile source may be set.


- `supplementalGroups`: `[]integer`A list of groups applied to the first process run in each container, in addition to the container's primary GID and fsGroup (if specified).  If the SupplementalGroupsPolicy feature is enabled, the supplementalGroupsPolicy field determines whether these are in addition to or instead of any group memberships defined in the container image. If unspecified, no additional groups are added, though group memberships defined in the container image may still be used, depending on the supplementalGroupsPolicy field. Note that this field cannot be set when spec.os.name is windows.


- `supplementalGroupsPolicy`: `string`Defines how supplemental groups of the first container processes are calculated. Valid values are "Merge" and "Strict". If not specified, "Merge" is used. (Alpha) Using the field requires the SupplementalGroupsPolicy feature gate to be enabled and the container runtime must implement support for this feature. Note that this field cannot be set when spec.os.name is windows.


Possible enum values:



- `"Merge"` means that the container's provided SupplementalGroups and FsGroup (specified in SecurityContext) will be merged with the primary user's groups as defined in the container image (in /etc/group).

- `"Strict"` means that the container's provided SupplementalGroups and FsGroup (specified in SecurityContext) will be used instead of any groups defined in the container image.



- `sysctls`: `[][Sysctl](#io.k8s.api.core.v1.Sysctl)`Sysctls hold a list of namespaced sysctls used for the pod. Pods with unsupported sysctls (by the container runtime) might fail to launch. Note that this field cannot be set when spec.os.name is windows.


- `windowsOptions`: [WindowsSecurityContextOptions](#io.k8s.api.core.v1.WindowsSecurityContextOptions)WindowsSecurityContextOptions contain Windows-specific options and credentials.



## [#](#io.k8s.api.core.v1.Sysctl)Sysctl

Sysctl defines a kernel parameter to be set

- `name`: `string`Name of a property to set


- `value`: `string`Value of a property to set



## [#](#io.k8s.api.core.v1.Toleration)Toleration

The pod this Toleration is attached to tolerates any taint that matches the triple <key,value,effect> using the matching operator .

- `effect`: `string`Effect indicates the taint effect to match. Empty means match all taint effects. When specified, allowed values are NoSchedule, PreferNoSchedule and NoExecute.


Possible enum values:



- `"NoExecute"` Evict any already-running pods that do not tolerate the taint. Currently enforced by NodeController.

- `"NoSchedule"` Do not allow new pods to schedule onto the node unless they tolerate the taint, but allow all pods submitted to Kubelet without going through the scheduler to start, and allow all already-running pods to continue running. Enforced by the scheduler.

- `"PreferNoSchedule"` Like TaintEffectNoSchedule, but the scheduler tries not to schedule new pods onto the node, rather than prohibiting new pods from scheduling onto the node entirely. Enforced by the scheduler.



- `key`: `string`Key is the taint key that the toleration applies to. Empty means match all taint keys. If the key is empty, operator must be Exists; this combination means to match all values and all keys.


- `operator`: `string`Operator represents a key's relationship to the value. Valid operators are Exists and Equal. Defaults to Equal. Exists is equivalent to wildcard for value, so that a pod can tolerate all taints of a particular category.


Possible enum values:



- `"Equal"`

- `"Exists"`



- `tolerationSeconds`: `integer`TolerationSeconds represents the period of time the toleration (which must be of effect NoExecute, otherwise this field is ignored) tolerates the taint. By default, it is not set, which means tolerate the taint forever (do not evict). Zero and negative values will be treated as 0 (evict immediately) by the system.


- `value`: `string`Value is the taint value the toleration matches to. If the operator is Exists, the value should be empty, otherwise just a regular string.



## [#](#io.k8s.api.core.v1.TopologySpreadConstraint)TopologySpreadConstraint

TopologySpreadConstraint specifies how to spread matching pods among the given topology.

- `labelSelector`: [LabelSelector](https://kubernetes.io/docs/reference/kubernetes-api/common-definitions/label-selector/)A label selector is a label query over a set of resources. The result of matchLabels and matchExpressions are ANDed. An empty label selector matches all objects. A null label selector matches no objects.


- `matchLabelKeys`: `[]string`MatchLabelKeys is a set of pod label keys to select the pods over which spreading will be calculated. The keys are used to lookup values from the incoming pod labels, those key-value labels are ANDed with labelSelector to select the group of existing pods over which spreading will be calculated for the incoming pod. The same key is forbidden to exist in both MatchLabelKeys and LabelSelector. MatchLabelKeys cannot be set when LabelSelector isn't set. Keys that don't exist in the incoming pod labels will be ignored. A null or empty list means only match against labelSelector.


This is a beta field and requires the MatchLabelKeysInPodTopologySpread feature gate to be enabled (enabled by default).


- `maxSkew`: `integer`MaxSkew describes the degree to which pods may be unevenly distributed. When `whenUnsatisfiable=DoNotSchedule`, it is the maximum permitted difference between the number of matching pods in the target topology and the global minimum. The global minimum is the minimum number of matching pods in an eligible domain or zero if the number of eligible domains is less than MinDomains. For example, in a 3-zone cluster, MaxSkew is set to 1, and pods with the same labelSelector spread as 2/2/1: In this case, the global minimum is 1. | zone1 | zone2 | zone3 | |  P P  |  P P  |   P   | - if MaxSkew is 1, incoming pod can only be scheduled to zone3 to become 2/2/2; scheduling it onto zone1(zone2) would make the ActualSkew(3-1) on zone1(zone2) violate MaxSkew(1). - if MaxSkew is 2, incoming pod can be scheduled onto any zone. When `whenUnsatisfiable=ScheduleAnyway`, it is used to give higher precedence to topologies that satisfy it. It's a required field. Default value is 1 and 0 is not allowed.


- `minDomains`: `integer`MinDomains indicates a minimum number of eligible domains. When the number of eligible domains with matching topology keys is less than minDomains, Pod Topology Spread treats "global minimum" as 0, and then the calculation of Skew is performed. And when the number of eligible domains with matching topology keys equals or greater than minDomains, this value has no effect on scheduling. As a result, when the number of eligible domains is less than minDomains, scheduler won't schedule more than maxSkew Pods to those domains. If value is nil, the constraint behaves as if MinDomains is equal to 1. Valid values are integers greater than 0. When value is not nil, WhenUnsatisfiable must be DoNotSchedule.


For example, in a 3-zone cluster, MaxSkew is set to 2, MinDomains is set to 5 and pods with the same labelSelector spread as 2/2/2: | zone1 | zone2 | zone3 | |  P P  |  P P  |  P P  | The number of domains is less than 5(MinDomains), so "global minimum" is treated as 0. In this situation, new pod with the same labelSelector cannot be scheduled, because computed skew will be 3(3 - 0) if new Pod is scheduled to any of the three zones, it will violate MaxSkew.


- `nodeAffinityPolicy`: `string`NodeAffinityPolicy indicates how we will treat Pod's nodeAffinity/nodeSelector when calculating pod topology spread skew. Options are: - Honor: only nodes matching nodeAffinity/nodeSelector are included in the calculations. - Ignore: nodeAffinity/nodeSelector are ignored. All nodes are included in the calculations.


If this value is nil, the behavior is equivalent to the Honor policy. This is a beta-level feature default enabled by the NodeInclusionPolicyInPodTopologySpread feature flag.


Possible enum values:



- `"Honor"` means use this scheduling directive when calculating pod topology spread skew.

- `"Ignore"` means ignore this scheduling directive when calculating pod topology spread skew.



- `nodeTaintsPolicy`: `string`NodeTaintsPolicy indicates how we will treat node taints when calculating pod topology spread skew. Options are: - Honor: nodes without taints, along with tainted nodes for which the incoming pod has a toleration, are included. - Ignore: node taints are ignored. All nodes are included.


If this value is nil, the behavior is equivalent to the Ignore policy. This is a beta-level feature default enabled by the NodeInclusionPolicyInPodTopologySpread feature flag.


Possible enum values:



- `"Honor"` means use this scheduling directive when calculating pod topology spread skew.

- `"Ignore"` means ignore this scheduling directive when calculating pod topology spread skew.



- `topologyKey`: `string`TopologyKey is the key of node labels. Nodes that have a label with this key and identical values are considered to be in the same topology. We consider each <key, value> as a "bucket", and try to put balanced number of pods into each bucket. We define a domain as a particular instance of a topology. Also, we define an eligible domain as a domain whose nodes meet the requirements of nodeAffinityPolicy and nodeTaintsPolicy. e.g. If TopologyKey is "kubernetes.io/hostname", each Node is a domain of that topology. And, if TopologyKey is "topology.kubernetes.io/zone", each zone is a domain of that topology. It's a required field.


- `whenUnsatisfiable`: `string`WhenUnsatisfiable indicates how to deal with a pod if it doesn't satisfy the spread constraint. - DoNotSchedule (default) tells the scheduler not to schedule it. - ScheduleAnyway tells the scheduler to schedule the pod in any location,
but giving higher precedence to topologies that would help reduce the
skew.
A constraint is considered "Unsatisfiable" for an incoming pod if and only if every possible node assignment for that pod would violate "MaxSkew" on some topology. For example, in a 3-zone cluster, MaxSkew is set to 1, and pods with the same labelSelector spread as 3/1/1: | zone1 | zone2 | zone3 | | P P P |   P   |   P   | If WhenUnsatisfiable is set to DoNotSchedule, incoming pod can only be scheduled to zone2(zone3) to become 3/2/1(3/1/2) as ActualSkew(2-1) on zone2(zone3) satisfies MaxSkew(1). In other words, the cluster can still be imbalanced, but scheduler won't make it *more* imbalanced. It's a required field.


Possible enum values:



- `"DoNotSchedule"` instructs the scheduler not to schedule the pod when constraints are not satisfied.

- `"ScheduleAnyway"` instructs the scheduler to schedule the pod even if constraints are not satisfied.




## [#](#io.k8s.api.core.v1.Volume)Volume

Volume represents a named volume in a pod that may be accessed by any container in the pod.

- `awsElasticBlockStore`: [AWSElasticBlockStoreVolumeSource](#io.k8s.api.core.v1.AWSElasticBlockStoreVolumeSource)Represents a Persistent Disk resource in AWS.


An AWS EBS disk must exist before mounting to a container. The disk must also be in the same AWS zone as the kubelet. An AWS EBS disk can only be mounted as read/write once. AWS EBS volumes support ownership management and SELinux relabeling.


- `azureDisk`: [AzureDiskVolumeSource](#io.k8s.api.core.v1.AzureDiskVolumeSource)AzureDisk represents an Azure Data Disk mount on the host and bind mount to the pod.


- `azureFile`: [AzureFileVolumeSource](#io.k8s.api.core.v1.AzureFileVolumeSource)AzureFile represents an Azure File Service mount on the host and bind mount to the pod.


- `cephfs`: [CephFSVolumeSource](#io.k8s.api.core.v1.CephFSVolumeSource)Represents a Ceph Filesystem mount that lasts the lifetime of a pod Cephfs volumes do not support ownership management or SELinux relabeling.


- `cinder`: [CinderVolumeSource](#io.k8s.api.core.v1.CinderVolumeSource)Represents a cinder volume resource in Openstack. A Cinder volume must exist before mounting to a container. The volume must also be in the same region as the kubelet. Cinder volumes support ownership management and SELinux relabeling.


- `configMap`: [ConfigMapVolumeSource](#io.k8s.api.core.v1.ConfigMapVolumeSource)Adapts a ConfigMap into a volume.


The contents of the target ConfigMap's Data field will be presented in a volume as files using the keys in the Data field as the file names, unless the items element is populated with specific mappings of keys to paths. ConfigMap volumes support ownership management and SELinux relabeling.


- `csi`: [CSIVolumeSource](#io.k8s.api.core.v1.CSIVolumeSource)Represents a source location of a volume to mount, managed by an external CSI driver


- `downwardAPI`: [DownwardAPIVolumeSource](#io.k8s.api.core.v1.DownwardAPIVolumeSource)DownwardAPIVolumeSource represents a volume containing downward API info. Downward API volumes support ownership management and SELinux relabeling.


- `emptyDir`: [EmptyDirVolumeSource](#io.k8s.api.core.v1.EmptyDirVolumeSource)Represents an empty directory for a pod. Empty directory volumes support ownership management and SELinux relabeling.


- `ephemeral`: [EphemeralVolumeSource](#io.k8s.api.core.v1.EphemeralVolumeSource)Represents an ephemeral volume that is handled by a normal storage driver.


- `fc`: [FCVolumeSource](#io.k8s.api.core.v1.FCVolumeSource)Represents a Fibre Channel volume. Fibre Channel volumes can only be mounted as read/write once. Fibre Channel volumes support ownership management and SELinux relabeling.


- `flexVolume`: [FlexVolumeSource](#io.k8s.api.core.v1.FlexVolumeSource)FlexVolume represents a generic volume resource that is provisioned/attached using an exec based plugin.


- `flocker`: [FlockerVolumeSource](#io.k8s.api.core.v1.FlockerVolumeSource)Represents a Flocker volume mounted by the Flocker agent. One and only one of datasetName and datasetUUID should be set. Flocker volumes do not support ownership management or SELinux relabeling.


- `gcePersistentDisk`: [GCEPersistentDiskVolumeSource](#io.k8s.api.core.v1.GCEPersistentDiskVolumeSource)Represents a Persistent Disk resource in Google Compute Engine.


A GCE PD must exist before mounting to a container. The disk must also be in the same GCE project and zone as the kubelet. A GCE PD can only be mounted as read/write once or read-only many times. GCE PDs support ownership management and SELinux relabeling.


- `gitRepo`: [GitRepoVolumeSource](#io.k8s.api.core.v1.GitRepoVolumeSource)Represents a volume that is populated with the contents of a git repository. Git repo volumes do not support ownership management. Git repo volumes support SELinux relabeling.


DEPRECATED: GitRepo is deprecated. To provision a container with a git repo, mount an EmptyDir into an InitContainer that clones the repo using git, then mount the EmptyDir into the Pod's container.


- `glusterfs`: [GlusterfsVolumeSource](#io.k8s.api.core.v1.GlusterfsVolumeSource)Represents a Glusterfs mount that lasts the lifetime of a pod. Glusterfs volumes do not support ownership management or SELinux relabeling.


- `hostPath`: [HostPathVolumeSource](#io.k8s.api.core.v1.HostPathVolumeSource)Represents a host path mapped into a pod. Host path volumes do not support ownership management or SELinux relabeling.


- `image`: [ImageVolumeSource](#io.k8s.api.core.v1.ImageVolumeSource)ImageVolumeSource represents a image volume resource.


- `iscsi`: [ISCSIVolumeSource](#io.k8s.api.core.v1.ISCSIVolumeSource)Represents an ISCSI disk. ISCSI volumes can only be mounted as read/write once. ISCSI volumes support ownership management and SELinux relabeling.


- `name`: `string`name of the volume. Must be a DNS_LABEL and unique within the pod. More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names)


- `nfs`: [NFSVolumeSource](#io.k8s.api.core.v1.NFSVolumeSource)Represents an NFS mount that lasts the lifetime of a pod. NFS volumes do not support ownership management or SELinux relabeling.


- `persistentVolumeClaim`: [PersistentVolumeClaimVolumeSource](#io.k8s.api.core.v1.PersistentVolumeClaimVolumeSource)PersistentVolumeClaimVolumeSource references the user's PVC in the same namespace. This volume finds the bound PV and mounts that volume for the pod. A PersistentVolumeClaimVolumeSource is, essentially, a wrapper around another type of volume that is owned by someone else (the system).


- `photonPersistentDisk`: [PhotonPersistentDiskVolumeSource](#io.k8s.api.core.v1.PhotonPersistentDiskVolumeSource)Represents a Photon Controller persistent disk resource.


- `portworxVolume`: [PortworxVolumeSource](#io.k8s.api.core.v1.PortworxVolumeSource)PortworxVolumeSource represents a Portworx volume resource.


- `projected`: [ProjectedVolumeSource](#io.k8s.api.core.v1.ProjectedVolumeSource)Represents a projected volume source


- `quobyte`: [QuobyteVolumeSource](#io.k8s.api.core.v1.QuobyteVolumeSource)Represents a Quobyte mount that lasts the lifetime of a pod. Quobyte volumes do not support ownership management or SELinux relabeling.


- `rbd`: [RBDVolumeSource](#io.k8s.api.core.v1.RBDVolumeSource)Represents a Rados Block Device mount that lasts the lifetime of a pod. RBD volumes support ownership management and SELinux relabeling.


- `scaleIO`: [ScaleIOVolumeSource](#io.k8s.api.core.v1.ScaleIOVolumeSource)ScaleIOVolumeSource represents a persistent ScaleIO volume


- `secret`: [SecretVolumeSource](#io.k8s.api.core.v1.SecretVolumeSource)Adapts a Secret into a volume.


The contents of the target Secret's Data field will be presented in a volume as files using the keys in the Data field as the file names. Secret volumes support ownership management and SELinux relabeling.


- `storageos`: [StorageOSVolumeSource](#io.k8s.api.core.v1.StorageOSVolumeSource)Represents a StorageOS persistent volume resource.


- `vsphereVolume`: [VsphereVirtualDiskVolumeSource](#io.k8s.api.core.v1.VsphereVirtualDiskVolumeSource)Represents a vSphere volume resource.



## [#](#io.k8s.api.core.v1.AWSElasticBlockStoreVolumeSource)AWSElasticBlockStoreVolumeSource

Represents a Persistent Disk resource in AWS.


An AWS EBS disk must exist before mounting to a container. The disk must also be in the same AWS zone as the kubelet. An AWS EBS disk can only be mounted as read/write once. AWS EBS volumes support ownership management and SELinux relabeling.

- `fsType`: `string`fsType is the filesystem type of the volume that you want to mount. Tip: Ensure that the filesystem type is supported by the host operating system. Examples: "ext4", "xfs", "ntfs". Implicitly inferred to be "ext4" if unspecified. More info: [https://kubernetes.io/docs/concepts/storage/volumes#awselasticblockstore](https://kubernetes.io/docs/concepts/storage/volumes#awselasticblockstore)


- `partition`: `integer`partition is the partition in the volume that you want to mount. If omitted, the default is to mount by volume name. Examples: For volume /dev/sda1, you specify the partition as "1". Similarly, the volume partition for /dev/sda is "0" (or you can leave the property empty).


- `readOnly`: `boolean`readOnly value true will force the readOnly setting in VolumeMounts. More info: [https://kubernetes.io/docs/concepts/storage/volumes#awselasticblockstore](https://kubernetes.io/docs/concepts/storage/volumes#awselasticblockstore)


- `volumeID`: `string`volumeID is unique ID of the persistent disk resource in AWS (Amazon EBS volume). More info: [https://kubernetes.io/docs/concepts/storage/volumes#awselasticblockstore](https://kubernetes.io/docs/concepts/storage/volumes#awselasticblockstore)



## [#](#io.k8s.api.core.v1.AzureDiskVolumeSource)AzureDiskVolumeSource

AzureDisk represents an Azure Data Disk mount on the host and bind mount to the pod.

- `cachingMode`: `string`cachingMode is the Host Caching mode: None, Read Only, Read Write.


Possible enum values:



- `"None"`

- `"ReadOnly"`

- `"ReadWrite"`



- `diskName`: `string`diskName is the Name of the data disk in the blob storage


- `diskURI`: `string`diskURI is the URI of data disk in the blob storage


- `fsType`: `string`fsType is Filesystem type to mount. Must be a filesystem type supported by the host operating system. Ex. "ext4", "xfs", "ntfs". Implicitly inferred to be "ext4" if unspecified.


- `kind`: `string`kind expected values are Shared: multiple blob disks per storage account  Dedicated: single blob disk per storage account  Managed: azure managed data disk (only in managed availability set). defaults to shared


Possible enum values:



- `"Dedicated"`

- `"Managed"`

- `"Shared"`



- `readOnly`: `boolean`readOnly Defaults to false (read/write). ReadOnly here will force the ReadOnly setting in VolumeMounts.



## [#](#io.k8s.api.core.v1.AzureFileVolumeSource)AzureFileVolumeSource

AzureFile represents an Azure File Service mount on the host and bind mount to the pod.

- `readOnly`: `boolean`readOnly defaults to false (read/write). ReadOnly here will force the ReadOnly setting in VolumeMounts.


- `secretName`: `string`secretName is the  name of secret that contains Azure Storage Account Name and Key


- `shareName`: `string`shareName is the azure share Name



## [#](#io.k8s.api.core.v1.CephFSVolumeSource)CephFSVolumeSource

Represents a Ceph Filesystem mount that lasts the lifetime of a pod Cephfs volumes do not support ownership management or SELinux relabeling.

- `monitors`: `[]string`monitors is Required: Monitors is a collection of Ceph monitors More info: [https://examples.k8s.io/volumes/cephfs/README.md#how-to-use-it](https://examples.k8s.io/volumes/cephfs/README.md#how-to-use-it)


- `path`: `string`path is Optional: Used as the mounted root, rather than the full Ceph tree, default is /


- `readOnly`: `boolean`readOnly is Optional: Defaults to false (read/write). ReadOnly here will force the ReadOnly setting in VolumeMounts. More info: [https://examples.k8s.io/volumes/cephfs/README.md#how-to-use-it](https://examples.k8s.io/volumes/cephfs/README.md#how-to-use-it)


- `secretFile`: `string`secretFile is Optional: SecretFile is the path to key ring for User, default is /etc/ceph/user.secret More info: [https://examples.k8s.io/volumes/cephfs/README.md#how-to-use-it](https://examples.k8s.io/volumes/cephfs/README.md#how-to-use-it)


- `secretRef`: [LocalObjectReference](#io.k8s.api.core.v1.LocalObjectReference)LocalObjectReference contains enough information to let you locate the referenced object inside the same namespace.


- `user`: `string`user is optional: User is the rados user name, default is admin More info: [https://examples.k8s.io/volumes/cephfs/README.md#how-to-use-it](https://examples.k8s.io/volumes/cephfs/README.md#how-to-use-it)



## [#](#io.k8s.api.core.v1.CinderVolumeSource)CinderVolumeSource

Represents a cinder volume resource in Openstack. A Cinder volume must exist before mounting to a container. The volume must also be in the same region as the kubelet. Cinder volumes support ownership management and SELinux relabeling.

- `fsType`: `string`fsType is the filesystem type to mount. Must be a filesystem type supported by the host operating system. Examples: "ext4", "xfs", "ntfs". Implicitly inferred to be "ext4" if unspecified. More info: [https://examples.k8s.io/mysql-cinder-pd/README.md](https://examples.k8s.io/mysql-cinder-pd/README.md)


- `readOnly`: `boolean`readOnly defaults to false (read/write). ReadOnly here will force the ReadOnly setting in VolumeMounts. More info: [https://examples.k8s.io/mysql-cinder-pd/README.md](https://examples.k8s.io/mysql-cinder-pd/README.md)


- `secretRef`: [LocalObjectReference](#io.k8s.api.core.v1.LocalObjectReference)LocalObjectReference contains enough information to let you locate the referenced object inside the same namespace.


- `volumeID`: `string`volumeID used to identify the volume in cinder. More info: [https://examples.k8s.io/mysql-cinder-pd/README.md](https://examples.k8s.io/mysql-cinder-pd/README.md)



## [#](#io.k8s.api.core.v1.ConfigMapVolumeSource)ConfigMapVolumeSource

Adapts a ConfigMap into a volume.


The contents of the target ConfigMap's Data field will be presented in a volume as files using the keys in the Data field as the file names, unless the items element is populated with specific mappings of keys to paths. ConfigMap volumes support ownership management and SELinux relabeling.

- `defaultMode`: `integer`defaultMode is optional: mode bits used to set permissions on created files by default. Must be an octal value between 0000 and 0777 or a decimal value between 0 and 511. YAML accepts both octal and decimal values, JSON requires decimal values for mode bits. Defaults to 0644. Directories within the path are not affected by this setting. This might be in conflict with other options that affect the file mode, like fsGroup, and the result can be other mode bits set.


- `items`: `[][KeyToPath](#io.k8s.api.core.v1.KeyToPath)`items if unspecified, each key-value pair in the Data field of the referenced ConfigMap will be projected into the volume as a file whose name is the key and content is the value. If specified, the listed keys will be projected into the specified paths, and unlisted keys will not be present. If a key is specified which is not present in the ConfigMap, the volume setup will error unless it is marked optional. Paths must be relative and may not contain the '..' path or start with '..'.


- `name`: `string`Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names)


- `optional`: `boolean`optional specify whether the ConfigMap or its keys must be defined



## [#](#io.k8s.api.core.v1.KeyToPath)KeyToPath

Maps a string key to a path within a volume.

- `key`: `string`key is the key to project.


- `mode`: `integer`mode is Optional: mode bits used to set permissions on this file. Must be an octal value between 0000 and 0777 or a decimal value between 0 and 511. YAML accepts both octal and decimal values, JSON requires decimal values for mode bits. If not specified, the volume defaultMode will be used. This might be in conflict with other options that affect the file mode, like fsGroup, and the result can be other mode bits set.


- `path`: `string`path is the relative path of the file to map the key to. May not be an absolute path. May not contain the path element '..'. May not start with the string '..'.



## [#](#io.k8s.api.core.v1.CSIVolumeSource)CSIVolumeSource

Represents a source location of a volume to mount, managed by an external CSI driver

- `driver`: `string`driver is the name of the CSI driver that handles this volume. Consult with your admin for the correct name as registered in the cluster.


- `fsType`: `string`fsType to mount. Ex. "ext4", "xfs", "ntfs". If not provided, the empty value is passed to the associated CSI driver which will determine the default filesystem to apply.


- `nodePublishSecretRef`: [LocalObjectReference](#io.k8s.api.core.v1.LocalObjectReference)LocalObjectReference contains enough information to let you locate the referenced object inside the same namespace.


- `readOnly`: `boolean`readOnly specifies a read-only configuration for the volume. Defaults to false (read/write).


- `volumeAttributes`: `map[string]string`volumeAttributes stores driver-specific properties that are passed to the CSI driver. Consult your driver's documentation for supported values.



## [#](#io.k8s.api.core.v1.DownwardAPIVolumeSource)DownwardAPIVolumeSource

DownwardAPIVolumeSource represents a volume containing downward API info. Downward API volumes support ownership management and SELinux relabeling.

- `defaultMode`: `integer`Optional: mode bits to use on created files by default. Must be a Optional: mode bits used to set permissions on created files by default. Must be an octal value between 0000 and 0777 or a decimal value between 0 and 511. YAML accepts both octal and decimal values, JSON requires decimal values for mode bits. Defaults to 0644. Directories within the path are not affected by this setting. This might be in conflict with other options that affect the file mode, like fsGroup, and the result can be other mode bits set.


- `items`: `[][DownwardAPIVolumeFile](#io.k8s.api.core.v1.DownwardAPIVolumeFile)`Items is a list of downward API volume file



## [#](#io.k8s.api.core.v1.DownwardAPIVolumeFile)DownwardAPIVolumeFile

DownwardAPIVolumeFile represents information to create the file containing the pod field

- `fieldRef`: [ObjectFieldSelector](https://kubernetes.io/docs/reference/kubernetes-api/common-definitions/object-field-selector/)ObjectFieldSelector selects an APIVersioned field of an object.


- `mode`: `integer`Optional: mode bits used to set permissions on this file, must be an octal value between 0000 and 0777 or a decimal value between 0 and 511. YAML accepts both octal and decimal values, JSON requires decimal values for mode bits. If not specified, the volume defaultMode will be used. This might be in conflict with other options that affect the file mode, like fsGroup, and the result can be other mode bits set.


- `path`: `string`Required: Path is  the relative path name of the file to be created. Must not be absolute or contain the '..' path. Must be utf-8 encoded. The first item of the relative path must not start with '..'


- `resourceFieldRef`: [ResourceFieldSelector](#io.k8s.api.core.v1.ResourceFieldSelector)ResourceFieldSelector represents container resources (cpu, memory) and their output format



## [#](#io.k8s.api.core.v1.EmptyDirVolumeSource)EmptyDirVolumeSource

Represents an empty directory for a pod. Empty directory volumes support ownership management and SELinux relabeling.

- `medium`: `string`medium represents what type of storage medium should back this directory. The default is "" which means to use the node's default medium. Must be an empty string (default) or Memory. More info: [https://kubernetes.io/docs/concepts/storage/volumes#emptydir](https://kubernetes.io/docs/concepts/storage/volumes#emptydir)


- `sizeLimit`: [Quantity](#io.k8s.apimachinery.pkg.api.resource.Quantity)Quantity is a fixed-point representation of a number. It provides convenient marshaling/unmarshaling in JSON and YAML, in addition to String() and AsInt64() accessors.


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

````


## [#](#io.k8s.api.core.v1.EphemeralVolumeSource)EphemeralVolumeSource

Represents an ephemeral volume that is handled by a normal storage driver.

- `volumeClaimTemplate`: [PersistentVolumeClaimTemplate](#io.k8s.api.core.v1.PersistentVolumeClaimTemplate)PersistentVolumeClaimTemplate is used to produce PersistentVolumeClaim objects as part of an EphemeralVolumeSource.



## [#](#io.k8s.api.core.v1.PersistentVolumeClaimTemplate)PersistentVolumeClaimTemplate

PersistentVolumeClaimTemplate is used to produce PersistentVolumeClaim objects as part of an EphemeralVolumeSource.

- `metadata`: [ObjectMeta](https://kubernetes.io/docs/reference/kubernetes-api/common-definitions/object-meta/)ObjectMeta is metadata that all persisted resources must have, which includes all objects users must create.


- `spec`: [PersistentVolumeClaimSpec](#io.k8s.api.core.v1.PersistentVolumeClaimSpec)PersistentVolumeClaimSpec describes the common attributes of storage devices and allows a Source for provider-specific attributes



## [#](#io.k8s.api.core.v1.PersistentVolumeClaimSpec)PersistentVolumeClaimSpec

PersistentVolumeClaimSpec describes the common attributes of storage devices and allows a Source for provider-specific attributes

- `accessModes`: `[]string`accessModes contains the desired access modes the volume should have. More info: [https://kubernetes.io/docs/concepts/storage/persistent-volumes#access-modes-1](https://kubernetes.io/docs/concepts/storage/persistent-volumes#access-modes-1)


- `dataSource`: [TypedLocalObjectReference](#io.k8s.api.core.v1.TypedLocalObjectReference)TypedLocalObjectReference contains enough information to let you locate the typed referenced object inside the same namespace.


- `dataSourceRef`: [TypedObjectReference](#io.k8s.api.core.v1.TypedObjectReference)TypedObjectReference contains enough information to let you locate the typed referenced object


- `resources`: [VolumeResourceRequirements](#io.k8s.api.core.v1.VolumeResourceRequirements)VolumeResourceRequirements describes the storage resource requirements for a volume.


- `selector`: [LabelSelector](https://kubernetes.io/docs/reference/kubernetes-api/common-definitions/label-selector/)A label selector is a label query over a set of resources. The result of matchLabels and matchExpressions are ANDed. An empty label selector matches all objects. A null label selector matches no objects.


- `storageClassName`: `string`storageClassName is the name of the StorageClass required by the claim. More info: [https://kubernetes.io/docs/concepts/storage/persistent-volumes#class-1](https://kubernetes.io/docs/concepts/storage/persistent-volumes#class-1)


- `volumeAttributesClassName`: `string`volumeAttributesClassName may be used to set the VolumeAttributesClass used by this claim. If specified, the CSI driver will create or update the volume with the attributes defined in the corresponding VolumeAttributesClass. This has a different purpose than storageClassName, it can be changed after the claim is created. An empty string value means that no VolumeAttributesClass will be applied to the claim but it's not allowed to reset this field to empty string once it is set. If unspecified and the PersistentVolumeClaim is unbound, the default VolumeAttributesClass will be set by the persistentvolume controller if it exists. If the resource referred to by volumeAttributesClass does not exist, this PersistentVolumeClaim will be set to a Pending state, as reflected by the modifyVolumeStatus field, until such as a resource exists. More info: [https://kubernetes.io/docs/concepts/storage/volume-attributes-classes/](https://kubernetes.io/docs/concepts/storage/volume-attributes-classes/) (Beta) Using this field requires the VolumeAttributesClass feature gate to be enabled (off by default).


- `volumeMode`: `string`volumeMode defines what type of volume is required by the claim. Value of Filesystem is implied when not included in claim spec.


Possible enum values:



- `"Block"` means the volume will not be formatted with a filesystem and will remain a raw block device.

- `"Filesystem"` means the volume will be or is formatted with a filesystem.



- `volumeName`: `string`volumeName is the binding reference to the PersistentVolume backing this claim.



## [#](#io.k8s.api.core.v1.TypedLocalObjectReference)TypedLocalObjectReference

TypedLocalObjectReference contains enough information to let you locate the typed referenced object inside the same namespace.

- `apiGroup`: `string`APIGroup is the group for the resource being referenced. If APIGroup is not specified, the specified Kind must be in the core API group. For any other third-party types, APIGroup is required.


- `kind`: `string`Kind is the type of resource being referenced


- `name`: `string`Name is the name of resource being referenced



## [#](#io.k8s.api.core.v1.TypedObjectReference)TypedObjectReference

TypedObjectReference contains enough information to let you locate the typed referenced object

- `apiGroup`: `string`APIGroup is the group for the resource being referenced. If APIGroup is not specified, the specified Kind must be in the core API group. For any other third-party types, APIGroup is required.


- `kind`: `string`Kind is the type of resource being referenced


- `name`: `string`Name is the name of resource being referenced


- `namespace`: `string`Namespace is the namespace of resource being referenced Note that when a namespace is specified, a gateway.networking.k8s.io/ReferenceGrant object is required in the referent namespace to allow that namespace's owner to accept the reference. See the ReferenceGrant documentation for details. (Alpha) This field requires the CrossNamespaceVolumeDataSource feature gate to be enabled.



## [#](#io.k8s.api.core.v1.VolumeResourceRequirements)VolumeResourceRequirements

VolumeResourceRequirements describes the storage resource requirements for a volume.

- `limits`: `map[string][Quantity](#io.k8s.apimachinery.pkg.api.resource.Quantity)`Limits describes the maximum amount of compute resources allowed. More info: [https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/)


- `requests`: `map[string][Quantity](#io.k8s.apimachinery.pkg.api.resource.Quantity)`Requests describes the minimum amount of compute resources required. If Requests is omitted for a container, it defaults to Limits if that is explicitly specified, otherwise to an implementation-defined value. Requests cannot exceed Limits. More info: [https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/)



## [#](#io.k8s.api.core.v1.FCVolumeSource)FCVolumeSource

Represents a Fibre Channel volume. Fibre Channel volumes can only be mounted as read/write once. Fibre Channel volumes support ownership management and SELinux relabeling.

- `fsType`: `string`fsType is the filesystem type to mount. Must be a filesystem type supported by the host operating system. Ex. "ext4", "xfs", "ntfs". Implicitly inferred to be "ext4" if unspecified.


- `lun`: `integer`lun is Optional: FC target lun number


- `readOnly`: `boolean`readOnly is Optional: Defaults to false (read/write). ReadOnly here will force the ReadOnly setting in VolumeMounts.


- `targetWWNs`: `[]string`targetWWNs is Optional: FC target worldwide names (WWNs)


- `wwids`: `[]string`wwids Optional: FC volume world wide identifiers (wwids) Either wwids or combination of targetWWNs and lun must be set, but not both simultaneously.



## [#](#io.k8s.api.core.v1.FlexVolumeSource)FlexVolumeSource

FlexVolume represents a generic volume resource that is provisioned/attached using an exec based plugin.

- `driver`: `string`driver is the name of the driver to use for this volume.


- `fsType`: `string`fsType is the filesystem type to mount. Must be a filesystem type supported by the host operating system. Ex. "ext4", "xfs", "ntfs". The default filesystem depends on FlexVolume script.


- `options`: `map[string]string`options is Optional: this field holds extra command options if any.


- `readOnly`: `boolean`readOnly is Optional: defaults to false (read/write). ReadOnly here will force the ReadOnly setting in VolumeMounts.


- `secretRef`: [LocalObjectReference](#io.k8s.api.core.v1.LocalObjectReference)LocalObjectReference contains enough information to let you locate the referenced object inside the same namespace.



## [#](#io.k8s.api.core.v1.FlockerVolumeSource)FlockerVolumeSource

Represents a Flocker volume mounted by the Flocker agent. One and only one of datasetName and datasetUUID should be set. Flocker volumes do not support ownership management or SELinux relabeling.

- `datasetName`: `string`datasetName is Name of the dataset stored as metadata -> name on the dataset for Flocker should be considered as deprecated


- `datasetUUID`: `string`datasetUUID is the UUID of the dataset. This is unique identifier of a Flocker dataset



## [#](#io.k8s.api.core.v1.GCEPersistentDiskVolumeSource)GCEPersistentDiskVolumeSource

Represents a Persistent Disk resource in Google Compute Engine.


A GCE PD must exist before mounting to a container. The disk must also be in the same GCE project and zone as the kubelet. A GCE PD can only be mounted as read/write once or read-only many times. GCE PDs support ownership management and SELinux relabeling.

- `fsType`: `string`fsType is filesystem type of the volume that you want to mount. Tip: Ensure that the filesystem type is supported by the host operating system. Examples: "ext4", "xfs", "ntfs". Implicitly inferred to be "ext4" if unspecified. More info: [https://kubernetes.io/docs/concepts/storage/volumes#gcepersistentdisk](https://kubernetes.io/docs/concepts/storage/volumes#gcepersistentdisk)


- `partition`: `integer`partition is the partition in the volume that you want to mount. If omitted, the default is to mount by volume name. Examples: For volume /dev/sda1, you specify the partition as "1". Similarly, the volume partition for /dev/sda is "0" (or you can leave the property empty). More info: [https://kubernetes.io/docs/concepts/storage/volumes#gcepersistentdisk](https://kubernetes.io/docs/concepts/storage/volumes#gcepersistentdisk)


- `pdName`: `string`pdName is unique name of the PD resource in GCE. Used to identify the disk in GCE. More info: [https://kubernetes.io/docs/concepts/storage/volumes#gcepersistentdisk](https://kubernetes.io/docs/concepts/storage/volumes#gcepersistentdisk)


- `readOnly`: `boolean`readOnly here will force the ReadOnly setting in VolumeMounts. Defaults to false. More info: [https://kubernetes.io/docs/concepts/storage/volumes#gcepersistentdisk](https://kubernetes.io/docs/concepts/storage/volumes#gcepersistentdisk)



## [#](#io.k8s.api.core.v1.GitRepoVolumeSource)GitRepoVolumeSource

Represents a volume that is populated with the contents of a git repository. Git repo volumes do not support ownership management. Git repo volumes support SELinux relabeling.


DEPRECATED: GitRepo is deprecated. To provision a container with a git repo, mount an EmptyDir into an InitContainer that clones the repo using git, then mount the EmptyDir into the Pod's container.

- `directory`: `string`directory is the target directory name. Must not contain or start with '..'.  If '.' is supplied, the volume directory will be the git repository.  Otherwise, if specified, the volume will contain the git repository in the subdirectory with the given name.


- `repository`: `string`repository is the URL


- `revision`: `string`revision is the commit hash for the specified revision.



## [#](#io.k8s.api.core.v1.GlusterfsVolumeSource)GlusterfsVolumeSource

Represents a Glusterfs mount that lasts the lifetime of a pod. Glusterfs volumes do not support ownership management or SELinux relabeling.

- `endpoints`: `string`endpoints is the endpoint name that details Glusterfs topology. More info: [https://examples.k8s.io/volumes/glusterfs/README.md#create-a-pod](https://examples.k8s.io/volumes/glusterfs/README.md#create-a-pod)


- `path`: `string`path is the Glusterfs volume path. More info: [https://examples.k8s.io/volumes/glusterfs/README.md#create-a-pod](https://examples.k8s.io/volumes/glusterfs/README.md#create-a-pod)


- `readOnly`: `boolean`readOnly here will force the Glusterfs volume to be mounted with read-only permissions. Defaults to false. More info: [https://examples.k8s.io/volumes/glusterfs/README.md#create-a-pod](https://examples.k8s.io/volumes/glusterfs/README.md#create-a-pod)



## [#](#io.k8s.api.core.v1.HostPathVolumeSource)HostPathVolumeSource

Represents a host path mapped into a pod. Host path volumes do not support ownership management or SELinux relabeling.

- `path`: `string`path of the directory on the host. If the path is a symlink, it will follow the link to the real path. More info: [https://kubernetes.io/docs/concepts/storage/volumes#hostpath](https://kubernetes.io/docs/concepts/storage/volumes#hostpath)


- `type`: `string`type for HostPath Volume Defaults to "" More info: [https://kubernetes.io/docs/concepts/storage/volumes#hostpath](https://kubernetes.io/docs/concepts/storage/volumes#hostpath)


Possible enum values:



- `""` For backwards compatible, leave it empty if unset

- `"BlockDevice"` A block device must exist at the given path

- `"CharDevice"` A character device must exist at the given path

- `"Directory"` A directory must exist at the given path

- `"DirectoryOrCreate"` If nothing exists at the given path, an empty directory will be created there as needed with file mode 0755, having the same group and ownership with Kubelet.

- `"File"` A file must exist at the given path

- `"FileOrCreate"` If nothing exists at the given path, an empty file will be created there as needed with file mode 0644, having the same group and ownership with Kubelet.

- `"Socket"` A UNIX socket must exist at the given path




## [#](#io.k8s.api.core.v1.ImageVolumeSource)ImageVolumeSource

ImageVolumeSource represents a image volume resource.

- `pullPolicy`: `string`Policy for pulling OCI objects. Possible values are: Always: the kubelet always attempts to pull the reference. Container creation will fail If the pull fails. Never: the kubelet never pulls the reference and only uses a local image or artifact. Container creation will fail if the reference isn't present. IfNotPresent: the kubelet pulls if the reference isn't already present on disk. Container creation will fail if the reference isn't present and the pull fails. Defaults to Always if :latest tag is specified, or IfNotPresent otherwise.


Possible enum values:



- `"Always"` means that kubelet always attempts to pull the latest image. Container will fail If the pull fails.

- `"IfNotPresent"` means that kubelet pulls if the image isn't present on disk. Container will fail if the image isn't present and the pull fails.

- `"Never"` means that kubelet never pulls an image, but only uses a local image. Container will fail if the image isn't present



- `reference`: `string`Required: Image or artifact reference to be used. Behaves in the same way as pod.spec.containers[*].image. Pull secrets will be assembled in the same way as for the container image by looking up node credentials, SA image pull secrets, and pod spec image pull secrets. More info: [https://kubernetes.io/docs/concepts/containers/images](https://kubernetes.io/docs/concepts/containers/images) This field is optional to allow higher level config management to default or override container images in workload controllers like Deployments and StatefulSets.



## [#](#io.k8s.api.core.v1.ISCSIVolumeSource)ISCSIVolumeSource

Represents an ISCSI disk. ISCSI volumes can only be mounted as read/write once. ISCSI volumes support ownership management and SELinux relabeling.

- `chapAuthDiscovery`: `boolean`chapAuthDiscovery defines whether support iSCSI Discovery CHAP authentication


- `chapAuthSession`: `boolean`chapAuthSession defines whether support iSCSI Session CHAP authentication


- `fsType`: `string`fsType is the filesystem type of the volume that you want to mount. Tip: Ensure that the filesystem type is supported by the host operating system. Examples: "ext4", "xfs", "ntfs". Implicitly inferred to be "ext4" if unspecified. More info: [https://kubernetes.io/docs/concepts/storage/volumes#iscsi](https://kubernetes.io/docs/concepts/storage/volumes#iscsi)


- `initiatorName`: `string`initiatorName is the custom iSCSI Initiator Name. If initiatorName is specified with iscsiInterface simultaneously, new iSCSI interface : will be created for the connection.


- `iqn`: `string`iqn is the target iSCSI Qualified Name.


- `iscsiInterface`: `string`iscsiInterface is the interface Name that uses an iSCSI transport. Defaults to 'default' (tcp).


- `lun`: `integer`lun represents iSCSI Target Lun number.


- `portals`: `[]string`portals is the iSCSI Target Portal List. The portal is either an IP or ip_addr:port if the port is other than default (typically TCP ports 860 and 3260).


- `readOnly`: `boolean`readOnly here will force the ReadOnly setting in VolumeMounts. Defaults to false.


- `secretRef`: [LocalObjectReference](#io.k8s.api.core.v1.LocalObjectReference)LocalObjectReference contains enough information to let you locate the referenced object inside the same namespace.


- `targetPortal`: `string`targetPortal is iSCSI Target Portal. The Portal is either an IP or ip_addr:port if the port is other than default (typically TCP ports 860 and 3260).



## [#](#io.k8s.api.core.v1.NFSVolumeSource)NFSVolumeSource

Represents an NFS mount that lasts the lifetime of a pod. NFS volumes do not support ownership management or SELinux relabeling.

- `path`: `string`path that is exported by the NFS server. More info: [https://kubernetes.io/docs/concepts/storage/volumes#nfs](https://kubernetes.io/docs/concepts/storage/volumes#nfs)


- `readOnly`: `boolean`readOnly here will force the NFS export to be mounted with read-only permissions. Defaults to false. More info: [https://kubernetes.io/docs/concepts/storage/volumes#nfs](https://kubernetes.io/docs/concepts/storage/volumes#nfs)


- `server`: `string`server is the hostname or IP address of the NFS server. More info: [https://kubernetes.io/docs/concepts/storage/volumes#nfs](https://kubernetes.io/docs/concepts/storage/volumes#nfs)



## [#](#io.k8s.api.core.v1.PersistentVolumeClaimVolumeSource)PersistentVolumeClaimVolumeSource

PersistentVolumeClaimVolumeSource references the user's PVC in the same namespace. This volume finds the bound PV and mounts that volume for the pod. A PersistentVolumeClaimVolumeSource is, essentially, a wrapper around another type of volume that is owned by someone else (the system).

- `claimName`: `string`claimName is the name of a PersistentVolumeClaim in the same namespace as the pod using this volume. More info: [https://kubernetes.io/docs/concepts/storage/persistent-volumes#persistentvolumeclaims](https://kubernetes.io/docs/concepts/storage/persistent-volumes#persistentvolumeclaims)


- `readOnly`: `boolean`readOnly Will force the ReadOnly setting in VolumeMounts. Default false.



## [#](#io.k8s.api.core.v1.PhotonPersistentDiskVolumeSource)PhotonPersistentDiskVolumeSource

Represents a Photon Controller persistent disk resource.

- `fsType`: `string`fsType is the filesystem type to mount. Must be a filesystem type supported by the host operating system. Ex. "ext4", "xfs", "ntfs". Implicitly inferred to be "ext4" if unspecified.


- `pdID`: `string`pdID is the ID that identifies Photon Controller persistent disk



## [#](#io.k8s.api.core.v1.PortworxVolumeSource)PortworxVolumeSource

PortworxVolumeSource represents a Portworx volume resource.

- `fsType`: `string`fSType represents the filesystem type to mount Must be a filesystem type supported by the host operating system. Ex. "ext4", "xfs". Implicitly inferred to be "ext4" if unspecified.


- `readOnly`: `boolean`readOnly defaults to false (read/write). ReadOnly here will force the ReadOnly setting in VolumeMounts.


- `volumeID`: `string`volumeID uniquely identifies a Portworx volume



## [#](#io.k8s.api.core.v1.ProjectedVolumeSource)ProjectedVolumeSource

Represents a projected volume source

- `defaultMode`: `integer`defaultMode are the mode bits used to set permissions on created files by default. Must be an octal value between 0000 and 0777 or a decimal value between 0 and 511. YAML accepts both octal and decimal values, JSON requires decimal values for mode bits. Directories within the path are not affected by this setting. This might be in conflict with other options that affect the file mode, like fsGroup, and the result can be other mode bits set.


- `sources`: `[][VolumeProjection](#io.k8s.api.core.v1.VolumeProjection)`sources is the list of volume projections. Each entry in this list handles one source.



## [#](#io.k8s.api.core.v1.VolumeProjection)VolumeProjection

Projection that may be projected along with other supported volume types. Exactly one of these fields must be set.

- `clusterTrustBundle`: [ClusterTrustBundleProjection](#io.k8s.api.core.v1.ClusterTrustBundleProjection)ClusterTrustBundleProjection describes how to select a set of ClusterTrustBundle objects and project their contents into the pod filesystem.


- `configMap`: [ConfigMapProjection](#io.k8s.api.core.v1.ConfigMapProjection)Adapts a ConfigMap into a projected volume.


The contents of the target ConfigMap's Data field will be presented in a projected volume as files using the keys in the Data field as the file names, unless the items element is populated with specific mappings of keys to paths. Note that this is identical to a configmap volume source without the default mode.


- `downwardAPI`: [DownwardAPIProjection](#io.k8s.api.core.v1.DownwardAPIProjection)Represents downward API info for projecting into a projected volume. Note that this is identical to a downwardAPI volume source without the default mode.


- `secret`: [SecretProjection](#io.k8s.api.core.v1.SecretProjection)Adapts a secret into a projected volume.


The contents of the target Secret's Data field will be presented in a projected volume as files using the keys in the Data field as the file names. Note that this is identical to a secret volume source without the default mode.


- `serviceAccountToken`: [ServiceAccountTokenProjection](#io.k8s.api.core.v1.ServiceAccountTokenProjection)ServiceAccountTokenProjection represents a projected service account token volume. This projection can be used to insert a service account token into the pods runtime filesystem for use against APIs (Kubernetes API Server or otherwise).



## [#](#io.k8s.api.core.v1.ClusterTrustBundleProjection)ClusterTrustBundleProjection

ClusterTrustBundleProjection describes how to select a set of ClusterTrustBundle objects and project their contents into the pod filesystem.

- `labelSelector`: [LabelSelector](https://kubernetes.io/docs/reference/kubernetes-api/common-definitions/label-selector/)A label selector is a label query over a set of resources. The result of matchLabels and matchExpressions are ANDed. An empty label selector matches all objects. A null label selector matches no objects.


- `name`: `string`Select a single ClusterTrustBundle by object name.  Mutually-exclusive with signerName and labelSelector.


- `optional`: `boolean`If true, don't block pod startup if the referenced ClusterTrustBundle(s) aren't available.  If using name, then the named ClusterTrustBundle is allowed not to exist.  If using signerName, then the combination of signerName and labelSelector is allowed to match zero ClusterTrustBundles.


- `path`: `string`Relative path from the volume root to write the bundle.


- `signerName`: `string`Select all ClusterTrustBundles that match this signer name. Mutually-exclusive with name.  The contents of all selected ClusterTrustBundles will be unified and deduplicated.



## [#](#io.k8s.api.core.v1.ConfigMapProjection)ConfigMapProjection

Adapts a ConfigMap into a projected volume.


The contents of the target ConfigMap's Data field will be presented in a projected volume as files using the keys in the Data field as the file names, unless the items element is populated with specific mappings of keys to paths. Note that this is identical to a configmap volume source without the default mode.

- `items`: `[][KeyToPath](#io.k8s.api.core.v1.KeyToPath)`items if unspecified, each key-value pair in the Data field of the referenced ConfigMap will be projected into the volume as a file whose name is the key and content is the value. If specified, the listed keys will be projected into the specified paths, and unlisted keys will not be present. If a key is specified which is not present in the ConfigMap, the volume setup will error unless it is marked optional. Paths must be relative and may not contain the '..' path or start with '..'.


- `name`: `string`Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names)


- `optional`: `boolean`optional specify whether the ConfigMap or its keys must be defined



## [#](#io.k8s.api.core.v1.DownwardAPIProjection)DownwardAPIProjection

Represents downward API info for projecting into a projected volume. Note that this is identical to a downwardAPI volume source without the default mode.

- `items`: `[][DownwardAPIVolumeFile](#io.k8s.api.core.v1.DownwardAPIVolumeFile)`Items is a list of DownwardAPIVolume file



## [#](#io.k8s.api.core.v1.SecretProjection)SecretProjection

Adapts a secret into a projected volume.


The contents of the target Secret's Data field will be presented in a projected volume as files using the keys in the Data field as the file names. Note that this is identical to a secret volume source without the default mode.

- `items`: `[][KeyToPath](#io.k8s.api.core.v1.KeyToPath)`items if unspecified, each key-value pair in the Data field of the referenced Secret will be projected into the volume as a file whose name is the key and content is the value. If specified, the listed keys will be projected into the specified paths, and unlisted keys will not be present. If a key is specified which is not present in the Secret, the volume setup will error unless it is marked optional. Paths must be relative and may not contain the '..' path or start with '..'.


- `name`: `string`Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names)


- `optional`: `boolean`optional field specify whether the Secret or its key must be defined



## [#](#io.k8s.api.core.v1.ServiceAccountTokenProjection)ServiceAccountTokenProjection

ServiceAccountTokenProjection represents a projected service account token volume. This projection can be used to insert a service account token into the pods runtime filesystem for use against APIs (Kubernetes API Server or otherwise).

- `audience`: `string`audience is the intended audience of the token. A recipient of a token must identify itself with an identifier specified in the audience of the token, and otherwise should reject the token. The audience defaults to the identifier of the apiserver.


- `expirationSeconds`: `integer`expirationSeconds is the requested duration of validity of the service account token. As the token approaches expiration, the kubelet volume plugin will proactively rotate the service account token. The kubelet will start trying to rotate the token if the token is older than 80 percent of its time to live or if the token is older than 24 hours.Defaults to 1 hour and must be at least 10 minutes.


- `path`: `string`path is the path relative to the mount point of the file to project the token into.



## [#](#io.k8s.api.core.v1.QuobyteVolumeSource)QuobyteVolumeSource

Represents a Quobyte mount that lasts the lifetime of a pod. Quobyte volumes do not support ownership management or SELinux relabeling.

- `group`: `string`group to map volume access to Default is no group


- `readOnly`: `boolean`readOnly here will force the Quobyte volume to be mounted with read-only permissions. Defaults to false.


- `registry`: `string`registry represents a single or multiple Quobyte Registry services specified as a string as host:port pair (multiple entries are separated with commas) which acts as the central registry for volumes


- `tenant`: `string`tenant owning the given Quobyte volume in the Backend Used with dynamically provisioned Quobyte volumes, value is set by the plugin


- `user`: `string`user to map volume access to Defaults to serivceaccount user


- `volume`: `string`volume is a string that references an already created Quobyte volume by name.



## [#](#io.k8s.api.core.v1.RBDVolumeSource)RBDVolumeSource

Represents a Rados Block Device mount that lasts the lifetime of a pod. RBD volumes support ownership management and SELinux relabeling.

- `fsType`: `string`fsType is the filesystem type of the volume that you want to mount. Tip: Ensure that the filesystem type is supported by the host operating system. Examples: "ext4", "xfs", "ntfs". Implicitly inferred to be "ext4" if unspecified. More info: [https://kubernetes.io/docs/concepts/storage/volumes#rbd](https://kubernetes.io/docs/concepts/storage/volumes#rbd)


- `image`: `string`image is the rados image name. More info: [https://examples.k8s.io/volumes/rbd/README.md#how-to-use-it](https://examples.k8s.io/volumes/rbd/README.md#how-to-use-it)


- `keyring`: `string`keyring is the path to key ring for RBDUser. Default is /etc/ceph/keyring. More info: [https://examples.k8s.io/volumes/rbd/README.md#how-to-use-it](https://examples.k8s.io/volumes/rbd/README.md#how-to-use-it)


- `monitors`: `[]string`monitors is a collection of Ceph monitors. More info: [https://examples.k8s.io/volumes/rbd/README.md#how-to-use-it](https://examples.k8s.io/volumes/rbd/README.md#how-to-use-it)


- `pool`: `string`pool is the rados pool name. Default is rbd. More info: [https://examples.k8s.io/volumes/rbd/README.md#how-to-use-it](https://examples.k8s.io/volumes/rbd/README.md#how-to-use-it)


- `readOnly`: `boolean`readOnly here will force the ReadOnly setting in VolumeMounts. Defaults to false. More info: [https://examples.k8s.io/volumes/rbd/README.md#how-to-use-it](https://examples.k8s.io/volumes/rbd/README.md#how-to-use-it)


- `secretRef`: [LocalObjectReference](#io.k8s.api.core.v1.LocalObjectReference)LocalObjectReference contains enough information to let you locate the referenced object inside the same namespace.


- `user`: `string`user is the rados user name. Default is admin. More info: [https://examples.k8s.io/volumes/rbd/README.md#how-to-use-it](https://examples.k8s.io/volumes/rbd/README.md#how-to-use-it)



## [#](#io.k8s.api.core.v1.ScaleIOVolumeSource)ScaleIOVolumeSource

ScaleIOVolumeSource represents a persistent ScaleIO volume

- `fsType`: `string`fsType is the filesystem type to mount. Must be a filesystem type supported by the host operating system. Ex. "ext4", "xfs", "ntfs". Default is "xfs".


- `gateway`: `string`gateway is the host address of the ScaleIO API Gateway.


- `protectionDomain`: `string`protectionDomain is the name of the ScaleIO Protection Domain for the configured storage.


- `readOnly`: `boolean`readOnly Defaults to false (read/write). ReadOnly here will force the ReadOnly setting in VolumeMounts.


- `secretRef`: [LocalObjectReference](#io.k8s.api.core.v1.LocalObjectReference)LocalObjectReference contains enough information to let you locate the referenced object inside the same namespace.


- `sslEnabled`: `boolean`sslEnabled Flag enable/disable SSL communication with Gateway, default false


- `storageMode`: `string`storageMode indicates whether the storage for a volume should be ThickProvisioned or ThinProvisioned. Default is ThinProvisioned.


- `storagePool`: `string`storagePool is the ScaleIO Storage Pool associated with the protection domain.


- `system`: `string`system is the name of the storage system as configured in ScaleIO.


- `volumeName`: `string`volumeName is the name of a volume already created in the ScaleIO system that is associated with this volume source.



## [#](#io.k8s.api.core.v1.SecretVolumeSource)SecretVolumeSource

Adapts a Secret into a volume.


The contents of the target Secret's Data field will be presented in a volume as files using the keys in the Data field as the file names. Secret volumes support ownership management and SELinux relabeling.

- `defaultMode`: `integer`defaultMode is Optional: mode bits used to set permissions on created files by default. Must be an octal value between 0000 and 0777 or a decimal value between 0 and 511. YAML accepts both octal and decimal values, JSON requires decimal values for mode bits. Defaults to 0644. Directories within the path are not affected by this setting. This might be in conflict with other options that affect the file mode, like fsGroup, and the result can be other mode bits set.


- `items`: `[][KeyToPath](#io.k8s.api.core.v1.KeyToPath)`items If unspecified, each key-value pair in the Data field of the referenced Secret will be projected into the volume as a file whose name is the key and content is the value. If specified, the listed keys will be projected into the specified paths, and unlisted keys will not be present. If a key is specified which is not present in the Secret, the volume setup will error unless it is marked optional. Paths must be relative and may not contain the '..' path or start with '..'.


- `optional`: `boolean`optional field specify whether the Secret or its keys must be defined


- `secretName`: `string`secretName is the name of the secret in the pod's namespace to use. More info: [https://kubernetes.io/docs/concepts/storage/volumes#secret](https://kubernetes.io/docs/concepts/storage/volumes#secret)



## [#](#io.k8s.api.core.v1.StorageOSVolumeSource)StorageOSVolumeSource

Represents a StorageOS persistent volume resource.

- `fsType`: `string`fsType is the filesystem type to mount. Must be a filesystem type supported by the host operating system. Ex. "ext4", "xfs", "ntfs". Implicitly inferred to be "ext4" if unspecified.


- `readOnly`: `boolean`readOnly defaults to false (read/write). ReadOnly here will force the ReadOnly setting in VolumeMounts.


- `secretRef`: [LocalObjectReference](#io.k8s.api.core.v1.LocalObjectReference)LocalObjectReference contains enough information to let you locate the referenced object inside the same namespace.


- `volumeName`: `string`volumeName is the human-readable name of the StorageOS volume.  Volume names are only unique within a namespace.


- `volumeNamespace`: `string`volumeNamespace specifies the scope of the volume within StorageOS.  If no namespace is specified then the Pod's namespace will be used.  This allows the Kubernetes name scoping to be mirrored within StorageOS for tighter integration. Set VolumeName to any name to override the default behaviour. Set to "default" if you are not using namespaces within StorageOS. Namespaces that do not pre-exist within StorageOS will be created.



## [#](#io.k8s.api.core.v1.VsphereVirtualDiskVolumeSource)VsphereVirtualDiskVolumeSource

Represents a vSphere volume resource.

- `fsType`: `string`fsType is filesystem type to mount. Must be a filesystem type supported by the host operating system. Ex. "ext4", "xfs", "ntfs". Implicitly inferred to be "ext4" if unspecified.


- `storagePolicyID`: `string`storagePolicyID is the storage Policy Based Management (SPBM) profile ID associated with the StoragePolicyName.


- `storagePolicyName`: `string`storagePolicyName is the storage Policy Based Management (SPBM) profile name.


- `volumePath`: `string`volumePath is the path that identifies vSphere volume vmdk



## [#](#io.k8s.api.apps.v1.DaemonSetUpdateStrategy)DaemonSetUpdateStrategy

DaemonSetUpdateStrategy is a struct used to control the update strategy for a DaemonSet.

- `rollingUpdate`: [RollingUpdateDaemonSet](#io.k8s.api.apps.v1.RollingUpdateDaemonSet)Spec to control the desired behavior of daemon set rolling update.


- `type`: `string`Type of daemon set update. Can be "RollingUpdate" or "OnDelete". Default is RollingUpdate.


Possible enum values:



- `"OnDelete"` Replace the old daemons only when it's killed

- `"RollingUpdate"` Replace the old daemons by new ones using rolling update i.e replace them on each node one after the other.




## [#](#io.k8s.api.apps.v1.RollingUpdateDaemonSet)RollingUpdateDaemonSet

Spec to control the desired behavior of daemon set rolling update.

- `maxSurge`: [IntOrString](#io.k8s.apimachinery.pkg.util.intstr.IntOrString)IntOrString is a type that can hold an int32 or a string.  When used in JSON or YAML marshalling and unmarshalling, it produces or consumes the inner type.  This allows you to have, for example, a JSON field that can accept a name or number.


- `maxUnavailable`: [IntOrString](#io.k8s.apimachinery.pkg.util.intstr.IntOrString)IntOrString is a type that can hold an int32 or a string.  When used in JSON or YAML marshalling and unmarshalling, it produces or consumes the inner type.  This allows you to have, for example, a JSON field that can accept a name or number.



## [#](#io.k8s.api.apps.v1.DaemonSetStatus)DaemonSetStatus

DaemonSetStatus represents the current status of a daemon set.

- `collisionCount`: `integer`Count of hash collisions for the DaemonSet. The DaemonSet controller uses this field as a collision avoidance mechanism when it needs to create the name for the newest ControllerRevision.


- `conditions`: `[][DaemonSetCondition](#io.k8s.api.apps.v1.DaemonSetCondition)`Represents the latest available observations of a DaemonSet's current state.


- `currentNumberScheduled`: `integer`The number of nodes that are running at least 1 daemon pod and are supposed to run the daemon pod. More info: [https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/](https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/)


- `desiredNumberScheduled`: `integer`The total number of nodes that should be running the daemon pod (including nodes correctly running the daemon pod). More info: [https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/](https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/)


- `numberAvailable`: `integer`The number of nodes that should be running the daemon pod and have one or more of the daemon pod running and available (ready for at least spec.minReadySeconds)


- `numberMisscheduled`: `integer`The number of nodes that are running the daemon pod, but are not supposed to run the daemon pod. More info: [https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/](https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/)


- `numberReady`: `integer`numberReady is the number of nodes that should be running the daemon pod and have one or more of the daemon pod running with a Ready Condition.


- `numberUnavailable`: `integer`The number of nodes that should be running the daemon pod and have none of the daemon pod running and available (ready for at least spec.minReadySeconds)


- `observedGeneration`: `integer`The most recent generation observed by the daemon set controller.


- `updatedNumberScheduled`: `integer`The total number of nodes that are running updated daemon pod



## [#](#io.k8s.api.apps.v1.DaemonSetCondition)DaemonSetCondition

DaemonSetCondition describes the state of a DaemonSet at a certain point.

- `lastTransitionTime`: `string`Time is a wrapper around time.Time which supports correct marshaling to YAML and JSON.  Wrappers are provided for many of the factory methods that the time package offers.


- `message`: `string`A human readable message indicating details about the transition.


- `reason`: `string`The reason for the condition's last transition.


- `status`: `string`Status of the condition, one of True, False, Unknown.


- `type`: `string`Type of DaemonSet condition.



## [#](#io.k8s.apimachinery.pkg.apis.meta.v1.Time)Time

Time is a wrapper around time.Time which supports correct marshaling to YAML and JSON.  Wrappers are provided for many of the factory methods that the time package offers.

