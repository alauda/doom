import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { logger } from '@rspress/core'
import { afterEach, beforeEach, describe, expect, rs, test } from '@rstest/core'

import { loadConfig } from '#cli/load-config.ts'
import { TRANSLATIONS } from '#runtime/translation.ts'
import { SUPPORTED_LANGUAGES } from '#shared/constants.ts'

/**
 * Every directory directly under the docs root used to become a language,
 * apart from `dist`, `node_modules`, `public` and `shared`. Each language gets
 * a `/<lang>/products` page whose heading comes from doom's word list, and the
 * word list only has the supported languages — so a site that added
 * `docs/scripts/` for a shell script failed every build with
 *
 *     Page "/scripts/products" SSG rendering failed.
 *     TypeError: Cannot read properties of undefined (reading 'all_product_documentation')
 *
 * A directory is now a language only if its name is one of
 * `SUPPORTED_LANGUAGES`. Any other directory is left out of the site the way
 * `shared/` is, and a warning names it.
 */
describe('language directories', () => {
  let root: string
  let warnings: string[]

  beforeEach(async () => {
    root = await fs.mkdtemp(path.join(os.tmpdir(), 'doom-locales-'))
    // A config of its own, so `loadConfig` never falls back to the one in the
    // working directory, which is this repository's own `doom.config.yml`.
    await fs.writeFile(path.join(root, 'doom.config.yml'), 'title: Test\n')
    warnings = []
    rs.spyOn(logger, 'warn').mockImplementation((message) => {
      warnings.push(String(message))
    })
  })

  afterEach(async () => {
    rs.restoreAllMocks()
    await fs.rm(root, { recursive: true, force: true })
  })

  const write = async (files: Record<string, string>) => {
    for (const [file, content] of Object.entries(files)) {
      const filePath = path.join(root, file)
      await fs.mkdir(path.dirname(filePath), { recursive: true })
      await fs.writeFile(filePath, content)
    }
  }

  const load = async (options?: { include?: string[]; exclude?: string[] }) => {
    const { config } = await loadConfig(root, options)
    return {
      config,
      langs: (config.themeConfig?.locales ?? []).map(({ lang }) => lang).sort(),
      excluded: config.route?.exclude ?? [],
    }
  }

  // The warning shows the directory the way the user would type it.
  const shown = (dir: string) =>
    path.relative(process.cwd(), path.join(root, dir))

  test('a directory of scripts beside the languages is not a language', async () => {
    await write({
      'en/index.md': '# Home\n',
      'zh/index.md': '# 首页\n',
      'scripts/check-branding.sh': 'echo ok\n',
    })

    const { config, langs, excluded } = await load()

    expect(langs).toEqual(['en', 'zh'])
    expect(excluded).toContain('scripts/**/*')

    // The page that crashed: without a `scripts` language there is no
    // `/scripts/products` to render.
    const global = config.plugins?.find(({ name }) => name === 'doom-global')
    const pages = await global?.addPages?.(config, true)
    expect(pages?.map(({ routePath }) => routePath).sort()).toEqual([
      '/login',
      '/products',
      '/zh/login',
      '/zh/products',
    ])

    expect(warnings).toHaveLength(1)
    expect(warnings[0]).toContain(shown('scripts'))
  })

  test('a directory of images is not a language', async () => {
    await write({
      'en/index.md': '# Home\n',
      'images/diagram.png': 'not really a png',
    })

    const { langs, excluded } = await load()

    expect(langs).toEqual(['en'])
    expect(excluded).toContain('images/**/*')
  })

  test('pages under a language doom does not support are left out with a warning, not an error', async () => {
    // Skipped like any other non-language directory, and the build goes on.
    // The warning is the only sign that these pages are not on the site, so it
    // has to name the directory.
    await write({
      'en/index.md': '# Home\n',
      'ja/index.md': '# ホーム\n',
    })

    const { langs, excluded } = await load()

    expect(langs).toEqual(['en'])
    expect(excluded).toContain('ja/**/*')
    expect(warnings).toHaveLength(1)
    expect(warnings[0]).toContain(shown('ja'))
  })

  test('`-I` picks languages first, and the directories it leaves out are skipped silently as before', async () => {
    await write({
      'en/index.md': '# Home\n',
      'zh/index.md': '# 首页\n',
      'scripts/check-branding.sh': 'echo ok\n',
    })

    const { langs, excluded } = await load({ include: ['en'] })

    expect(langs).toEqual(['en'])
    expect(excluded).toEqual(
      expect.arrayContaining(['zh/**/*', 'scripts/**/*']),
    )
    expect(warnings).toEqual([])
  })

  test('`shared` and `public` hold files without becoming languages', async () => {
    await write({
      'en/index.md': '# Home\n',
      'shared/snippet.mdx': 'Shared text\n',
      'public/en/notes.md': '# Notes\n',
    })

    const { langs } = await load()

    expect(langs).toEqual(['en'])
    expect(warnings).toEqual([])
  })

  test('each supported language becomes a language with its display name', async () => {
    await write(
      Object.fromEntries(
        SUPPORTED_LANGUAGES.map((lang) => [`${lang}/index.md`, '# Home\n']),
      ),
    )

    const { config } = await loadConfig(root)
    const locales = config.themeConfig?.locales ?? []

    expect(locales).toHaveLength(SUPPORTED_LANGUAGES.length)
    for (const { lang, label } of locales) {
      // Without a display name the label falls back to the directory name.
      expect(label).not.toBe(lang)
    }
    expect(warnings).toEqual([])
  })
})

/**
 * Whether a directory is a language is now decided by `SUPPORTED_LANGUAGES`, so
 * the word list has to cover exactly those languages. A language added to the
 * word list alone would be skipped as a non-language directory; one added to
 * `SUPPORTED_LANGUAGES` alone would render its products page from `undefined`,
 * the crash described above.
 */
describe('supported languages', () => {
  test('are exactly the languages with a word list', () => {
    expect(SUPPORTED_LANGUAGES.length).toBeGreaterThan(0)
    expect(Object.keys(TRANSLATIONS).sort()).toEqual(
      [...SUPPORTED_LANGUAGES].sort(),
    )
  })
})
