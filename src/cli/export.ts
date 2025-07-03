import fs from 'node:fs/promises'
import path from 'node:path'

import { removeLeadingSlash, serve } from '@rspress/core'
import { logger } from '@rspress/shared/logger'
import { Command } from 'commander'
import { cyan, yellow } from 'yoctocolors'

import {
  autoSidebar,
  type DoomSidebar,
  type DoomSidebarGroup,
  type DoomSidebarItem,
} from '../plugins/index.js'
import { getPdfName } from '../shared/index.js'
import type { GlobalCliOptions, ServeOptions } from '../types.js'
import { pathExists, setNodeEnv } from '../utils/index.js'

import {
  generatePdf,
  type GeneratePdfOptions,
  type Page,
  type PDFOutline,
} from './export-pdf-core/index.js'
import { loadConfig } from './load-config.js'

const collectPages = (sidebarItems: DoomSidebar[], base: string) => {
  const pages: Page[] = []
  for (const item of sidebarItems) {
    if ('link' in item && item.link) {
      const link = removeLeadingSlash(item.link)
      pages.push({
        key: link,
        path: base + link + '.html?print',
        title: item.text,
      })
    }
    if ('items' in item) {
      pages.push(...collectPages(item.items, base))
    }
  }
  return pages
}

export const exportCommand = new Command('export')
  .description(
    'Export the documentation as PDF, `apis/**` and `*/apis/**` routes will be ignored automatically',
  )
  .argument('[root]', 'Root directory of the documentation')
  .option('-H, --host [host]', 'Serve host name')
  .option('-P, --port [port]', 'Serve port number', '4173')
  .action(async function (root?: string) {
    setNodeEnv('production')

    const { port, host, ...globalOptions } = this.optsWithGlobals<
      ServeOptions & GlobalCliOptions
    >()

    let { config } = await loadConfig(root, {
      ...globalOptions,
      export: true,
    })

    const outDir = config.outDir!

    if (!(await pathExists(path.resolve(outDir, 'index.html'), 'file'))) {
      logger.error('Please build the documentation first')
      process.exit(1)
    }

    config = await autoSidebar(config, {
      ignore: globalOptions.ignore,
      export: true,
    })

    config.builderConfig!.server!.open = false

    // make sure it won't be overridden by `serve`
    const themeConfig = { ...config.themeConfig }

    logger.start('Serving...')

    await serve({ config, host, port })

    const tempDir = path.resolve(outDir, '.doom')

    const commonOptions: Omit<GeneratePdfOptions, 'pages' | 'outFile'> = {
      tempDir,
      port: port!,
      host: host || 'localhost',
      outDir,
      pdfOptions: {
        margin: {
          top: 40,
          right: 40,
          bottom: 40,
          left: 40,
        },
        printBackground: true,
        headerTemplate: /* HTML */ `<div
          style="margin-top: -0.4cm; height: 70%; width: 100%; display: flex; justify-content: center; align-items: center; color: lightgray; border-bottom: solid lightgray 1px; font-size: 10px;"
        >
          <span class="title"></span>
        </div>`,
        footerTemplate: /* HTML */ `<div
          style="margin-bottom: -0.4cm; height: 70%; width: 100%; display: flex; justify-content: flex-start; align-items: center; color: lightgray; border-top: solid lightgray 1px; font-size: 10px;"
        ></div>`,
      },
      printerOptions: {
        ignoreHTTPSErrors: true,
        initScripts: [
          // eslint-disable-next-line @typescript-eslint/require-await
          async () => {
            localStorage.setItem('rspress-theme-appearance', 'light')
            localStorage.setItem('rspress-visited', '1')
          },
        ],
        outlineContainerSelector: '.rspress-doc',
      },
    }

    const exportPdf = async (
      sidebarItems: DoomSidebar[],
      lang = config.lang!,
      options?: Partial<GeneratePdfOptions>,
    ) => {
      const pages = collectPages(sidebarItems, config.base!)
      const pdfOptions = {
        pages,
        outFile: getPdfName(lang, config.userBase, config.title),
        cleanupTempDir: false,
        ...commonOptions,
        ...options,
      }
      logger.start(
        `Exporting ${options ? 'custom' : 'all'} ${lang} language documents with ${pages.length} pages into ${yellow(pdfOptions.outFile)}...`,
      )
      return generatePdf(pdfOptions)
    }

    const findScopeFactory = (scope: string[]) =>
      function findScope(
        sidebarItems: DoomSidebar[],
      ): Set<DoomSidebarGroup | DoomSidebarItem> | undefined {
        const found = new Set<DoomSidebarGroup | DoomSidebarItem>()
        for (const item of sidebarItems) {
          if (!('_fileKey' in item) || !item._fileKey) {
            continue
          }
          if (scope.includes(item._fileKey)) {
            found.add(item)
          }
          if ('items' in item) {
            const found_ = findScope(item.items)
            if (found_?.size) {
              found_.forEach((i) => found.add(i))
            }
          }
        }
        return found
      }

    const exportItems = config.export || []

    const exportEntries = async (
      sidebarItems: DoomSidebar[],
      allOutlines: PDFOutline[],
      lang = config.lang!,
    ) => {
      for (const item of exportItems) {
        // already normalized by `loadConfig`
        const scope = item.scope as string[]
        const found = findScopeFactory(scope)(sidebarItems)
        if (!found?.size) {
          logger.warn(
            `Cannot find entry \`${cyan(scope.join(', '))}\` for lang ${lang}, skip exporting`,
          )
          continue
        }
        const foundSidebarItems = [...found]
        await exportPdf(foundSidebarItems, lang, {
          allOutlines,
          outFile: `${item.name || (foundSidebarItems.find((it) => it.link?.endsWith('/index')) ?? foundSidebarItems[0]).text}-${lang}.pdf`,
        })
      }
    }

    if (themeConfig.locales?.length) {
      for (const { lang, sidebar } of themeConfig.locales) {
        const sidebarItems = sidebar![
          config.lang === lang ? '/' : `/${lang}`
        ] as DoomSidebar[]
        const { allOutlines } = await exportPdf(sidebarItems, lang)
        await exportEntries(sidebarItems, allOutlines, lang)
      }
    } else {
      const sidebarItems = themeConfig.sidebar!['/'] as DoomSidebar[]
      const { allOutlines } = await exportPdf(sidebarItems)
      await exportEntries(sidebarItems, allOutlines)
    }

    await fs.rm(tempDir, { force: true, recursive: true })

    logger.ready('Closing the server')
    process.exit(0)
  })
