import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const BASE_DIR = path.resolve(fileURLToPath(import.meta.url), '../..')

export const PKG_DIR = path.resolve(BASE_DIR, '..')

export const STORAGE_DIR = path.resolve('node_modules/.doom')

export const OPTIONS_FILE = path.resolve(STORAGE_DIR, 'options.json')
