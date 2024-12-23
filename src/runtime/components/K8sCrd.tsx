/**
 * modified based on @see https://github.com/crdsdev/doc/blob/main/template/doc.html
 */

import { usePageData } from '@rspress/core/runtime'
import { Badge, Button, getCustomMDXComponent } from '@rspress/core/theme'
import { OpenAPIV3_1 } from 'openapi-types'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { useTranslation } from '../hooks/index.js'
import { ExtendedPageData } from '../types.js'
import { Directive } from './_Directive.js'
import { Markdown } from './_Markdown.js'

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

const X = getCustomMDXComponent()

export const K8sCrdSchemaPart = ({
  name,
  parent,
  schema: property,
  openAll,
}: {
  name: string
  parent: OpenAPIV3_1.SchemaObject
  schema: OpenAPIV3_1.SchemaObject
  openAll: boolean
}) => {
  const [open, setOpen] = useState(openAll)

  const onToggle = useCallback((open: boolean) => {
    setOpen(open)
  }, [])

  useEffect(() => {
    setOpen(openAll)
  }, [openAll])

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
            {type && <X.code>{type}</X.code>}
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
              openAll={openAll}
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

  const t = useTranslation()

  const [openAll, setOpenAll] = useState(false)

  const expandAll = useCallback(() => {
    setOpenAll(true)
  }, [])

  const collapseAll = useCallback(() => {
    setOpenAll(false)
  }, [])

  return (
    <>
      <Markdown>{description}</Markdown>
      <div className="flex items-center">
        <span>
          <X.code>{version}</X.code>
          <Badge>version</Badge>
        </span>
        {properties != null && (
          <div className="ml-auto">
            <Button
              className="doom-btn"
              type="button"
              text={<span onClick={collapseAll}>- {t('collapse_all')}</span>}
              size="medium"
              theme="alt"
            ></Button>
            <Button
              className="doom-btn ml-2"
              type="button"
              text={<span onClick={expandAll}>+ {t('expand_all')}</span>}
              size="medium"
              theme="alt"
            ></Button>
          </div>
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
                  openAll={openAll}
                />
              ),
          )}
        </div>
      )}
    </>
  )
}

export const K8sCrd = ({ name, crdPath }: K8sCrdProps) => {
  const { page } = usePageData() as ExtendedPageData

  const [, crd] = useMemo(
    () =>
      Object.entries(page.crdsMap || {}).find(([pathname, crd]) => {
        if (crdPath && pathname !== crdPath) {
          return false
        }
        return crd.metadata.name === name
      }) || [],
    [page],
  )

  if (!crd) {
    console.error(`No CustomResourceDefinition found for ${name}`)
    return null
  }

  return (
    <>
      <X.p>
        <X.code>{crd.spec.group}</X.code>
        <Badge>group</Badge>
      </X.p>
      {crd.spec.versions.map((version) => (
        <K8sCrdSchema
          schema={version.schema.openAPIV3Schema}
          version={version.name}
        />
      ))}
    </>
  )
}

export default K8sCrd
