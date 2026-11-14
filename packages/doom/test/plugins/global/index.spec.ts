import { createHash } from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import type { RspressPlugin, UserConfig } from '@rspress/core'
import { afterEach, describe, expect, test } from '@rstest/core'

import { globalPlugin, type GlobalVirtual } from '#plugins/global/index.ts'
import type { SharedSidebarPayload } from '#plugins/global/sidebar.ts'

const dirs: string[] = []
const temporaryOutput = () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'doom-sidebar-'))
  dirs.push(dir)
  return dir
}
const configure = (plugin: RspressPlugin, config: UserConfig) =>
  plugin.config?.(config, { addPlugin() {}, removePlugin() {} }, true)
const runtime = async (
  plugin: RspressPlugin,
  config: UserConfig,
  isProd = true,
): Promise<GlobalVirtual> => {
  // eslint-disable-next-line @typescript-eslint/no-deprecated -- exercise the runtime hook implemented by this plugin
  const modules = await plugin.addRuntimeModules?.(config, isProd)
  return JSON.parse(
    modules!['doom-@global-virtual'].replace(/^export default /, ''),
  ) as GlobalVirtual
}
const readSidebar = (outDir: string) => {
  const staticDir = path.join(outDir, 'static')
  const manifest = JSON.parse(
    fs.readFileSync(path.join(staticDir, 'sidebar.json'), 'utf8'),
  ) as { fileName: string }
  const content = fs.readFileSync(
    path.join(staticDir, manifest.fileName),
    'utf8',
  )
  expect(manifest.fileName).toBe(
    `sidebar.${createHash('sha256').update(content).digest('hex')}.json`,
  )
  return {
    fileName: manifest.fileName,
    content,
    payload: JSON.parse(content) as SharedSidebarPayload,
  }
}

afterEach(() => {
  for (const dir of dirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true })
  }
})

describe('globalPlugin shared sidebar', () => {
  test('writes locale sidebars and exposes a manifest under the site base', async () => {
    const outDir = path.join(temporaryOutput(), 'site')
    const sidebar = { '/': [{ text: 'Home', link: '/' }] }
    const localeSidebar = { '/en/': [{ text: 'English', link: '/en/' }] }
    const config: UserConfig = {
      root: 'docs',
      base: '/manual',
      outDir,
      themeConfig: {
        sidebar,
        locales: [{ lang: 'en', label: 'English', sidebar: localeSidebar }],
      },
    }
    const plugin = globalPlugin({})

    expect(await configure(plugin, config)).toBe(config)
    expect((await runtime(plugin, config)).sidebarManifestUrl).toBe(
      '/manual/static/sidebar.json',
    )
    await plugin.afterBuild?.(config, true)
    expect(readSidebar(outDir).payload).toEqual({
      sidebar,
      locales: [{ lang: 'en', sidebar: localeSidebar }],
    })
  })

  test('changes the content address after a title edit without changing the manifest URL', async () => {
    const outDir = temporaryOutput()
    const config: UserConfig = {
      root: 'docs',
      outDir,
      themeConfig: { sidebar: { '/': [{ text: 'Before', link: '/' }] } },
    }
    const plugin = globalPlugin({})
    await configure(plugin, config)
    await plugin.afterBuild?.(config, true)
    const before = readSidebar(outDir)
    const firstUrl = (await runtime(plugin, config)).sidebarManifestUrl

    config.themeConfig!.sidebar = { '/': [{ text: 'After', link: '/' }] }
    await configure(plugin, config)
    await plugin.afterBuild?.(config, true)
    const after = readSidebar(outDir)

    expect(after.fileName).not.toBe(before.fileName)
    expect(after.payload.sidebar).toEqual(config.themeConfig!.sidebar)
    expect((await runtime(plugin, config)).sidebarManifestUrl).toBe(firstUrl)
    expect(firstUrl).toBe('/static/sidebar.json')
  })

  test('can write the assets when the config hook has not run', async () => {
    const outDir = temporaryOutput()
    const config: UserConfig = { root: 'docs', outDir }
    const plugin = globalPlugin({})

    expect(await runtime(plugin, config, false)).not.toHaveProperty(
      'sidebarManifestUrl',
    )
    await plugin.afterBuild?.(config, true)
    expect(readSidebar(outDir).payload).toEqual({})
    expect((await runtime(plugin, config)).sidebarManifestUrl).toBe(
      '/static/sidebar.json',
    )
  })

  test('keeps only the main script URL stable', () => {
    const filename = globalPlugin({}).builderConfig?.output?.filename?.js
    expect(typeof filename).toBe('function')
    if (typeof filename !== 'function') {
      throw new Error('expected a script filename function')
    }
    expect(filename({ chunk: { name: 'index' } }, {})).toBe('[name].js')
    expect(filename({ chunk: { name: 'search' } }, {})).toBe(
      '[name].[contenthash:10].js',
    )
    expect(filename({}, {})).toBe('[name].[contenthash:10].js')
  })
})
