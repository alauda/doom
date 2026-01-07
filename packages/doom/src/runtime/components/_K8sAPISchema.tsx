import { FallbackHeading } from '@rspress/core/theme'
import type { OpenAPIV3_1 } from 'openapi-types'
import { Fragment, useMemo } from 'react'

import { resolveRef } from '../utils.js'

import { Markdown } from './Markdown.js'
import { X } from './_X.js'

export interface K8sAPISchemaProps {
  schema: OpenAPIV3_1.SchemaObject
  fullSchema?: OpenAPIV3_1.Document
}

export interface K8sAPISchemaItemProps {
  schema: OpenAPIV3_1.SchemaObject
  fullSchema?: OpenAPIV3_1.Document
  propertyPath?: string
}

const getSchemaValue = <
  T extends OpenAPIV3_1.SchemaObject,
  K extends keyof T = 'type',
>(
  schema: T,
  key: K = 'type' as K,
): T[K] | undefined => {
  if (schema[key]) {
    return schema[key]
  }

  if (schema.allOf?.length) {
    const allOf = schema.allOf[0] as T
    const value = allOf[key]
    if (value) {
      return value
    }
    if (allOf.oneOf?.length) {
      return allOf.oneOf.map((it) => (it as T)[key]) as T[K]
    }
  }
}

const NESTED_SCHEMA_TYPES = new Set(['object', 'array'])

const METADATA = 'metadata'

const DEFAULT_METADATA_DESCRIPTION =
  'ObjectMeta is metadata that all persisted resources must have, which includes all objects users must create.'

const derefSchema = (
  schema: OpenAPIV3_1.ReferenceObject | OpenAPIV3_1.SchemaObject,
  fullSchema?: OpenAPIV3_1.Document,
) => {
  const $ref = getSchemaValue(schema as OpenAPIV3_1.ReferenceObject, '$ref')
  if (fullSchema && $ref) {
    return resolveRef(fullSchema, $ref)
  }
  return schema as OpenAPIV3_1.SchemaObject
}

const typeCode = (type?: string | string[]) => (
  <code>{Array.isArray(type) ? type.join('|') : type}</code>
)

export const K8sAPISchemaItemBasic = ({
  schema,
}: {
  schema: OpenAPIV3_1.SchemaObject
}) => {
  const description = getSchemaValue(schema, 'description')
  return (
    <dl>
      {description && (
        <>
          <dt>Description</dt>
          <dd>{description}</dd>
        </>
      )}
      <dt>Type</dt>
      <dd>{typeCode(getSchemaValue(schema))}</dd>
      {schema.required && (
        <>
          <dt>Required</dt>
          <dd>
            {schema.required.map((it) => (
              <code key={it}>{it}</code>
            ))}
          </dd>
        </>
      )}
    </dl>
  )
}

export const K8sAPISchemaItem = ({
  schema,
  fullSchema,
  propertyPath = '',
}: K8sAPISchemaItemProps) => {
  const schemaType = useMemo(() => getSchemaValue(schema), [schema])

  const isArraySchema = schemaType === 'array'

  const nestedSchema = useMemo(
    () =>
      isArraySchema
        ? derefSchema(
            (schema as OpenAPIV3_1.ArraySchemaObject).items,
            fullSchema,
          )
        : schema,
    [fullSchema, isArraySchema, schema],
  )

  const propertiesEntry = useMemo(() => {
    const properties = getSchemaValue(nestedSchema, 'properties')
    return (
      properties &&
      Object.entries(properties).map(
        ([key, value]) => [key, derefSchema(value, fullSchema)] as const,
      )
    )
  }, [fullSchema, nestedSchema])

  return (
    <>
      <K8sAPISchemaItemBasic schema={schema} />
      {!propertyPath && <FallbackHeading level={2} title="Specification" />}
      {isArraySchema && (
        <>
          <div className="rp-toc-exclude">
            <FallbackHeading level={3} title={`${propertyPath}[]`} />
          </div>
          <K8sAPISchemaItemBasic schema={nestedSchema} />
        </>
      )}
      {propertiesEntry && (
        <>
          <X.table>
            <thead>
              <tr>
                <th>Property</th>
                <th>Type</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {propertiesEntry.map(([key, value]) => {
                const description = getSchemaValue(value, 'description')
                const isMetadata = key === METADATA
                return (
                  <tr key={key}>
                    <td>
                      <code>{key}</code>
                    </td>
                    <td>
                      {isMetadata ? (
                        <code>
                          <X.a href="/apis/references/ObjectMeta.html">
                            ObjectMeta
                          </X.a>
                        </code>
                      ) : (
                        typeCode(getSchemaValue(value))
                      )}
                    </td>
                    <td>
                      <Markdown>
                        {description ||
                          (isMetadata ? DEFAULT_METADATA_DESCRIPTION : '')}
                      </Markdown>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </X.table>
          {propertiesEntry.map(([key, value]) => {
            const type = getSchemaValue(value) as string

            if (!NESTED_SCHEMA_TYPES.has(type) || key === METADATA) {
              return
            }

            const nestedPropertyPath = `${propertyPath}${isArraySchema ? '[]' : ''}.${key}`

            return (
              <Fragment key={key}>
                <div className="rp-toc-exclude">
                  <FallbackHeading level={3} title={nestedPropertyPath} />
                </div>
                <K8sAPISchemaItem
                  schema={value}
                  fullSchema={fullSchema}
                  propertyPath={nestedPropertyPath}
                />
              </Fragment>
            )
          })}
        </>
      )}
    </>
  )
}

export const K8sAPISchema = ({ schema, fullSchema }: K8sAPISchemaProps) => {
  console.log(schema)
  return <K8sAPISchemaItem schema={schema} fullSchema={fullSchema} />
}
