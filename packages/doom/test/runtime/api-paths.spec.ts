import { describe, expect, test } from '@rstest/core'

import { declaresStatusSubresource } from '#runtime/api-paths.ts'

// Shape of an aggregation-layer document that routes a resource but exposes no
// subresource — the case that used to fabricate a `/status` section out of the
// schema's `status` property.
const CLUSTER_SCOPED_NO_STATUS = [
  '/apis/cluster.alauda.io/v1/clusterviews',
  '/apis/cluster.alauda.io/v1/namespaces/{namespace}/clusterviews',
  '/apis/cluster.alauda.io/v1/namespaces/{namespace}/clusterviews/{name}',
  '/apis/cluster.alauda.io/v1/watch/clusterviews',
]

const WITH_STATUS = [
  '/apis/apps/v1/namespaces/{namespace}/deployments',
  '/apis/apps/v1/namespaces/{namespace}/deployments/{name}',
  '/apis/apps/v1/namespaces/{namespace}/deployments/{name}/status',
]

describe('declaresStatusSubresource', () => {
  test('reports the subresource when the document routes it', () => {
    expect(declaresStatusSubresource(WITH_STATUS, 'deployments')).toBe(true)
  })

  test('denies it when the document routes the resource but not the subresource', () => {
    expect(
      declaresStatusSubresource(CLUSTER_SCOPED_NO_STATUS, 'clusterviews'),
    ).toBe(false)
  })

  test('abstains when the document does not route the resource at all', () => {
    // A schema embedded in an unrelated document (a referenced type) must not
    // be read as "this resource has no /status".
    expect(
      declaresStatusSubresource(WITH_STATUS, 'persistentvolumeclaims'),
    ).toBeUndefined()
  })

  test('abstains on a document with no paths', () => {
    expect(declaresStatusSubresource([], 'clusterviews')).toBeUndefined()
  })

  test('abstains when the plural name is unknown', () => {
    expect(declaresStatusSubresource(WITH_STATUS, undefined)).toBeUndefined()
  })

  test('matches a collection path that ends with the plural', () => {
    expect(
      declaresStatusSubresource(
        ['/apis/example.com/v1/widgets', '/apis/example.com/v1/widgets/{name}'],
        'widgets',
      ),
    ).toBe(false)
  })

  test('does not confuse a different resource sharing a path prefix', () => {
    // `widgetsets` must not satisfy a lookup for `widgets`.
    expect(
      declaresStatusSubresource(
        [
          '/apis/example.com/v1/widgetsets',
          '/apis/example.com/v1/widgetsets/{name}/status',
        ],
        'widgets',
      ),
    ).toBeUndefined()
  })

  test('ignores a /status route belonging to another resource', () => {
    expect(
      declaresStatusSubresource(
        [
          '/apis/example.com/v1/widgets',
          '/apis/example.com/v1/gadgets/{name}/status',
        ],
        'widgets',
      ),
    ).toBe(false)
  })
})
