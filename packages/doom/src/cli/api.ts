import path from 'node:path'

import { logger } from '@rspress/core'
import { Command } from 'commander'
import { glob } from 'tinyglobby'
import { cyan, red, yellow } from 'yoctocolors'

import type { GlobalCliOptions } from '../types.ts'
import { resolveStaticConfig } from '../utils/helpers.ts'

import { loadConfig } from './load-config.ts'

interface Problem {
  file: string
  message: string
}

// The parsed files are untrusted YAML/JSON — an empty file parses to `null`,
// and a non-CRD file has none of these fields. Type them loosely so the runtime
// guards below are real, not dead code.
interface LooseCrd {
  kind?: string
  metadata?: { name?: string }
  spec?: { group?: string; names?: { plural?: string } }
}

const rel = (base: string, file: string) => path.relative(base, file) || file

/**
 * `doom api check` — a zero-network, offline validation of the local API
 * schema sources (`api.crds` / `api.openapis`). It closes the gap the ingest
 * contract leaves open: there is no naming rule, no drift detection and no
 * conflict report for the hand-committed CRD / OpenAPI files. It never talks to
 * a cluster; it only reads what is already on disk, so a documentation build
 * stays reproducible.
 */
const checkApiSources = async (
  root: string | undefined,
  globalOptions: GlobalCliOptions,
) => {
  const { config, configFilePath } = await loadConfig(root, globalOptions)
  const base = configFilePath ? path.dirname(configFilePath) : config.root!

  const problems: Problem[] = []
  const warnings: Problem[] = []

  // ---- CRDs -------------------------------------------------------------
  const crdFiles = config.api?.crds?.length
    ? await glob(config.api.crds, { cwd: base, absolute: true })
    : []

  const crdNameOwners = new Map<string, string>()

  for (const file of crdFiles) {
    let crd: LooseCrd | null | undefined
    try {
      crd = await resolveStaticConfig<LooseCrd | null>(file)
    } catch (error) {
      problems.push({
        file: rel(base, file),
        message: `failed to parse: ${(error as Error).message}`,
      })
      continue
    }

    if (crd?.kind !== 'CustomResourceDefinition') {
      problems.push({
        file: rel(base, file),
        message: `not a CustomResourceDefinition (kind: ${cyan(String(crd?.kind))})`,
      })
      continue
    }

    const name = crd.metadata?.name
    if (!name) {
      problems.push({ file: rel(base, file), message: 'missing metadata.name' })
      continue
    }

    const previous = crdNameOwners.get(name)
    if (previous) {
      problems.push({
        file: rel(base, file),
        message: `duplicate CRD \`${cyan(name)}\` (also in ${cyan(previous)})`,
      })
    } else {
      crdNameOwners.set(name, rel(base, file))
    }

    // Filename convention: `<group>_<plural>.yaml`.
    const group = crd.spec?.group
    const plural = crd.spec?.names?.plural
    if (group && plural) {
      const expected = `${group}_${plural}.yaml`
      const actual = path.basename(file)
      if (actual !== expected && actual !== `${group}_${plural}.yml`) {
        warnings.push({
          file: rel(base, file),
          message: `filename \`${actual}\` does not match the \`<group>_<plural>.yaml\` convention (expected \`${cyan(expected)}\`)`,
        })
      }
    }
  }

  // ---- OpenAPI definitions ---------------------------------------------
  const openapiFiles = config.api?.openapis?.length
    ? await glob(config.api.openapis, { cwd: base, absolute: true })
    : []

  // schema name -> list of { file, content }
  const schemaOwners = new Map<string, { file: string; content: string }[]>()

  for (const file of openapiFiles) {
    let doc: Record<string, unknown> | null | undefined
    try {
      doc = await resolveStaticConfig<Record<string, unknown> | null>(file)
    } catch (error) {
      problems.push({
        file: rel(base, file),
        message: `failed to parse: ${(error as Error).message}`,
      })
      continue
    }

    const components = doc?.components as
      | { schemas?: Record<string, unknown> }
      | undefined
    const schemas: Record<string, unknown> = {
      ...(components?.schemas ?? {}),
      ...((doc?.definitions as Record<string, unknown> | undefined) ?? {}),
    }
    for (const [name, schema] of Object.entries(schemas)) {
      const list = schemaOwners.get(name) ?? []
      list.push({ file: rel(base, file), content: JSON.stringify(schema) })
      schemaOwners.set(name, list)
    }
  }

  let duplicateNames = 0
  let conflictNames = 0
  for (const [name, owners] of schemaOwners) {
    if (owners.length < 2) {
      continue
    }
    duplicateNames++
    const distinctContent = new Set(owners.map((o) => o.content))
    if (distinctContent.size > 1) {
      conflictNames++
      problems.push({
        file: owners.map((o) => o.file).join(', '),
        message: `OpenAPI definition \`${cyan(name)}\` is defined ${owners.length} times with ${distinctContent.size} different bodies`,
      })
    }
  }

  // ---- report -----------------------------------------------------------
  logger.info(
    `Checked ${cyan(String(crdFiles.length))} CRD file(s) and ${cyan(String(openapiFiles.length))} OpenAPI file(s).`,
  )
  if (duplicateNames) {
    logger.info(
      `${cyan(String(duplicateNames))} OpenAPI definition name(s) appear in more than one file (${conflictNames} with conflicting bodies).`,
    )
  }

  for (const w of warnings) {
    logger.warn(`${yellow(w.file)}: ${w.message}`)
  }
  for (const p of problems) {
    logger.error(`${red(p.file)}: ${p.message}`)
  }

  if (problems.length) {
    logger.error(
      `\`doom api check\` found ${red(String(problems.length))} problem(s) and ${warnings.length} warning(s).`,
    )
    process.exitCode = 1
  } else {
    logger.success(
      `\`doom api check\` passed with ${warnings.length} warning(s).`,
    )
  }
}

export const apiCommand = new Command('api').description(
  'Work with the local API schema sources (`api.crds` / `api.openapis`)',
)

apiCommand
  .command('check')
  .description(
    'Validate the local CRD / OpenAPI sources offline: every file parses, CRDs have the right kind, names are unique, filenames follow the `<group>_<plural>.yaml` convention, and OpenAPI definitions do not conflict across files',
  )
  .argument('[root]', 'Root directory of the documentation')
  .action(async function (root?: string) {
    const globalOptions = this.optsWithGlobals<GlobalCliOptions>()
    await checkApiSources(root, globalOptions)
  })
