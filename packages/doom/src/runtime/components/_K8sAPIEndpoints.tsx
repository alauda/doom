import { FallbackHeading } from '@rspress/core/theme'
import virtual from 'doom-@api-virtual'
import { plural as pluralize } from 'pluralize'

import { useTranslation } from '../hooks/index.js'

import { APIReferenceLink } from './_APIReferenceLink.js'
import { X } from './_X.js'

export interface K8sAPIDefinition {
  group?: string
  version: string
  kind: string
}

export interface K8sAPIEndpointsProps extends K8sAPIDefinition {
  namespaced?: boolean
  hasStatus?: boolean
  hasScale?: boolean
  /**
   * The resource's plural name. When provided (e.g. read from a CRD's
   * `spec.names.plural`) it is used verbatim; otherwise it is guessed with the
   * `pluralize` package, which is wrong for irregular or hyphenated plurals.
   */
  plural?: string
  pathPrefix?: string
}

const QueryParameters = ({
  fieldValidation = true,
}: {
  fieldValidation?: boolean
}) => {
  const t = useTranslation()
  return (
    <>
      <dl>
        <dt>{t('query_parameters')}</dt>
      </dl>
      <X.table>
        <thead>
          <tr>
            <th>{t('parameter')}</th>
            <th>{t('type')}</th>
            <th>{t('description')}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>dryRun</code>
            </td>
            <td>
              <code>string</code>
            </td>
            <td>
              When present, indicates that modifications should not be
              persisted. An invalid or unrecognized dryRun directive will result
              in an error response and no further processing of the request.
              Valid values are: - All: all dry run stages will be processed
            </td>
          </tr>
          {fieldValidation && (
            <tr>
              <td>
                <code>fieldValidation</code>
              </td>
              <td>
                <code>string</code>
              </td>
              <td>
                fieldValidation instructs the server on how to handle objects in
                the request (POST/PUT/PATCH) containing unknown or duplicate
                fields. Valid values are: - Ignore: This will ignore any unknown
                fields that are silently dropped from the object, and will
                ignore all but the last duplicate field that the decoder
                encounters. This is the default behavior prior to v1.23. - Warn:
                This will send a warning via the standard warning response
                header for each unknown field that is dropped from the object,
                and for each duplicate field that is encountered. The request
                will still succeed if there are no other errors, and will only
                persist the last of any duplicate fields. This is the default in
                v1.23+ - Strict: This will fail the request with a BadRequest
                error if any unknown fields would be dropped from the object, or
                if any duplicate fields are present. The error returned from the
                server will contain all unknown and duplicate fields
                encountered.
              </td>
            </tr>
          )}
        </tbody>
      </X.table>
    </>
  )
}

const BodyParameters = ({ kind }: { kind: string }) => {
  const t = useTranslation()
  return (
    <>
      <dl>
        <dt>{t('body_parameters')}</dt>
      </dl>
      <X.table>
        <thead>
          <tr>
            <th>{t('parameter')}</th>
            <th>{t('type')}</th>
            <th>{t('description')}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>body</code>
            </td>
            <td>
              <code>{kind}</code> schema
            </td>
            <td>
              <code>application/json</code> formatted
            </td>
          </tr>
        </tbody>
      </X.table>
    </>
  )
}

interface K8sAPIEndpointProps {
  kind: string
}

const K8sAPIListEndpoint = ({ kind }: K8sAPIEndpointProps) => {
  const t = useTranslation()
  return (
    <>
      <dl>
        <dt>{t('http_method')}</dt>
        <dd>
          <code>DELETE</code>
        </dd>
        <dt>{t('description')}</dt>
        <dd>delete collection of {kind}</dd>
        <dt>{t('http_responses')}</dt>
      </dl>
      <X.table>
        <thead>
          <tr>
            <th>{t('http_code')}</th>
            <th>{t('response_body')}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>200 - OK</td>
            <td>
              <code>
                <APIReferenceLink name="Status" />
              </code>{' '}
              schema
            </td>
          </tr>
          <tr>
            <td>401 - Unauthorized</td>
            <td>Empty</td>
          </tr>
        </tbody>
      </X.table>
      <dl>
        <dt>{t('http_method')}</dt>
        <dd>
          <code>GET</code>
        </dd>
        <dt>{t('description')}</dt>
        <dd>list objects of kind {kind}</dd>
        <dt>{t('http_responses')}</dt>
      </dl>
      <X.table>
        <thead>
          <tr>
            <th>{t('http_code')}</th>
            <th>{t('response_body')}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>200 - OK</td>
            <td>
              <code>{kind}List</code> schema
            </td>
          </tr>
          <tr>
            <td>401 - Unauthorized</td>
            <td>Empty</td>
          </tr>
        </tbody>
      </X.table>
      <dl>
        <dt>{t('http_method')}</dt>
        <dd>
          <code>POST</code>
        </dd>
        <dt>{t('description')}</dt>
        <dd>create a new {kind}</dd>
      </dl>
      <QueryParameters />
      <BodyParameters kind={kind} />
      <dl>
        <dt>{t('http_responses')}</dt>
      </dl>
      <X.table>
        <thead>
          <tr>
            <th>{t('http_code')}</th>
            <th>{t('response_body')}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>200 - OK</td>
            <td>
              <code>{kind}</code> schema
            </td>
          </tr>
          <tr>
            <td>201 - Created</td>
            <td>
              <code>{kind}</code> schema
            </td>
          </tr>
          <tr>
            <td>202 - Accepted</td>
            <td>
              <code>{kind}</code> schema
            </td>
          </tr>
          <tr>
            <td>401 - Unauthorized</td>
            <td>Empty</td>
          </tr>
        </tbody>
      </X.table>
    </>
  )
}

const K8sAPIItemEndpoint = ({ kind }: K8sAPIEndpointProps) => {
  const t = useTranslation()
  return (
    <>
      <dl>
        <dt>{t('http_method')}</dt>
        <dd>
          <code>DELETE</code>
        </dd>
        <dt>{t('description')}</dt>
        <dd>delete the specified {kind}</dd>
      </dl>
      <QueryParameters fieldValidation={false} />
      <dl>
        <dt>{t('http_responses')}</dt>
      </dl>
      <X.table>
        <thead>
          <tr>
            <th>{t('http_code')}</th>
            <th>{t('response_body')}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>200 - OK</td>
            <td>
              <code>
                <APIReferenceLink name="Status" />
              </code>{' '}
              schema
            </td>
          </tr>
          <tr>
            <td>202 - Accepted</td>
            <td>
              <code>
                <APIReferenceLink name="Status" />
              </code>{' '}
              schema
            </td>
          </tr>
          <tr>
            <td>401 - Unauthorized</td>
            <td>Empty</td>
          </tr>
        </tbody>
      </X.table>
      <dl>
        <dt>{t('http_method')}</dt>
        <dd>
          <code>GET</code>
        </dd>
        <dt>{t('description')}</dt>
        <dd>read the specified {kind}</dd>
        <dt>{t('http_responses')}</dt>
      </dl>
      <X.table>
        <thead>
          <tr>
            <th>{t('http_code')}</th>
            <th>{t('response_body')}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>200 - OK</td>
            <td>
              <code>{kind}</code> schema
            </td>
          </tr>
          <tr>
            <td>401 - Unauthorized</td>
            <td>Empty</td>
          </tr>
        </tbody>
      </X.table>
      <dl>
        <dt>{t('http_method')}</dt>
        <dd>
          <code>PATCH</code>
        </dd>
        <dt>{t('description')}</dt>
        <dd>partially update the specified {kind}</dd>
      </dl>
      <QueryParameters />
      <dl>
        <dt>{t('http_responses')}</dt>
      </dl>
      <X.table>
        <thead>
          <tr>
            <th>{t('http_code')}</th>
            <th>{t('response_body')}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>200 - OK</td>
            <td>
              <code>{kind}</code> schema
            </td>
          </tr>
          <tr>
            <td>401 - Unauthorized</td>
            <td>Empty</td>
          </tr>
        </tbody>
      </X.table>
      <dl>
        <dt>{t('http_method')}</dt>
        <dd>
          <code>PUT</code>
        </dd>
        <dt>{t('description')}</dt>
        <dd>replace the specified {kind}</dd>
      </dl>
      <QueryParameters />
      <BodyParameters kind={kind} />
      <dl>
        <dt>{t('http_responses')}</dt>
      </dl>
      <X.table>
        <thead>
          <tr>
            <th>{t('http_code')}</th>
            <th>{t('response_body')}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>200 - OK</td>
            <td>
              <code>{kind}</code> schema
            </td>
          </tr>
          <tr>
            <td>201 - Created</td>
            <td>
              <code>{kind}</code> schema
            </td>
          </tr>
          <tr>
            <td>401 - Unauthorized</td>
            <td>Empty</td>
          </tr>
        </tbody>
      </X.table>
    </>
  )
}

const K8sAPIStatusEndpoint = ({ kind }: K8sAPIEndpointProps) => {
  const t = useTranslation()
  return (
    <>
      <dl>
        <dt>{t('http_method')}</dt>
        <dd>
          <code>GET</code>
        </dd>
        <dt>{t('description')}</dt>
        <dd>read status of the specified {kind}</dd>
        <dt>{t('http_responses')}</dt>
      </dl>
      <X.table>
        <thead>
          <tr>
            <th>{t('http_code')}</th>
            <th>{t('response_body')}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>200 - OK</td>
            <td>
              <code>{kind}</code> schema
            </td>
          </tr>
          <tr>
            <td>401 - Unauthorized</td>
            <td>Empty</td>
          </tr>
        </tbody>
      </X.table>
      <dl>
        <dt>{t('http_method')}</dt>
        <dd>
          <code>PATCH</code>
        </dd>
        <dt>{t('description')}</dt>
        <dd>partially update status of the specified {kind}</dd>
      </dl>
      <QueryParameters />
      <dl>
        <dt>{t('http_responses')}</dt>
      </dl>
      <X.table>
        <thead>
          <tr>
            <th>{t('http_code')}</th>
            <th>{t('response_body')}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>200 - OK</td>
            <td>
              <code>{kind}</code> schema
            </td>
          </tr>
          <tr>
            <td>401 - Unauthorized</td>
            <td>Empty</td>
          </tr>
        </tbody>
      </X.table>
      <dl>
        <dt>{t('http_method')}</dt>
        <dd>
          <code>PUT</code>
        </dd>
        <dt>{t('description')}</dt>
        <dd>replace status of the specified {kind}</dd>
      </dl>
      <QueryParameters />
      <BodyParameters kind={kind} />
      <dl>
        <dt>{t('http_responses')}</dt>
      </dl>
      <X.table>
        <thead>
          <tr>
            <th>{t('http_code')}</th>
            <th>{t('response_body')}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>200 - OK</td>
            <td>
              <code>{kind}</code> schema
            </td>
          </tr>
          <tr>
            <td>201 - Created</td>
            <td>
              <code>{kind}</code> schema
            </td>
          </tr>
          <tr>
            <td>401 - Unauthorized</td>
            <td>Empty</td>
          </tr>
        </tbody>
      </X.table>
    </>
  )
}

const K8sAPIScaleEndpoint = ({ kind }: K8sAPIEndpointProps) => {
  const t = useTranslation()
  return (
    <>
      <dl>
        <dt>{t('http_method')}</dt>
        <dd>
          <code>GET</code>
        </dd>
        <dt>{t('description')}</dt>
        <dd>read scale of the specified {kind}</dd>
        <dt>{t('http_responses')}</dt>
      </dl>
      <X.table>
        <thead>
          <tr>
            <th>{t('http_code')}</th>
            <th>{t('response_body')}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>200 - OK</td>
            <td>
              <code>
                <APIReferenceLink name="Scale" />
              </code>{' '}
              schema
            </td>
          </tr>
          <tr>
            <td>401 - Unauthorized</td>
            <td>Empty</td>
          </tr>
        </tbody>
      </X.table>
      <dl>
        <dt>{t('http_method')}</dt>
        <dd>
          <code>PATCH</code>
        </dd>
        <dt>{t('description')}</dt>
        <dd>partially update scale of the specified {kind}</dd>
      </dl>
      <QueryParameters />
      <dl>
        <dt>{t('http_method')}</dt>
        <dd>
          <code>PUT</code>
        </dd>
        <dt>{t('description')}</dt>
        <dd>replace scale of the specified {kind}</dd>
      </dl>
      <QueryParameters />
      <BodyParameters kind="Scale" />
    </>
  )
}

export const K8sAPIEndpoints = ({
  hasStatus,
  hasScale,
  group,
  version,
  kind,
  plural,
  pathPrefix: pathPrefix_,
  namespaced = true,
}: K8sAPIEndpointsProps) => {
  const t = useTranslation()

  const pathPrefix = pathPrefix_ ?? (virtual.pathPrefix || '')

  const pluralName = plural ?? pluralize(kind).toLowerCase()

  const apiPath = `${
    pathPrefix
  }/${group ? `apis/${group}` : 'api'}/${version}/${namespaced ? `namespaces/{namespace}/` : ''}${pluralName}`

  return (
    <>
      <FallbackHeading level={2} title={t('api_endpoints')} />
      <X.p>{t('available_api_endpoints')}</X.p>
      <X.ul>
        <X.li>
          <code>{apiPath}</code>
          <X.ul>
            <X.li>
              <code>DELETE</code>: delete collection of {kind}
            </X.li>
            <X.li>
              <code>GET</code>: list objects of kind {kind}
            </X.li>
            <X.li>
              <code>POST</code>: create a new {kind}
            </X.li>
          </X.ul>
        </X.li>
        <X.li>
          <code>{`${apiPath}/{name}`}</code>
          <X.ul>
            <X.li>
              <code>DELETE</code>: delete the specified {kind}
            </X.li>
            <X.li>
              <code>GET</code>: read the specified {kind}
            </X.li>
            <X.li>
              <code>PATCH</code>: partially update the specified {kind}
            </X.li>
            <X.li>
              <code>PUT</code>: replace the specified {kind}
            </X.li>
          </X.ul>
        </X.li>
        {hasStatus && (
          <X.li>
            <code>{`${apiPath}/{name}/status`}</code>
            <X.ul>
              <X.li>
                <code>GET</code>: read status of the specified {kind}
              </X.li>
              <X.li>
                <code>PATCH</code>: partially update status of the specified{' '}
                {kind}
              </X.li>
              <X.li>
                <code>PUT</code>: replace status of the specified {kind}
              </X.li>
            </X.ul>
          </X.li>
        )}
        {hasScale && (
          <X.li>
            <code>{`${apiPath}/{name}/scale`}</code>
            <X.ul>
              <X.li>
                <code>GET</code>: read scale of the specified {kind}
              </X.li>
              <X.li>
                <code>PATCH</code>: partially update scale of the specified{' '}
                {kind}
              </X.li>
              <X.li>
                <code>PUT</code>: replace scale of the specified {kind}
              </X.li>
            </X.ul>
          </X.li>
        )}
      </X.ul>

      <div className="rp-toc-exclude">
        <FallbackHeading level={3} title={apiPath} />
      </div>
      <K8sAPIListEndpoint kind={kind} />

      <div className="rp-toc-exclude">
        <FallbackHeading level={3} title={`${apiPath}/{name}`} />
      </div>
      <K8sAPIItemEndpoint kind={kind} />

      {hasStatus && (
        <>
          <div className="rp-toc-exclude">
            <FallbackHeading level={3} title={`${apiPath}/{name}/status`} />
          </div>
          <K8sAPIStatusEndpoint kind={kind} />
        </>
      )}

      {hasScale && (
        <>
          <div className="rp-toc-exclude">
            <FallbackHeading level={3} title={`${apiPath}/{name}/scale`} />
          </div>
          <K8sAPIScaleEndpoint kind={kind} />
        </>
      )}
    </>
  )
}
