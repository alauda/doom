import path from 'node:path'
import { fileURLToPath } from 'node:url'

const BASE_DIR = path.resolve(fileURLToPath(import.meta.url), '..')

const PKG_DIR = path.resolve(BASE_DIR, '..')

export const pkgResolve = (...paths: string[]) =>
  path.resolve(PKG_DIR, ...paths)
