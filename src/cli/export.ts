import path from 'node:path'

import {
  generatePdf,
  type GeneratePdfOptions,
  type Page,
} from './export-pdf-core/index.js'
import { removeLeadingSlash, serve } from '@rspress/core'
import { logger } from '@rspress/shared/logger'
import { Command } from 'commander'

import { autoSidebar } from '../plugins/index.js'
import {
  pathExists,
  removeBothEndsSlashes,
  setNodeEnv,
  type GlobalCliOptions,
  type ServeOptions,
} from '../utils/index.js'
import { loadConfig } from './load-config.js'
import type { DoomSidebar } from '../plugins/auto-sidebar/walk.js'

export const exportCommand = new Command('export')
  .description('Export the documentation as PDF')
  .argument('[root]', 'Root directory of the documentation')
  .option('-H, --host [host]', 'Serve host name')
  .option('-P, --port [port]', 'Serve port number', '4173')
  .action(async function (root?: string) {
    setNodeEnv('production')

    const { port, host, ...globalOptions } = this.optsWithGlobals<
      ServeOptions & GlobalCliOptions
    >()

    let { config } = await loadConfig(root, globalOptions)

    const outDir = config.outDir!

    if (!(await pathExists(path.resolve(outDir, 'index.html'), 'file'))) {
      logger.error('Please build the documentation first')
      process.exit(1)
    }

    config = await autoSidebar(config, {
      ...config.sidebar,
      excludeRoutes: (globalOptions.ignore && config.internalRoutes) || [],
    })

    config.builderConfig!.server!.open = false

    const themeConfig = config.themeConfig!

    logger.start('Serving...')

    await serve({ config, host, port })

    const collectPages = (sidebarItems: DoomSidebar[]) => {
      const pages: Page[] = []
      for (const item of sidebarItems) {
        if ('link' in item && item.link) {
          const link = removeLeadingSlash(item.link)
          pages.push({
            key: link,
            path: config.base! + link + '.html?print=true',
            title: item.text,
          })
        }
        if ('items' in item) {
          pages.push(...collectPages(item.items))
        }
      }
      return pages
    }

    const commonOptions: Omit<GeneratePdfOptions, 'pages' | 'outFile'> = {
      tempDir: path.resolve(outDir, '.doom'),
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
    ) => {
      await generatePdf({
        pages: collectPages(sidebarItems),
        outFile: `${removeBothEndsSlashes(config.base!) || config.title}-${lang}.pdf`,
        ...commonOptions,
      })
    }

    if (themeConfig.locales?.length) {
      for (const { lang, sidebar } of themeConfig.locales) {
        const sidebarItems = sidebar![
          config.lang === lang ? '/' : `/${lang}`
        ] as DoomSidebar[]
        await exportPdf(sidebarItems, lang)
      }
    } else {
      const sidebarItems = themeConfig.sidebar!['/'] as DoomSidebar[]
      await exportPdf(sidebarItems)
    }

    // close the server
    process.exit(0)
  })
