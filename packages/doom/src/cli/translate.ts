import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import { isDeepStrictEqual } from 'node:util'

import { logger } from '@rspress/core'
import { removeLeadingSlash } from '@rspress/shared'
import matter from '@rspress/shared/gray-matter'
import { Command } from 'commander'
import ejs from 'ejs'
import { glob } from 'tinyglobby'
import { cyan, red } from 'yoctocolors'

import {
  mdProcessor,
  mdxProcessor,
  normalizeImgSrc,
  type NormalizeImgSrcOptions,
} from '../plugins/index.js'
import {
  DEFAULT_COPY_ONLY_DIRECTORIES,
  Language,
  SUPPORTED_LANGUAGES,
  TITLE_TRANSLATION_MAP,
} from '../shared/index.js'
import type { GlobalCliOptions, TranslateOptions } from '../types.js'
import { OPTIONS_FILE, STORAGE_DIR, pathExists } from '../utils/index.js'

import {
  escapeMarkdownHeadingIds,
  getMatchedDocFilePaths,
  parseBoolean,
  stringifyMatter,
  translateCodeFile,
} from './helpers.js'
import { loadConfig } from './load-config.js'
import { createSegmentTranslator } from './translate-call.js'
import {
  type TranslateCheckOptions,
  checkTranslations,
} from './translate-check.js'
import { createTranslationChecker } from './translate-checker.js'
import { createDiagnoser } from './translate-diagnose.js'
import { createJudge } from './translate-judge.js'
import {
  CONCURRENCY_ENV,
  DEFAULT_CONCURRENCY,
  DEFAULT_REQUESTS_PER_MINUTE,
  REQUESTS_PER_MINUTE_ENV,
  createLimits,
  positiveIntFromEnv,
} from './translate-limits.js'
import { maskAst } from './translate-mask.js'
import {
  DEFAULT_JUDGE_REASONING_EFFORT,
  DEFAULT_REASONING_EFFORT,
  createGateway,
  gatewayModel,
} from './translate-models.js'
import {
  DEFAULT_MAX_SEGMENT_ATTEMPTS,
  type SegmentOutcome,
  type TranslateDocumentResult,
  translateDocument,
} from './translate-pipeline.js'
import { createRepairAgent } from './translate-repair-agent.js'
import type { SegmentCacheRecord } from './translate-segment-cache.js'
import { resolveTerms } from './translate-terms.js'

/**
 * `doom translate` — orchestration and the gate.
 *
 * Everything that decides *what* gets translated lives here: which files the
 * globs match, which are already current by `sourceSHA`, which are copied
 * rather than translated, how a translation's frontmatter is merged, and the
 * deterministic rewrites (`normalizeImgSrc`, `translateCodeFile`) that are ours
 * to make rather than a model's.
 *
 * Translating a document does not live here at all. That is a segment pipeline,
 * in `translate-pipeline.ts`. There is one path through it: no flag turns it
 * off and no single-shot fallback remains, because a protection that can be
 * skipped is one that gets skipped.
 */

export interface I18nFrontmatter {
  i18n?: {
    additionalPrompts?: string
    disableAutoTranslation?: boolean
  }
  sourceSHA?: string
  /**
   * Where each of this translation's segments came from and where it went.
   *
   * The translator's own bookkeeping, like `sourceSHA` beside it: it lets the
   * next run reuse the segments whose source has not changed instead of
   * retranslating a whole page because one line of it moved. Nothing renders
   * it, and `translation-frontmatter-preservation` knows it is ours.
   */
  i18nSegments?: SegmentCacheRecord
  title?: string
  description?: string
}

/**
 * How many readings a segment gets, and how many must agree.
 *
 * Three and two, against two-and-unanimous for a whole page. A segment is a
 * short text, and a reviewer given less to go on has more room to find
 * something to say; the third reading buys back the precision that unanimity
 * gives when there is a whole document to be sure about.
 */
const DEFAULT_SEGMENT_DRAWS = 3
const DEFAULT_SEGMENT_VOTES = 2

/**
 * The translation rules.
 *
 * Overridable per repository through `translate.systemPrompt`, which is why
 * the placeholder discipline is *not* here: it is part of the harness's own
 * prompt in `translate-call.ts`, where a repository cannot drop it by
 * replacing this text.
 */
const DEFAULT_SYSTEM_PROMPT = `
You are a professional technical documentation engineer, skilled in writing high-quality technical documentation in <%= targetLang %>. Please accurately translate from <%= sourceLang %> to <%= targetLang %>, maintaining the style consistent with technical documentation in <%= sourceLang %>.

## Baseline Requirements
- Sentences should be fluent and conform to the expression habits of the <%= targetLang %> language.
- Input format is MDX; output format must also retain the original MDX format. Do not translate the names of jsx components such as <Overview />, and do not wrap output in unnecessary code blocks.
- Do not translate professional technical terms and proper nouns, including but not limited to: Kubernetes, Docker, CLI, API, REST, GraphQL, JSON, YAML, Git, GitHub, GitLab, AWS, Azure, GCP, Linux, Windows, macOS, Node.js, React, Vue, Angular, TypeScript, JavaScript, Python, Java, Go, Rust, etc. Keep these terms in their original form.
- The title field and description field in frontmatter should be translated, other frontmatter fields should retain and do not translate.
- Content within MDX components needs to be translated, whereas MDX component names and parameter keys do not.
- Keep original escape characters like backslash, angle brackets, etc. unchanged during translation.
- Do not add any escape characters to special characters like [], (), {}, etc. unless they were explicitly present in the source text. For example:
  - If source has "Architecture [Optional]", keep it as "Architecture [Optional]" (not "Architecture \\[Optional]")
  - If source has "Function (param)", keep it as "Function (param)" (not "Function \\(param)")
  - Only add escape characters if they were present in the original text
- Preserve and do not translate the following comments, nor modify their content:
  - {/* release-notes-for-bugs */}
  - <!-- release-notes-for-bugs -->
- Remove and do not retain the following comments:
  - {/* reference-start */}
  - {/* reference-end */}
  - <!-- reference-start -->
  - <!-- reference-end -->
- Ensure the original Markdown format remains intact during translation, such as frontmatter, code blocks, lists, tables, etc.
- Do not translate the content of the code block.
<% if (titleTranslationPrompt) { %>
<%- titleTranslationPrompt %>
<% } %>
<% if (terms) { %>
<%- terms %>
<% } %>
<% if (userPrompt || additionalPrompts) { %>
## Additional Requirements
These are additional requirements for the translation. They should be met along with the baseline requirements, and in case of any conflict, the baseline requirements should take precedence.

"""
<% if (userPrompt) { %>
<%- userPrompt %>
<% } %>

<% if (additionalPrompts) { %>
<%- additionalPrompts %>
<% } %>
"""
<% } %>
`.trim()

function extractFirstLevelHeading(content: string): string | null {
  const lines = content.split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('# ')) {
      return trimmed.substring(2).trim()
    }
  }
  return null
}

function getTitleTranslation(
  title: string,
  sourceLang: Language,
  targetLang: Language,
): string | null {
  for (const translations of TITLE_TRANSLATION_MAP) {
    if (translations[sourceLang] === title && translations[targetLang]) {
      return translations[targetLang]
    }
  }
  return null
}

/** Renders the translation rules for one document. */
const renderTranslationRules = async ({
  source,
  target,
  sourceContent,
  options,
  additionalPrompts,
}: {
  source: Language
  target: Language
  sourceContent: string
  options: TranslateOptions
  additionalPrompts?: string
}) => {
  const sourceLang = Language[source]
  const targetLang = Language[target]

  const terms = await resolveTerms(source, target, sourceContent)

  const firstLevelHeading = extractFirstLevelHeading(sourceContent)
  let titleTranslationPrompt = ''
  if (firstLevelHeading) {
    const titleTranslation = getTitleTranslation(
      firstLevelHeading,
      source,
      target,
    )
    if (titleTranslation) {
      titleTranslationPrompt = `- The heading "${firstLevelHeading}" should be translated as "${titleTranslation}".`
    }
  }

  const rules = await ejs.render(
    options.systemPrompt?.trim() || DEFAULT_SYSTEM_PROMPT,
    {
      sourceLang,
      targetLang,
      userPrompt: options.userPrompt ?? '',
      additionalPrompts: additionalPrompts ?? '',
      terms: terms.text,
      titleTranslationPrompt,
    },
    { async: true },
  )

  return { rules, terms: terms.pairs }
}

/** One segment, named the way a person reading a build log needs it named. */
const segmentName = (outcome: SegmentOutcome) =>
  `segment ${outcome.index + 1}` +
  (outcome.label.line || outcome.label.heading
    ? ` (${[
        outcome.label.line ? `line ${outcome.label.line}` : undefined,
        outcome.label.heading ? `‹${outcome.label.heading}›` : undefined,
      ]
        .filter(Boolean)
        .join(' ')})`
    : '')

/**
 * Why a document failed, in one line.
 *
 * Three ways to fail, and they are told apart on purpose: a segment nothing
 * could translate, a whole-document check that kept failing after the segments
 * it named were redone, and a whole-document check nobody could attribute to a
 * segment. They call for different things from whoever reads the log, and the
 * design this replaced reported all of them as the same wall of problems.
 */
const describeFailure = (result: TranslateDocumentResult) => {
  const { failure } = result
  switch (failure?.kind) {
    case 'unsplittable-block': {
      return 'A single block is too large to translate and cannot be divided.'
    }
    case 'segment': {
      return `${failure.segments.length} segment(s) never passed: ${failure.segments
        .map((index) => segmentName(result.outcomes[index]))
        .join(', ')}.`
    }
    case 'assembly': {
      return `The assembled document still failed its checks after ${result.assemblyRounds} round(s) of sending segments back.`
    }
    case 'unlocatable': {
      return 'The assembled document failed a check of the whole page that could not be attributed to any one segment.'
    }
    case 'error': {
      return `The translation stopped on an error and nothing was written: ${failure.detail}`
    }
    default: {
      return 'The document did not pass its checks.'
    }
  }
}

/** Everything that was wrong with one failed document, grouped by segment. */
const describeFailedDocument = ({
  file,
  result,
  diagnosis,
}: FailedDocument) => {
  const lines = [`\n${cyan(file)} — ${describeFailure(result)}`]

  const failed =
    result.failure?.kind === 'segment'
      ? result.failure.segments.map((index) => result.outcomes[index])
      : []

  for (const outcome of failed) {
    lines.push(
      `  ${segmentName(outcome)}, after ${outcome.attempts} attempt(s):`,
      ...outcome.findings.map(
        (finding) => `    ${red(finding.rule)}  ${finding.reason}`,
      ),
    )
  }

  if (failed.length === 0) {
    lines.push(
      ...result.findings
        .filter((finding) => finding.blocking !== false)
        .map(
          (finding) =>
            `  ${red(finding.rule)}${finding.line ? ` (line ${finding.line})` : ''}  ${finding.reason}`,
        ),
    )
  }

  if (diagnosis) {
    lines.push(
      '',
      `  ${cyan('What this looks like')} (written by a model from the evidence above; advisory, and not part of the verdict):`,
      ...diagnosis.split('\n').map((line) => `    ${line}`),
    )
  }

  return lines.join('\n')
}

export interface TranslateCommandOptions {
  source: Language
  target: Language
  // Not required by commander — see the option definition below.
  glob?: string[]
  copy?: boolean
}

interface FailedDocument {
  file: string
  result: TranslateDocumentResult
  /** The failure analysis, when one could be produced. Advisory. */
  diagnosis?: string
}

const supportedLanguages = SUPPORTED_LANGUAGES.join(', ')

export const translateCommand = new Command('translate')
  .description('Translate the documentation')
  .enablePositionalOptions()
  .argument('[root]', 'Root directory of the documentation')
  .option(
    '-s, --source <language>',
    `Document source language, one of ${supportedLanguages}`,
    'en',
  )
  .option(
    '-t, --target <language>',
    `Document target language, one of ${supportedLanguages}`,
    'zh',
  )
  // Deliberately not `requiredOption`: commander walks up the hierarchy when it
  // checks mandatory options, so a required option here would make every
  // subcommand — `doom translate check` — unusable. Checked in the action.
  .option(
    '-g, --glob <path...>',
    'Glob patterns of source dirs/files to translate',
  )
  .option(
    '-C, --copy [boolean]',
    'Whether to copy relative assets to the target directory instead of following links',
    parseBoolean,
    false,
  )
  .action(async function (root?: string) {
    const {
      source,
      target,
      glob: globs,
      copy,
      force,
      ...globalOptions
    } = this.optsWithGlobals<TranslateCommandOptions & GlobalCliOptions>()

    if (!globs?.length) {
      logger.error(
        `Missing required option \`${cyan('-g, --glob <path...>')}\`: which source files to translate.`,
      )
      process.exitCode = 1
      return
    }

    if (
      !Object.hasOwn(Language, source) ||
      !Object.hasOwn(Language, target) ||
      source === target
    ) {
      logger.error(
        `Translate from language \`${cyan(source)}\` to \`${cyan(target)}\` is not supported.`,
      )
      process.exitCode = 1
      return
    }

    const { config } = await loadConfig(root, globalOptions)

    // The pairwise lint rules find the docs root through this file. Without it
    // they resolve against whatever the last doom command left behind, decide
    // the document is not a translation, and report nothing at all — a check
    // that passes because it never ran.
    await fs.mkdir(STORAGE_DIR, { recursive: true })
    await fs.writeFile(
      OPTIONS_FILE,
      JSON.stringify({ root, globalOptions }, null, 2),
    )

    const docsDir = config.root!

    const sourceDir = path.resolve(docsDir, source)
    const targetDir = path.resolve(docsDir, target)

    if (!(await pathExists(sourceDir, 'directory'))) {
      logger.error(`The directory "${cyan(sourceDir)}" does not exist.`)
      process.exitCode = 1
      return
    }

    const sourceMatched = await glob(globs.map(removeLeadingSlash), {
      absolute: true,
      cwd: sourceDir,
      onlyFiles: false,
    })

    const sourceFilePaths = await getMatchedDocFilePaths(sourceMatched)

    const allSourceFilePaths = new Set(sourceFilePaths.flat())

    const internalFilePaths = await glob(config.internalRoutes || [], {
      absolute: true,
      cwd: docsDir,
    })

    for (const internalFilePath of internalFilePaths) {
      allSourceFilePaths.delete(internalFilePath)
    }

    // Get copy-only files using glob patterns
    const copyOnlyFilePaths = await glob(
      config.translate?.copyOnlyDirectories ?? DEFAULT_COPY_ONLY_DIRECTORIES,
      {
        absolute: true,
        cwd: sourceDir,
      },
    )

    const copyOnlyFilePathsSet = new Set(copyOnlyFilePaths)

    if (allSourceFilePaths.size === 0) {
      logger.error(
        `No files matched by the glob patterns: ${globs.map((g) => `\`${cyan(g)}\``).join(', ')}`,
      )
      process.exitCode = 1
      return
    }

    if (isDeepStrictEqual(globs, ['*'])) {
      logger.warn(
        `You're running in a special mode, all files except \`${cyan('internalRoutes')}\` will be translated, and all ${red('unmatched')} target files will be ${red('removed')}.`,
      )

      const targetMatched = await glob(globs.map(removeLeadingSlash), {
        absolute: true,
        cwd: targetDir,
        onlyFiles: false,
      })

      const targetFilePaths = await getMatchedDocFilePaths(targetMatched)

      const allTargetFilePaths = new Set(targetFilePaths.flat())

      for (const internalFilePath of internalFilePaths) {
        allTargetFilePaths.delete(internalFilePath)
      }

      const toRemoveTargetFilePaths: string[] = []

      for (const targetFilePath of allTargetFilePaths) {
        const targetRelativePath = path.relative(targetDir, targetFilePath)
        const sourceFilePath = path.resolve(sourceDir, targetRelativePath)
        if (!allSourceFilePaths.has(sourceFilePath)) {
          toRemoveTargetFilePaths.push(targetFilePath)
        }
      }

      if (toRemoveTargetFilePaths.length > 0) {
        logger.warn(
          'Found unmatched target files will be removed:\n' +
            toRemoveTargetFilePaths.map((file) => `- ${red(file)}`).join('\n'),
        )

        await Promise.all(toRemoveTargetFilePaths.map((file) => fs.rm(file)))
      }
    }

    const translateOptions = config.translate ?? {}

    // Two options were removed when the whole-document loop was, and both of
    // them named a budget that no longer exists. Ignoring them quietly would
    // leave a repository believing it had configured something — which is the
    // exact failure mode this rewrite exists to remove, in miniature.
    const removed: Record<string, string> = {
      maxRepairRounds:
        '`maxSegmentAttempts` (per segment) and `maxAssemblyRounds` (per document)',
      maxTurns:
        '`repairAgent.maxTurns`, which now bounds only the repair agent',
    }
    const usedRemoved = Object.keys(removed).filter(
      (key) => key in translateOptions,
    )
    if (usedRemoved.length > 0) {
      logger.error(
        `\`translate\` no longer has ${usedRemoved
          .map((key) => `\`${cyan(key)}\``)
          .join(
            ' or ',
          )}: a translation is now produced a segment at a time, so a budget for the whole document has nothing to bound.\n` +
          usedRemoved
            .map((key) => `  ${cyan(key)} → replaced by ${removed[key]}`)
            .join('\n'),
      )
      process.exitCode = 1
      return
    }

    // Built once: the provider wiring, and the processors the rules run in.
    // Missing credentials fail here, by name, rather than once per file as a
    // wall of unrelated stream errors.
    const gateway = await createGateway({
      modelId: translateOptions.model,
      judgeModelId: translateOptions.judge?.model,
      contextWindow: translateOptions.contextWindow,
      maxOutputTokens: translateOptions.maxOutputTokens,
    })
    const checker = createTranslationChecker()
    const scratchDir = path.resolve(STORAGE_DIR, 'translate-scratch')
    await fs.rm(scratchDir, { recursive: true, force: true })

    // Per-site config wins; the environment is how one gateway's budget is set
    // for every repository that talks to it, without editing each of them.
    const concurrency =
      translateOptions.concurrency ??
      positiveIntFromEnv(CONCURRENCY_ENV, DEFAULT_CONCURRENCY)
    const requestsPerMinute =
      translateOptions.requestsPerMinute ??
      positiveIntFromEnv(REQUESTS_PER_MINUTE_ENV, DEFAULT_REQUESTS_PER_MINUTE)
    const { modelCallLimit, documentLimit } = createLimits({
      concurrency,
      requestsPerMinute,
    })

    const reasoningEffort =
      translateOptions.reasoningEffort ?? DEFAULT_REASONING_EFFORT
    const maxSegmentAttempts =
      translateOptions.maxSegmentAttempts ?? DEFAULT_MAX_SEGMENT_ATTEMPTS
    const judgeEnabled = translateOptions.judge?.enabled !== false
    const judgeReasoning =
      translateOptions.judge?.reasoningEffort ?? DEFAULT_JUDGE_REASONING_EFFORT

    // Two reviewers, because they are asked two different questions. The first
    // reads one segment against its source and can stop it being frozen; the
    // second reads the finished page for what no segment can see — a term that
    // drifted between sections, a join that reads badly — and only ever
    // reports.
    const segmentJudge = judgeEnabled
      ? createJudge({
          models: gateway.models,
          model: gateway.judgeModel,
          reasoningEffort: judgeReasoning,
          draws: translateOptions.judge?.segmentDraws ?? DEFAULT_SEGMENT_DRAWS,
          votes: translateOptions.judge?.segmentVotes ?? DEFAULT_SEGMENT_VOTES,
          limit: modelCallLimit,
        })
      : undefined
    const documentJudge =
      judgeEnabled && translateOptions.fullDocJudge !== false
        ? createJudge({
            models: gateway.models,
            model: gateway.judgeModel,
            reasoningEffort: judgeReasoning,
            draws: translateOptions.judge?.draws,
            limit: modelCallLimit,
          })
        : undefined

    // A segment that repeated attempts could not fix goes to an agent that can
    // only edit. It may be a stronger model than the one doing the translating:
    // this path is rare and it is the hard one.
    const repairModelId = translateOptions.repairAgent?.model
    const repairModel =
      repairModelId && repairModelId !== gateway.model.id
        ? gatewayModel({
            id: repairModelId,
            baseUrl: gateway.baseUrl,
            contextWindow: translateOptions.contextWindow,
            maxOutputTokens: translateOptions.maxOutputTokens,
          })
        : gateway.model

    const diagnoser =
      translateOptions.diagnose?.enabled === false
        ? undefined
        : createDiagnoser({
            models: gateway.models,
            model: gateway.model,
            reasoningEffort: translateOptions.diagnose?.reasoningEffort,
            limit: modelCallLimit,
          })

    logger.info(
      `Translating with \`${cyan(gateway.model.id)}\` (reasoning ${cyan(reasoningEffort)}), a segment at a time, up to ${cyan(String(maxSegmentAttempts))} attempt(s) per segment. ` +
        `${cyan(String(concurrency))} document(s) at a time, at most ${cyan(String(requestsPerMinute))} model request(s) a minute. ` +
        (segmentJudge
          ? `Reviewed by \`${cyan(gateway.judgeModel.id)}\`.`
          : `${red('Judge disabled')} — only the deterministic checks are running.`),
    )

    const failures: FailedDocument[] = []

    await Promise.all(
      [...allSourceFilePaths].map(async (sourceFilePath) => {
        const sourceContent = await fs.readFile(sourceFilePath, 'utf-8')

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { sourceSHA: _sourceSHA, ...sourceFrontmatter } = matter(
          sourceContent,
        ).data as I18nFrontmatter

        if (sourceFrontmatter.i18n?.disableAutoTranslation) {
          return
        }

        const sourceSHA = crypto
          .createHash('sha256')
          .update(sourceContent)
          .digest('hex')

        const targetFilePath = sourceFilePath.replace(sourceDir, targetDir)

        /**
         * The translation already on disk, when there is one.
         *
         * Two layers use it. `sourceSHA` skips a document nobody touched at
         * all; below that, the segments whose source did not change are reused
         * rather than retranslated, so a one-line edit costs one segment
         * instead of a whole page. `--force` turns off both, which is what
         * "translate it again" has always meant.
         */
        let previous: { body: string; record?: SegmentCacheRecord } | undefined
        if (await pathExists(targetFilePath, 'file')) {
          const targetContent = await fs.readFile(targetFilePath, 'utf-8')
          const parsedTarget = matter(targetContent)
          const targetFrontmatter = parsedTarget.data as I18nFrontmatter
          if (!force && targetFrontmatter.sourceSHA === sourceSHA) {
            return
          }
          if (!force && translateOptions.segmentCache !== false) {
            previous = {
              body: parsedTarget.content,
              record: targetFrontmatter.i18nSegments,
            }
          }
        }

        const shouldCopyOnly = copyOnlyFilePathsSet.has(sourceFilePath)
        const sourceRelativePath = path.relative(docsDir, sourceFilePath)
        const targetRelativePath = path.relative(docsDir, targetFilePath)
        const targetBase = path.dirname(targetFilePath)

        /** The document exactly as it will be written, given a translated body. */
        const compose = (restored: string, cache?: SegmentCacheRecord) => {
          const newFrontmatter = { ...sourceFrontmatter, sourceSHA }
          delete newFrontmatter.i18n
          delete newFrontmatter.i18nSegments
          if (cache) {
            newFrontmatter.i18nSegments = cache
          }

          const { data, content } = matter(restored)
          const typedData = data as I18nFrontmatter

          if (typedData.title && typeof typedData.title === 'string') {
            newFrontmatter.title = typedData.title
          }
          if (
            typedData.description &&
            typeof typedData.description === 'string'
          ) {
            newFrontmatter.description = typedData.description
          }

          if (sourceFrontmatter.title) {
            const titleTranslation = getTitleTranslation(
              sourceFrontmatter.title,
              source,
              target,
            )
            if (titleTranslation) {
              newFrontmatter.title = titleTranslation
            }
          }

          if (typeof newFrontmatter.title !== 'string') {
            delete newFrontmatter.title
          }

          return stringifyMatter(newFrontmatter, content)
        }

        // One document's error is that document's failure, not the run's.
        //
        // Measured on 2026-09-04: a judge reading refused by the gateway for
        // longer than its retries threw out of here, and the whole process
        // exited — forty minutes of accepted translations of other documents
        // still in flight went with it. The documents already written stay
        // written; this one is reported with the rest at the end.
        await documentLimit(async () => {
          try {
            await translateOne()
          } catch (error) {
            const detail =
              error instanceof Error ? error.message : String(error)
            failures.push({
              file: targetRelativePath,
              result: {
                findings: [{ rule: 'doom-translate:error', reason: detail }],
                failure: { kind: 'error', detail },
                outcomes: [],
                assemblyRounds: 0,
              },
            })
            logger.error(
              `${cyan(sourceRelativePath)}: translation stopped on an error and nothing was written: ${detail}`,
            )
          }
        })

        async function translateOne() {
          if (shouldCopyOnly) {
            logger.info(
              `Copying ${cyan(sourceRelativePath)} to ${cyan(targetRelativePath)}`,
            )
            const { content } = matter(sourceContent)
            await fs.mkdir(targetBase, { recursive: true })
            await fs.writeFile(targetFilePath, compose(content))
            return
          }

          logger.info(
            `Translating ${cyan(sourceRelativePath)} to ${cyan(targetRelativePath)}`,
          )

          const isMdx = sourceFilePath.endsWith('.mdx')
          const processor = isMdx ? mdxProcessor : mdProcessor

          const ast = processor.parse(escapeMarkdownHeadingIds(sourceContent))

          const sourceBase = path.dirname(sourceFilePath)
          const normalizeOptions = { sourceBase, targetBase }
          const normalizeImgSrcOptions: NormalizeImgSrcOptions = {
            ...normalizeOptions,
            localPublicBase: path.resolve(docsDir, 'public'),
            translating: { source, target, copy },
          }

          const normalizedAst = {
            ...ast,
            children: ast.children.map((it) =>
              translateCodeFile(
                normalizeImgSrc(it, normalizeImgSrcOptions),
                normalizeOptions,
              ),
            ),
          }

          // Everything the model must not author — link targets, JSX attribute
          // values, code, anchors — becomes an opaque placeholder here, so the
          // real value is never in the model's context to rewrite.
          const maskEntries = maskAst(normalizedAst)
          const maskedSource = processor.stringify(normalizedAst)

          // Proves the pairwise rules will actually compare this document
          // against its source before anything is spent translating it. Their
          // failure mode is to return quietly, so "no findings" and "not
          // checked" are the same output — and this is the difference.
          await checker.assertCheckable(targetFilePath, compose('# probe\n'))

          const { rules, terms } = await renderTranslationRules({
            source,
            target,
            sourceContent,
            options: translateOptions,
            additionalPrompts: sourceFrontmatter.i18n?.additionalPrompts,
          })

          const repairer =
            translateOptions.repairAgent?.enabled === false
              ? undefined
              : createRepairAgent({
                  models: gateway.models,
                  model: repairModel,
                  reasoningEffort:
                    translateOptions.repairAgent?.reasoningEffort,
                  scratchDir,
                  extension: isMdx ? '.mdx' : '.md',
                  maxTurns: translateOptions.repairAgent?.maxTurns,
                  limit: modelCallLimit,
                  onProgress: (message) => {
                    logger.info(`${cyan(sourceRelativePath)}: ${message}`)
                  },
                })

          const translator = createSegmentTranslator({
            models: gateway.models,
            model: gateway.model,
            reasoningEffort,
            translationRules: rules,
            sourceLanguage: Language[source],
            targetLanguage: Language[target],
            processor,
            limit: modelCallLimit,
          })

          const result = await translateDocument({
            tree: normalizedAst,
            maskedSource,
            maskEntries,
            processor,
            compose,
            targetPath: targetFilePath,
            sourceLabel: sourceRelativePath,
            sourceLanguage: Language[source],
            targetLanguage: Language[target],
            translator,
            checker,
            segmentJudge,
            documentJudge,
            terms,
            segmentCap: translateOptions.segmentCap,
            segmentHardCap: translateOptions.segmentHardCap,
            segmentFloor: translateOptions.segmentFloor,
            maxSegmentAttempts,
            maxAssemblyRounds: translateOptions.maxAssemblyRounds,
            contextTail: translateOptions.contextTail,
            repairer,
            previous,
            onProgress: (message) => {
              logger.info(message)
            },
          })

          if (!result.document) {
            // Explained before it is reported, so the log carries the analysis
            // next to the failure rather than in a separate place nobody
            // correlates. Advisory throughout: it cannot change this outcome.
            const diagnosis = await diagnoser?.diagnose({
              sourceLabel: sourceRelativePath,
              failure: result.failure,
              outcomes: result.outcomes,
              findings: result.findings,
              assemblyRounds: result.assemblyRounds,
            })
            failures.push({ file: targetRelativePath, result, diagnosis })
            logger.error(
              `${cyan(targetRelativePath)} did not pass its checks. ${describeFailure(result)}`,
            )
            return
          }

          await fs.mkdir(targetBase, { recursive: true })
          await fs.writeFile(targetFilePath, result.document)

          const cached = result.outcomes.filter(
            (outcome) => outcome.status === 'cached',
          ).length
          const repaired = result.outcomes.filter(
            (outcome) => outcome.status === 'repaired',
          ).length
          logger.info(
            `${cyan(sourceRelativePath)} translated to ${cyan(targetRelativePath)} ` +
              `(${result.outcomes.length} segment(s)` +
              (cached ? `, ${cached} reused` : '') +
              (repaired ? `, ${repaired} repaired` : '') +
              // Translation calls, named as such. The reviewers, the repair
              // agent and the diagnosis all cost model calls too, and none of
              // them are counted here: their judges are shared by every
              // document being translated at once, so there is no per-document
              // number to print. Calling this "model calls" made it look like
              // there was.
              `, ${translator.calls()} translation call(s)` +
              (result.assemblyRounds
                ? `, ${result.assemblyRounds} assembly round(s)`
                : '') +
              ')',
          )
        }
      }),
    )

    await fs.rm(scratchDir, { recursive: true, force: true })

    // Fail at the end, with the whole list.
    //
    // Not per file, and not by falling back to the previous translation: a
    // failed document that is written out anyway, or quietly left at its old
    // version, is a problem nobody sees. A red pipeline is the one channel in
    // this organisation that has ever actually reached anyone, and the build
    // does not go red for a document that was silently skipped.
    if (failures.length > 0) {
      logger.error(
        `${red(String(failures.length))} document(s) could not be translated to a state that passes their checks. Nothing will be uploaded.\n` +
          failures.map(describeFailedDocument).join('\n'),
      )
      process.exitCode = 1
      return
    }

    logger.success('All translations passed their checks.')
  })

translateCommand
  .command('check')
  .description(
    'Check translations that already exist against their sources — offline, with no translation model involved. Runs the same rules the translator runs in its own loop',
  )
  .argument('[root]', 'Root directory of the documentation')
  .option(
    '-g, --glob <path...>',
    'Glob patterns within each language directory',
    ['**/*.md{,x}'],
  )
  .option(
    '-t, --target <language...>',
    'Languages to check (default: every translated language directory present)',
  )
  .action(async function (root?: string) {
    const globalOptions = this.optsWithGlobals<GlobalCliOptions>()
    const { glob: globs, target } = this.opts<TranslateCheckOptions>()
    await checkTranslations(root, globalOptions, { glob: globs, target })
  })
