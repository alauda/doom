import fs from 'node:fs/promises'
import path from 'node:path'

import { parse } from 'yaml'

import { BASE_DIR, PKG_DIR } from './constants.js'
import { JSON_EXTENSION, YAML_EXTENSIONS } from '../cli/constants.js'
import { StringMapper } from '../shared/types.js'
import { glob } from 'tinyglobby'

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

export async function generateRuntimeModule<T, R = T>(
  patterns: string[],
  kind: string,
  cwd: string,
  isProd: boolean,
  mapper?: (input: T) => R | Promise<R>,
) {
  const runtimeModules: StringMapper = {}
  const files = await glob(patterns, { cwd })
  for (const file of files) {
    const result = await resolveStaticConfig<T>(path.resolve(cwd, file))
    runtimeModules[`doom-@${kind}/${file}.mjs`] =
      `export default ${JSON.stringify(
        (await mapper?.(result)) ?? result,
        null,
        isProd ? 0 : 2,
      )}`
  }
  runtimeModules[`doom-@${kind}Map`] =
    files
      .map((file, index) => `import _${index} from 'doom-@${kind}/${file}.mjs'`)
      .join('\n') +
    `\nexport default {${files.map((file, index) => `'${file}':_${index}`).join(',')}}`
  return runtimeModules
}
