import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  rstest,
  test,
} from '@rstest/core'
import type { List } from 'mdast'
import type { ApiInterceptor, InterceptorRequest } from 'x-fetch'

import type { JiraIssue } from '#plugins/replace/types.ts'

type ResolveRelease =
  (typeof import('#plugins/replace/resolve-release.ts'))['resolveRelease']

type Interceptors = (typeof import('x-fetch'))['interceptors']

const TEMPLATES = { fixed: 'project = <%= project %>' }

const ISSUE: JiraIssue = {
  expand: '',
  id: '1',
  self: 'https://jira.example.test/rest/api/2/issue/1',
  key: 'DOOM-1',
  fields: { customfield_13801: 'A fictional fix.' },
}

const RELEASE: List = {
  type: 'list',
  children: [
    {
      type: 'listItem',
      children: [
        {
          type: 'paragraph',
          children: [{ type: 'text', value: 'A fictional fix.' }],
        },
      ],
    },
  ],
}

const ENV_NAMES = ['JIRA_USERNAME', 'JIRA_PASSWORD', 'JIRA_BASE_URL'] as const

// The expected addresses are written out rather than taken from the module, so
// a wrong default fails these tests instead of agreeing with them.
describe('resolveRelease — which Jira it asks', () => {
  const saved = ENV_NAMES.map((name) => [name, process.env[name]] as const)
  const requests: InterceptorRequest[] = []
  // Records the request and answers it; it never calls on to the network.
  const answer: ApiInterceptor = (request) => {
    requests.push(request)
    return new Response(JSON.stringify({ issues: [ISSUE] }))
  }
  const fetchSpy = rstest.spyOn(globalThis, 'fetch')
  let interceptors: Interceptors
  let resolveRelease: ResolveRelease

  beforeAll(async () => {
    // Nothing in this file may reach a real Jira. x-fetch takes hold of
    // `globalThis.fetch` when it loads, so the stub goes in before it does: a
    // request the interceptor missed then fails here instead of leaving.
    fetchSpy.mockRejectedValue(new Error('no network in this test'))
    ;({ interceptors } = await import('x-fetch'))
    interceptors.use(answer)
    // The credentials are read when the module loads, so they are set first.
    process.env.JIRA_USERNAME = 'test-user'
    process.env.JIRA_PASSWORD = 'test-password'
    ;({ resolveRelease } = await import('#plugins/replace/resolve-release.ts'))
  })

  afterAll(() => {
    interceptors.eject(answer)
    fetchSpy.mockRestore()
    for (const [name, value] of saved) {
      if (value === undefined) {
        Reflect.deleteProperty(process.env, name)
      } else {
        process.env[name] = value
      }
    }
  })

  beforeEach(() => {
    requests.length = 0
    Reflect.deleteProperty(process.env, 'JIRA_BASE_URL')
  })

  // Release notes are cached by query, so every test asks about its own project.
  const resolve = async (project: string) => {
    const release = await resolveRelease(
      TEMPLATES,
      `template=fixed&project=${project}`,
      'en',
      true,
    )
    return { urls: requests.map((request) => request.url), release }
  }

  test('unset, it asks jira.alauda.cn exactly as before', async () => {
    const { urls, release } = await resolve('UNSET')

    expect(urls).toEqual([
      'https://jira.alauda.cn/rest/api/2/search?jql=project+%3D+UNSET',
    ])
    expect(requests[0].headers.get('Authorization')).toBe(
      'Basic dGVzdC11c2VyOnRlc3QtcGFzc3dvcmQ=',
    )
    expect(release).toEqual(RELEASE)
  })

  test('`JIRA_BASE_URL` sends it elsewhere, port included', async () => {
    process.env.JIRA_BASE_URL = 'https://jira.example.test:8443'

    const { urls, release } = await resolve('SET')

    expect(urls).toEqual([
      'https://jira.example.test:8443/rest/api/2/search?jql=project+%3D+SET',
    ])
    expect(release).toEqual(RELEASE)
  })

  test('a trailing slash does not double the one before `rest`', async () => {
    process.env.JIRA_BASE_URL = 'https://jira.example.test:8443/'

    const { urls, release } = await resolve('SLASH')

    expect(urls).toEqual([
      'https://jira.example.test:8443/rest/api/2/search?jql=project+%3D+SLASH',
    ])
    expect(release).toEqual(RELEASE)
  })

  test('empty means unset — an unset variable often arrives this way', async () => {
    process.env.JIRA_BASE_URL = ''

    const { urls, release } = await resolve('EMPTY')

    expect(urls).toEqual([
      'https://jira.alauda.cn/rest/api/2/search?jql=project+%3D+EMPTY',
    ])
    expect(release).toEqual(RELEASE)
  })
})
