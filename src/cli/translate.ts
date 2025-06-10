import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import { setTimeout } from 'node:timers/promises'
import { isDeepStrictEqual } from 'node:util'

import { removeLeadingSlash } from '@rspress/shared'
import { logger } from '@rspress/shared/logger'
import { Command } from 'commander'
import { render } from 'ejs'
import matter from 'gray-matter'
import { AzureOpenAI, RateLimitError } from 'openai'
import { pRateLimit } from 'p-ratelimit'
import { glob } from 'tinyglobby'
import { cyan, red } from 'yoctocolors'

import {
  mdProcessor,
  mdxProcessor,
  normalizeImgSrc,
  type NormalizeImgSrcOptions,
} from '../plugins/index.js'
import {
  Language,
  SUPPORTED_LANGUAGES,
  TITLE_TRANSLATION_MAP,
} from '../shared/index.js'
import type { GlobalCliOptions, TranslateOptions } from '../types.js'
import { pathExists } from '../utils/index.js'

import {
  escapeMarkdownHeadingIds,
  getMatchedDocFilePaths,
  parseBoolean,
  parseTerms,
} from './helpers.js'
import { loadConfig } from './load-config.js'

export interface I18nFrontmatter {
  i18n?: {
    additionalPrompts?: string
    disableAutoTranslation?: boolean
  }
  sourceSHA?: string
  title?: string
}

export const TERMS_SUPPORTED_LANGUAGES: Language[] = ['en', 'zh', 'ru']

// Directories that should be copied instead of translated
const COPY_ONLY_DIRECTORIES = [
  'apis/advanced_apis/**',
  'apis/kubernetes_apis/**',
]

const DEFAULT_SYSTEM_PROMPT = `
You are a professional technical documentation engineer, skilled in writing high-quality technical documentation in <%= targetLang %>. Please accurately translate the following text from <%= sourceLang %> to <%= targetLang %>, maintaining the style consistent with technical documentation in <%= sourceLang %>.

## Baseline Requirements
- Sentences should be fluent and conform to the expression habits of the <%= targetLang %> language.
- Input format is MDX; output format must also retain the original MDX format. Do not translate the names of jsx components such as <Overview />, and do not wrap output in unnecessary code blocks.
- **CRITICAL**: Do not translate or modify ANY link content in the document. This includes:
  - URLs in markdown links: [text](URL) - keep URL exactly as is
  - Reference-style links: [text][ref] and [ref]: URL - keep both ref and URL unchanged
  - Inline URLs: https://example.com - keep completely unchanged
  - Image links: ![alt](src) - keep src unchanged, but alt text can be translated
  - Anchor links: [text](#anchor) - keep #anchor unchanged
  - Any href attributes in HTML tags - keep unchanged
- Do not translate professional technical terms and proper nouns, including but not limited to: Kubernetes, Docker, CLI, API, REST, GraphQL, JSON, YAML, Git, GitHub, GitLab, AWS, Azure, GCP, Linux, Windows, macOS, Node.js, React, Vue, Angular, TypeScript, JavaScript, Python, Java, Go, Rust, etc. Keep these terms in their original form.
- The title field and description field in frontmatter should be translated, other frontmatter fields should retain and do not translate.
- Content within MDX components needs to be translated, whereas MDX component names and parameter keys do not.
- Do not modify or translate any placeholders in the format of __ANCHOR_N__ (where N is a number). These placeholders must be kept exactly as they appear in the source text.
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

The text for translation is provided below, within triple quotes:
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

let openai: AzureOpenAI | undefined

export interface InternalTranslateOptions extends TranslateOptions {
  source: Language
  sourceContent: string
  target: Language
  additionalPrompts?: string
}

const resolveTerms = async (
  sourceLang: Language,
  targetLang: Language,
  sourceContent: string,
) => {
  const parsedTerms = await parseTerms()

  // Filter terms that exist in source content and have translations for both source and target languages
  const relevantTerms = parsedTerms.filter((term) => {
    // Check if term has both source and target language translations
    const sourceTranslation = term[sourceLang]
    const targetTranslation = term[targetLang]

    if (!sourceTranslation || !targetTranslation) {
      return false
    }

    // Check if the source translation appears in the source content (case-insensitive)
    const sourceTermRegex = new RegExp(
      `\\b${sourceTranslation.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`,
      'i',
    )
    return sourceTermRegex.test(sourceContent)
  })

  if (relevantTerms.length === 0) {
    logger.debug('No relevant terms found for translation')
    return ''
  }

  const sourceLangName = Language[sourceLang]
  const targetLangName = Language[targetLang]

  const terms =
    `- The following is a common related terminology vocabulary table (${sourceLangName} <=> ${targetLangName}), you should use it to translate the matched text.\n` +
    relevantTerms
      .map((term) => `  * ${term[sourceLang]} <=> ${term[targetLang]}`)
      .join('\n')

  logger.debug('Resolved terms:', terms)
  return terms
}

const ANCHOR_REGEX = /(\\\\?)\{#([a-zA-Z0-9_-]+)\}/g

function replaceAnchorsWithPlaceholders(content: string): {
  content: string
  anchors: string[]
} {
  // Handle escaped underscores in anchor IDs (e.g., \{#independent\_doc\_site} -> \{#independent_doc_site})
  // This is necessary because MDX processor automatically escapes underscores in heading IDs
  // to ensure proper Markdown parsing, but we need the original unescaped form for anchor matching
  const unescapedContent = content.replace(/\\_/g, '_')

  const anchors: string[] = []
  const contentWithPlaceholders = unescapedContent.replace(
    ANCHOR_REGEX,
    (match) => {
      anchors.push(match)
      return `__ANCHOR_${anchors.length - 1}__`
    },
  )

  return { content: contentWithPlaceholders, anchors }
}

function restoreAnchors(content: string, anchors: string[]): string {
  return content.replace(/__ANCHOR_(\d+)__/g, (_, index: string) => {
    const numIndex: number = parseInt(index, 10)
    if (isNaN(numIndex) || numIndex < 0 || numIndex >= anchors.length) {
      throw new Error(`Invalid anchor index: ${index}`)
    }
    const anchor: string = anchors[numIndex]
    return anchor
  })
}

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

export const translate = async ({
  source,
  sourceContent,
  target,
  systemPrompt,
  userPrompt = '',
  additionalPrompts = '',
}: InternalTranslateOptions) => {
  if (!openai) {
    openai = new AzureOpenAI({
      endpoint:
        process.env.AZURE_OPENAI_ENDPOINT ||
        'https://azure-ai-api-gateway.alauda.cn',
      apiKey: process.env.AZURE_OPENAI_API_KEY,
      apiVersion: process.env.OPENAI_API_VERSION || '2025-03-01-preview',
    })
  }

  const sourceLang = Language[source]
  const targetLang = Language[target]

  let terms = ''

  if (
    [source, target].every((lang) => TERMS_SUPPORTED_LANGUAGES.includes(lang))
  ) {
    terms = await resolveTerms(source, target, sourceContent)
  }

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

  const { content: contentWithPlaceholders, anchors } =
    replaceAnchorsWithPlaceholders(sourceContent)

  const finalSystemPrompt = await render(
    systemPrompt?.trim() || DEFAULT_SYSTEM_PROMPT,
    {
      sourceLang,
      targetLang,
      userPrompt,
      additionalPrompts: additionalPrompts,
      terms,
      titleTranslationPrompt,
    },
    { async: true },
  )

  logger.debug('Final system prompt:\n', finalSystemPrompt)
  const { choices } = await openai.chat.completions.parse({
    messages: [
      {
        role: 'system',
        content: finalSystemPrompt,
      },
      {
        role: 'user',
        content: contentWithPlaceholders,
      },
    ],
    model: 'gpt-4.1-mini',
    temperature: 0.2,
  })

  const { content, refusal } = choices[0].message

  if (refusal) {
    throw new Error(refusal)
  }

  return restoreAnchors(content!, anchors)
}

const limit = pRateLimit({
  interval: 60_000, // 1min
  rate: 50,
  concurrency: 10,
})

export interface TranslateCommandOptions {
  source: Language
  target: Language
  glob: string[]
  copy?: boolean
}

const supportedLanguages = SUPPORTED_LANGUAGES.join(', ')

export const translateCommand = new Command('translate')
  .description('Translate the documentation')
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
  .requiredOption('-g, --glob <path...>', 'Glob patterns for source dirs/files')
  .option(
    '-C, --copy [boolean]',
    'Wether to copy relative assets to the target directory instead of following links',
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
    const copyOnlyFilePaths = await glob(COPY_ONLY_DIRECTORIES, {
      absolute: true,
      cwd: sourceDir,
    })

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

    const executor = async () =>
      await Promise.all(
        [...allSourceFilePaths].map(async (sourceFilePath) => {
          const sourceContent = await fs.readFile(sourceFilePath, 'utf-8')

          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { sourceSHA: _sourceSHA, ...sourceFrontmatter } = matter(
            sourceContent,
          ).data as I18nFrontmatter

          if (sourceFrontmatter.i18n?.disableAutoTranslation) {
            allSourceFilePaths.delete(sourceFilePath)
            return
          }

          const sourceSHA = crypto
            .createHash('sha256')
            .update(sourceContent)
            .digest('hex')

          const targetFilePath = sourceFilePath.replace(sourceDir, targetDir)

          let targetContent: string | undefined

          let targetFrontmatter: I18nFrontmatter | undefined

          if (await pathExists(targetFilePath, 'file')) {
            targetContent = await fs.readFile(targetFilePath, 'utf-8')

            targetFrontmatter = matter(targetContent).data as I18nFrontmatter

            if (!force && targetFrontmatter.sourceSHA === sourceSHA) {
              allSourceFilePaths.delete(sourceFilePath)
              return
            }
          }

          const shouldCopyOnly = copyOnlyFilePathsSet.has(sourceFilePath)

          await limit(async () => {
            const sourceRelativePath = path.relative(docsDir, sourceFilePath)
            const targetRelativePath = path.relative(docsDir, targetFilePath)

            if (shouldCopyOnly) {
              logger.info(
                `Copying ${cyan(sourceRelativePath)} to ${cyan(targetRelativePath)}`,
              )

              // For copy-only files, we still update the sourceSHA but don't translate
              const newFrontmatter = { ...sourceFrontmatter, sourceSHA }
              delete newFrontmatter.i18n

              const { content } = matter(sourceContent)

              targetContent = matter.stringify(
                content.startsWith('\n') ? content : '\n' + content,
                newFrontmatter,
              )

              const targetBase = path.dirname(targetFilePath)
              await fs.mkdir(targetBase, { recursive: true })
              await fs.writeFile(targetFilePath, targetContent)

              logger.info(
                `${cyan(sourceRelativePath)} copied to ${cyan(targetRelativePath)}`,
              )
            } else {
              logger.info(
                `Translating ${cyan(sourceRelativePath)} to ${cyan(targetRelativePath)}`,
              )

              const isMdx = sourceFilePath.endsWith('.mdx')

              const processor = isMdx ? mdxProcessor : mdProcessor

              const ast = processor.parse(
                escapeMarkdownHeadingIds(sourceContent),
              )

              const targetBase = path.dirname(targetFilePath)

              const normalizeImgSrcOptions: NormalizeImgSrcOptions = {
                localPublicBase: path.resolve(docsDir, 'public'),
                sourceBase: path.dirname(sourceFilePath),
                targetBase,
                translating: { source, target, copy },
              }

              const normalizedSourceContent = processor.stringify({
                ...ast,
                children: ast.children.map((it) =>
                  normalizeImgSrc(it, normalizeImgSrcOptions),
                ),
              })

              targetContent = await translate({
                ...config.translate,
                source,
                sourceContent: normalizedSourceContent,
                target,
                additionalPrompts: sourceFrontmatter.i18n?.additionalPrompts,
              })

              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { i18n: _, ...newFrontmatter } = {
                ...sourceFrontmatter,
                sourceSHA,
              }

              const { data, content } = matter(targetContent)
              const typedData = data as I18nFrontmatter

              if (typedData.title && typeof typedData.title === 'string') {
                newFrontmatter.title = typedData.title
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

              const finalFrontmatter =
                typeof newFrontmatter.title === 'string'
                  ? newFrontmatter
                  : (() => {
                      // eslint-disable-next-line @typescript-eslint/no-unused-vars
                      const { title: _, ...rest } = newFrontmatter
                      return rest
                    })()

              targetContent = matter.stringify(
                content.startsWith('\n') ? content : '\n' + content,
                finalFrontmatter,
              )

              await fs.mkdir(targetBase, { recursive: true })

              await fs.writeFile(targetFilePath, targetContent)

              logger.info(
                `${cyan(sourceRelativePath)} translated to ${cyan(targetRelativePath)}`,
              )
            }

            allSourceFilePaths.delete(sourceFilePath)
          })
        }),
      )

    let retry = 0

    while (retry < 15) {
      try {
        await executor()
        return
      } catch (error) {
        if (error instanceof RateLimitError) {
          const retryAfter =
            Number(error.headers.get('retry-after')) || 60 * ++retry
          logger.warn(`Rate limit exceeded, retrying in ${retryAfter}s...`)
          await setTimeout(retryAfter)
          continue
        }

        throw error
      }
    }

    logger.error(
      `Failed to translate after ${retry} retries, please try again later.`,
    )
    process.exitCode = 1
  })
