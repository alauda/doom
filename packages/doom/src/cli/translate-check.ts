import fs from 'node:fs/promises'
import path from 'node:path'

import { logger } from '@rspress/core'
import { glob } from 'tinyglobby'
import { cyan, red } from 'yoctocolors'

import { SUPPORTED_LANGUAGES } from '../shared/index.ts'
import type { GlobalCliOptions } from '../types.ts'
import { OPTIONS_FILE, STORAGE_DIR } from '../utils/index.ts'

import { loadConfig } from './load-config.ts'
import { createTranslationChecker } from './translate-checker.ts'

/**
 * `doom translate check` — run the translation checks over translations that
 * already exist, without calling a translation model at all.
 *
 * Two things this is for. It is the offline way to survey the ~40 repositories
 * that consume doom and find out which translated documents are damaged, at no
 * token cost, before deciding what is worth re-translating. And it is the same
 * rule set the translator runs in its own loop — deliberately the same, because
 * a second set of criteria is a second thing to keep in step, and the first one
 * to fall out of it.
 */

export interface TranslateCheckOptions {
  glob: string[]
  target?: string[]
}

export const checkTranslations = async (
  root: string | undefined,
  globalOptions: GlobalCliOptions,
  { glob: globs, target }: TranslateCheckOptions,
) => {
  await fs.mkdir(STORAGE_DIR, { recursive: true })
  await fs.writeFile(
    OPTIONS_FILE,
    JSON.stringify({ root, globalOptions }, null, 2),
  )

  const { config } = await loadConfig(root, globalOptions)
  const docsDir = config.root!
  const sourceLang = config.lang ?? 'en'

  const targets: string[] = []
  if (target?.length) {
    targets.push(...target)
  } else {
    for (const lang of SUPPORTED_LANGUAGES) {
      if (lang === sourceLang) {
        continue
      }
      const present = await fs
        .stat(path.resolve(docsDir, lang))
        .then((stat) => stat.isDirectory())
        .catch(() => false)
      if (present) {
        targets.push(lang)
      }
    }
  }

  if (targets.length === 0) {
    logger.error(
      `No translated language directories found under \`${cyan(docsDir)}\`. Nothing to check.`,
    )
    process.exitCode = 1
    return
  }

  const files = (
    await Promise.all(
      targets.map((lang) =>
        glob(
          globs.map((pattern) => `${lang}/${pattern}`),
          { absolute: true, cwd: docsDir },
        ),
      ),
    )
  )
    .flat()
    .sort()

  if (files.length === 0) {
    logger.error(
      `No documents matched in ${targets.map((lang) => `\`${cyan(lang)}\``).join(', ')}. Refusing to report "no problems" for a search that found nothing.`,
    )
    process.exitCode = 1
    return
  }

  logger.start(
    `Checking ${cyan(String(files.length))} translated document(s) in ${targets.map((lang) => `\`${cyan(lang)}\``).join(', ')}...`,
  )

  const checker = createTranslationChecker()

  let problems = 0
  for (const file of files) {
    const value = await fs.readFile(file, 'utf8')
    const findings = await checker.check(file, value)
    if (findings.length === 0) {
      continue
    }
    problems += findings.length
    logger.error(
      `${cyan(path.relative(docsDir, file))}\n${findings
        .map(
          (finding) =>
            `  ${red(finding.rule)}${finding.line ? ` (line ${finding.line})` : ''}  ${finding.reason}`,
        )
        .join('\n')}`,
    )
  }

  if (problems > 0) {
    logger.error(
      `\`doom translate check\` found ${red(String(problems))} problem(s) in ${files.length} document(s).`,
    )
    process.exitCode = 1
    return
  }

  logger.success(
    `\`doom translate check\` passed: ${files.length} document(s), no problems.`,
  )
}
