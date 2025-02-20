import { RspressPlugin } from '@rspress/core'

import { K8sTypeList } from '../../shared/types.js'
import { generateRuntimeModule } from '../../utils/index.js'
import type {
  FunctionResource,
  PermissionPluginOptions,
  RoleTemplate,
} from './types.js'

// @internal
declare module 'doom-@permission-functionResourcesMap' {
  const functionResourcesMap: Record<string, FunctionResource[]>
}

// @internal
declare module 'doom-@permission-roleTemplatesMap' {
  const roleTemplatesMap: Record<string, RoleTemplate[]>
}

export const permissionPlugin = ({
  localBasePath,
  functionresources = [],
  roletemplates = [],
}: PermissionPluginOptions): RspressPlugin => {
  return {
    name: 'doom-permission',
    async addRuntimeModules(config, isProd) {
      return {
        ...(await generateRuntimeModule<
          K8sTypeList<FunctionResource>,
          FunctionResource[]
        >(
          functionresources,
          'permission-functionResources',
          localBasePath,
          config.root!,
          isProd,
          ({ items }) => items,
        )),
        ...(await generateRuntimeModule<
          K8sTypeList<RoleTemplate>,
          RoleTemplate[]
        >(
          roletemplates,
          'permission-roleTemplates',
          config.root!,
          localBasePath,
          isProd,
          ({ items }) => items,
        )),
      }
    },
  }
}
