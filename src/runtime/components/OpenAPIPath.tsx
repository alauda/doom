import { usePageData } from '@rspress/core/runtime'
import { Badge, getCustomMDXComponent } from '@rspress/core/theme'
import BananaSlug from 'github-slugger'
import { OpenAPIV3, type OpenAPIV3_1 } from 'openapi-types'
import { ReactNode, useMemo, useState } from 'react'

import { ExtendedPageData } from '../types.js'
import { DEFAULT_COMMON_REFS, omitRoutePathRefs, resolveRef } from '../utils.js'
import { HeadingTitle } from './_HeadingTitle.js'
import { Markdown } from './_Markdown.js'
import { RefLink } from './_RefLink.js'
import OpenAPIRef from './OpenAPIRef.js'

import openapisMap from 'doom-@api-openapisMap'

export interface OpenAPIPathProps {
  /**
   * The path under the OpenAPI schema `paths` definition.
   */
  path: string
  /**
   * The specific path to the OpenAPI schema, otherwise the first matched will be used.
   */
  openapiPath?: string
  /**
   * If you have a gateway which adds common path prefix, can be used to override global config level `pathPrefix`.
   */
  pathPrefix?: string
}

export const OpenAPIParameters = ({
  parameters,
  openapi,
}: {
  parameters: Array<OpenAPIV3_1.ReferenceObject | OpenAPIV3_1.ParameterObject>
  openapi: OpenAPIV3_1.Document
}) => {
  const [X] = useState(getCustomMDXComponent)
  return (
    <X.ul>
      {parameters.map((param, index) => {
        const paramObj =
          '$ref' in param
            ? resolveRef<OpenAPIV3_1.ParameterObject>(openapi, param.$ref)
            : param
        const type =
          paramObj.schema &&
          ('$ref' in paramObj.schema ? paramObj.schema : paramObj.schema.type)
        let typeNode: ReactNode
        if (typeof type === 'string') {
          typeNode = <X.code>{type}</X.code>
        } else if (type) {
          typeNode = <RefLink $ref={type.$ref} />
        }
        return (
          <X.li key={index}>
            <X.code>{paramObj.name}</X.code>(<em>in {paramObj.in}</em>):{' '}
            {typeNode}
            {paramObj.required && <Badge>required</Badge>}
            <Markdown>{paramObj.description}</Markdown>
          </X.li>
        )
      })}
    </X.ul>
  )
}

export const OpenAPIResponses = ({
  responses,
  openapi,
}: {
  responses: OpenAPIV3_1.ResponsesObject
  openapi: OpenAPIV3_1.Document
}) => {
  const [X] = useState(getCustomMDXComponent)
  return (
    <X.ul>
      {Object.entries(responses).map(([code, response], index) => {
        const responseObj =
          '$ref' in response
            ? resolveRef<OpenAPIV3_1.ResponseObject>(openapi, response.$ref)
            : response
        const schema = responseObj.content?.['application/json'].schema
        let refNode: ReactNode
        if (schema && '$ref' in schema) {
          refNode = (
            <>
              (<RefLink $ref={schema.$ref} />)
            </>
          )
        }
        return (
          <X.li key={index}>
            <X.code>{code}</X.code>
            {refNode}: {responseObj.description}
          </X.li>
        )
      })}
    </X.ul>
  )
}

const getRefsForPath = (
  openapi: OpenAPIV3_1.Document,
  path: string,
  knownRefs: Record<string, string>,
) => {
  const pathSchema = openapi.paths?.[path]

  if (!pathSchema) {
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

  for (const method of Object.values(OpenAPIV3.HttpMethods)) {
    if (pathSchema[method]?.requestBody) {
      collectRefs(pathSchema[method].requestBody)
    }
    if (pathSchema[method]?.responses) {
      for (const response in pathSchema[method].responses) {
        collectRefs(pathSchema[method].responses[response])
      }
    }
  }

  return Array.from(refs)
}

export const OpenAPIPath = ({
  path,
  openapiPath: openapiPath_,
  pathPrefix: pathPrefix_,
}: OpenAPIPathProps) => {
  const [X] = useState(getCustomMDXComponent)
  const { page } = usePageData() as ExtendedPageData

  const pathPrefix = pathPrefix_ ?? (page.pathPrefix || '')

  const slugger = useMemo(() => new BananaSlug(), [])

  const [pathItem, openapi, openapiPath, refs] = useMemo(() => {
    for (const [pathname, openapi] of Object.entries(openapisMap)) {
      if (openapiPath_ && pathname !== openapiPath_) {
        continue
      }
      const pathItem = openapi.paths?.[path]
      if (pathItem) {
        return [
          pathItem as OpenAPIV3_1.PathItemObject,
          openapi,
          pathname,
          getRefsForPath(
            openapi,
            path,
            omitRoutePathRefs(
              {
                ...page.references,
                ...DEFAULT_COMMON_REFS,
              },
              page.routePath,
            ),
          ),
        ]
      }
    }
    return []
  }, [])

  if (!pathItem || !openapi) {
    console.error(`No OpenAPI path definition found for ${path}`)
    return null
  }

  return (
    <>
      <HeadingTitle slugger={slugger} level={2}>
        {pathPrefix}
        {path}
      </HeadingTitle>

      {pathItem.parameters && (
        <>
          <HeadingTitle slugger={slugger} level={3}>
            Common Parameters
          </HeadingTitle>
          <OpenAPIParameters
            parameters={pathItem.parameters}
            openapi={openapi}
          />
        </>
      )}

      {Object.values(OpenAPIV3.HttpMethods).map((method) => {
        if (!pathItem[method]) {
          return null
        }

        const { description, parameters, requestBody, responses, summary } =
          pathItem[method]

        const requestBodyRef =
          requestBody &&
          ('$ref' in requestBody
            ? requestBody.$ref
            : (
                requestBody.content['application/json'].schema as
                  | OpenAPIV3_1.ReferenceObject
                  | undefined
              )?.$ref)

        const requestBodySchema = requestBodyRef
          ? resolveRef(openapi, requestBodyRef)
          : undefined

        return (
          <>
            <HeadingTitle slugger={slugger} level={3}>
              <X.code>{method}</X.code>
              {summary}
            </HeadingTitle>
            <Markdown>{description}</Markdown>
            {parameters && (
              <>
                <HeadingTitle slugger={slugger} level={4}>
                  Parameters
                </HeadingTitle>
                <OpenAPIParameters parameters={parameters} openapi={openapi} />
              </>
            )}
            {requestBodySchema && (
              <>
                <HeadingTitle slugger={slugger} level={4}>
                  Request Body
                </HeadingTitle>
                <X.p>
                  <RefLink $ref={requestBodyRef} />
                  {requestBodySchema.required && <Badge>required</Badge>}
                </X.p>
              </>
            )}
            {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
            {responses && (
              <>
                <HeadingTitle slugger={slugger} level={4}>
                  Response
                </HeadingTitle>
                <OpenAPIResponses responses={responses} openapi={openapi} />
              </>
            )}
          </>
        )
      })}

      {refs?.map((ref, index) => {
        return (
          <OpenAPIRef
            key={index}
            schema={ref}
            openapiPath={openapiPath}
            collectRefs={false}
          />
        )
      })}
    </>
  )
}

export default OpenAPIPath
