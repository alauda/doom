import { usePageData } from '@rspress/core/runtime'
import { getCustomMDXComponent } from '@rspress/core/theme'
import BananaSlug from 'github-slugger'
import { OpenAPIV3, OpenAPIV3_1 } from 'openapi-types'
import { ReactNode, useMemo } from 'react'

import { ExtendedPageData } from '../types.js'
import { DEFAULT_COMMON_REFS, omitRoutePathRefs, resolveRef } from '../utils.js'
import { HeadingTitle } from './_HeadingTitle.js'
import { RefLink } from './_RefLink.js'
import OpenAPIRef from './OpenAPIRef.js'
import { Markdown } from './_Markdown.js'

export interface OpenAPIPathProps {
  path: string
}

const X = getCustomMDXComponent()

export const OpenAPIParameters = ({
  parameters,
  openapi,
}: {
  parameters: Array<OpenAPIV3_1.ReferenceObject | OpenAPIV3_1.ParameterObject>
  openapi: OpenAPIV3_1.Document
}) => {
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
            {typeNode}, {paramObj.required ? 'required' : 'optional'}
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

export const OpenAPIPath = ({ path }: OpenAPIPathProps) => {
  const { page } = usePageData() as ExtendedPageData

  const slugger = useMemo(() => new BananaSlug(), [])

  const [pathItem, openapi, refs] = useMemo(() => {
    for (const openapi of Object.values(page.openapisMap || {})) {
      const pathItem = openapi.paths?.[path]
      if (pathItem) {
        return [
          pathItem as OpenAPIV3_1.PathItemObject,
          openapi,
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
  }, [page.openapiMap])

  if (!pathItem || !openapi) {
    console.error(`No OpenAPI path definition found for ${path}`)
    return null
  }

  return (
    <>
      <HeadingTitle slugger={slugger} level={2}>
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
            {requestBody && (
              <>
                <HeadingTitle slugger={slugger} level={4}>
                  Request Body
                </HeadingTitle>
                <RefLink
                  $ref={
                    '$ref' in requestBody
                      ? requestBody.$ref
                      : (
                          requestBody.content['application/json'].schema as
                            | OpenAPIV3_1.ReferenceObject
                            | undefined
                        )?.$ref
                  }
                />
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
            openapi={openapi}
            collectRefs={false}
          />
        )
      })}
    </>
  )
}

export default OpenAPIPath
