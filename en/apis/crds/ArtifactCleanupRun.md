# ArtifactCleanupRun

`artifacts.katanomi.dev` group

ArtifactCleanupRun is the Schema for the artifactcleanupruns API

`v1alpha1` version+ Expand Allspec `object`ArtifactCleanupRunSpec defines the desired state of ArtifactCleanupRun

artifactCleanupRef `object`Reference to an existing ArtifactCleanup

apiVersion `string`API version of the referent.

fieldPath `string`If referring to a piece of an object instead of an entire object, this string
should contain a valid JSON/Go field access statement, such as desiredState.manifest.containers[2].
For example, if the object reference is to a container within a pod, this would take on a value like:
"spec.containers{name}" (where "name" refers to the name of the container that triggered
the event) or if no container name is specified "spec.containers[2]" (container with
index 2 in this pod). This syntax is chosen only to have some well-defined way of
referencing a part of an object.
TODO: this design is not final and this field is subject to change in the future.

kind `string`Kind of the referent.
More info: [https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds](https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds)

name `string`Name of the referent.
More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names)

namespace `string`Namespace of the referent.
More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/)

resourceVersion `string`Specific resourceVersion to which this reference is made, if any.
More info: [https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#concurrency-control-and-consistency](https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#concurrency-control-and-consistency)

uid `string`UID of the referent.
More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#uids](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#uids)

artifactCleanupSpec `object`In-line spec for ArtifactCleanup. This options is mutually exclusive with artifactCleanupRef.

address `object`Address stores the integrated service API address

CACerts `string`CACerts is the Certification Authority (CA) certificates in PEM format
according to [https://www.rfc-editor.org/rfc/rfc7468](https://www.rfc-editor.org/rfc/rfc7468).

name `string`Name is the name of the address.

url `string`historyLimits `object`HistoryLimits limits the number of executed items are preserved
It only calculates already completed items

count `integer`Sets a hard count for all finished items
to be cleared from storage

integrationClassName `string`IntegrationClassName sets the name of IntegrationClass that this integration is implemented

integrationRef `object`Reference to specific integration that contains the tool API define.

apiVersion `string`API version of the referent.

fieldPath `string`If referring to a piece of an object instead of an entire object, this string
should contain a valid JSON/Go field access statement, such as desiredState.manifest.containers[2].
For example, if the object reference is to a container within a pod, this would take on a value like:
"spec.containers{name}" (where "name" refers to the name of the container that triggered
the event) or if no container name is specified "spec.containers[2]" (container with
index 2 in this pod). This syntax is chosen only to have some well-defined way of
referencing a part of an object.
TODO: this design is not final and this field is subject to change in the future.

kind `string`Kind of the referent.
More info: [https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds](https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds)

name `string`Name of the referent.
More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names)

namespace `string`Namespace of the referent.
More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/)

resourceVersion `string`Specific resourceVersion to which this reference is made, if any.
More info: [https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#concurrency-control-and-consistency](https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#concurrency-control-and-consistency)

uid `string`UID of the referent.
More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#uids](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#uids)

policies `[]object`Policy A detailed description of the policy, including warehouse, cleanup rules, and retention rules.

cleanupRules `[]object`Rule Describes the parameters of the rule.

duration `string`The interval for saving time type rules.

name `string`Rule names are for display purposes only.

quantity `integer`Quantity value used to hold quantity type rules.

regexp `string`The regular expression used to hold the match type rules.

type `string`Rule type

repository `object`A list of Repository to match. Regular expressions are supported.

name `string`Matches the warehouse rule name, for display only.

regexp `string`Regular expression that matches the repository.

retentionRules `[]object`Rule Describes the parameters of the rule.

duration `string`The interval for saving time type rules.

name `string`Rule names are for display purposes only.

quantity `integer`Quantity value used to hold quantity type rules.

regexp `string`The regular expression used to hold the match type rules.

type `string`Rule type

resource `object`Resources array of predefined resources to be used

annotations `object`Annotations provides a method to annotate specific resources in order to provide some metadata

name `string` requiredName stores the name of the resource object

properties `object`Properties of the resource. This is used to transmit fields and values to the integration class

readOnly `boolean`ReadOnly adds a desired behaviour for consumers of this resource

replicationPolicyRef `object`ReplicationPolicyRef stores a reference to a policy that generated this resource
used by the ClusterIntegration object when replicating and creating Integration objects

apiVersion `string`API version of the referent.

fieldPath `string`If referring to a piece of an object instead of an entire object, this string
should contain a valid JSON/Go field access statement, such as desiredState.manifest.containers[2].
For example, if the object reference is to a container within a pod, this would take on a value like:
"spec.containers{name}" (where "name" refers to the name of the container that triggered
the event) or if no container name is specified "spec.containers[2]" (container with
index 2 in this pod). This syntax is chosen only to have some well-defined way of
referencing a part of an object.
TODO: this design is not final and this field is subject to change in the future.

kind `string`Kind of the referent.
More info: [https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds](https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds)

name `string`Name of the referent.
More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names)

namespace `string`Namespace of the referent.
More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/)

resourceVersion `string`Specific resourceVersion to which this reference is made, if any.
More info: [https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#concurrency-control-and-consistency](https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#concurrency-control-and-consistency)

uid `string`UID of the referent.
More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#uids](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#uids)

subResources `[]object`annotations `object`Annotations provides a method to annotate specific resources in order to provide some metadata

name `string` requiredName stores the name of the resource object

properties `object`Properties of the resource. This is used to transmit fields and values to the integration class

subtype `string`Subtype of resource associated with the object

type `string` requiredType of resource associated with the object

subtype `string`Subtype of resource associated with the object

syncPolicy `string`SyncPolicy specifies how resources are synced to the system. Defaults to "SyncOnly"

type `string` requiredType of resource associated with the object

triggers `object`all triggers defined for triggering current artifactcleanup

cronTriggers `[]object`ArtifactCleanupCronTrigger defines cronTrigger.

annotations `object`Annotations is an unstructured key value map stored with a resource that may be
set by external tools to store and retrieve arbitrary metadata. They are not
queryable and should be preserved when modifying objects.
More info: [http://kubernetes.io/docs/user-guide/annotations](http://kubernetes.io/docs/user-guide/annotations)

name `string`The name of the timed trigger

spec `object`Trigger the desired property periodically.

broker `string`Broker instance to listen

disabled `boolean`Disabled a switch for crontrigger.

params `[]object`TriggerValueBinding represent values that will bind to template

const `boolean`If true, indicates that value is a constant, not an expression.

name `string`name of template parameter

value `string`value of template parameter
do we only need type of string

runnableRef `object`reference of runnabledefinition

apiVersion `string`API version of the referent.

fieldPath `string`If referring to a piece of an object instead of an entire object, this string
should contain a valid JSON/Go field access statement, such as desiredState.manifest.containers[2].
For example, if the object reference is to a container within a pod, this would take on a value like:
"spec.containers{name}" (where "name" refers to the name of the container that triggered
the event) or if no container name is specified "spec.containers[2]" (container with
index 2 in this pod). This syntax is chosen only to have some well-defined way of
referencing a part of an object.
TODO: this design is not final and this field is subject to change in the future.

kind `string`Kind of the referent.
More info: [https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds](https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds)

name `string`Name of the referent.
More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names)

namespace `string`Namespace of the referent.
More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/)

resourceVersion `string`Specific resourceVersion to which this reference is made, if any.
More info: [https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#concurrency-control-and-consistency](https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#concurrency-control-and-consistency)

uid `string`UID of the referent.
More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#uids](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#uids)

runnableSpec `object`Inline spec for runnable template.

kube `object`Uses a yaml format to create a template for resource

parameters `[]object`KubeParameter used to generate the resource with jsonpath replacement rules

fieldPaths `[]string`FieldPaths is jsonpath for replacing the parameter value into the resource at render time

name `string`Unique parameter name

required `boolean`Parameter required, Defaults to false

type `string`Parameter value type, one of [string, number, boolean], default is string

template `object`Raw resource definition yaml

schedule `string` requiredSchedule is the cron schedule.

timezone `string`Timezone modifies the actual time relative to the specified timezone. Defaults to UTC.
More general information about time zones: [https://www.iana.org/time-zones](https://www.iana.org/time-zones)
List of valid timezone values: [https://en.wikipedia.org/wiki/List_of_tz_database_time_zones](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)

dryRun `boolean``True` means that the simulation runs without performing specific cleanup operations.

status `string`Status Used for cancelling a ArtifactCleanupRun (and maybe more later on)

status `object`ArtifactCleanupRunStatus defines the observed state of ArtifactCleanupRun

annotations `object`Annotations is additional Status fields for the Resource to save some
additional State as well as convey more information to the user. This is
roughly akin to Annotations on any k8s resource, just the reconciler conveying
richer information outwards.

artifactCleanupSpec `object`When spec.artifactCleanupRef is used, the spec will be stored here for future reference

address `object`Address stores the integrated service API address

CACerts `string`CACerts is the Certification Authority (CA) certificates in PEM format
according to [https://www.rfc-editor.org/rfc/rfc7468](https://www.rfc-editor.org/rfc/rfc7468).

name `string`Name is the name of the address.

url `string`historyLimits `object`HistoryLimits limits the number of executed items are preserved
It only calculates already completed items

count `integer`Sets a hard count for all finished items
to be cleared from storage

integrationClassName `string`IntegrationClassName sets the name of IntegrationClass that this integration is implemented

integrationRef `object`Reference to specific integration that contains the tool API define.

apiVersion `string`API version of the referent.

fieldPath `string`If referring to a piece of an object instead of an entire object, this string
should contain a valid JSON/Go field access statement, such as desiredState.manifest.containers[2].
For example, if the object reference is to a container within a pod, this would take on a value like:
"spec.containers{name}" (where "name" refers to the name of the container that triggered
the event) or if no container name is specified "spec.containers[2]" (container with
index 2 in this pod). This syntax is chosen only to have some well-defined way of
referencing a part of an object.
TODO: this design is not final and this field is subject to change in the future.

kind `string`Kind of the referent.
More info: [https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds](https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds)

name `string`Name of the referent.
More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names)

namespace `string`Namespace of the referent.
More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/)

resourceVersion `string`Specific resourceVersion to which this reference is made, if any.
More info: [https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#concurrency-control-and-consistency](https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#concurrency-control-and-consistency)

uid `string`UID of the referent.
More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#uids](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#uids)

policies `[]object`Policy A detailed description of the policy, including warehouse, cleanup rules, and retention rules.

cleanupRules `[]object`Rule Describes the parameters of the rule.

duration `string`The interval for saving time type rules.

name `string`Rule names are for display purposes only.

quantity `integer`Quantity value used to hold quantity type rules.

regexp `string`The regular expression used to hold the match type rules.

type `string`Rule type

repository `object`A list of Repository to match. Regular expressions are supported.

name `string`Matches the warehouse rule name, for display only.

regexp `string`Regular expression that matches the repository.

retentionRules `[]object`Rule Describes the parameters of the rule.

duration `string`The interval for saving time type rules.

name `string`Rule names are for display purposes only.

quantity `integer`Quantity value used to hold quantity type rules.

regexp `string`The regular expression used to hold the match type rules.

type `string`Rule type

resource `object`Resources array of predefined resources to be used

annotations `object`Annotations provides a method to annotate specific resources in order to provide some metadata

name `string` requiredName stores the name of the resource object

properties `object`Properties of the resource. This is used to transmit fields and values to the integration class

readOnly `boolean`ReadOnly adds a desired behaviour for consumers of this resource

replicationPolicyRef `object`ReplicationPolicyRef stores a reference to a policy that generated this resource
used by the ClusterIntegration object when replicating and creating Integration objects

apiVersion `string`API version of the referent.

fieldPath `string`If referring to a piece of an object instead of an entire object, this string
should contain a valid JSON/Go field access statement, such as desiredState.manifest.containers[2].
For example, if the object reference is to a container within a pod, this would take on a value like:
"spec.containers{name}" (where "name" refers to the name of the container that triggered
the event) or if no container name is specified "spec.containers[2]" (container with
index 2 in this pod). This syntax is chosen only to have some well-defined way of
referencing a part of an object.
TODO: this design is not final and this field is subject to change in the future.

kind `string`Kind of the referent.
More info: [https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds](https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds)

name `string`Name of the referent.
More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names)

namespace `string`Namespace of the referent.
More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/)

resourceVersion `string`Specific resourceVersion to which this reference is made, if any.
More info: [https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#concurrency-control-and-consistency](https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#concurrency-control-and-consistency)

uid `string`UID of the referent.
More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#uids](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#uids)

subResources `[]object`annotations `object`Annotations provides a method to annotate specific resources in order to provide some metadata

name `string` requiredName stores the name of the resource object

properties `object`Properties of the resource. This is used to transmit fields and values to the integration class

subtype `string`Subtype of resource associated with the object

type `string` requiredType of resource associated with the object

subtype `string`Subtype of resource associated with the object

syncPolicy `string`SyncPolicy specifies how resources are synced to the system. Defaults to "SyncOnly"

type `string` requiredType of resource associated with the object

triggers `object`all triggers defined for triggering current artifactcleanup

cronTriggers `[]object`ArtifactCleanupCronTrigger defines cronTrigger.

annotations `object`Annotations is an unstructured key value map stored with a resource that may be
set by external tools to store and retrieve arbitrary metadata. They are not
queryable and should be preserved when modifying objects.
More info: [http://kubernetes.io/docs/user-guide/annotations](http://kubernetes.io/docs/user-guide/annotations)

name `string`The name of the timed trigger

spec `object`Trigger the desired property periodically.

broker `string`Broker instance to listen

disabled `boolean`Disabled a switch for crontrigger.

params `[]object`TriggerValueBinding represent values that will bind to template

const `boolean`If true, indicates that value is a constant, not an expression.

name `string`name of template parameter

value `string`value of template parameter
do we only need type of string

runnableRef `object`reference of runnabledefinition

apiVersion `string`API version of the referent.

fieldPath `string`If referring to a piece of an object instead of an entire object, this string
should contain a valid JSON/Go field access statement, such as desiredState.manifest.containers[2].
For example, if the object reference is to a container within a pod, this would take on a value like:
"spec.containers{name}" (where "name" refers to the name of the container that triggered
the event) or if no container name is specified "spec.containers[2]" (container with
index 2 in this pod). This syntax is chosen only to have some well-defined way of
referencing a part of an object.
TODO: this design is not final and this field is subject to change in the future.

kind `string`Kind of the referent.
More info: [https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds](https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds)

name `string`Name of the referent.
More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names)

namespace `string`Namespace of the referent.
More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/)

resourceVersion `string`Specific resourceVersion to which this reference is made, if any.
More info: [https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#concurrency-control-and-consistency](https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#concurrency-control-and-consistency)

uid `string`UID of the referent.
More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#uids](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#uids)

runnableSpec `object`Inline spec for runnable template.

kube `object`Uses a yaml format to create a template for resource

parameters `[]object`KubeParameter used to generate the resource with jsonpath replacement rules

fieldPaths `[]string`FieldPaths is jsonpath for replacing the parameter value into the resource at render time

name `string`Unique parameter name

required `boolean`Parameter required, Defaults to false

type `string`Parameter value type, one of [string, number, boolean], default is string

template `object`Raw resource definition yaml

schedule `string` requiredSchedule is the cron schedule.

timezone `string`Timezone modifies the actual time relative to the specified timezone. Defaults to UTC.
More general information about time zones: [https://www.iana.org/time-zones](https://www.iana.org/time-zones)
List of valid timezone values: [https://en.wikipedia.org/wiki/List_of_tz_database_time_zones](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)

completionTime `string`CompletionTime is the time when StageRun completed.

conditions `[]object`Condition defines a readiness condition for a Knative resource.
See: [https://github.com/kubernetes/community/blob/master/contributors/devel/sig-architecture/api-conventions.md#typical-status-properties](https://github.com/kubernetes/community/blob/master/contributors/devel/sig-architecture/api-conventions.md#typical-status-properties)

lastTransitionTime `string`LastTransitionTime is the last time the condition transitioned from one status to another.
We use VolatileTime in place of metav1.Time to exclude this from creating equality.Semantic
differences (all other things held constant).

message `string`A human readable message indicating details about the transition.

reason `string`The reason for the condition's last transition.

severity `string`Severity with which to treat failures of this type of condition.
When this is not specified, it defaults to Error.

status `string` requiredStatus of the condition, one of True, False, Unknown.

type `string` requiredType of condition.

observedGeneration `integer`ObservedGeneration is the 'Generation' of the Service that
was last processed by the controller.

resources `[]object`Resource A detailed description of the cleanup reocrd.

message `string`Description of reason info.

reason `string`Describes the reason for the status, such as Cancelled, InternalServerError, DryRun.

repository `string`A list of repositories to match. Regular expressions are supported.

status `string`Describes the cleanup state. (Unknown, True, False)

tags `[]object`name `string`tag name

pullTime `string`tag push time, if Name is empty, the pushtime of the version

pushTime `string`tag pull time, if Name is empty, the pulltime of the version

version `string`Clean up the list of rules.

startTime `string`StartTime is the time when StageRun actually started.

summary `object`Describe the overall result of the cleanup. Record success, failure, ignore the number of records.

failed `integer`Failed records the total number of cleanup failures.

skiped `integer`Skiped records the total number of cleanup ignores.

succeeded `integer`Succeeded records the total number of successful cleanups.

triggeredBy `object`TriggeredBy stores a list of triggered information.

cloudEvent `object`Cloud Event data for the event that triggered.

data `string`Data event payload

datacontenttype `string`extensions `object`id `string`source `string`specversion `string`subject `string`time `string`type `string`Type of event

ref `object`Reference to another object that might have triggered this object

apiVersion `string`API version of the referent.

fieldPath `string`If referring to a piece of an object instead of an entire object, this string
should contain a valid JSON/Go field access statement, such as desiredState.manifest.containers[2].
For example, if the object reference is to a container within a pod, this would take on a value like:
"spec.containers{name}" (where "name" refers to the name of the container that triggered
the event) or if no container name is specified "spec.containers[2]" (container with
index 2 in this pod). This syntax is chosen only to have some well-defined way of
referencing a part of an object.
TODO: this design is not final and this field is subject to change in the future.

kind `string`Kind of the referent.
More info: [https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds](https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds)

name `string`Name of the referent.
More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names)

namespace `string`Namespace of the referent.
More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/)

resourceVersion `string`Specific resourceVersion to which this reference is made, if any.
More info: [https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#concurrency-control-and-consistency](https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#concurrency-control-and-consistency)

uid `string`UID of the referent.
More info: [https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#uids](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#uids)

triggeredTimestamp `string`Date time of creation of triggered event. Will match a resource's metadata.creationTimestamp
it is added here for convinience only

triggeredType `string`Indicates trigger type, such as Manual Automated.

user `object`Reference to the user that triggered the object. Any Kubernetes `Subject` is accepted.

apiGroup `string`APIGroup holds the API group of the referenced subject.
Defaults to "" for ServiceAccount subjects.
Defaults to "rbac.authorization.k8s.io" for User and Group subjects.

kind `string` requiredKind of object being referenced. Values defined by this API group are "User", "Group", and "ServiceAccount".
If the Authorizer does not recognized the kind value, the Authorizer should report an error.

name `string` requiredName of the object being referenced.

namespace `string`Namespace of the referenced object.  If the object kind is non-namespace, such as "User" or "Group", and this value is not empty
the Authorizer should report an error.

