import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import { setTimeout } from 'node:timers/promises'

import { removeLeadingSlash } from '@rspress/shared'
import { logger } from '@rspress/shared/logger'
import { Command } from 'commander'
import { render } from 'ejs'
import { merge } from 'es-toolkit/compat'
import matter from 'gray-matter'
import { AzureOpenAI, RateLimitError } from 'openai'
import { pRateLimit } from 'p-ratelimit'
import { glob } from 'tinyglobby'
import { cyan } from 'yoctocolors'

import {
  mdProcessor,
  mdxProcessor,
  normalizeImgSrc,
  type NormalizeImgSrcOptions,
} from '../plugins/index.js'
import { isDoc } from '../shared/index.js'
import type { GlobalCliOptions, TranslateOptions } from '../types.js'
import { pathExists } from '../utils/index.js'

import { parseBoolean } from './helpers.js'
import { loadConfig } from './load-config.js'

export interface I18nFrontmatter {
  i18n?: {
    title?: Record<string, string>
    additionalPrompts?: string
    disableAutoTranslation?: boolean
  }
  sourceSHA?: string
  title?: string
}

const LANGUAGE_CODES: Record<string, string> = {
  zh: '中文',
  en: '英文',
}

const DEFAULT_SYSTEM_PROMPT = `
## 角色
你是一位专业的技术文档工程师，擅长写作高质量的<%= targetLang %>技术分档。请你帮我准确地将以下<%= sourceLang %>翻译成<%= targetLang %>，风格与<%= targetLang %>技术文档保持一致。

## 规则
- 第一条消息为需要翻译的最新<%= sourceLang %>文档，第二条消息为之前翻译过的但内容可能过期的<%= targetLang %>文档，如果没有翻译过则为空
- 输入格式为 MDX 格式，输出格式也必须保留原始 MDX 格式，不要翻译其中的 jsx 组件名称，如 <Overview />，且不要额外包装在不必要的代码块中
- 文档中的资源链接不要翻译和替换
- MDX 组件中包含的内容需要翻译，MDX 组件参数的值不需要翻译，但以下这些特殊的 MDX 组件参数值需要翻译
  * 组件示例： <Tab label="参数值">组件包含的内容</Tab>，label 是 key 不用翻译，"参数值" 需要翻译
- 以下是常见的相关术语词汇对应表（中文 -> English）
  * ACP -> ACP
  * 灵雀云 -> Alauda
  * 容器组 -> Pods
  * global 集群 -> global cluster
- 移除 {/* reference-start */}, {/* reference-end */}, <!-- reference-start --> 和 <!-- reference-end --> 相关的注释
- 翻译过程中务必保留原文中的 \\< 和 \\{ 转义字符不要做任何转义变更
- 翻译过程中不要破坏原有的 Markdown 格式，如 frontmatter, 代码块、列表、表格等，其中 frontmatter 的内容不用做任何翻译，只需要原样返回即可

## 策略
分四步进行翻译工作：
1. 根据<%= sourceLang %>文档直译成<%= targetLang %>，保持原有格式，不要遗漏任何信息
2. 根据第一步直译的结果，指出其中存在的具体问题，要准确描述，不宜笼统的表示，也不要增加原文不存在的内容或格式，包括不仅限于
 - 不符合<%= targetLang %>表达习惯，明确指出不符合的地方
 - 语句不通顺，指出位置，不需要给出修改意见，意译时修复
 - 晦涩难懂，模棱两可，不易理解，可以尝试给出解释
3. 根据第一步直译的结果和第二步指出的问题，重新进行意译，保证内容的原意的基础上，使其更易于理解，更符合<%= targetLang %>技术文档的表达习惯，同时保持原有的格式不变
4. 当存在之前翻译过的<%= targetLang %>文档时，将第三步的结果分段与之前的<%= targetLang %>文档细致地比较，不要遗漏任何新的分段（包括文本、资源链接等），如果分段内翻译结果意思相近，仅仅表达方式不同的，且没有新增任何内容时，则该分段只需要保持之前翻译过的内容即可，不需要重复翻译

最终只需要输出最后一步的结果，不需要输出之前步骤的结果。

<%= additionalPrompts %>
`.trim()

let openai: AzureOpenAI | undefined

export interface InternalTranslateOptions extends TranslateOptions {
  source: string
  sourceContent: string
  target: string
  targetContent?: string
  additionalPrompts?: string
}

export const translate = async ({
  source,
  sourceContent,
  target,
  targetContent = '',
  systemPrompt,
  additionalPrompts = '',
}: InternalTranslateOptions) => {
  if (!openai) {
    openai = new AzureOpenAI({
      endpoint:
        process.env.AZURE_OPENAI_ENDPOINT ||
        'https://apt-docs-openai.openai.azure.com',
      apiKey: process.env.AZURE_OPENAI_API_KEY || 'doom',
      apiVersion: process.env.OPENAI_API_VERSION || '2025-01-01-preview',
    })
  }

  const sourceLang = LANGUAGE_CODES[source]
  const targetLang = LANGUAGE_CODES[target]

  const { choices } = await openai.beta.chat.completions.parse({
    messages: [
      {
        role: 'system',
        content: await render(
          systemPrompt?.trim() || DEFAULT_SYSTEM_PROMPT,
          { sourceLang, targetLang, additionalPrompts },
          { async: true },
        ),
      },
      {
        role: 'user',
        content: sourceContent,
      },
      {
        role: 'user',
        content: targetContent,
      },
    ],
    model: 'gpt-4o-mini',
  })

  const { content, refusal } = choices[0].message

  if (refusal) {
    throw new Error(refusal)
  }

  return content!
}

const limit = pRateLimit({
  interval: 60_000, // 1min
  rate: 50,
  concurrency: 10,
})

export interface TranslateCommandOptions {
  source: string
  target: string
  glob: string[]
  copy?: boolean
}

export const translateCommand = new Command('translate')
  .description('Translate the documentation')
  .argument('[root]', 'Root directory of the documentation')
  .option('-s, --source <language>', 'Document source language', 'zh')
  .option('-t, --target <language>', 'Document target language', 'en')
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
      !Object.hasOwn(LANGUAGE_CODES, source) ||
      !Object.hasOwn(LANGUAGE_CODES, target) ||
      source === target
    ) {
      console.error(
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
      console.error(`The directory "${cyan(sourceDir)}" does not exist.`)
      process.exitCode = 1
      return
    }

    const matched = await glob(globs.map(removeLeadingSlash), {
      absolute: true,
      cwd: sourceDir,
      onlyFiles: false,
    })

    const sourceFilePaths = await Promise.all(
      matched.map(async (it) => {
        const stat = await fs.stat(it)

        if (stat.isDirectory()) {
          return glob('**/*.md{,x}', {
            absolute: true,
            cwd: it,
          })
        }
        if (stat.isFile() && isDoc(it)) {
          return it
        }
        return []
      }),
    )

    const allSourceFilePaths = new Set(sourceFilePaths.flat())

    const executor = async () =>
      await Promise.all(
        [...allSourceFilePaths].map(async (sourceFilePath) => {
          const sourceContent = await fs.readFile(sourceFilePath, 'utf-8')

          const sourceFrontmatter = matter(sourceContent)
            .data as I18nFrontmatter

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

            targetFrontmatter = matter(targetContent).data

            if (
              targetFrontmatter.i18n?.disableAutoTranslation ||
              (!force && targetFrontmatter.sourceSHA === sourceSHA)
            ) {
              allSourceFilePaths.delete(sourceFilePath)
              return
            }
          }

          await limit(async () => {
            const relativePath = path.relative(docsDir, sourceFilePath)

            logger.info(`Translating ${cyan(relativePath)}`)

            const isMdx = sourceFilePath.endsWith('.mdx')

            const processor = isMdx ? mdxProcessor : mdProcessor

            const ast = processor.parse(sourceContent)

            const normalizeImgSrcOptions: NormalizeImgSrcOptions = {
              localPublicBase: path.resolve(docsDir, 'public'),
              sourceBase: path.dirname(sourceFilePath),
              targetBase: path.dirname(targetFilePath),
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
              targetContent: force ? '' : targetContent,
              additionalPrompts:
                targetFrontmatter?.i18n?.additionalPrompts ??
                sourceFrontmatter.i18n?.additionalPrompts,
            })

            const { data, content } = matter(targetContent)

            const newFrontmatter = merge(
              {},
              sourceFrontmatter,
              targetFrontmatter,
              data,
            )

            newFrontmatter.sourceSHA = sourceSHA

            if (sourceFrontmatter.i18n?.title?.[target]) {
              newFrontmatter.title = sourceFrontmatter.i18n.title[target]
            }

            targetContent = matter.stringify(
              content.startsWith('\n') ? content : '\n' + content,
              newFrontmatter,
            )

            await fs.mkdir(path.dirname(targetFilePath), { recursive: true })

            await fs.writeFile(targetFilePath, targetContent)

            logger.info(`${cyan(relativePath)} translated`)

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
