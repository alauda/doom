import { usePageData } from '@rspress/core/runtime'
import openapisMap from 'doom-@api-openapisMap'
import type { OpenAPIV3_1 } from 'openapi-types'
import { type ReactNode, useId, useMemo } from 'react'

import { modelName, omitRoutePathRefs, resolveRef } from '../utils.js'

import { HeadingTitle } from './_HeadingTitle.js'
import { Markdown } from './_Markdown.js'
import { RefLink } from './_RefLink.js'
import { X } from './_X.js'

export interface OpenAPIRefProps {
  /**
   * The schema name under the OpenAPI schema `definitions` (swagger 2.0) or `components/schemas` (openapi 3.x).
   */
  schema: string
  /**
   * The specific path to the OpenAPI schema, otherwise the first matched will be used.
   */
  openapiPath?: string
  uid?: string
  collectRefs?: boolean
}

export const OpenAPIProperty = ({
  name,
  property,
  openapi,
}: {
  name?: string
  property: OpenAPIV3_1.ReferenceObject | OpenAPIV3_1.SchemaObject
  openapi: OpenAPIV3_1.Document
}) => {
  const propObj =
    '$ref' in property ? resolveRef(openapi, property.$ref) : property
  const type = propObj.type
  let typeNode: ReactNode
  let extraNode: ReactNode
  if (type === 'array') {
    const { items } = propObj
    const itemsObj = '$ref' in items ? resolveRef(openapi, items.$ref) : items
    const itemsType = itemsObj.type
    typeNode = (
      <code>
        []
        {'$ref' in items ? <RefLink $ref={items.$ref} /> : itemsType}
      </code>
    )
  } else if (type === 'object') {
    if ('properties' in property && property.properties) {
      extraNode = (
        <div className="my-4">
          <em>Properties:</em>
          <OpenAPIProperties
            properties={property.properties}
            openapi={openapi}
          />
        </div>
      )
    }
    if (typeof propObj.additionalProperties === 'object') {
      const props = propObj.additionalProperties
      const propsObj = '$ref' in props ? resolveRef(openapi, props.$ref) : props
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
  } else if ('$ref' in property) {
    typeNode = <RefLink $ref={property.$ref} />
  }
  return (
    <>
      {name && (
        <>
          <code>{name}</code>:{' '}
        </>
      )}
      {typeNode}
      <Markdown>{propObj.description}</Markdown>
      {extraNode}
    </>
  )
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
  return (
    <X.ul>
      {Object.entries(properties).map(([name, property]) => (
        <X.li key={name}>
          <OpenAPIProperty name={name} property={property} openapi={openapi} />
        </X.li>
      ))}
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
    for (const value of Object.values(schema) as unknown[]) {
      if (value && typeof value === 'object') {
        collectRefs(value)
      }
    }
  }

  collectRefs(refSchema)

  return Array.from(refs)
}

export const OpenAPIRef = ({
  schema,
  openapiPath: openapiPath_,
  uid,
  collectRefs = true,
}: OpenAPIRefProps) => {
  const { page } = usePageData()

  const innerUid = useId()

  if (uid == null) {
    uid = innerUid
  }

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
  }, [openapiPath_, schema])

  const refs = useMemo(() => {
    if (collectRefs && openapi) {
      return getRefsForSchema(
        openapi,
        schema,
        omitRoutePathRefs(page.routePath),
      )
    }
  }, [collectRefs, openapi, page.routePath, schema])

  if (!schemaItem || !openapi) {
    console.error(`No OpenAPI schema definition found for ${schema}\n`)
    return null
  }

  return (
    <>
      <HeadingTitle uid={uid} slug={schema} level={2}>
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
          uid={uid}
          collectRefs={false}
        />
      ))}
    </>
  )
}

export default OpenAPIRef
