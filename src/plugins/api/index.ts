import { openapiSchemaToJsonSchema } from '@openapi-contrib/openapi-schema-to-json-schema'
import type { RspressPlugin } from '@rspress/core'
import type { OpenAPI, OpenAPIV3_1 } from 'openapi-types'
import { convertObj } from 'swagger2openapi'

import { generateRuntimeModule } from '../../utils/index.js'
import type { ApiPluginOptions, CustomResourceDefinition } from './types.js'

// @internal
declare module 'doom-@api-crdsMap' {
  const crdsMap: Record<string, CustomResourceDefinition>
}

// @internal
declare module 'doom-@api-openapisMap' {
  const openapisMap: Record<string, OpenAPIV3_1.Document>
}

export const apiPlugin = ({
  localBasePath,
  crds = [],
  openapis = [],
  references,
  pathPrefix,
}: ApiPluginOptions): RspressPlugin => {
  return {
    name: 'doom-api',
    extendPageData(pageData) {
      pageData.references = references
      pageData.pathPrefix = pathPrefix
    },
    async addRuntimeModules(_, isProd) {
      return {
        ...(await generateRuntimeModule(
          crds,
          'api-crds',
          localBasePath,
          isProd,
        )),
        ...(await generateRuntimeModule<OpenAPI.Document>(
          openapis,
          'api-openapis',
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
