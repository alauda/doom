import { dirname } from 'node:path'

import { getAbsFileName } from './getAbsFileName.ts'

export function getDirname(metaURL: string) {
  return dirname(getAbsFileName(metaURL))
}
