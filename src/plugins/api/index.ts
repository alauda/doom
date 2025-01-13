import path from 'node:path'

import { openapiSchemaToJsonSchema } from '@openapi-contrib/openapi-schema-to-json-schema'
import type { RspressPlugin } from '@rspress/core'
import type { OpenAPI, OpenAPIV3_1 } from 'openapi-types'
import { convertObj } from 'swagger2openapi'
import { glob } from 'tinyglobby'

import { resolveStaticConfig } from '../../utils/index.js'
import type { ApiPluginOptions, CustomResourceDefinition } from './types.js'

export const apiPlugin = ({
  localBasePath,
  crds,
  openapis,
  references,
  pathPrefix,
}: ApiPluginOptions): RspressPlugin => {
  return {
    name: 'doom-api',
    async extendPageData(pageData) {
      const crdsMap: Record<string, CustomResourceDefinition> = {}
      const openapisMap: Record<string, OpenAPIV3_1.Document> = {}

      if (crds) {
        for (const file of await glob(crds, {
          cwd: localBasePath,
        })) {
          crdsMap[file] = await resolveStaticConfig<CustomResourceDefinition>(
            path.resolve(localBasePath, file),
          )
        }
      }

      if (openapis) {
        for (const file of await glob(openapis, {
          cwd: localBasePath,
        })) {
          let doc = await resolveStaticConfig<OpenAPI.Document>(
            path.resolve(localBasePath, file),
          )

          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          doc.info ??= { title: 'Unknown', version: '0.0.0' }

          if ('swagger' in doc && doc.swagger === '2.0') {
            doc = (await convertObj(doc, {})).openapi
          }

          if ('openapi' in doc && doc.openapi.startsWith('3.0.')) {
            doc = openapiSchemaToJsonSchema(doc) as OpenAPIV3_1.Document
            doc.openapi = '3.1.0'
          }

          openapisMap[file] = doc as OpenAPIV3_1.Document
        }
      }

      pageData.crdsMap = crdsMap
      pageData.openapisMap = openapisMap
      pageData.references = references
      pageData.pathPrefix = pathPrefix
    },
  }
}
