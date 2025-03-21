import { dirname } from 'node:path'

import { getAbsFileName } from './getAbsFileName.js'

export function getDirname(metaURL: string) {
  return dirname(getAbsFileName(metaURL))
}
