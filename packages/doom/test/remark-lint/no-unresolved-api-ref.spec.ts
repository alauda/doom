import { describe, expect, test } from '@rstest/core'
import remarkMdx from 'remark-mdx'
import remarkParse from 'remark-parse'
import { unified } from 'unified'

import {
  type ApiSources,
  checkApiRefs,
} from '#remark-lint/no-unresolved-api-ref.ts'

const parse = (value: string) =>
  unified().use(remarkParse).use(remarkMdx).parse(value)

const sources = (overrides: Partial<ApiSources> = {}): ApiSources => ({
  crdNames: new Set(),
  schemaNames: new Set(),
  schemaNamesWithoutGvk: new Set(),
  pathNames: new Set(),
  functionNames: new Set(),
  ...overrides,
})

const check = (mdx: string, apiSources: ApiSources) => {
  const messages: string[] = []
  checkApiRefs(parse(mdx), apiSources, (message) => messages.push(message))
  return messages
}

describe('no-unresolved-api-ref', () => {
  describe('reference resolution', () => {
    test('flags a name that resolves to neither a CRD nor a schema', () => {
      const messages = check(
        '<K8sAPI name="v1.Missing" />\n',
        sources({ crdNames: new Set(['widgets.example.com']) }),
      )
      expect(messages).toHaveLength(1)
      expect(messages[0]).toContain('resolves to neither')
    })

    test('accepts a name backed by a CRD', () => {
      const messages = check(
        '<K8sAPI name="widgets.example.com" />\n',
        sources({ crdNames: new Set(['widgets.example.com']) }),
      )
      expect(messages).toHaveLength(0)
    })

    test('ignores a dynamic name it cannot read statically', () => {
      const messages = check('<K8sAPI name={someName} />\n', sources())
      expect(messages).toHaveLength(0)
    })

    test('flags an unresolved OpenAPIRef schema', () => {
      const messages = check('<OpenAPIRef schema="v1.Gone" />\n', sources())
      expect(messages).toHaveLength(1)
      expect(messages[0]).toContain('OpenAPIRef')
    })

    test('flags an unresolved OpenAPIPath path', () => {
      const messages = check(
        '<OpenAPIPath path="/test/gone" />\n',
        sources({ pathNames: new Set(['/test/foo']) }),
      )
      expect(messages).toHaveLength(1)
      expect(messages[0]).toContain('/test/gone')
    })

    test('flags an unknown K8sPermissionTable function', () => {
      const messages = check(
        `<K8sPermissionTable functions={['known', 'unknown']} />\n`,
        sources({ functionNames: new Set(['known']) }),
      )
      expect(messages).toHaveLength(1)
      expect(messages[0]).toContain('unknown')
    })
  })

  // The endpoint paths are concatenated from group/version/plural. An OpenAPI
  // source without `x-kubernetes-group-version-kind` leaves them unknown, so
  // the caller has to declare them — otherwise the endpoints section silently
  // disappears from an otherwise green build.
  describe('derivable group/version/kind', () => {
    const gvkless = () =>
      sources({
        schemaNames: new Set(['v1.ClusterView']),
        schemaNamesWithoutGvk: new Set(['v1.ClusterView']),
      })

    test('flags a GVK-less schema with no explicit props', () => {
      const messages = check(
        '<K8sAPI name="v1.ClusterView" namespaced={false} />\n',
        gvkless(),
      )
      expect(messages).toHaveLength(1)
      expect(messages[0]).toContain('x-kubernetes-group-version-kind')
    })

    test('flags the deprecated K8sCrd alias too', () => {
      const messages = check('<K8sCrd name="v1.ClusterView" />\n', gvkless())
      expect(messages).toHaveLength(1)
    })

    test('accepts explicit apiVersion + apiKind props', () => {
      const messages = check(
        '<K8sAPI name="v1.ClusterView" apiGroup="cluster.alauda.io" apiVersion="v1" apiKind="ClusterView" plural="clusterviews" />\n',
        gvkless(),
      )
      expect(messages).toHaveLength(0)
    })

    test('flags a half-declared resource (apiVersion without apiKind)', () => {
      const messages = check(
        '<K8sAPI name="v1.ClusterView" apiVersion="v1" />\n',
        gvkless(),
      )
      expect(messages).toHaveLength(1)
    })

    test('accepts a schema that carries the GVK extension', () => {
      const messages = check(
        '<K8sAPI name="v1.Pod" />\n',
        sources({ schemaNames: new Set(['v1.Pod']) }),
      )
      expect(messages).toHaveLength(0)
    })

    test('accepts a GVK-less schema that a CRD of the same name backs', () => {
      const messages = check(
        '<K8sAPI name="widgets.example.com" />\n',
        sources({
          crdNames: new Set(['widgets.example.com']),
          schemaNames: new Set(['widgets.example.com']),
          schemaNamesWithoutGvk: new Set(['widgets.example.com']),
        }),
      )
      expect(messages).toHaveLength(0)
    })

    test('stays quiet when a spread may carry the props', () => {
      const messages = check(
        '<K8sAPI name="v1.ClusterView" {...props} />\n',
        gvkless(),
      )
      expect(messages).toHaveLength(0)
    })
  })
})
