import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const BASE_DIR = path.resolve(fileURLToPath(import.meta.url), '../..')

export const PKG_DIR = path.resolve(BASE_DIR, '..')
