import fs from 'node:fs'
import path from 'node:path'

import { baseResolve } from '../../utils/index.ts'

const componentsDir = baseResolve('runtime/components')

const isGlobalComponentFile = (file: string) => {
  const basename = path.basename(file, path.extname(file))
  return (
    !basename.startsWith('_') &&
    !basename.endsWith('.d') &&
    basename !== 'index'
  )
}

export const getGlobalComponentFiles = () =>
  fs
    .readdirSync(componentsDir)
    .filter(isGlobalComponentFile)
    .map((file) => path.resolve(componentsDir, file))

export const getGlobalComponentNames = () =>
  fs
    .readdirSync(componentsDir)
    .filter(isGlobalComponentFile)
    .map((file) => path.basename(file, path.extname(file)))
