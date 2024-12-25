import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import * as prompts from '@inquirer/prompts'
import { logger } from '@rsbuild/core'
import { program } from 'commander'
import { render } from 'ejs'
import { simpleGit } from 'simple-git'
import { glob } from 'tinyglobby'
import { cyan, magenta } from 'yoctocolors'

import { resolveStaticConfig } from '../utils/helpers.js'

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

export type ScaffoldingLayoutProcessor = {
  type: 'ejsTemplate'
}

export type ScaffoldingLayoutWriteMode = 'append' | 'write'

export interface ScaffoldingLayoutBase {
  processors?: ScaffoldingLayoutProcessor[]
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

const scaffoldingsFolder = path.resolve(os.homedir(), '.doom/scaffoldings')

const getScaffoldings = async (
  repoFolder: string,
  scaffoldingPath: string,
  branch: string,
) => {
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
        `Failed to parse \`${magenta(scaffoldingPath)}\` on branch \`${magenta(branch)}\`: ${err.message}`,
      )
    }
  }
}

const resolveScaffoldings = async (
  name: string,
  force: boolean,
): Promise<{ base: string; scaffoldings: Scaffolding[] } | undefined> => {
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

  const repoFolder = path.resolve(scaffoldingsFolder, name)

  const {
    repo,
    branches: branches_,
    scaffoldingPath = 'templates/scaffolding.yaml',
  } = scaffoldingTemplates[name]

  let branches = branches_

  let created = false

  try {
    const stat = await fs.stat(path.resolve(repoFolder, '.git'))
    if (stat.isDirectory()) {
      created = true
    }
  } catch {
    // ignore
  }

  if (!created) {
    await fs.mkdir(repoFolder, { recursive: true })
  }

  const git = simpleGit(repoFolder)

  if (!created) {
    await git.clone(
      /^((\w+):)?\/\//.test(repo)
        ? repo
        : `https://gitlab-ce.alauda.cn/${repo}`,
      repoFolder,
      ['--depth', '1'],
    )
  }

  let currentBranch = (await git.raw(['branch', '--show-current'])).trim()

  let scaffoldings: Scaffolding[] | undefined

  const base = path.resolve(repoFolder, scaffoldingPath, '..')

  if (
    !force &&
    (scaffoldings = await getScaffoldings(
      repoFolder,
      scaffoldingPath,
      currentBranch,
    ))
  ) {
    return { base, scaffoldings }
  }

  if (!branches?.length) {
    const defaultBranch = (
      await git.raw(['rev-parse', '--abbrev-ref', 'origin/HEAD'])
    )
      .trim()
      .replace('origin/', '')
    branches = [defaultBranch]
  }

  const options = ['--depth', '1', '--force']

  for (const branch of branches) {
    if (branch === currentBranch) {
      await git.pull([...options, '--no-rebase'])
    } else {
      await git.fetch('origin', `${branch}:${branch}`, options)
      await git.checkout((currentBranch = branch))
    }

    const scaffoldings = await getScaffoldings(
      repoFolder,
      scaffoldingPath,
      branch,
    )

    if (scaffoldings) {
      return { base, scaffoldings }
    }
  }
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
  parameters: Record<string, unknown>
  processors?: ScaffoldingLayoutProcessor[]
  writeMode?: ScaffoldingLayoutWriteMode
}) => {
  let content = await fs.readFile(source, 'utf-8')

  for (const processor of processors || []) {
    switch (processor.type) {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      case 'ejsTemplate': {
        content = render(content, { parameters })
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

program
  .argument('[template]', 'Scaffolding template name, format: `[name][:type]`')
  .option(
    '-f, --force [boolean]',
    'Force to fetch latest scaffolding template, otherwise use local cache',
    (value) => !!value && value !== 'false',
    false,
  )
  .action(async (template: string = '', { force }: { force: boolean }) => {
    let [name, type] = template.split(':')

    if (!name) {
      name = 'product-doc'
    }

    const { base, scaffoldings } =
      (await resolveScaffoldings(name, force)) || {}

    if (!scaffoldings) {
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
      parameters[param.name] = await prompts[param.type](param.options)
    }

    for (const layout of scaffolding.layout || []) {
      const source = path.resolve(base!, render(layout.source, { parameters }))
      const target = path.resolve(render(layout.target, { parameters }))
      const when = layout.when && render(layout.when, { parameters })

      if (['', 'null', 'undefined', 'false'].includes(when!)) {
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
          for (const matcher of layout.matchers || []) {
            const matched = await glob(
              matcher.match.map((m) => render(m, { parameters })),
              { cwd: source },
            )

            for (const file of matched) {
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
          break
        }
      }
    }
  })
  .parseAsync(process.argv)
  .catch((err: unknown) => {
    if (err instanceof Error && err.name === 'ExitPromptError') {
      return
    }
    logger.error(err)
  })
