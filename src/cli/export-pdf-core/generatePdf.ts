import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { red, yellow } from 'yoctocolors'

import {
  createProgress,
  isValidUrl,
  Printer,
  writeFileSafe,
  type PrinterOptions,
} from '../html-export-pdf/index.js'

import type { LaunchOptions, Page, PDFOptions } from './types.js'
import {
  getUrlLink,
  mergePDF,
  type NormalizePage,
  type PDFOutline,
} from './utils/index.js'

export interface GeneratePdfOptions {
  pages: Page[]
  tempDir: string
  port: number
  host: string
  outFile: string
  outDir: string
  launchOptions?: LaunchOptions
  pdfOptions?: PDFOptions
  pdfOutlines?: boolean
  urlOrigin?: string
  printerOptions?: PrinterOptions
}

/**
 * Generate PDF from VuePress or VitePress dev server.
 */
export async function generatePdf({
  pages,
  tempDir,
  port,
  host,
  outFile,
  outDir,
  urlOrigin,
  pdfOptions,
  pdfOutlines = true,
  launchOptions,
  printerOptions,
}: GeneratePdfOptions) {
  await fs.mkdir(tempDir, { recursive: true })

  const isValidUrlOrigin = isValidUrl(urlOrigin ?? '')

  if (urlOrigin && !isValidUrlOrigin) {
    process.stdout.write(red(`${urlOrigin} is not a valid URL`))
    process.exit(1)
  }

  let userURLOrigin = ''
  if (urlOrigin && isValidUrlOrigin) {
    userURLOrigin = new URL(urlOrigin).origin
  }

  const localURLOrigin = `${host}:${port}`

  const normalizePages = pages.map<NormalizePage>((page) => {
    return {
      url: page.path,
      title: page.title,
      location: urlOrigin
        ? `${userURLOrigin}${page.path}`
        : `http://${localURLOrigin}${page.path}`,
      pagePath: path.resolve(tempDir, `${page.key}.pdf`),
    }
  })

  const singleBar = createProgress()
  singleBar.start(normalizePages.length)

  const printer = new Printer(printerOptions)

  const page = await printer.setup(launchOptions)

  if (urlOrigin && isValidUrlOrigin) {
    await page.route('**/*', (route) => {
      const reqUrl = route.request().url()
      if (!isValidUrl(reqUrl)) {
        return route.continue()
      }
      // http or https
      const parsedUrl = new URL(reqUrl)
      if (userURLOrigin === parsedUrl.origin) {
        parsedUrl.host = host
        parsedUrl.protocol = 'http:'
        parsedUrl.port = `${port}`
        const parsedUrlString = parsedUrl.toString()
        return route.continue({
          url: parsedUrlString,
          headers: Object.assign({}, route.request().headers(), {
            refer: parsedUrlString,
            // Same origin
            // origin: parsedUrl.origin,
            // CORS
            // host: parsedUrl.host,
          }),
        })
      }
    })
  }

  const allOutlines: PDFOutline[] = []

  for (const { location, pagePath, title } of normalizePages) {
    const { data, outlineNodes } = await printer.pdf(
      location,
      {
        format: 'A4',
        ...pdfOptions,
      },
      pdfOutlines,
    )

    if (pdfOutlines) {
      allOutlines.push([getUrlLink(location).link, outlineNodes])
    }

    await writeFileSafe(pagePath, data)

    singleBar.increment(1, { headTitle: title || (await page.title()) })
  }

  singleBar.stop()

  await printer.closeBrowser()

  const exportedPath = await mergePDF(
    normalizePages,
    outFile,
    outDir,
    allOutlines,
  )

  const message = `Exported to ${yellow(exportedPath)}\n`
  process.stdout.write(message)

  await fs.rm(tempDir, { force: true, recursive: true })
  return exportedPath
}
