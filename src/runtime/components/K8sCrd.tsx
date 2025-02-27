/**
 * modified based on @see https://github.com/crdsdev/doc/blob/main/template/doc.html
 */

import { Badge, Button, getCustomMDXComponent } from '@rspress/core/theme'
import type { OpenAPIV3_1 } from 'openapi-types'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { useIsPrint, useTranslation } from '../hooks/index.js'
import { Directive } from './Directive.js'
import { Markdown } from './_Markdown.js'

import crdsMap from 'doom-@api-crdsMap'

export interface K8sCrdProps {
  /**
   * The `metadata.name` of the CustomResourceDefinition
   */
  name: string
  /**
   * The specific path to the CRD, otherwise the first matched will be used.
   */
  crdPath?: string
}

export const K8sCrdSchemaPart = ({
  name,
  parent,
  schema: property,
  expandAll,
}: {
  name: string
  parent: OpenAPIV3_1.SchemaObject
  schema: OpenAPIV3_1.SchemaObject
  expandAll: boolean
}) => {
  const [open, setOpen] = useState(expandAll)

  const onToggle = useCallback((open: boolean) => {
    setOpen(open)
  }, [])

  useEffect(() => {
    setOpen(expandAll)
  }, [expandAll])

  const [props, required, type, schema] = useMemo(() => {
    let schema = property
    let props = property.properties
    let type = property.type as string
    if (property.type === 'array') {
      const itemsSchema = property.items as OpenAPIV3_1.SchemaObject
      if (itemsSchema.type === 'object') {
        schema = itemsSchema
        props = itemsSchema.properties
        type = `[]object`
      } else if (itemsSchema.type) {
        type = `[]${itemsSchema.type as string}`
      }
    }
    let required = false
    if (parent.required?.includes(name)) {
      required = true
    }
    return [props, required, type, schema]
  }, [name, parent, property])

  return (
    <>
      <Directive
        type="details"
        title={
          <>
            {name}
            {type && <code>{type}</code>}
            {required && <Badge>required</Badge>}
          </>
        }
        open={open}
        onToggle={onToggle}
      >
        <Markdown>{schema.description}</Markdown>
        {props &&
          Object.entries(props).map(([name, subSchema]) => (
            <K8sCrdSchemaPart
              key={name}
              name={name}
              parent={schema}
              schema={subSchema}
              expandAll={expandAll}
            />
          ))}
      </Directive>
    </>
  )
}

const SKIPPED_PROPERTIES = ['apiVersion', 'kind', 'metadata']

export const K8sCrdSchema = ({
  schema,
  version,
}: {
  schema: OpenAPIV3_1.SchemaObject
  version: string
}) => {
  const { description, properties } = schema

  const isPrint = useIsPrint()

  const t = useTranslation()

  const [expandAll, setExpandAll] = useState(isPrint)

  const toggleExpandAll = useCallback(() => {
    setExpandAll((all) => !all)
  }, [])

  return (
    <>
      <Markdown>{description}</Markdown>
      <div className="flex items-center">
        <span>
          <code>{version}</code>
          <Badge>version</Badge>
        </span>
        {!isPrint && properties != null && (
          <Button
            className="ml-auto doom-btn"
            type="button"
            text={
              <span onClick={toggleExpandAll}>
                {expandAll ? '-' : '+'}{' '}
                {t(expandAll ? 'collapse_all' : 'expand_all')}
              </span>
            }
            size="medium"
            theme="alt"
          ></Button>
        )}
      </div>
      {properties == null ? (
        <Directive type="warning">{t('crd_no_schema')}</Directive>
      ) : (
        <div className="doom-collapse-group">
          {Object.entries(properties).map(
            ([name, subSchema]) =>
              SKIPPED_PROPERTIES.includes(name) || (
                <K8sCrdSchemaPart
                  key={name}
                  name={name}
                  parent={schema}
                  schema={subSchema}
                  expandAll={expandAll}
                />
              ),
          )}
        </div>
      )}
    </>
  )
}

export const K8sCrd = ({ name, crdPath }: K8sCrdProps) => {
  const [X] = useState(getCustomMDXComponent)

  const [, crd] = useMemo(
    () =>
      Object.entries(crdsMap).find(([pathname, crd]) => {
        if (crdPath && pathname !== crdPath) {
          return false
        }
        return crd.metadata.name === name
      }) || [],
    [],
  )

  if (!crd) {
    console.error(`No CustomResourceDefinition found for ${name}`)
    return null
  }

  return (
    <>
      <X.p>
        <code>{crd.spec.group}</code>
        <Badge>group</Badge>
      </X.p>
      {crd.spec.versions.map((version) => (
        <K8sCrdSchema
          key={version.name}
          schema={version.schema.openAPIV3Schema}
          version={version.name}
        />
      ))}
    </>
  )
}

export default K8sCrd
