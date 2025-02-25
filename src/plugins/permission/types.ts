import type { K8sTypeMeta } from '../../shared/types.js'

export interface FunctionResource extends K8sTypeMeta {
  kind: 'FunctionResource'
  spec: {
    rules: FunctionResourceRule[]
  }
}

export interface FunctionResourceRule {
  apiGroup: string
  bindCluster: 'bussiness' | 'global' | 'unlimit'
  bindNamespacePart: '' | 'common' | 'kube-public' | 'project_ns' | 'system'
  bindScope: 'cluster' | 'namespace'
  resources: string[]
}

export interface PermissionPluginOptions {
  functionresources?: string[]
  localBasePath: string
  roletemplates?: string[]
}

export interface RoleTemplate extends K8sTypeMeta {
  kind: 'RoleTemplate'
  spec: {
    rules: RoleTemplateRule[]
  }
}

export interface RoleTemplateRule {
  functionResourceRef: string
  verbs: RoleTemplateRuleVerb[]
}

export type RoleTemplateRuleVerb =
  | '*'
  | 'create'
  | 'delete'
  | 'deletecollection'
  | 'get'
  | 'list'
  | 'patch'
  | 'update'
  | 'watch'
