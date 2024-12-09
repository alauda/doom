import fs from 'node:fs/promises'
import path from 'node:path'

import { parse } from 'yaml'

import { BASE_DIR, PKG_DIR } from './constants.js'
import { JSON_EXTENSION, YAML_EXTENSIONS } from '../cli/constants.js'

export const baseResolve = (...paths: string[]) =>
  path.resolve(BASE_DIR, ...paths)

export const pkgResolve = (...paths: string[]) =>
  path.resolve(PKG_DIR, ...paths)

export const resolveStaticConfig = async <T = unknown>(
  filepath: string,
): Promise<T> => {
  const extname = path.extname(filepath)
  const content = await fs.readFile(filepath, 'utf-8')

  if (extname === JSON_EXTENSION) {
    if (!content.trim()) {
      return null as T
    }
    return JSON.parse(content) as T
  }

  if ((YAML_EXTENSIONS as readonly string[]).includes(extname)) {
    return parse(content) as T
  }

  throw new Error(`Unsupported file extension: ${extname}`)
}
