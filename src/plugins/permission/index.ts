import type { RspressPlugin } from '@rspress/core'

import type { K8sTypeList } from '../../shared/types.js'
import { generateRuntimeModule } from '../../utils/index.js'
import type {
  FunctionResource,
  PermissionPluginOptions,
  RoleTemplate,
} from './types.js'

export type * from './types.js'

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
}: PermissionPluginOptions): RspressPlugin => {
  return {
    name: 'doom-permission',
    async addRuntimeModules(config, isProd) {
      return {
        ...(await generateRuntimeModule<
          K8sTypeList<FunctionResource>,
          FunctionResource[]
        >(
          config.permission?.functionresources,
          'permission-functionResources',
          config.root!,
          localBasePath,
          isProd,
          ({ items }) => items,
        )),
        ...(await generateRuntimeModule<
          K8sTypeList<RoleTemplate>,
          RoleTemplate[]
        >(
          config.permission?.roletemplates,
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
