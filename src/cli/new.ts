import fs from 'node:fs/promises'
import path from 'node:path'

import * as prompts from '@inquirer/prompts'
import { logger } from '@rsbuild/core'
import { Command } from 'commander'
import { render } from 'ejs'
import { glob } from 'tinyglobby'
import { cyan, magenta } from 'yoctocolors'

import { JS_STR_FALSY_VALUES } from '../shared/index.js'
import type { ContentProcessor } from '../types.js'
import { resolveRepo, resolveStaticConfig } from '../utils/index.js'

export const DEFAULT_PATH = 'templates/scaffolding.yaml'

export interface ScaffoldingTemplate {
  repo: string
  branches?: string[]
  scaffoldingPath?: string
}

const scaffoldingTemplates: Record<string, ScaffoldingTemplate> = {
  'product-doc': {
    repo: 'alauda-public/product-doc-guide',
  },
}

type Prompts = Omit<typeof prompts, 'Separator'>

type PromptOptions<T extends keyof Prompts> = Prompts[T] extends (
  config: infer R,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => any
  ? R
  : never

export interface ScaffoldingParameter<T extends keyof Prompts = keyof Prompts> {
  name: string
  type: T
  options: PromptOptions<T>
}

export type ScaffoldingLayoutWriteMode = 'append' | 'write'

export interface ScaffoldingLayoutBase {
  processors?: ContentProcessor[]
  writeMode?: ScaffoldingLayoutWriteMode
}

export interface ScaffoldingLayoutMatcher extends ScaffoldingLayoutBase {
  match: string[]
}

export interface ScaffoldingLayoutFolder extends ScaffoldingLayoutBase {
  type: 'folder'
  matchers?: ScaffoldingLayoutMatcher[]
}

export interface ScaffoldingLayoutFile extends ScaffoldingLayoutBase {
  type: 'file'
}

export type ScaffoldingLayout = {
  source: string
  target: string
  when?: string
} & (ScaffoldingLayoutFile | ScaffoldingLayoutFolder)

export interface Scaffolding {
  name: string
  description?: string
  parameters?: ScaffoldingParameter[]
  layout?: ScaffoldingLayout[]
}

const getScaffoldings = async (repoFolder: string, scaffoldingPath: string) => {
  const scaffoldingFile = path.resolve(repoFolder, scaffoldingPath)
  try {
    const stat = await fs.stat(scaffoldingFile)
    if (stat.isFile()) {
      const { scaffolding } = await resolveStaticConfig<{
        scaffolding: Scaffolding[]
      }>(scaffoldingFile)
      return scaffolding
    }
  } catch (err_) {
    const err = err_ as Error
    if (err.name === 'YAMLParseError') {
      logger.error(
        `Failed to parse \`${magenta(scaffoldingPath)}\`: ${err.message}`,
      )
    }
  }
}

const resolveScaffoldings = async (
  name: string,
  force: boolean,
): Promise<
  { base: string; repoFolder: string; scaffoldings?: Scaffolding[] } | undefined
> => {
  if (!Object.hasOwn(scaffoldingTemplates, name)) {
    logger.error(
      `Template \`${magenta(name)}\` not found, current available templates are: ${Object.keys(
        scaffoldingTemplates,
      )
        .map((t) => cyan(`\`${t}\``))
        .join(', ')}`,
    )
    return
  }

  const { repo, scaffoldingPath = 'templates/scaffolding.yaml' } =
    scaffoldingTemplates[name]

  const repoFolder = await resolveRepo(repo, force)

  if (!repoFolder) {
    return
  }

  const base = path.resolve(repoFolder, scaffoldingPath, '..')

  const scaffoldings = await getScaffoldings(repoFolder, scaffoldingPath)

  return { base, scaffoldings, repoFolder }
}

const handleTemplateFile = async ({
  source,
  target,
  processors,
  parameters,
  writeMode = 'write',
}: {
  source: string
  target: string
  parameters?: Record<string, unknown>
  processors?: ContentProcessor[]
  writeMode?: ScaffoldingLayoutWriteMode
}) => {
  let content = await fs.readFile(source, 'utf-8')

  for (const processor of processors || []) {
    switch (processor.type) {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      case 'ejsTemplate': {
        content = render(content, { data: processor.data, parameters })
        break
      }
      default: {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        throw new Error(`Unknown processor type: \`${processor.type}\``)
      }
    }
  }

  await fs.mkdir(path.dirname(target), { recursive: true })

  await fs[`${writeMode}File`](target, content)
}

export const newCommand = new Command('new')
  .description('Generate scaffolding from templates')
  .argument('[template]', 'Scaffolding template name, format: `[name][:type]`')
  .action(async function (this: Command, template: string = '') {
    let [name, type] = template.split(':')

    if (!name) {
      name = 'product-doc'
    }

    const { force } = this.optsWithGlobals<{ force: boolean }>()

    const { base, repoFolder, scaffoldings } =
      (await resolveScaffoldings(name, force)) || {}

    if (!scaffoldings) {
      if (repoFolder) {
        logger.error(
          `Unable to resolve any scaffoldings, if you are sure the template \`${magenta(name)}\` exists, try to use the \`--force\` option, or event remove the local cache at ${magenta(repoFolder)} and try again`,
        )
      }
      return
    }

    if (!type) {
      type = await prompts.select({
        message: '请选择脚手架类型',
        choices: scaffoldings.map((s) => ({
          value: s.name,
          description: s.description,
        })),
      })
    }

    const scaffolding = scaffoldings.find((s) => s.name === type)

    if (!scaffolding) {
      logger.error(
        `Scaffolding \`${magenta(type)}\` not found, current available scaffoldings are: ${scaffoldings
          .map((s) => cyan(`\`${s.name}\``))
          .join(', ')}`,
      )
      return
    }

    const parameters: Record<string, unknown> = {}

    for (const param of scaffolding.parameters || []) {
      parameters[param.name] =
        await // @ts-expect-error -- no idea how to fix this
        prompts[param.type](param.options)
    }

    logger.start('Generating scaffolding...')

    for (const layout of scaffolding.layout || []) {
      const source = path.resolve(base!, render(layout.source, { parameters }))
      const target = path.resolve(render(layout.target, { parameters }))
      const when = layout.when && render(layout.when, { parameters })

      if (JS_STR_FALSY_VALUES.has(when!)) {
        continue
      }

      switch (layout.type) {
        case 'file': {
          await handleTemplateFile({
            source,
            target,
            parameters,
            processors: layout.processors,
            writeMode: layout.writeMode,
          })
          break
        }
        case 'folder': {
          const dirents = await fs.readdir(source, {
            recursive: true,
            withFileTypes: true,
          })
          const files = new Set(
            dirents
              .filter((d) => d.isFile())
              .map((d) =>
                path.relative(
                  source,
                  path.resolve(
                    d.parentPath ||
                      // eslint-disable-next-line @typescript-eslint/no-deprecated
                      d.path,
                    d.name,
                  ),
                ),
              ),
          )
          for (const matcher of layout.matchers || []) {
            const matched = await glob(
              matcher.match.map((m) => render(m, { parameters })),
              { cwd: source },
            )

            for (const file of matched) {
              files.delete(file)
              await handleTemplateFile({
                source: path.resolve(source, file),
                target: path.resolve(
                  target,
                  file.endsWith('.ejs') ? file.slice(0, -4) : file,
                ),
                parameters,
                processors: matcher.processors,
                writeMode: matcher.writeMode,
              })
            }
          }

          for (const file of files) {
            await handleTemplateFile({
              source: path.resolve(source, file),
              target: path.resolve(target, file),
            })
          }
          break
        }
      }
    }

    logger.success('Scaffolding generated successfully!')
  })
