import path from 'node:path'

import { openapiSchemaToJsonSchema } from '@openapi-contrib/openapi-schema-to-json-schema'
import type { RspressPlugin } from '@rspress/core'
import { convertObj } from 'swagger2openapi'
import { OpenAPI, OpenAPIV3_1 } from 'openapi-types'
import { glob } from 'tinyglobby'

import { DoomConfig, resolveStaticConfig } from '../../utils/index.js'
import { CustomResourceDefinition } from './types.js'

export const apiPlugin = (): RspressPlugin => {
  const crdsMap: Record<string, CustomResourceDefinition> = {}
  const openapisMap: Record<string, OpenAPIV3_1.Document> = {}

  const shared: {
    references?: Record<string, string>
    pathPrefix?: string
  } = {}

  return {
    name: 'doom-api',
    async beforeBuild(config_) {
      const config = config_ as DoomConfig

      if (!config.api) {
        return
      }

      const { crds, openapis, references, pathPrefix } = config.api

      if (crds) {
        for (const file of await glob(crds, {
          cwd: config.root,
        })) {
          crdsMap[file] = await resolveStaticConfig<CustomResourceDefinition>(
            path.resolve(config.root!, file),
          )
        }
      }

      if (openapis) {
        for (const file of await glob(openapis, {
          cwd: config.root,
        })) {
          let doc = await resolveStaticConfig<OpenAPI.Document>(
            path.resolve(config.root!, file),
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

      shared.references = references
      shared.pathPrefix = pathPrefix
    },
    extendPageData(pageData) {
      pageData.crdsMap = crdsMap
      pageData.openapisMap = openapisMap
      pageData.references = shared.references
      pageData.pathPrefix = shared.pathPrefix
    },
  }
}
