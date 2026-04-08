import { usePage } from '@rspress/core/runtime'
import { Badge } from '@rspress/core/theme-original'
import openapisMap from 'doom-@api-openapisMap'
import virtual from 'doom-@api-virtual'
import BananaSlug from 'github-slugger'
import { OpenAPIV3, type OpenAPIV3_1 } from 'openapi-types'
import { Fragment, useMemo, type ReactNode } from 'react'

import { omitRoutePathRefs, resolveRef } from '../utils.js'

import { Markdown } from './Markdown.js'
import { OpenAPIProperties, OpenAPIProperty, OpenAPIRef } from './OpenAPIRef.js'
import { HeadingTitle } from './_HeadingTitle.js'
import { RefLink } from './_RefLink.js'
import { X } from './_X.js'

export interface OpenAPIPathProps {
  /**
   * The path or paths under the OpenAPI schema `paths` definition.
   */
  path: string | string[]
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
  return (
    <X.ul>
      {parameters.map((param, index) => {
        const paramObj =
          '$ref' in param
            ? resolveRef<OpenAPIV3_1.ParameterObject>(openapi, param.$ref)!
            : param
        const type =
          paramObj.schema &&
          ('$ref' in paramObj.schema ? paramObj.schema : paramObj.schema.type)
        let typeNode: ReactNode
        if (typeof type === 'string') {
          typeNode = <code>{type}</code>
        } else if (type) {
          typeNode = <RefLink $ref={type.$ref} />
        }
        return (
          // eslint-disable-next-line @eslint-react/no-array-index-key
          <X.li key={index}>
            <code>{paramObj.name}</code> (<em>in {paramObj.in}</em>): {typeNode}
            {paramObj.required && (
              <>
                {' '}
                <Badge>required</Badge>
              </>
            )}
            <>
              {' '}
              <Markdown>{paramObj.description}</Markdown>
            </>
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
      {Object.entries(responses).map(([code, response]) => {
        const responseObj =
          '$ref' in response
            ? resolveRef<OpenAPIV3_1.ResponseObject>(openapi, response.$ref)!
            : response
        const responseContent = responseObj.content
        const schema = (
          responseContent?.['application/json'] ?? responseContent?.['*/*']
        )?.schema
        const type = schema && ('$ref' in schema ? schema : schema.type)
        let typeNode: ReactNode
        let extraNode: ReactNode
        if (typeof type === 'string') {
          typeNode = <code>{type}</code>
          if (
            type === 'object' &&
            'properties' in schema! &&
            schema.properties
          ) {
            extraNode = (
              <div className="my-4">
                <em>Properties:</em>
                <OpenAPIProperties
                  properties={schema.properties}
                  openapi={openapi}
                />
              </div>
            )
          } else if (type === 'array' && 'items' in schema! && schema.items) {
            extraNode = (
              <div className="my-4">
                <em>Items:</em>
                <OpenAPIProperty property={schema.items} openapi={openapi} />
              </div>
            )
          }
        } else if (type && '$ref' in type) {
          typeNode = <RefLink $ref={type.$ref} />
        }
        return (
          <X.li key={code}>
            <code>{code}</code> {typeNode}: {responseObj.description}
            {extraNode}
          </X.li>
        )
      })}
    </X.ul>
  )
}

const setRefsForPath = (
  openapi: OpenAPIV3_1.Document,
  path: string,
  knownRefs: Record<string, string>,
  refs: Set<string>,
) => {
  const pathSchema = openapi.paths?.[path]

  if (!pathSchema) {
    return
  }

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
}

export interface OpenAPIPathBaseProps extends Omit<
  OpenAPIPathProps,
  'openapiPath'
> {
  path: string
  pathItem?: OpenAPIV3_1.PathItemObject
  openapi?: OpenAPIV3_1.Document
  slugger: BananaSlug
}

const OpenAPIPathBase = ({
  path,
  pathItem,
  openapi,
  pathPrefix: pathPrefix_,
  slugger,
}: OpenAPIPathBaseProps) => {
  const pathPrefix = pathPrefix_ ?? (virtual.pathPrefix || '')

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
            : /* eslint-disable @typescript-eslint/no-unnecessary-condition */
              (
                (
                  requestBody.content['application/json'] ||
                  requestBody.content['application/json-patch+json'] ||
                  requestBody.content['*/*']
                )?.schema as OpenAPIV3_1.ReferenceObject | undefined
              )?.$ref)
        /* eslint-enable @typescript-eslint/no-unnecessary-condition */

        const requestBodySchema = requestBodyRef
          ? resolveRef(openapi, requestBodyRef)
          : undefined

        return (
          <Fragment key={method}>
            <HeadingTitle slugger={slugger} level={3}>
              <code>{method}</code> {summary}
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
          </Fragment>
        )
      })}
    </>
  )
}

export const OpenAPIPath = ({
  path,
  openapiPath,
  pathPrefix,
}: OpenAPIPathProps) => {
  const { page } = usePage()

  const { paths, pathMap, refMap } = useMemo(() => {
    const paths = Array.isArray(path) ? path : [path]

    const pathMap = new Map<
      string,
      {
        pathItem: OpenAPIV3_1.PathItemObject
        openapi: OpenAPIV3_1.Document
      }
    >()
    const refMap = new Map<string, Set<string>>()

    for (const [pathname, openapi] of Object.entries(openapisMap)) {
      if (openapiPath && pathname !== openapiPath) {
        continue
      }
      for (const path of paths) {
        const pathItem = openapi.paths?.[path]
        if (pathItem) {
          pathMap.set(path, {
            pathItem,
            openapi,
          })

          if (!refMap.has(pathname)) {
            refMap.set(pathname, new Set())
          }
          const refs = refMap.get(pathname)!
          setRefsForPath(openapi, path, omitRoutePathRefs(page.routePath), refs)
        }
      }
    }
    return { paths, pathMap, refMap }
  }, [openapiPath, page.routePath, path])

  const slugger = useMemo(() => new BananaSlug(), [])

  return (
    <>
      {paths.map((path) => {
        const p = pathMap.get(path)
        return (
          <OpenAPIPathBase
            key={path}
            path={path}
            pathItem={p?.pathItem}
            openapi={p?.openapi}
            pathPrefix={pathPrefix}
            slugger={slugger}
          />
        )
      })}
      {[...refMap.entries()].map(([openapiPath, refs]) => (
        <Fragment key={openapiPath}>
          {[...refs].map((ref) => (
            <OpenAPIRef
              key={ref}
              schema={ref}
              openapiPath={openapiPath}
              collectRefs={false}
            />
          ))}
        </Fragment>
      ))}
    </>
  )
}

export default OpenAPIPath
