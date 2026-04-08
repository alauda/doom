import { usePage } from '@rspress/core/runtime'
import openapisMap from 'doom-@api-openapisMap'
import type { OpenAPIV3_1 } from 'openapi-types'
import { type ReactNode, useMemo } from 'react'

import { modelName, omitRoutePathRefs, resolveRef } from '../utils.js'

import { Markdown } from './Markdown.js'
import { HeadingTitle } from './_HeadingTitle.js'
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
  /**
   * Whether to collect references from the schema.
   *
   * @default true
   */
  collectRefs?: boolean
}

export const get$Ref = (
  obj: OpenAPIV3_1.ReferenceObject | OpenAPIV3_1.SchemaObject,
) => {
  if ('$ref' in obj && obj.$ref) {
    return obj.$ref
  }
  if ('allOf' in obj && Array.isArray(obj.allOf)) {
    for (const item of obj.allOf) {
      if ('$ref' in item && item.$ref) {
        return item.$ref
      }
    }
  }
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
  const prop$Ref = get$Ref(property)

  const propObj = prop$Ref
    ? resolveRef(openapi, prop$Ref)!
    : (property as OpenAPIV3_1.SchemaObject)

  const type = propObj.type

  let typeNode: ReactNode
  let extraNode: ReactNode

  if (type === 'array') {
    const { items } = propObj
    const items$Ref = get$Ref(items)
    const itemsObj = items$Ref
      ? resolveRef(openapi, items$Ref)!
      : (items as OpenAPIV3_1.SchemaObject)
    const itemsType = itemsObj.type
    typeNode = (
      <code>
        []
        {items$Ref ? <RefLink $ref={items$Ref} /> : itemsType}
      </code>
    )
  } else if (type === 'object') {
    if (prop$Ref) {
      typeNode = <RefLink $ref={prop$Ref} />
    }

    if (typeof propObj.additionalProperties === 'object') {
      const props = propObj.additionalProperties
      const props$Ref = get$Ref(props)
      const propsObj = props$Ref
        ? resolveRef(openapi, props$Ref)!
        : (props as OpenAPIV3_1.SchemaObject)
      const propsType = propsObj.type
      typeNode = (
        <>
          {typeNode}
          <code>
            map[string]
            {typeof propsType === 'string'
              ? propsType
              : props$Ref && <RefLink $ref={props$Ref} />}
          </code>
        </>
      )

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
    } else if (!prop$Ref) {
      typeNode = <code>{type}</code>
    }
  } else if (typeof type === 'string') {
    typeNode = <code>{type}</code>
  } else if (prop$Ref) {
    typeNode = <RefLink $ref={prop$Ref} />
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
      const ref = schema.$ref.replace(/^#\/components\/[^/]+\//, '')
      if (!knownRefs[ref]) {
        refs.add(ref)
        schema = resolveRef(openapi, schema.$ref)!
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
  collectRefs = true,
}: OpenAPIRefProps) => {
  const { page } = usePage()

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const [schemaItem, openapi, openapiPath] = useMemo(() => {
    for (const [pathname, openapi] of Object.entries(openapisMap)) {
      if (openapiPath_ && pathname !== openapiPath_) {
        continue
      }
      const schemaItem = resolveRef(openapi, schema)
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
