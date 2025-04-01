import type { PDFDocument } from 'pdf-lib'

export interface Meta {
  title?: string
  lang?: string
  subject?: string
  author?: string
  keywords?: string[] | string
  creator?: string
  producer?: string
  creationDate?: Date | string
  modDate?: Date | string
  [tag: string]: unknown
}

export function setMetadata(pdfDoc: PDFDocument, meta: Meta) {
  // Get the existing Info
  if (!meta.creator) {
    const creator = pdfDoc.getCreator()
    meta.creator = creator ? `${creator} - doom` : 'doom'
  }

  pdfDoc.setCreator(meta.creator)

  if (meta.author) {
    pdfDoc.setAuthor(meta.author)
  }

  if (!meta.producer) {
    const producer = pdfDoc.getProducer()
    meta.producer = producer || 'doom'
  }

  pdfDoc.setProducer(meta.producer)

  if (meta.title) {
    pdfDoc.setTitle(meta.title)
  }

  if (meta.subject) {
    pdfDoc.setSubject(meta.subject)
  }

  if (!meta.keywords) {
    meta.keywords = []
  } else if (typeof meta.keywords === 'string') {
    meta.keywords = meta.keywords.split(',')
  }

  pdfDoc.setKeywords(meta.keywords)

  // Overwrite Dates
  if (!(meta.creationDate instanceof Date)) {
    meta.creationDate = new Date()
  }

  pdfDoc.setCreationDate(meta.creationDate)

  meta.modDate = new Date()

  pdfDoc.setModificationDate(meta.modDate)
}
