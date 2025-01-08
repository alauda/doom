import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { logger } from '@rspress/shared/logger'
import { render } from 'ejs'
import type { Content, List, ListItem, PhrasingContent, Root } from 'mdast'
import remarkFrontmatter from 'remark-frontmatter'
import remarkStringify from 'remark-stringify'
import { simpleGit } from 'simple-git'
import { type Plugin } from 'unified'
import { parse, stringify } from 'yaml'
import { cyan, red } from 'yoctocolors'

import { parseToc } from './remark-toc.js'
import type {
  JiraIssue,
  NormalizedReferenceSource,
  ReleaseNotesOptions,
} from './types.js'
import {
  getFrontmatterNode,
  mdProcessor,
  mdxProcessor,
  stringifySettings,
} from './utils.js'

const remotesFolder = path.resolve(os.homedir(), '.doom/remotes')

export const refCache = new Map<string, Promise<Content[] | undefined>>()

const resolveReference_ = async (
  localBasePath: string,
  items: Record<string, NormalizedReferenceSource>,
  refName: string,
  force?: boolean,
) => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!items[refName]) {
    logger.error(`Reference \`${red(refName)}\` not found`)
    return
  }

  const source = items[refName]

  let sourcePath = source.path
  if (source.repo) {
    const repoFolder = path.resolve(remotesFolder, source.slug!)

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
      logger.info(`Cloning remote \`${cyan(source.slug!)}\` repository...`)
      await git.clone(source.repo, repoFolder, ['--depth', '1'])
    }

    if (force) {
      logger.info(`Pulling latest changes for \`${cyan(source.slug!)}\`...`)
      await git.pull(['--depth', '1', '--force', '--rebase'])
    }

    sourcePath = path.resolve(repoFolder, sourcePath)
  } else {
    sourcePath = path.resolve(localBasePath, sourcePath)
  }

  let found = false

  try {
    const stat = await fs.stat(sourcePath)
    found = stat.isFile()
  } catch {
    //
  }

  if (!found) {
    logger.error(
      `Reference path \`${red(source.path)}\` for \`${red(source.name)}\` not found`,
    )
    return
  }

  let content = await fs.readFile(sourcePath, 'utf8')

  for (const processor of source.processors ?? []) {
    switch (processor.type) {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      case 'ejsTemplate': {
        content = await render(
          content,
          { data: processor.data },
          { async: true },
        )
        break
      }
    }
  }

  const processor = (sourcePath.endsWith('.ejs')
    ? sourcePath.slice(0, -4)
    : sourcePath
  ).endsWith('.mdx')
    ? mdxProcessor
    : mdProcessor

  const root = processor.parse(content)

  if (!source.anchor) {
    return root.children
  }

  const frontmatterNode = getFrontmatterNode(root)

  const { toc } = parseToc(root, true)

  const active = toc.find((it) => it.id === source.anchor)

  if (!active) {
    logger.error(
      `Anchor \`${red(source.anchor)}\` not found in \`${red(source.name)}\``,
    )
    return
  }

  const nodes: Content[] = frontmatterNode ? [frontmatterNode] : []

  for (let i = active.index, n = root.children.length; i < n; i++) {
    if (i === active.index && (source.ignoreHeading ?? active.depth === 1)) {
      continue
    }
    const node = root.children[i]
    if (
      node.type === 'heading' &&
      node.depth <= active.depth &&
      i > active.index
    ) {
      break
    }
    nodes.push(node)
  }

  return nodes
}

const resolveReference = async (
  localBasePath: string,
  items: Record<string, NormalizedReferenceSource>,
  refName: string,
  force?: boolean,
) => {
  if (refCache.has(refName)) {
    return refCache.get(refName)
  }

  const resolving = resolveReference_(localBasePath, items, refName, force)
  refCache.set(refName, resolving)
  return resolving
}

export const releaseCache = new Map<
  string,
  Promise<Record<string, Content | Content[]> | undefined>
>()

const FIELD_MAPPER: Record<string, string> = {
  zh: 'customfield_13800',
  en: 'customfield_13801',
}

const { JIRA_TOKEN, JIRA_USERNAME, JIRA_PASSWORD } = process.env

const issuesToMdast = (issues: JiraIssue[], lang: string) => {
  return issues
    .map((issue): ListItem | undefined => {
      const description = (
        (lang !== 'en' && issue.fields[FIELD_MAPPER[lang]]) ||
        issue.fields[FIELD_MAPPER.en]
      )?.trim()
      if (!description) {
        return
      }
      return {
        type: 'listItem',
        children: [
          {
            type: 'paragraph',
            children: description
              .split('\n')
              .map<PhrasingContent>((line) => {
                return {
                  type: 'text',
                  value: line,
                }
              })
              .reduce<PhrasingContent[]>((acc, curr, index) => {
                if (index === 0) {
                  return [curr]
                }
                return acc.concat({ type: 'html', value: '<br>' }, curr)
              }, []),
          },
        ],
      }
    })
    .filter((_) => !!_)
}

const resolveRelease_ = async (
  releaseTemplates: Record<string, string>,
  releaseQuery: string,
): Promise<Record<string, List> | undefined> => {
  const query = new URLSearchParams(releaseQuery)
  const templateName = query.get('template')
  if (!templateName) {
    logger.error(
      `Release notes template not found for query \`${red(releaseQuery)}\``,
    )
    return
  }

  const template = releaseTemplates[templateName]
  if (!template) {
    logger.error(`Release notes template \`${red(templateName)}\` not found`)
    return
  }

  let Authorization: string

  if (JIRA_TOKEN) {
    Authorization = `Bearer ${JIRA_TOKEN}`
  } else if (JIRA_USERNAME && JIRA_PASSWORD) {
    Authorization = `Basic ${Buffer.from(
      `${JIRA_USERNAME}:${JIRA_PASSWORD}`,
    ).toString('base64')}`
  } else {
    throw new Error(
      '`JIRA_TOKEN` or `JIRA_USERNAME` and `JIRA_PASSWORD` environments must be set for fetching Jira issues',
    )
  }

  const data: Record<string, string> = {}

  for (const [key, value] of query.entries()) {
    if (key === 'template') {
      continue
    }
    data[key] = value
  }

  const jql = await render(template, data, { async: true })

  logger.info(`Fetching release notes for query \`${cyan(releaseQuery)}\``)

  const res = await fetch(
    `https://jira.alauda.cn/rest/api/2/search?${new URLSearchParams({ jql })}`,
    { headers: { Authorization } },
  )

  if (!res.ok) {
    logger.error(
      `Failed to fetch release notes for query \`${red(releaseQuery)}\` with status \`${res.status}\``,
    )
    return
  }

  const { issues } = (await res.json()) as { issues: JiraIssue[] }

  return ['en', 'zh'].reduce(
    (acc, curr) =>
      Object.assign(acc, {
        [curr]: { type: 'list', children: issuesToMdast(issues, curr) },
      }),
    {},
  )
}

const resolveRelease = async (
  releaseTemplates: Record<string, string>,
  releaseQuery: string,
  lang: string,
) => {
  if (releaseCache.has(releaseQuery)) {
    const cached = await releaseCache.get(releaseQuery)
    return cached?.[lang] ?? cached?.en
  }

  const resolving = resolveRelease_(releaseTemplates, releaseQuery)
  releaseCache.set(releaseQuery, resolving)
  const resolved = await resolving
  return resolved?.[lang] ?? resolved?.en
}

const MD_REF_START_COMMENT_PATTERN = /<!-{2,} *reference-start#(.+) *-{2,}>/
const MDX_REF_START_COMMENT_PATTERN = /{\/\*+ *reference-start#(.+) *\*+\/}/
const MDX_REF_START_PATTERN = /\/\*+ *reference-start#(.+) *\*+\//

const MD_REF_END_COMMENT_PATTERN = /<!-{2,} *reference-end *-{2,}>/
const MDX_REF_END_PATTERN = /\/\*+ *reference-end *\*+\//

export const MD_RELEASE_COMMENT_PATTERN =
  /<!-{2,} *release-notes-for-bugs\?(.+) *-{2,}>/
export const MDX_RELEASE_COMMENT_PATTERN =
  /{\/\*+ *release-notes-for-bugs\?(.+) *\*+\/}/
const MDX_RELEASE_PATTERN = /\/\*+ *release-notes-for-bugs\?(.+) *\*+\//

export const maybeHaveRef = (filepath: string, content: string) => {
  if (!/\.mdx?$/.test(filepath)) {
    return
  }
  return (
    filepath.endsWith('.mdx')
      ? [MDX_REF_START_COMMENT_PATTERN, MDX_RELEASE_COMMENT_PATTERN]
      : [MD_REF_START_COMMENT_PATTERN, MD_RELEASE_COMMENT_PATTERN]
  ).some((p) => p.test(content))
}
export const remarkReplace: Plugin<
  [
    {
      lang: string | null
      localBasePath: string
      root: string
      items: Record<string, NormalizedReferenceSource>
      force?: boolean
      releaseNotes?: ReleaseNotesOptions
    },
  ],
  Root
> = function ({ lang, localBasePath, root, items, force, releaseNotes }) {
  return async (ast, vfile) => {
    const filepath = vfile.path
    let content = vfile.toString()

    if (!maybeHaveRef(filepath, content)) {
      return
    }

    const processor = this()
      .use(remarkFrontmatter)
      .use(remarkStringify, stringifySettings)

    const originalAst = vfile.data.original
      ? ast
      : processor.parse((content = await fs.readFile(filepath, 'utf8')))

    const frontmatterNode = getFrontmatterNode(originalAst)

    let frontmatter =
      frontmatterNode &&
      (parse(frontmatterNode.value) as Record<string, unknown> | null)

    const isMdx = filepath.endsWith('.mdx')

    const relativePath = path.relative(root, filepath)

    const currLang = lang === null ? 'zh' : relativePath.split('/')[0]

    const references: Array<number | [number, number]> = []

    const newAstChildren: Array<Content | Content[]> = []
    const newContentChildren: Array<Content | Content[]> = []

    let index = 0
    let start: number | null = null
    let refName = ''
    let matched: RegExpMatchArray | null

    for (const node of ast.children) {
      index++

      if (node.type !== (isMdx ? 'mdxFlowExpression' : 'html')) {
        if (node.type === 'yaml') {
          continue
        }

        newAstChildren.push(node)
        if (start == null) {
          newContentChildren.push(node)
        }
        continue
      }

      if (
        (matched = node.value.match(
          isMdx ? MDX_REF_START_PATTERN : MD_REF_START_COMMENT_PATTERN,
        ))
      ) {
        if (start != null) {
          logger.warn(
            `Invalid reference start block ${node.value}, nested reference blocks are not allowed`,
          )
        } else {
          start = index
          refName = matched[1].trim()
        }

        newAstChildren.push(node)
        newContentChildren.push(node)

        continue
      }

      if (
        (isMdx ? MDX_REF_END_PATTERN : MD_REF_END_COMMENT_PATTERN).test(
          node.value,
        )
      ) {
        if (start == null) {
          logger.warn(
            `Invalid reference end block ${node.value}, no matching start block found`,
          )
        } else {
          references.push([start, index])
          start = null
        }

        const resolved = await resolveReference(
          localBasePath,
          items,
          refName,
          force,
        )

        if (resolved) {
          const { frontmatterMode } = items[refName]
          for (const nodeItem of resolved) {
            if (nodeItem.type !== 'yaml') {
              newContentChildren.push(nodeItem)
              continue
            }

            if (!frontmatterMode || frontmatterMode === 'ignore') {
              continue
            }

            if (frontmatterMode === 'remove') {
              frontmatter = null
              continue
            }

            const data = parse(nodeItem.value) as Record<string, unknown> | null

            if (frontmatterMode === 'merge') {
              if (data) {
                frontmatter = {
                  ...frontmatter,
                  ...data,
                }
              }
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            } else if (frontmatterMode === 'replace') {
              frontmatter = data
            }
          }
        }

        newAstChildren.push(node)
        newContentChildren.push(node)

        continue
      }

      if (
        (matched = node.value.match(
          isMdx ? MDX_RELEASE_PATTERN : MD_RELEASE_COMMENT_PATTERN,
        ))
      ) {
        const releaseContent = await resolveRelease(
          releaseNotes?.queryTemplates ?? {},
          matched[1].trim(),
          currLang,
        )
        newAstChildren.push(releaseContent ?? node)
        newContentChildren.push(node)
      }
    }

    if (start != null) {
      logger.warn(
        `Invalid reference start block ${start}, no matching end block found, adding for you`,
      )
      newContentChildren.push({
        type: isMdx ? 'mdxFlowExpression' : 'html',
        value: isMdx ? '/* reference-end */' : '<!-- reference-end -->',
      })
    }

    if (frontmatter) {
      newContentChildren.unshift({
        type: 'yaml',
        value: stringify(frontmatter).trim(),
      })
    }

    const newContent = processor.stringify({
      ...ast,
      children: newContentChildren.flat().filter((n) => n.type !== 'mdxjsEsm'),
    })

    if (content !== newContent) {
      await fs.writeFile(filepath, newContent)
      return
    }

    ast.children = newAstChildren.flat()
  }
}
