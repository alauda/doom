import { Buffer } from 'node:buffer'
import fs from 'node:fs/promises'
import { join, relative } from 'node:path'
import process from 'node:process'

import {
  asPDFName,
  PDFArray,
  PDFDict,
  PDFDocument,
  PDFObject,
  PDFString,
} from 'pdf-lib'
import PDFMerger from 'pdf-merger-js'
import { red } from 'yoctocolors'

import type { OutlineNode } from '../../html-export-pdf/index.js'
import { mergePDFs } from '../../merge-pdfs/index.js'

import { convertPathToPosix } from './convertPathToPosix.js'
import { getUrlLink } from './getUrlLink.js'

export interface NormalizePage {
  location: string
  pagePath: string
  url: string
  title?: string
}

export type PDFOutline = [path: string, outlineNodes: OutlineNode[]]

export interface Outline {
  title: string
  dest: PDFArray
  children: Outline[]
}

const extractOutline = (doc: PDFDocument, dict: PDFDict) => {
  return {
    title: (dict.get(asPDFName('Title')) as PDFString).decodeText(),
    dest: dict.get(asPDFName('Dest')) as PDFArray,
    children: extractOutlines(doc, dict),
  }
}

const extractOutlines = (doc: PDFDocument, dictObj: PDFObject) => {
  const outlineDict = doc.context.lookup(dictObj, PDFDict)

  const first = outlineDict.get(asPDFName('First'))

  let dict = doc.context.lookupMaybe(first, PDFDict)

  if (!dict) {
    return []
  }

  const outlines: Outline[] = [extractOutline(doc, dict)]

  let obj: PDFObject | undefined

  while ((obj = dict.get(asPDFName('Next')))) {
    dict = doc.context.lookup(obj, PDFDict)
    outlines.push(extractOutline(doc, dict))
  }

  return outlines
}

/**
 * Based on @see https://github.com/Hopding/pdf-lib/issues/867#issuecomment-827570106
 */
export const replaceLinksWithOutline = async (
  pdfData: Buffer | Uint8Array,
  pdfOutlines: PDFOutline[],
) => {
  const pdfDoc = await PDFDocument.load(pdfData)

  const outlinesObj = pdfDoc.catalog.get(asPDFName('Outlines'))

  if (!outlinesObj) {
    return pdfData
  }

  const outlineMap = new WeakMap<OutlineNode, Outline>()

  const outlineNodes = pdfOutlines.flatMap(([, outlineNodes]) => outlineNodes)

  const outlineNodeMap = new Map(pdfOutlines)

  const outlines = extractOutlines(pdfDoc, outlinesObj)

  for (const [index, outlineNode] of outlineNodes.entries()) {
    const outline = outlines[index]
    outlineMap.set(outlineNode, outline)
    for (const [index, outlineChild] of outlineNode.children.entries()) {
      outlineMap.set(outlineChild, outline.children[index])
    }
  }

  const pages = pdfDoc.getPages()

  for (const page of pages) {
    for (const annot of page.node.Annots()?.asArray() || []) {
      const dict = pdfDoc.context.lookupMaybe(annot, PDFDict)
      const aRecord = dict?.get(asPDFName(`A`))
      const link = pdfDoc.context.lookupMaybe(aRecord, PDFDict)
      const uri = link?.get(asPDFName('URI'))?.toString().slice(1, -1) // get the original link, remove parenthesis

      if (!dict || !aRecord || !link || !uri) {
        continue
      }

      const url = uri.replace(/\\(\d{2,3})/g, (_, code: string) =>
        String.fromCharCode(Number.parseInt(code, 8)),
      )

      if (/^https?:\/\//.test(url)) {
        const { link, hash } = getUrlLink(url)

        let matched = outlineNodeMap.get(link)

        if (!matched && link.endsWith('/')) {
          matched = outlineNodeMap.get(link + 'index.html')
        }

        if (!matched?.length) {
          continue
        }

        let matchedOutlineNode = matched[0]

        if (hash) {
          for (const node of matched) {
            if (node.destination === hash) {
              matchedOutlineNode = node
              break
            }
            for (const child of node.children) {
              if (child.destination === hash) {
                matchedOutlineNode = child
                break
              }
            }
          }
        }

        const matchedOutline = outlineMap.get(matchedOutlineNode)

        if (!matchedOutline) {
          continue
        }

        dict.set(
          asPDFName('A'),
          pdfDoc.context.obj({
            S: 'GoTo',
            D: matchedOutline.dest,
          }),
        )
      }
    }
  }
  return pdfDoc.save()
}

/**
 * Merge PDFs.
 * @param pages - NormalizePage
 * @param outFile - Output file
 * @param outDir - Output directory
 * @returns relativePath - Output relative path
 */
export async function mergePDF(
  pages: NormalizePage[],
  outFile: string,
  outDir: string,
  pdfOutlines: PDFOutline[],
) {
  const saveDirPath = join(process.cwd(), outDir)

  if (outDir) {
    await fs.mkdir(saveDirPath, { recursive: true })
  }

  const saveFilePath = join(saveDirPath, outFile)

  if (pages.length === 0) {
    process.stderr.write(
      red(
        'The website has no pages, please check whether the export path is set correctly',
      ),
    )
    process.exit(1)
  } else if (pages.length === 1) {
    await fs.rename(pages[0].pagePath, saveFilePath)
  } else {
    let pdfData: Buffer | Uint8Array
    if (pdfOutlines.length > 0) {
      pdfData = await mergePDFs(
        pages.map(({ pagePath }) => {
          const relativePagePath = relative(process.cwd(), pagePath)
          return convertPathToPosix(relativePagePath)
        }),
      )
      pdfData = await replaceLinksWithOutline(pdfData, pdfOutlines)
    } else {
      const merger = new PDFMerger()
      for (const { pagePath } of pages) {
        await merger.add(pagePath)
      }
      pdfData = await merger.saveAsBuffer()
    }

    await fs.writeFile(saveFilePath, pdfData)
  }

  return relative(process.cwd(), saveFilePath)
}
