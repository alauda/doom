import path from 'node:path'

import { RspressPlugin } from '@rspress/core'
import { glob } from 'tinyglobby'
import type {
  FunctionResource,
  PermissionPluginOptions,
  RoleTemplate,
} from './types.js'
import { resolveStaticConfig } from '../../utils/index.js'
import { K8sTypeList } from '../../shared/types.js'

export const permissionPlugin = ({
  functionresources,
  localBasePath,
  roletemplates,
}: PermissionPluginOptions): RspressPlugin => {
  return {
    async extendPageData(pageData) {
      const functionResourcesMap: Record<string, FunctionResource[]> = {}
      const roleTemplatesMap: Record<string, RoleTemplate[]> = {}

      if (functionresources) {
        for (const file of await glob(functionresources, {
          cwd: localBasePath,
        })) {
          functionResourcesMap[file] = (
            await resolveStaticConfig<K8sTypeList<FunctionResource>>(
              path.resolve(localBasePath, file),
            )
          ).items
        }
      }

      if (roletemplates) {
        for (const file of await glob(roletemplates, {
          cwd: localBasePath,
        })) {
          roleTemplatesMap[file] = (
            await resolveStaticConfig<K8sTypeList<RoleTemplate>>(
              path.resolve(localBasePath, file),
            )
          ).items
        }
      }

      pageData.functionResourcesMap = functionResourcesMap
      pageData.roleTemplatesMap = roleTemplatesMap
    },
    name: 'doom-permission',
  }
}
