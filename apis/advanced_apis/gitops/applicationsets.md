# ApplicationSet

## [#](#_r_b9_-gitopsv1projectprojectapplicationsets)/gitops/v1/project/{project}/applicationsets

### [#](#_r_b9_--list-applicationsets-in-a-project)`get` List applicationsets in a project

#### [#](#_r_b9_-parameters)Parameters

- `Authorization` (*in header*): `string` Given Bearer token will use this as authorization for the API


- `project` (*in path*): `string` required project name


- `filter` (*in query*): `string` list filter


- `limit` (*in query*): `number` list limit


- `continue` (*in query*): `string` list continue



#### [#](#_r_b9_-response)Response

- `200` [ApplicationSetList](#_r_b9_-v1alpha1.ApplicationSetList): success

### [#](#_r_b9_--create-an-applicationset-in-a-project)`post` Create an applicationset in a project

#### [#](#_r_b9_-parameters-1)Parameters

- `Authorization` (*in header*): `string` Given Bearer token will use this as authorization for the API


- `project` (*in path*): `string` required project name



#### [#](#_r_b9_-request-body)Request Body

[ApplicationSet](#_r_b9_-v1alpha1.ApplicationSet)required

#### [#](#_r_b9_-response-1)Response

- `201` [ApplicationSet](#_r_b9_-v1alpha1.ApplicationSet): success

## [#](#_r_b9_-v1alpha1.ApplicationSetList)ApplicationSetList

- `apiVersion`: `string`APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: [https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources](https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources)


- `items`: `[][ApplicationSet](#_r_b9_-v1alpha1.ApplicationSet)`
- `kind`: `string`Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: [https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds](https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds)


- `metadata`: [ListMeta](#_r_b9_-v1.ListMeta)ListMeta describes metadata that synthetic resources must have, including lists and various status objects. A resource may have only one of {ObjectMeta, ListMeta}.



## [#](#_r_b9_-v1alpha1.ApplicationSet)ApplicationSet

- `apiVersion`: `string`APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: [https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources](https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources)


- `kind`: `string`Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: [https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds](https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds)


- `metadata`: [ObjectMeta](https://kubernetes.io/docs/reference/kubernetes-api/common-definitions/object-meta/)ObjectMeta is metadata that all persisted resources must have, which includes all objects users must create.


- `spec`: [ApplicationSetSpec](#_r_b9_-v1alpha1.ApplicationSetSpec)
- `status`: [ApplicationSetStatus](#_r_b9_-v1alpha1.ApplicationSetStatus)

## [#](#_r_b9_-v1alpha1.ApplicationSetSpec)ApplicationSetSpec

- `applyNestedSelectors`: `boolean`
- `generators`: `[][ApplicationSetGenerator](#_r_b9_-v1alpha1.ApplicationSetGenerator)`
- `goTemplate`: `boolean`
- `goTemplateOptions`: `[]string`
- `ignoreApplicationDifferences`: `[][ApplicationSetResourceIgnoreDifferences](#_r_b9_-v1alpha1.ApplicationSetResourceIgnoreDifferences)`
- `preservedFields`: [ApplicationPreservedFields](#_r_b9_-v1alpha1.ApplicationPreservedFields)
- `strategy`: [ApplicationSetStrategy](#_r_b9_-v1alpha1.ApplicationSetStrategy)
- `syncPolicy`: [ApplicationSetSyncPolicy](#_r_b9_-v1alpha1.ApplicationSetSyncPolicy)
- `template`: [ApplicationSetTemplate](#_r_b9_-v1alpha1.ApplicationSetTemplate)
- `templatePatch`: `string`

## [#](#_r_b9_-v1alpha1.ApplicationSetGenerator)ApplicationSetGenerator

- `clusterDecisionResource`: [DuckTypeGenerator](#_r_b9_-v1alpha1.DuckTypeGenerator)
- `clusters`: [ClusterGenerator](#_r_b9_-v1alpha1.ClusterGenerator)
- `git`: [GitGenerator](#_r_b9_-v1alpha1.GitGenerator)
- `list`: [ListGenerator](#_r_b9_-v1alpha1.ListGenerator)
- `matrix`: [MatrixGenerator](#_r_b9_-v1alpha1.MatrixGenerator)
- `merge`: [MergeGenerator](#_r_b9_-v1alpha1.MergeGenerator)
- `plugin`: [PluginGenerator](#_r_b9_-v1alpha1.PluginGenerator)
- `pullRequest`: [PullRequestGenerator](#_r_b9_-v1alpha1.PullRequestGenerator)
- `scmProvider`: [SCMProviderGenerator](#_r_b9_-v1alpha1.SCMProviderGenerator)
- `selector`: [LabelSelector](#_r_b9_-v1.LabelSelector)A label selector is a label query over a set of resources. The result of matchLabels and matchExpressions are ANDed. An empty label selector matches all objects. A null label selector matches no objects.



## [#](#_r_b9_-v1alpha1.DuckTypeGenerator)DuckTypeGenerator

- `configMapRef`: `string`
- `labelSelector`: [LabelSelector](#_r_b9_-v1.LabelSelector)A label selector is a label query over a set of resources. The result of matchLabels and matchExpressions are ANDed. An empty label selector matches all objects. A null label selector matches no objects.


- `name`: `string`
- `requeueAfterSeconds`: `integer`
- `template`: [ApplicationSetTemplate](#_r_b9_-v1alpha1.ApplicationSetTemplate)
- `values`: `map[string]string`

## [#](#_r_b9_-v1.LabelSelector)LabelSelector

A label selector is a label query over a set of resources. The result of matchLabels and matchExpressions are ANDed. An empty label selector matches all objects. A null label selector matches no objects.

- `matchExpressions`: `[][LabelSelectorRequirement](#_r_b9_-v1.LabelSelectorRequirement)`matchExpressions is a list of label selector requirements. The requirements are ANDed.


- `matchLabels`: `map[string]string`matchLabels is a map of {key,value} pairs. A single {key,value} in the matchLabels map is equivalent to an element of matchExpressions, whose key field is "key", the operator is "In", and the values array contains only "value". The requirements are ANDed.



## [#](#_r_b9_-v1.LabelSelectorRequirement)LabelSelectorRequirement

A label selector requirement is a selector that contains values, a key, and an operator that relates the key and values.

- `key`: `string`key is the label key that the selector applies to.


- `operator`: `string`operator represents a key's relationship to a set of values. Valid operators are In, NotIn, Exists and DoesNotExist.


- `values`: `[]string`values is an array of string values. If the operator is In or NotIn, the values array must be non-empty. If the operator is Exists or DoesNotExist, the values array must be empty. This array is replaced during a strategic merge patch.



## [#](#_r_b9_-v1alpha1.ApplicationSetTemplate)ApplicationSetTemplate

- `metadata`: [ApplicationSetTemplateMeta](#_r_b9_-v1alpha1.ApplicationSetTemplateMeta)
- `spec`: [ApplicationSpec](#_r_b9_-v1alpha1.ApplicationSpec)

## [#](#_r_b9_-v1alpha1.ApplicationSetTemplateMeta)ApplicationSetTemplateMeta

- `annotations`: `map[string]string`
- `finalizers`: `[]string`
- `labels`: `map[string]string`
- `name`: `string`
- `namespace`: `string`

## [#](#_r_b9_-v1alpha1.ApplicationSpec)ApplicationSpec

- `destination`: [ApplicationDestination](#_r_b9_-v1alpha1.ApplicationDestination)
- `ignoreDifferences`: `[][ResourceIgnoreDifferences](#_r_b9_-v1alpha1.ResourceIgnoreDifferences)`
- `info`: `[][Info](#_r_b9_-v1alpha1.Info)`
- `project`: `string`
- `revisionHistoryLimit`: `integer`
- `source`: [ApplicationSource](#_r_b9_-v1alpha1.ApplicationSource)
- `sourceHydrator`: [SourceHydrator](#_r_b9_-v1alpha1.SourceHydrator)
- `sources`: `[][ApplicationSource](#_r_b9_-v1alpha1.ApplicationSource)`
- `syncPolicy`: [SyncPolicy](#_r_b9_-v1alpha1.SyncPolicy)

## [#](#_r_b9_-v1alpha1.ApplicationDestination)ApplicationDestination

- `name`: `string`
- `namespace`: `string`
- `server`: `string`

## [#](#_r_b9_-v1alpha1.ResourceIgnoreDifferences)ResourceIgnoreDifferences

- `group`: `string`
- `jqPathExpressions`: `[]string`
- `jsonPointers`: `[]string`
- `kind`: `string`
- `managedFieldsManagers`: `[]string`
- `name`: `string`
- `namespace`: `string`

## [#](#_r_b9_-v1alpha1.Info)Info

- `name`: `string`
- `value`: `string`

## [#](#_r_b9_-v1alpha1.ApplicationSource)ApplicationSource

- `chart`: `string`
- `directory`: [ApplicationSourceDirectory](#_r_b9_-v1alpha1.ApplicationSourceDirectory)
- `helm`: [ApplicationSourceHelm](#_r_b9_-v1alpha1.ApplicationSourceHelm)
- `kustomize`: [ApplicationSourceKustomize](#_r_b9_-v1alpha1.ApplicationSourceKustomize)
- `name`: `string`
- `path`: `string`
- `plugin`: [ApplicationSourcePlugin](#_r_b9_-v1alpha1.ApplicationSourcePlugin)
- `ref`: `string`
- `repoURL`: `string`
- `targetRevision`: `string`

## [#](#_r_b9_-v1alpha1.ApplicationSourceDirectory)ApplicationSourceDirectory

- `exclude`: `string`
- `include`: `string`
- `jsonnet`: [ApplicationSourceJsonnet](#_r_b9_-v1alpha1.ApplicationSourceJsonnet)
- `recurse`: `boolean`

## [#](#_r_b9_-v1alpha1.ApplicationSourceJsonnet)ApplicationSourceJsonnet

- `extVars`: `[][JsonnetVar](#_r_b9_-v1alpha1.JsonnetVar)`
- `libs`: `[]string`
- `tlas`: `[][JsonnetVar](#_r_b9_-v1alpha1.JsonnetVar)`

## [#](#_r_b9_-v1alpha1.JsonnetVar)JsonnetVar

- `code`: `boolean`
- `name`: `string`
- `value`: `string`

## [#](#_r_b9_-v1alpha1.ApplicationSourceHelm)ApplicationSourceHelm

- `apiVersions`: `[]string`
- `fileParameters`: `[][HelmFileParameter](#_r_b9_-v1alpha1.HelmFileParameter)`
- `ignoreMissingValueFiles`: `boolean`
- `kubeVersion`: `string`
- `namespace`: `string`
- `parameters`: `[][HelmParameter](#_r_b9_-v1alpha1.HelmParameter)`
- `passCredentials`: `boolean`
- `releaseName`: `string`
- `skipCrds`: `boolean`
- `skipSchemaValidation`: `boolean`
- `skipTests`: `boolean`
- `valueFiles`: `[]string`
- `values`: `string`
- `valuesObject`: `string`
- `version`: `string`

## [#](#_r_b9_-v1alpha1.HelmFileParameter)HelmFileParameter

- `name`: `string`
- `path`: `string`

## [#](#_r_b9_-v1alpha1.HelmParameter)HelmParameter

- `forceString`: `boolean`
- `name`: `string`
- `value`: `string`

## [#](#_r_b9_-v1alpha1.ApplicationSourceKustomize)ApplicationSourceKustomize

- `apiVersions`: `[]string`
- `commonAnnotations`: `map[string]string`
- `commonAnnotationsEnvsubst`: `boolean`
- `commonLabels`: `map[string]string`
- `components`: `[]string`
- `forceCommonAnnotations`: `boolean`
- `forceCommonLabels`: `boolean`
- `images`: `[]string`
- `kubeVersion`: `string`
- `labelWithoutSelector`: `boolean`
- `namePrefix`: `string`
- `nameSuffix`: `string`
- `namespace`: `string`
- `patches`: `[][KustomizePatch](#_r_b9_-v1alpha1.KustomizePatch)`
- `replicas`: `[][KustomizeReplica](#_r_b9_-v1alpha1.KustomizeReplica)`
- `version`: `string`

## [#](#_r_b9_-v1alpha1.KustomizePatch)KustomizePatch

- `options`: `map[string]boolean`
- `patch`: `string`
- `path`: `string`
- `target`: [KustomizeSelector](#_r_b9_-v1alpha1.KustomizeSelector)

## [#](#_r_b9_-v1alpha1.KustomizeSelector)KustomizeSelector

- `annotationSelector`: `string`
- `group`: `string`
- `kind`: `string`
- `labelSelector`: `string`
- `name`: `string`
- `namespace`: `string`
- `version`: `string`

## [#](#_r_b9_-v1alpha1.KustomizeReplica)KustomizeReplica

- `count`: `string`
- `name`: `string`

## [#](#_r_b9_-v1alpha1.ApplicationSourcePlugin)ApplicationSourcePlugin

- `env`: `[][EnvEntry](#_r_b9_-v1alpha1.EnvEntry)`
- `name`: `string`
- `parameters`: `[][ApplicationSourcePluginParameter](#_r_b9_-v1alpha1.ApplicationSourcePluginParameter)`

## [#](#_r_b9_-v1alpha1.EnvEntry)EnvEntry

- `name`: `string`
- `value`: `string`

## [#](#_r_b9_-v1alpha1.ApplicationSourcePluginParameter)ApplicationSourcePluginParameter

- `OptionalArray`: [OptionalArray](#_r_b9_-v1alpha1.OptionalArray)
- `OptionalMap`: [OptionalMap](#_r_b9_-v1alpha1.OptionalMap)
- `name`: `string`
- `string`: `string`

## [#](#_r_b9_-v1alpha1.OptionalArray)OptionalArray

- `array`: `[]string`

## [#](#_r_b9_-v1alpha1.OptionalMap)OptionalMap

- `map`: `map[string]string`

## [#](#_r_b9_-v1alpha1.SourceHydrator)SourceHydrator

- `drySource`: [DrySource](#_r_b9_-v1alpha1.DrySource)
- `hydrateTo`: [HydrateTo](#_r_b9_-v1alpha1.HydrateTo)
- `syncSource`: [SyncSource](#_r_b9_-v1alpha1.SyncSource)

## [#](#_r_b9_-v1alpha1.DrySource)DrySource

- `path`: `string`
- `repoURL`: `string`
- `targetRevision`: `string`

## [#](#_r_b9_-v1alpha1.HydrateTo)HydrateTo

- `targetBranch`: `string`

## [#](#_r_b9_-v1alpha1.SyncSource)SyncSource

- `path`: `string`
- `targetBranch`: `string`

## [#](#_r_b9_-v1alpha1.SyncPolicy)SyncPolicy

- `automated`: [SyncPolicyAutomated](#_r_b9_-v1alpha1.SyncPolicyAutomated)
- `managedNamespaceMetadata`: [ManagedNamespaceMetadata](#_r_b9_-v1alpha1.ManagedNamespaceMetadata)
- `retry`: [RetryStrategy](#_r_b9_-v1alpha1.RetryStrategy)
- `syncOptions`: `[]string`

## [#](#_r_b9_-v1alpha1.SyncPolicyAutomated)SyncPolicyAutomated

- `allowEmpty`: `boolean`
- `prune`: `boolean`
- `selfHeal`: `boolean`

## [#](#_r_b9_-v1alpha1.ManagedNamespaceMetadata)ManagedNamespaceMetadata

- `annotations`: `map[string]string`
- `labels`: `map[string]string`

## [#](#_r_b9_-v1alpha1.RetryStrategy)RetryStrategy

- `backoff`: [Backoff](#_r_b9_-v1alpha1.Backoff)
- `limit`: `integer`

## [#](#_r_b9_-v1alpha1.Backoff)Backoff

- `duration`: `string`
- `factor`: `integer`
- `maxDuration`: `string`

## [#](#_r_b9_-v1alpha1.ClusterGenerator)ClusterGenerator

- `flatList`: `boolean`
- `selector`: [LabelSelector](#_r_b9_-v1.LabelSelector)A label selector is a label query over a set of resources. The result of matchLabels and matchExpressions are ANDed. An empty label selector matches all objects. A null label selector matches no objects.


- `template`: [ApplicationSetTemplate](#_r_b9_-v1alpha1.ApplicationSetTemplate)
- `values`: `map[string]string`

## [#](#_r_b9_-v1alpha1.GitGenerator)GitGenerator

- `directories`: `[][GitDirectoryGeneratorItem](#_r_b9_-v1alpha1.GitDirectoryGeneratorItem)`
- `files`: `[][GitFileGeneratorItem](#_r_b9_-v1alpha1.GitFileGeneratorItem)`
- `pathParamPrefix`: `string`
- `repoURL`: `string`
- `requeueAfterSeconds`: `integer`
- `revision`: `string`
- `template`: [ApplicationSetTemplate](#_r_b9_-v1alpha1.ApplicationSetTemplate)
- `values`: `map[string]string`

## [#](#_r_b9_-v1alpha1.GitDirectoryGeneratorItem)GitDirectoryGeneratorItem

- `exclude`: `boolean`
- `path`: `string`

## [#](#_r_b9_-v1alpha1.GitFileGeneratorItem)GitFileGeneratorItem

- `path`: `string`

## [#](#_r_b9_-v1alpha1.ListGenerator)ListGenerator

- `elements`: `[][JSON](#_r_b9_-v1.JSON)`
- `elementsYaml`: `string`
- `template`: [ApplicationSetTemplate](#_r_b9_-v1alpha1.ApplicationSetTemplate)

## [#](#_r_b9_-v1.JSON)JSON

## [#](#_r_b9_-v1alpha1.MatrixGenerator)MatrixGenerator

- `generators`: `[][ApplicationSetNestedGenerator](#_r_b9_-v1alpha1.ApplicationSetNestedGenerator)`
- `template`: [ApplicationSetTemplate](#_r_b9_-v1alpha1.ApplicationSetTemplate)

## [#](#_r_b9_-v1alpha1.ApplicationSetNestedGenerator)ApplicationSetNestedGenerator

- `clusterDecisionResource`: [DuckTypeGenerator](#_r_b9_-v1alpha1.DuckTypeGenerator)
- `clusters`: [ClusterGenerator](#_r_b9_-v1alpha1.ClusterGenerator)
- `git`: [GitGenerator](#_r_b9_-v1alpha1.GitGenerator)
- `list`: [ListGenerator](#_r_b9_-v1alpha1.ListGenerator)
- `matrix`: `string`
- `merge`: `string`
- `plugin`: [PluginGenerator](#_r_b9_-v1alpha1.PluginGenerator)
- `pullRequest`: [PullRequestGenerator](#_r_b9_-v1alpha1.PullRequestGenerator)
- `scmProvider`: [SCMProviderGenerator](#_r_b9_-v1alpha1.SCMProviderGenerator)
- `selector`: [LabelSelector](#_r_b9_-v1.LabelSelector)A label selector is a label query over a set of resources. The result of matchLabels and matchExpressions are ANDed. An empty label selector matches all objects. A null label selector matches no objects.



## [#](#_r_b9_-v1alpha1.PluginGenerator)PluginGenerator

- `configMapRef`: [PluginConfigMapRef](#_r_b9_-v1alpha1.PluginConfigMapRef)
- `input`: [PluginInput](#_r_b9_-v1alpha1.PluginInput)
- `requeueAfterSeconds`: `integer`
- `template`: [ApplicationSetTemplate](#_r_b9_-v1alpha1.ApplicationSetTemplate)
- `values`: `map[string]string`

## [#](#_r_b9_-v1alpha1.PluginConfigMapRef)PluginConfigMapRef

- `name`: `string`

## [#](#_r_b9_-v1alpha1.PluginInput)PluginInput

- `parameters`: `map[string][JSON](#_r_b9_-v1.JSON)`

## [#](#_r_b9_-v1alpha1.PullRequestGenerator)PullRequestGenerator

- `azuredevops`: [PullRequestGeneratorAzureDevOps](#_r_b9_-v1alpha1.PullRequestGeneratorAzureDevOps)
- `bitbucket`: [PullRequestGeneratorBitbucket](#_r_b9_-v1alpha1.PullRequestGeneratorBitbucket)
- `bitbucketServer`: [PullRequestGeneratorBitbucketServer](#_r_b9_-v1alpha1.PullRequestGeneratorBitbucketServer)
- `filters`: `[][PullRequestGeneratorFilter](#_r_b9_-v1alpha1.PullRequestGeneratorFilter)`
- `gitea`: [PullRequestGeneratorGitea](#_r_b9_-v1alpha1.PullRequestGeneratorGitea)
- `github`: [PullRequestGeneratorGithub](#_r_b9_-v1alpha1.PullRequestGeneratorGithub)
- `gitlab`: [PullRequestGeneratorGitLab](#_r_b9_-v1alpha1.PullRequestGeneratorGitLab)
- `requeueAfterSeconds`: `integer`
- `template`: [ApplicationSetTemplate](#_r_b9_-v1alpha1.ApplicationSetTemplate)

## [#](#_r_b9_-v1alpha1.PullRequestGeneratorAzureDevOps)PullRequestGeneratorAzureDevOps

- `api`: `string`
- `labels`: `[]string`
- `organization`: `string`
- `project`: `string`
- `repo`: `string`
- `tokenRef`: [SecretRef](#_r_b9_-v1alpha1.SecretRef)

## [#](#_r_b9_-v1alpha1.SecretRef)SecretRef

- `key`: `string`
- `secretName`: `string`

## [#](#_r_b9_-v1alpha1.PullRequestGeneratorBitbucket)PullRequestGeneratorBitbucket

- `api`: `string`
- `basicAuth`: [BasicAuthBitbucketServer](#_r_b9_-v1alpha1.BasicAuthBitbucketServer)
- `bearerToken`: [BearerTokenBitbucketCloud](#_r_b9_-v1alpha1.BearerTokenBitbucketCloud)
- `owner`: `string`
- `repo`: `string`

## [#](#_r_b9_-v1alpha1.BasicAuthBitbucketServer)BasicAuthBitbucketServer

- `passwordRef`: [SecretRef](#_r_b9_-v1alpha1.SecretRef)
- `username`: `string`

## [#](#_r_b9_-v1alpha1.BearerTokenBitbucketCloud)BearerTokenBitbucketCloud

- `tokenRef`: [SecretRef](#_r_b9_-v1alpha1.SecretRef)

## [#](#_r_b9_-v1alpha1.PullRequestGeneratorBitbucketServer)PullRequestGeneratorBitbucketServer

- `api`: `string`
- `basicAuth`: [BasicAuthBitbucketServer](#_r_b9_-v1alpha1.BasicAuthBitbucketServer)
- `bearerToken`: [BearerTokenBitbucket](#_r_b9_-v1alpha1.BearerTokenBitbucket)
- `caRef`: [ConfigMapKeyRef](#_r_b9_-v1alpha1.ConfigMapKeyRef)
- `insecure`: `boolean`
- `project`: `string`
- `repo`: `string`

## [#](#_r_b9_-v1alpha1.BearerTokenBitbucket)BearerTokenBitbucket

- `tokenRef`: [SecretRef](#_r_b9_-v1alpha1.SecretRef)

## [#](#_r_b9_-v1alpha1.ConfigMapKeyRef)ConfigMapKeyRef

- `configMapName`: `string`
- `key`: `string`

## [#](#_r_b9_-v1alpha1.PullRequestGeneratorFilter)PullRequestGeneratorFilter

- `branchMatch`: `string`
- `targetBranchMatch`: `string`

## [#](#_r_b9_-v1alpha1.PullRequestGeneratorGitea)PullRequestGeneratorGitea

- `api`: `string`
- `insecure`: `boolean`
- `owner`: `string`
- `repo`: `string`
- `tokenRef`: [SecretRef](#_r_b9_-v1alpha1.SecretRef)

## [#](#_r_b9_-v1alpha1.PullRequestGeneratorGithub)PullRequestGeneratorGithub

- `api`: `string`
- `appSecretName`: `string`
- `labels`: `[]string`
- `owner`: `string`
- `repo`: `string`
- `tokenRef`: [SecretRef](#_r_b9_-v1alpha1.SecretRef)

## [#](#_r_b9_-v1alpha1.PullRequestGeneratorGitLab)PullRequestGeneratorGitLab

- `api`: `string`
- `caRef`: [ConfigMapKeyRef](#_r_b9_-v1alpha1.ConfigMapKeyRef)
- `insecure`: `boolean`
- `labels`: `[]string`
- `project`: `string`
- `pullRequestState`: `string`
- `tokenRef`: [SecretRef](#_r_b9_-v1alpha1.SecretRef)

## [#](#_r_b9_-v1alpha1.SCMProviderGenerator)SCMProviderGenerator

- `awsCodeCommit`: [SCMProviderGeneratorAWSCodeCommit](#_r_b9_-v1alpha1.SCMProviderGeneratorAWSCodeCommit)
- `azureDevOps`: [SCMProviderGeneratorAzureDevOps](#_r_b9_-v1alpha1.SCMProviderGeneratorAzureDevOps)
- `bitbucket`: [SCMProviderGeneratorBitbucket](#_r_b9_-v1alpha1.SCMProviderGeneratorBitbucket)
- `bitbucketServer`: [SCMProviderGeneratorBitbucketServer](#_r_b9_-v1alpha1.SCMProviderGeneratorBitbucketServer)
- `cloneProtocol`: `string`
- `filters`: `[][SCMProviderGeneratorFilter](#_r_b9_-v1alpha1.SCMProviderGeneratorFilter)`
- `gitea`: [SCMProviderGeneratorGitea](#_r_b9_-v1alpha1.SCMProviderGeneratorGitea)
- `github`: [SCMProviderGeneratorGithub](#_r_b9_-v1alpha1.SCMProviderGeneratorGithub)
- `gitlab`: [SCMProviderGeneratorGitlab](#_r_b9_-v1alpha1.SCMProviderGeneratorGitlab)
- `requeueAfterSeconds`: `integer`
- `template`: [ApplicationSetTemplate](#_r_b9_-v1alpha1.ApplicationSetTemplate)
- `values`: `map[string]string`

## [#](#_r_b9_-v1alpha1.SCMProviderGeneratorAWSCodeCommit)SCMProviderGeneratorAWSCodeCommit

- `allBranches`: `boolean`
- `region`: `string`
- `role`: `string`
- `tagFilters`: `[][TagFilter](#_r_b9_-v1alpha1.TagFilter)`

## [#](#_r_b9_-v1alpha1.TagFilter)TagFilter

- `key`: `string`
- `value`: `string`

## [#](#_r_b9_-v1alpha1.SCMProviderGeneratorAzureDevOps)SCMProviderGeneratorAzureDevOps

- `accessTokenRef`: [SecretRef](#_r_b9_-v1alpha1.SecretRef)
- `allBranches`: `boolean`
- `api`: `string`
- `organization`: `string`
- `teamProject`: `string`

## [#](#_r_b9_-v1alpha1.SCMProviderGeneratorBitbucket)SCMProviderGeneratorBitbucket

- `allBranches`: `boolean`
- `appPasswordRef`: [SecretRef](#_r_b9_-v1alpha1.SecretRef)
- `owner`: `string`
- `user`: `string`

## [#](#_r_b9_-v1alpha1.SCMProviderGeneratorBitbucketServer)SCMProviderGeneratorBitbucketServer

- `allBranches`: `boolean`
- `api`: `string`
- `basicAuth`: [BasicAuthBitbucketServer](#_r_b9_-v1alpha1.BasicAuthBitbucketServer)
- `bearerToken`: [BearerTokenBitbucket](#_r_b9_-v1alpha1.BearerTokenBitbucket)
- `caRef`: [ConfigMapKeyRef](#_r_b9_-v1alpha1.ConfigMapKeyRef)
- `insecure`: `boolean`
- `project`: `string`

## [#](#_r_b9_-v1alpha1.SCMProviderGeneratorFilter)SCMProviderGeneratorFilter

- `branchMatch`: `string`
- `labelMatch`: `string`
- `pathsDoNotExist`: `[]string`
- `pathsExist`: `[]string`
- `repositoryMatch`: `string`

## [#](#_r_b9_-v1alpha1.SCMProviderGeneratorGitea)SCMProviderGeneratorGitea

- `allBranches`: `boolean`
- `api`: `string`
- `insecure`: `boolean`
- `owner`: `string`
- `tokenRef`: [SecretRef](#_r_b9_-v1alpha1.SecretRef)

## [#](#_r_b9_-v1alpha1.SCMProviderGeneratorGithub)SCMProviderGeneratorGithub

- `allBranches`: `boolean`
- `api`: `string`
- `appSecretName`: `string`
- `organization`: `string`
- `tokenRef`: [SecretRef](#_r_b9_-v1alpha1.SecretRef)

## [#](#_r_b9_-v1alpha1.SCMProviderGeneratorGitlab)SCMProviderGeneratorGitlab

- `allBranches`: `boolean`
- `api`: `string`
- `caRef`: [ConfigMapKeyRef](#_r_b9_-v1alpha1.ConfigMapKeyRef)
- `group`: `string`
- `includeSharedProjects`: `boolean`
- `includeSubgroups`: `boolean`
- `insecure`: `boolean`
- `tokenRef`: [SecretRef](#_r_b9_-v1alpha1.SecretRef)
- `topic`: `string`

## [#](#_r_b9_-v1alpha1.MergeGenerator)MergeGenerator

- `generators`: `[][ApplicationSetNestedGenerator](#_r_b9_-v1alpha1.ApplicationSetNestedGenerator)`
- `mergeKeys`: `[]string`
- `template`: [ApplicationSetTemplate](#_r_b9_-v1alpha1.ApplicationSetTemplate)

## [#](#_r_b9_-v1alpha1.ApplicationSetResourceIgnoreDifferences)ApplicationSetResourceIgnoreDifferences

- `jqPathExpressions`: `[]string`
- `jsonPointers`: `[]string`
- `name`: `string`

## [#](#_r_b9_-v1alpha1.ApplicationPreservedFields)ApplicationPreservedFields

- `annotations`: `[]string`
- `labels`: `[]string`

## [#](#_r_b9_-v1alpha1.ApplicationSetStrategy)ApplicationSetStrategy

- `rollingSync`: [ApplicationSetRolloutStrategy](#_r_b9_-v1alpha1.ApplicationSetRolloutStrategy)
- `type`: `string`

## [#](#_r_b9_-v1alpha1.ApplicationSetRolloutStrategy)ApplicationSetRolloutStrategy

- `steps`: `[][ApplicationSetRolloutStep](#_r_b9_-v1alpha1.ApplicationSetRolloutStep)`

## [#](#_r_b9_-v1alpha1.ApplicationSetRolloutStep)ApplicationSetRolloutStep

- `matchExpressions`: `[][ApplicationMatchExpression](#_r_b9_-v1alpha1.ApplicationMatchExpression)`
- `maxUpdate`: `string`

## [#](#_r_b9_-v1alpha1.ApplicationMatchExpression)ApplicationMatchExpression

- `key`: `string`
- `operator`: `string`
- `values`: `[]string`

## [#](#_r_b9_-v1alpha1.ApplicationSetSyncPolicy)ApplicationSetSyncPolicy

- `applicationsSync`: `string`
- `preserveResourcesOnDeletion`: `boolean`

## [#](#_r_b9_-v1alpha1.ApplicationSetStatus)ApplicationSetStatus

- `applicationStatus`: `[][ApplicationSetApplicationStatus](#_r_b9_-v1alpha1.ApplicationSetApplicationStatus)`
- `conditions`: `[][ApplicationSetCondition](#_r_b9_-v1alpha1.ApplicationSetCondition)`
- `resources`: `[][ResourceStatus](#_r_b9_-v1alpha1.ResourceStatus)`

## [#](#_r_b9_-v1alpha1.ApplicationSetApplicationStatus)ApplicationSetApplicationStatus

- `application`: `string`
- `lastTransitionTime`: `string`
- `message`: `string`
- `status`: `string`
- `step`: `string`
- `targetRevisions`: `[]string`

## [#](#_r_b9_-v1alpha1.ApplicationSetCondition)ApplicationSetCondition

- `lastTransitionTime`: `string`
- `message`: `string`
- `reason`: `string`
- `status`: `string`
- `type`: `string`

## [#](#_r_b9_-v1alpha1.ResourceStatus)ResourceStatus

- `group`: `string`
- `health`: [HealthStatus](#_r_b9_-v1alpha1.HealthStatus)
- `hook`: `boolean`
- `kind`: `string`
- `name`: `string`
- `namespace`: `string`
- `requiresDeletionConfirmation`: `boolean`
- `requiresPruning`: `boolean`
- `status`: `string`
- `syncWave`: `integer`
- `version`: `string`

## [#](#_r_b9_-v1alpha1.HealthStatus)HealthStatus

- `lastTransitionTime`: `string`
- `message`: `string`
- `status`: `string`

## [#](#_r_b9_-v1.ListMeta)ListMeta

ListMeta describes metadata that synthetic resources must have, including lists and various status objects. A resource may have only one of {ObjectMeta, ListMeta}.

- `continue`: `string`continue may be set if the user set a limit on the number of items returned, and indicates that the server has more data available. The value is opaque and may be used to issue another request to the endpoint that served this list to retrieve the next set of available objects. Continuing a consistent list may not be possible if the server configuration has changed or more than a few minutes have passed. The resourceVersion field returned when using this continue value will be identical to the value in the first response, unless you have received this token from an error message.


- `remainingItemCount`: `integer`remainingItemCount is the number of subsequent items in the list which are not included in this list response. If the list request contained label or field selectors, then the number of remaining items is unknown and the field will be left unset and omitted during serialization. If the list is complete (either because it is not chunking or because this is the last chunk), then there are no more remaining items and this field will be left unset and omitted during serialization. Servers older than v1.15 do not set this field. The intended use of the remainingItemCount is *estimating* the size of a collection. Clients should not rely on the remainingItemCount to be set or to be exact.


- `resourceVersion`: `string`String that identifies the server's internal version of this object that can be used by clients to determine when objects have changed. Value must be treated as opaque by clients and passed unmodified back to the server. Populated by the system. Read-only. More info: [https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#concurrency-control-and-consistency](https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#concurrency-control-and-consistency)


- `selfLink`: `string`Deprecated: selfLink is a legacy read-only field that is no longer populated by the system.



