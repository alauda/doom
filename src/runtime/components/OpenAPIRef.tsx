import { usePageData } from '@rspress/core/runtime'
import { getCustomMDXComponent } from '@rspress/theme-default'
import { OpenAPIV3_1 } from 'openapi-types'
import { ReactNode, useMemo } from 'react'

import { ExtendedPageData } from '../types.js'
import {
  DEFAULT_COMMON_REFS,
  modelName,
  omitRoutePathRefs,
  resolveRef,
} from '../utils.js'
import { HeadingTitle } from './_HeadingTitle.js'
import { RefLink } from './_RefLink.js'
import { Markdown } from './_Markdown.js'

export interface OpenAPIRefProps {
  schema: string
  openapi?: OpenAPIV3_1.Document
  collectRefs?: boolean
}

const X = getCustomMDXComponent()

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
            typeNode = <X.code>{type}</X.code>
          }
        } else if (typeof type === 'string') {
          typeNode = <X.code>{type}</X.code>
        } else if ('$ref' in prop) {
          typeNode = <RefLink $ref={prop.$ref} />
        }
        return (
          <X.li key={index}>
            <X.code>{name}</X.code>: {typeNode}
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
  openapi: openapi_,
  collectRefs = true,
}: OpenAPIRefProps) => {
  const { page } = usePageData() as ExtendedPageData

  const [schemaItem, openapi] = useMemo(() => {
    if (openapi_) {
      return [
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-arguments -- no sure to understand
        resolveRef<OpenAPIV3_1.SchemaObject>(openapi_, schema),
        openapi_,
      ]
    }
    for (const openapi of Object.values(page.openapisMap || {})) {
      const schemaItem = openapi.components?.schemas?.[schema]
      if (schemaItem) {
        return [schemaItem, openapi]
      }
    }
    return []
  }, [])

  if (!schemaItem || !openapi) {
    console.error(`No OpenAPI schema definition found for ${schema}`)
    return null
  }

  const refs = useMemo(() => {
    if (collectRefs) {
      return getRefsForSchema(
        openapi,
        schema,
        omitRoutePathRefs(
          {
            ...page.references,
            ...DEFAULT_COMMON_REFS,
          },
          page.routePath,
        ),
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
      {refs?.map((schema, index) => (
        <OpenAPIRef
          key={index}
          schema={schema}
          openapi={openapi}
          collectRefs={false}
        />
      ))}
    </>
  )
}

export default OpenAPIRef
