import EventEmitter from 'node:events'
import path from 'node:path'
import process from 'node:process'

import { PDFDocument } from 'pdf-lib'
import type { Browser, BrowserContext, LaunchOptions, Page } from 'playwright'
import { chromium } from 'playwright'
import { red } from 'yoctocolors'

import {
  getOutlineNodes,
  setOutlineNodes,
  type OutlineNode,
} from './outline.js'
import { setMetadata, type Meta } from './postprocesser.js'

export type PDFOptions = Exclude<Parameters<Page['pdf']>[0], undefined>

export type { Browser, LaunchOptions, Page }

export type PageInitScriptFn = Page['addInitScript']

export interface PrinterOptions {
  debug?: boolean
  headless?: LaunchOptions['headless']
  allowLocal?: boolean
  allowRemote?: boolean
  outlineTags?: string[]
  initScripts?: PageInitScriptFn[]
  additionalScripts?: string[]
  additionalStyles?: string[]
  allowedPaths?: string[]
  allowedDomains?: string[]
  ignoreHTTPSErrors?: boolean
  browserEndpoint?: string
  browserArgs?: string[]
  timeout?: number
  emulateMedia?: null | 'screen' | 'print'
  enableWarnings?: boolean
  outlineContainerSelector?: string
}

export class Printer extends EventEmitter {
  private debug: boolean
  private headless: LaunchOptions['headless']
  private allowLocal: boolean
  private outlineTags: string[]
  private allowRemote: boolean
  private initScripts: PageInitScriptFn[]
  private additionalScripts: string[]
  private additionalStyles: string[]
  private allowedPaths: string[]
  private allowedDomains: string[]
  private ignoreHTTPSErrors: boolean
  private browserWSEndpoint?: string
  private browserArgs: string[]
  private timeout: number
  private emulateMedia: 'screen' | 'print'
  private enableWarnings: boolean
  private outlineContainerSelector: string

  private browser?: Browser
  private browserContext?: BrowserContext
  private page?: Page

  private url?: string

  constructor(options: PrinterOptions = {}) {
    super()

    this.debug = options.debug ?? false
    this.headless = options.headless ?? true
    this.allowLocal = options.allowLocal ?? false
    this.allowRemote = options.allowRemote ?? true
    this.outlineTags = options.outlineTags ?? [
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
    ]
    this.initScripts = options.initScripts ?? []
    this.additionalScripts = options.additionalScripts ?? []
    this.additionalStyles = options.additionalStyles ?? []
    this.allowedPaths = options.allowedPaths ?? []
    this.allowedDomains = options.allowedDomains ?? []
    this.ignoreHTTPSErrors = options.ignoreHTTPSErrors ?? false
    this.browserWSEndpoint = options.browserEndpoint
    this.browserArgs = options.browserArgs ?? []
    this.timeout = options.timeout ?? 0
    this.emulateMedia = options.emulateMedia ?? 'print'
    this.enableWarnings = options.enableWarnings ?? false
    this.outlineContainerSelector = options.outlineContainerSelector ?? ''

    if (this.debug) {
      this.headless = false
    }
  }

  async setup(launchOptions?: LaunchOptions) {
    if (this.page) {
      return this.page
    }

    const browserOptions = {
      pipe: true,
      headless: this.headless,
      args: ['--disable-dev-shm-usage', '--export-tagged-pdf'],
      ...launchOptions,
    }

    if (this.allowLocal) {
      browserOptions.args.push('--allow-file-access-from-files')
    }

    if (this.browserArgs.length) {
      browserOptions.args.push(...this.browserArgs)
    }

    if (this.browserWSEndpoint) {
      this.browser = await chromium.connect(
        this.browserWSEndpoint,
        browserOptions,
      )
    } else {
      this.browser = await chromium.launch(browserOptions)
    }

    this.browserContext = await this.browser.newContext({
      ignoreHTTPSErrors: this.ignoreHTTPSErrors,
    })

    for (const script of this.initScripts) {
      await this.browserContext.addInitScript(script)
    }

    const page = await this.browserContext.newPage()

    this.page = page

    await page.emulateMedia({
      colorScheme: 'light',
      media: this.emulateMedia,
    })

    if (this.needsAllowedRules()) {
      await page.route('**/*', (route) => {
        const uri = new URL(route.request().url())
        const { host, protocol, pathname } = uri
        const local = protocol === 'file:'

        if (local && !this.withinAllowedPath(pathname)) {
          return route.abort()
        }

        if (local && !this.allowLocal) {
          return route.abort()
        }

        if (host && !this.isAllowedDomain(host)) {
          return route.abort()
        }

        if (host && !this.allowRemote) {
          return route.abort()
        }

        return route.continue()
      })
    }

    return page
  }

  async render(url: string) {
    const page = this.page || (await this.setup())

    if (url === this.url) {
      return page
    }

    this.url = url

    try {
      await page.goto(url)

      for (const style of this.additionalStyles) {
        await page.addStyleTag({ path: style })
      }

      for (const script of this.additionalScripts) {
        await page.addScriptTag({ path: script })
      }

      await page.waitForLoadState('networkidle', { timeout: this.timeout })

      return page
    } catch (error) {
      await this.closeBrowser()
      throw error
    }
  }

  async pdf(url: string, options: PDFOptions = {}, pdfOutlines?: boolean) {
    const page = await this.render(url)

    try {
      // Get metatags
      const meta = await page.evaluate(() => {
        const meta: Meta = {}
        const title = document.querySelector('title')
        if (title) {
          meta.title = title.textContent?.trim()
        }

        const lang = document.querySelector('html')?.getAttribute('lang')
        if (lang) {
          meta.lang = lang
        }

        const metaTags = document.querySelectorAll('meta')
        metaTags.forEach((tag) => {
          if (tag.name) {
            meta[tag.name] = tag.content
          }
        })

        return meta
      })

      const pdfExportOptions: PDFOptions = {
        scale: !options.scale ? 1 : options.scale,
        displayHeaderFooter: false,
        headerTemplate: options.headerTemplate,
        footerTemplate: options.footerTemplate,
        preferCSSPageSize: options.preferCSSPageSize,
        printBackground: options.printBackground,
        width: options.width,
        height: options.height,
        landscape: options.landscape,
        format: options.format,
      }

      if (options.margin) {
        pdfExportOptions.margin = options.margin
      }

      if (options.pageRanges) {
        pdfExportOptions.pageRanges = options.pageRanges
      }

      if (options.headerTemplate || options.footerTemplate) {
        pdfExportOptions.displayHeaderFooter = true
      }

      const pdf = await page.pdf(pdfExportOptions)

      this.emit('postprocessing')

      const pdfDoc = await PDFDocument.load(pdf)

      setMetadata(pdfDoc, meta)

      let outlineNodes: OutlineNode[] = []

      if (pdfOutlines) {
        outlineNodes = await getOutlineNodes(
          page,
          this.outlineTags,
          this.outlineContainerSelector,
        )
        setOutlineNodes(pdfDoc, outlineNodes, this.enableWarnings)
      }

      return {
        data: await pdfDoc.save(),
        outlineNodes,
      }
    } catch (error) {
      await this.closeBrowser()
      throw error
    }
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close()
      this.browser = undefined
      this.browserContext = undefined
      this.page = undefined
    } else {
      process.stdout.write(red('Browser instance not found'))
    }
  }

  needsAllowedRules() {
    return this.allowedPaths.length || this.allowedDomains.length
  }

  withinAllowedPath(pathname: string) {
    if (!this.allowedPaths.length) {
      return true
    }

    for (const parent of this.allowedPaths) {
      const relative = path.relative(parent, pathname)
      if (
        relative &&
        !relative.startsWith('..') &&
        !path.isAbsolute(relative)
      ) {
        return true
      }
    }

    return false
  }

  isAllowedDomain(domain: string) {
    if (!this.allowedDomains.length) {
      return true
    }
    return this.allowedDomains.includes(domain)
  }
}
