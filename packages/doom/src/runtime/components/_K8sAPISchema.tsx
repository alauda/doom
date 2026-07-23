import BananaSlug from '@rspress/shared/github-slugger'
import type { OpenAPIV3_1 } from 'openapi-types'
import { Fragment, useMemo } from 'react'

import { useTranslation } from '../hooks/index.js'
import { resolveRef } from '../utils.js'

import { Markdown } from './Markdown.js'
import { APIReferenceLink } from './_APIReferenceLink.js'
import { HeadingTitle } from './_HeadingTitle.js'
import { X } from './_X.js'

export interface K8sAPISchemaProps {
  schema: OpenAPIV3_1.SchemaObject
  fullSchema?: OpenAPIV3_1.Document
}

export interface K8sAPISchemaItemProps {
  schema: OpenAPIV3_1.SchemaObject
  fullSchema?: OpenAPIV3_1.Document
  propertyPath?: string
  /**
   * A single stateful slugger shared across the whole schema tree of a page.
   * github-slugger's stateless `slug()` strips `.`/`[`/`]`, so
   * `.spec.foo` and `.spec.foo[]` collide into one id; a shared instance
   * de-duplicates them (WCAG 4.1.1 / HTML id uniqueness).
   */
  slugger?: BananaSlug
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
  }

  if (key === 'type' && schema.oneOf?.length) {
    return schema.oneOf.map((it) => (it as T)[key]) as T[K]
  }

  // `x-kubernetes-int-or-string` fields carry their type under `anyOf`
  // (`[{ type: 'integer' }, { type: 'string' }]`) with no top-level `type`.
  if (key === 'type' && schema.anyOf?.length) {
    const types = schema.anyOf
      .map((it) => (it as T)[key])
      .filter(Boolean) as unknown[]
    if (types.length) {
      return types as T[K]
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
    return resolveRef(fullSchema, $ref)!
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
  const t = useTranslation()
  const description = getSchemaValue(schema, 'description')
  return (
    <dl>
      {description && (
        <>
          <dt>{t('description')}</dt>
          <dd>{description}</dd>
        </>
      )}
      <dt>{t('type')}</dt>
      <dd>{typeCode(getSchemaValue(schema))}</dd>
      {schema.required && (
        <>
          <dt>{t('required')}</dt>
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
  slugger,
}: K8sAPISchemaItemProps) => {
  const t = useTranslation()

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
      {!propertyPath && (
        <HeadingTitle slugger={slugger} level={2}>
          {t('specification')}
        </HeadingTitle>
      )}
      {isArraySchema && (
        <>
          <div className="rp-toc-exclude">
            <HeadingTitle slugger={slugger} level={3}>
              {`${propertyPath}[]`}
            </HeadingTitle>
          </div>
          <K8sAPISchemaItemBasic schema={nestedSchema} />
        </>
      )}
      {propertiesEntry && (
        <>
          <X.table>
            <thead>
              <tr>
                <th>{t('property')}</th>
                <th>{t('type')}</th>
                <th>{t('description')}</th>
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
                          <APIReferenceLink name="ObjectMeta" />
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

            const heading = (
              <HeadingTitle slugger={slugger} level={3}>
                {nestedPropertyPath}
              </HeadingTitle>
            )

            return (
              <Fragment key={key}>
                {/* Top-level properties (`.spec`, `.status`, …) feed the page
                    outline so a reference page has a usable TOC (DOOM-14);
                    deeper headings stay excluded so it does not explode into
                    hundreds of entries. */}
                {propertyPath ? (
                  <div className="rp-toc-exclude">{heading}</div>
                ) : (
                  heading
                )}
                <K8sAPISchemaItem
                  schema={value}
                  fullSchema={fullSchema}
                  propertyPath={nestedPropertyPath}
                  slugger={slugger}
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
  const slugger = useMemo(() => new BananaSlug(), [])
  return (
    <K8sAPISchemaItem
      schema={schema}
      fullSchema={fullSchema}
      slugger={slugger}
    />
  )
}
