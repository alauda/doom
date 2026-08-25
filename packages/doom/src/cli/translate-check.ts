import fs from 'node:fs/promises'
import path from 'node:path'

import { logger } from '@rspress/core'
import remarkFrontmatter from 'remark-frontmatter'
import remarkGfm from 'remark-gfm'
import remarkMdx from 'remark-mdx'
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'
import { glob } from 'tinyglobby'
import type { Plugin, Processor } from 'unified'
import { unified } from 'unified'
import { VFile } from 'vfile'
import { cyan, red } from 'yoctocolors'

import doomLint from '../remark-lint/index.ts'
import {
  translationComponentMultiset,
  translationFrontmatterPreservation,
  translationHeadingSequence,
  translationJsxAttributeParity,
  translationLengthRatio,
  translationLinkIsomorphism,
  translationEchoedSource,
  translationUpToDate,
  translationUrlResidue,
} from '../remark-lint/translation-parity/index.ts'
import { SUPPORTED_LANGUAGES } from '../shared/index.ts'
import type { GlobalCliOptions } from '../types.ts'
import { OPTIONS_FILE, STORAGE_DIR } from '../utils/index.ts'

import { loadConfig } from './load-config.ts'

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

// Order matters only for readability of the output: whether the pair is even
// comparable comes first, because nothing after it means anything otherwise.
const PARITY_RULES = [
  translationUpToDate,
  translationComponentMultiset,
  translationLinkIsomorphism,
  translationJsxAttributeParity,
  translationHeadingSequence,
  translationFrontmatterPreservation,
  translationLengthRatio,
  translationEchoedSource,
  translationUrlResidue,
] as unknown as Array<Plugin<[], never>>

export interface TranslateCheckOptions {
  glob: string[]
  target?: string[]
}

const buildProcessor = (mdx: boolean, rules: Array<Plugin<[], never>>) => {
  let processor = unified()
    .use(remarkParse)
    .use(remarkStringify)
    .use(remarkGfm)
    .use(remarkFrontmatter) as unknown as Processor
  if (mdx) {
    processor = processor.use(remarkMdx)
  }
  // `doomLint` is message control: it is what makes `<!-- lint disable -->`
  // work. Included so this command and `doom lint` agree about what a document
  // says — one rule set means one answer.
  processor = processor.use(doomLint) as unknown as Processor
  for (const rule of rules) {
    processor = processor.use(rule)
  }
  return processor.freeze()
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

  const mdxProcessor = buildProcessor(true, PARITY_RULES)
  const mdProcessor = buildProcessor(false, PARITY_RULES)

  let problems = 0
  for (const file of files) {
    const value = await fs.readFile(file, 'utf8')
    const processor = file.endsWith('.mdx') ? mdxProcessor : mdProcessor
    let vfile: VFile
    try {
      vfile = await processor.process(new VFile({ path: file, value }))
    } catch (error) {
      problems++
      logger.error(
        `${cyan(path.relative(docsDir, file))}\n  ${red('does not parse')}: ${error instanceof Error ? error.message : String(error)}`,
      )
      continue
    }
    if (vfile.messages.length === 0) {
      continue
    }
    problems += vfile.messages.length
    logger.error(
      `${cyan(path.relative(docsDir, file))}\n${vfile.messages
        .map(
          (message) =>
            `  ${red(message.ruleId ?? 'unknown')}  ${message.reason}`,
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
