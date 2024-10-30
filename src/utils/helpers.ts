import path from 'node:path'

import { BASE_DIR, PKG_DIR } from './constants.js'

export const baseResolve = (...paths: string[]) =>
  path.resolve(BASE_DIR, ...paths)

export const pkgResolve = (...paths: string[]) =>
  path.resolve(PKG_DIR, ...paths)
