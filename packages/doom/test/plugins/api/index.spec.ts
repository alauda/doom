import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import type { UserConfig } from '@rspress/shared'
import { afterAll, beforeAll, describe, expect, test } from '@rstest/core'

import { apiPlugin } from '#plugins/api/index.ts'

describe('apiPlugin addRuntimeModules', () => {
  let dir: string

  beforeAll(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'doom-api-'))
  })

  afterAll(() => {
    fs.rmSync(dir, { recursive: true, force: true })
  })

  const run = async (
    api: UserConfig['api'],
  ): Promise<Record<string, string>> => {
    const plugin = apiPlugin({ localBasePath: dir })
    // eslint-disable-next-line @typescript-eslint/no-deprecated -- doom's plugin implements this hook; exercise it directly
    return (await plugin.addRuntimeModules?.({ root: dir, api }, true)) ?? {}
  }

  test('exposes crdVersion / pathPrefix / references in the virtual module', async () => {
    const mods = await run({
      crdVersion: 'storage',
      pathPrefix: '/gw',
      references: { Foo: 'Foo.html' },
    })
    const virtual = mods['doom-@api-virtual']

    expect(virtual).toContain('"crdVersion":"storage"')
    expect(virtual).toContain('"pathPrefix":"/gw"')
    expect(virtual).toContain('"references"')
  })

  test('omits crdVersion when not configured', async () => {
    const mods = await run({})

    // JSON.stringify drops undefined values.
    expect(mods['doom-@api-virtual']).not.toContain('crdVersion')
  })
})
