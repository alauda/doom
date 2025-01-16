import { usePageData } from '@rspress/core/runtime'
import { getCustomMDXComponent } from '@rspress/core/theme'
import type { OpenAPIV3_1 } from 'openapi-types'
import { type ReactNode, useMemo, useState } from 'react'

import { modelName, omitRoutePathRefs, resolveRef } from '../utils.js'
import { HeadingTitle } from './_HeadingTitle.js'
import { Markdown } from './_Markdown.js'
import { RefLink } from './_RefLink.js'

import openapisMap from 'doom-@api-openapisMap'

export interface OpenAPIRefProps {
  /**
   * The schema name under the OpenAPI schema `definitions` (swagger 2.0) or `components/schemas` (openapi 3.x).
   */
  schema: string
  /**
   * The specific path to the OpenAPI schema, otherwise the first matched will be used.
   */
  openapiPath?: string
  collectRefs?: boolean
}

export const OpenAPIProperties = ({
  properties,
  openapi,
}: {
  properties: Record<
    string,
    OpenAPIV3_1.ReferenceObject | OpenAPIV3_1.SchemaObject
  >
  openapi: OpenAPIV3_1.Document
}) => {
  const [X] = useState(getCustomMDXComponent)
  return (
    <X.ul>
      {Object.entries(properties).map(([name, prop], index) => {
        const propObj = '$ref' in prop ? resolveRef(openapi, prop.$ref) : prop
        const type = propObj.type
        let typeNode: ReactNode
        if (type === 'array') {
          const { items } = propObj
          const itemsObj =
            '$ref' in items ? resolveRef(openapi, items.$ref) : items
          const itemsType = itemsObj.type
          typeNode = (
            <code>
              []
              {typeof itemsType === 'string'
                ? itemsType
                : '$ref' in items && <RefLink $ref={items.$ref} />}
            </code>
          )
        } else if (type === 'object') {
          if (typeof propObj.additionalProperties === 'object') {
            const props = propObj.additionalProperties
            const propsObj =
              '$ref' in props ? resolveRef(openapi, props.$ref) : props
            const propsType = propsObj.type
            typeNode = (
              <code>
                map[string]
                {typeof propsType === 'string'
                  ? propsType
                  : '$ref' in props && <RefLink $ref={props.$ref} />}
              </code>
            )
          } else {
            typeNode = <code>{type}</code>
          }
        } else if (typeof type === 'string') {
          typeNode = <code>{type}</code>
        } else if ('$ref' in prop) {
          typeNode = <RefLink $ref={prop.$ref} />
        }
        return (
          <X.li key={index}>
            <code>{name}</code>: {typeNode}
            <Markdown>{propObj.description}</Markdown>
          </X.li>
        )
      })}
    </X.ul>
  )
}

const getRefsForSchema = (
  openapi: OpenAPIV3_1.Document,
  schema: string,
  knownRefs: Record<string, string>,
) => {
  const refSchema = openapi.components?.schemas![schema]

  if (!refSchema) {
    return []
  }

  const refs = new Set<string>()

  const collectRefs = (schema: object) => {
    if ('$ref' in schema && typeof schema.$ref === 'string') {
      const ref = schema.$ref.replace('#/components/schemas/', '')
      if (!knownRefs[ref]) {
        refs.add(ref)
        schema = resolveRef(openapi, schema.$ref)
      }
    }
    for (const value of Object.values(schema)) {
      if (typeof value === 'object') {
        collectRefs(value as object)
      }
    }
  }

  collectRefs(refSchema)

  return Array.from(refs)
}

export const OpenAPIRef = ({
  schema,
  openapiPath: openapiPath_,
  collectRefs = true,
}: OpenAPIRefProps) => {
  const { page } = usePageData()

  const [schemaItem, openapi, openapiPath] = useMemo(() => {
    for (const [pathname, openapi] of Object.entries(openapisMap)) {
      if (openapiPath_ && pathname !== openapiPath_) {
        continue
      }
      const schemaItem = openapi.components?.schemas?.[schema]
      if (schemaItem) {
        return [schemaItem, openapi, pathname]
      }
    }
    return []
  }, [])

  if (!schemaItem || !openapi) {
    console.error(`No OpenAPI schema definition found for ${schema}\n`)
    return null
  }

  const refs = useMemo(() => {
    if (collectRefs) {
      return getRefsForSchema(
        openapi,
        schema,
        omitRoutePathRefs(page.routePath),
      )
    }
  }, [collectRefs, openapi, page.routePath, schema])

  return (
    <>
      <HeadingTitle slug={schema} level={2}>
        {modelName(schema)}
      </HeadingTitle>
      <Markdown>{schemaItem.description}</Markdown>
      {schemaItem.properties && (
        <OpenAPIProperties
          properties={schemaItem.properties}
          openapi={openapi}
        />
      )}
      {refs?.map((schema) => (
        <OpenAPIRef
          key={schema}
          schema={schema}
          openapiPath={openapiPath}
          collectRefs={false}
        />
      ))}
    </>
  )
}

export default OpenAPIRef
