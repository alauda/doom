import { openapiSchemaToJsonSchema } from '@openapi-contrib/openapi-schema-to-json-schema'
import type { RspressPlugin } from '@rspress/core'
import type { OpenAPI, OpenAPIV3_1 } from 'openapi-types'
import { convertObj } from 'swagger2openapi'

import { generateRuntimeModule } from '../../utils/index.js'

import type { ApiPluginOptions, CustomResourceDefinition } from './types.js'

export type * from './types.js'

// @internal
declare module 'doom-@api-crdsMap' {
  const crdsMap: Record<string, CustomResourceDefinition>
}

// @internal
declare module 'doom-@api-openapisMap' {
  const openapisMap: Record<string, OpenAPIV3_1.Document>
}

// @internal
declare module 'doom-@api-virtual' {
  const virtual: Pick<ApiPluginOptions, 'references' | 'pathPrefix'>
}

export const apiPlugin = ({
  localBasePath,
}: ApiPluginOptions): RspressPlugin => {
  return {
    name: 'doom-api',
    async addRuntimeModules(config, isProd) {
      return {
        'doom-@api-virtual': `export default ${JSON.stringify({ references: config.api?.references, pathPrefix: config.api?.pathPrefix }, null, isProd ? 0 : 2)}`,
        ...(await generateRuntimeModule(
          config.api?.crds,
          'api-crds',
          config.root!,
          localBasePath,
          isProd,
        )),
        ...(await generateRuntimeModule<OpenAPI.Document>(
          config.api?.openapis,
          'api-openapis',
          config.root!,
          localBasePath,
          isProd,
          async (doc) => {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            doc.info ??= { title: 'Unknown', version: '0.0.0' }

            if ('swagger' in doc && doc.swagger === '2.0') {
              doc = (await convertObj(doc, {})).openapi
            }

            if ('openapi' in doc && doc.openapi.startsWith('3.0.')) {
              doc = openapiSchemaToJsonSchema(doc) as OpenAPIV3_1.Document
              doc.openapi = '3.1.0'
            }

            return doc
          },
        )),
      }
    },
  }
}
