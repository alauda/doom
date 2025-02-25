import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'

import { logger } from '@rspress/shared/logger'
import { Command } from 'commander'
import matter from 'gray-matter'
import { AzureOpenAI } from 'openai'
import { pRateLimit } from 'p-ratelimit'
import { cyan } from 'yoctocolors'

import { pathExists, type GlobalCliOptions } from '../utils/index.js'
import { loadConfig } from './load-config.js'
import { mdProcessor, mdxProcessor } from '../plugins/replace/utils.js'
import { normalizeImgSrc } from '../plugins/replace/normalize-img-src.js'

export interface I18nFrontmatter {
  i18n?: {
    title?: {
      en?: string
    }
    additionalPrompts?: string
    disableAutoTranslation?: boolean
  }
  sourceSHA?: string
  title?: string
}

let openai: AzureOpenAI | undefined

export const translate = async (
  zhContent: string,
  enContent = '',
  additionalPrompts = '',
) => {
  if (!openai) {
    openai = new AzureOpenAI({
      endpoint:
        process.env.AZURE_OPENAI_ENDPOINT ||
        'https://apt-docs-openai.openai.azure.com',
      apiKey: process.env.AZURE_OPENAI_API_KEY || 'doom',
      apiVersion: process.env.OPENAI_API_VERSION || '2025-01-01-preview',
    })
  }

  const { choices } = await openai.beta.chat.completions.parse({
    messages: [
      {
        role: 'system',
        content: `
## 角色
你是一位专业的技术文档工程师，擅长写作高质量的英文技术分档。请你帮我准确地将以下中文翻译成英文，风格与英文技术文档保持一致。

## 规则
- 第一条消息为需要翻译的最新中文内容，第二条消息为之前翻译过的但内容可能过期的英文内容，如果没有翻译过则为空
- 输入格式为 MDX 格式，输出格式也必须保留原始 MDX 格式，且不要额外包装在不必要的代码块中
- 文档中的资源链接不要翻译和替换
- MDX 组件中包含的内容需要翻译，MDX 组件参数的值不需要翻译，但以下这些特殊的 MDX 组件参数值需要翻译
  * 组件示例： <Tab label="参数值">组件包含的内容</Tab>，label 是 key 不用翻译，"参数值" 需要翻译
- 以下是常见的相关术语词汇对应表（中文 -> English）
  * ACP -> ACP
  * 灵雀云 -> Alauda
- 移除 {/* reference-start */}, {/* reference-end */}, <!-- reference-start --> 和 <!-- reference-end --> 相关的注释
- 翻译过程中务必保留原文中的 \\< 转义字符不要做任何转义变更

## 策略
分四步进行翻译工作，并打印每步的结果：
1. 根据中文内容直译成英文，保持原有格式，不要遗漏任何信息
2. 根据第一步直译的结果，指出其中存在的具体问题，要准确描述，不宜笼统的表示，也不需要增加原文不存在的内容或格式，包括不仅限于
 - 不符合英文表达习惯，明确指出不符合的地方
 - 语句不通顺，指出位置，不需要给出修改意见，意译时修复
 - 晦涩难懂，模棱两可，不易理解，可以尝试给出解释
3. 根据第一步直译的结果和第二步指出的问题，重新进行意译，保证内容的原意的基础上，使其更易于理解，更符合英文技术文档的表达习惯，同时保持原有的格式不变
4. 当存在之前翻译的英文内容时，将第三步的结果按句子与之前的英文内容细致地比较，如果翻译结果意思相近，仅仅表达方式不同的，只需要保留之前的英文内容即可，不需要重复翻译

最终只需要输出最后一步的结果，不需要输出之前步骤的结果。

${additionalPrompts}
`.trim(),
      },
      {
        role: 'user',
        content: zhContent,
      },
      {
        role: 'user',
        content: enContent,
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

export const translateCommand = new Command('translate')
  .description('Translate the documentation')
  .argument('[root]', 'Root directory of the documentation')
  .action(async function (root?: string) {
    const { config } = await loadConfig(
      root,
      this.optsWithGlobals<GlobalCliOptions>(),
    )

    const docsDir = config.root!

    const zhDir = path.resolve(docsDir, 'zh')
    const enDir = path.resolve(docsDir, 'en')

    if (!(await pathExists(zhDir, 'directory'))) {
      console.error(`The directory "${cyan(zhDir)}" does not exist.`)
      process.exitCode = 1
      return
    }

    const dirents = await fs.readdir(zhDir, {
      recursive: true,
      withFileTypes: true,
    })

    await Promise.all(
      dirents.map(async (d) => {
        if (!d.isFile() || !/\.mdx?$/.test(d.name)) {
          return
        }

        const zhFilePath = path.resolve(
          d.parentPath ||
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            d.path,
          d.name,
        )

        const zhContent = await fs.readFile(zhFilePath, 'utf-8')

        const zhFrontmatter = matter(zhContent).data as I18nFrontmatter

        if (zhFrontmatter.i18n?.disableAutoTranslation) {
          return
        }

        const sourceSHA = crypto
          .createHash('sha256')
          .update(zhContent)
          .digest('hex')

        const enFilePath = zhFilePath.replace(zhDir, enDir)

        let enContent: string | undefined

        let enFrontmatter: I18nFrontmatter | undefined

        if (await pathExists(enFilePath, 'file')) {
          enContent = await fs.readFile(enFilePath, 'utf-8')

          enFrontmatter = matter(enContent).data

          if (
            enFrontmatter.i18n?.disableAutoTranslation ||
            enFrontmatter.sourceSHA === sourceSHA
          ) {
            return
          }
        }

        await limit(async () => {
          const relativePath = path.relative(docsDir, zhFilePath)

          logger.info(`Translating ${cyan(relativePath)}`)

          const isMdx = zhFilePath.endsWith('.mdx')

          const processor = isMdx ? mdxProcessor : mdProcessor

          const ast = processor.parse(zhContent)

          const normalizeImgSrcOptions = {
            localPublicBase: path.resolve(docsDir, 'public'),
            sourceBase: path.dirname(zhFilePath),
            targetBase: path.dirname(enFilePath),
            translating: 'en',
          }

          enContent = await translate(
            processor.stringify({
              ...ast,
              children: ast.children.map((it) =>
                normalizeImgSrc(it, normalizeImgSrcOptions),
              ),
            }),
            enContent,
            enFrontmatter?.i18n?.additionalPrompts ??
              zhFrontmatter.i18n?.additionalPrompts,
          )

          const { data, content } = matter(enContent)

          const newFrontmatter = { ...enFrontmatter, ...data }

          newFrontmatter.sourceSHA = sourceSHA

          if (zhFrontmatter.i18n?.title?.en) {
            newFrontmatter.title = zhFrontmatter.i18n.title.en
          }

          enContent = matter.stringify(
            content.startsWith('\n') ? content : '\n' + content,
            newFrontmatter,
          )

          await fs.mkdir(path.dirname(enFilePath), { recursive: true })

          await fs.writeFile(enFilePath, enContent)

          logger.info(`${cyan(relativePath)} translated`)
        })
      }),
    )
  })
