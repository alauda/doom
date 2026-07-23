import fs from 'node:fs/promises'
import path from 'node:path'

import { glob } from 'tinyglobby'
import { parse } from 'yaml'

import { JSON_EXTENSION, YAML_EXTENSIONS } from '../cli/constants.ts'
import type { StringMapper } from '../shared/types.ts'

import { BASE_DIR, PKG_DIR } from './constants.ts'

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
  patterns: string[] = [],
  kind: string,
  root: string,
  cwd: string,
  isProd: boolean,
  mapper?: (input: T) => R | Promise<R>,
) {
  const runtimeModules: StringMapper = {}
  // `tinyglobby`/`fdir` return files in filesystem (readdir) order, which is
  // not stable across machines. Sort so the map insertion order — and thus the
  // "first matched wins" tie-break in the API components — is deterministic.
  const files = (patterns.length ? await glob(patterns, { cwd }) : []).sort()
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
    // `file` is relative to `cwd`; resolve it against `cwd` before making it
    // relative to `root`, otherwise `path.relative` measures from
    // `process.cwd()` and the key silently changes with the working directory.
    `\nexport default {${files.map((file, index) => `'${path.relative(root, path.resolve(cwd, file))}':_${index}`).join(',')}}`
  return runtimeModules
}

export const setNodeEnv = (env: 'development' | 'production') => {
  process.env.NODE_ENV = env
}
