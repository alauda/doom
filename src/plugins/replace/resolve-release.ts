import { logger } from '@rspress/shared/logger'
import { render } from 'ejs'
import type {
  List,
  ListItem,
  Paragraph,
  PhrasingContent,
  RootContent,
} from 'mdast'
import { ResponseError, xfetch } from 'x-fetch'
import { cyan, red } from 'yoctocolors'

import type { JiraIssue, JiraLanguage } from './types.js'
import { isCI } from './utils.js'

const releaseCache = new Map<
  string,
  Promise<Record<string, RootContent | RootContent[]> | undefined>
>()

const FIELD_MAPPER: Record<JiraLanguage, string> = {
  zh: 'customfield_13800',
  en: 'customfield_13801',
}

const issuesToListItems = (
  issues: JiraIssue[],
  lang: JiraLanguage,
  isMdx: boolean,
): ListItem[] =>
  issues
    .map((issue): ListItem | undefined => {
      const description = (
        (FIELD_MAPPER[lang] && issue.fields[FIELD_MAPPER[lang]]) ||
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
              .map<PhrasingContent>((line) => ({ type: 'text', value: line }))
              .reduce<PhrasingContent[]>((acc, curr, index) => {
                if (index === 0) {
                  return [curr]
                }
                // @ts-expect-error -- seems like a typing issue in mdast or TypeScript
                return acc.concat(
                  isMdx
                    ? { type: 'mdxJsxFlowElement', name: 'br' }
                    : { type: 'html', value: '<br>' },
                  curr,
                )
              }, []),
          },
        ],
      }
    })
    .filter(Boolean)

const { JIRA_USERNAME, JIRA_PASSWORD } = process.env

let warned = false

const NO_ISSUE_MAPPER: Record<JiraLanguage, string> = {
  zh: '此次发版无相关问题。',
  en: 'No issues in this release.',
}

const resolveRelease_ = async (
  releaseTemplates: Record<string, string>,
  releaseQuery: string,
  isMdx: boolean,
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

  if (JIRA_USERNAME && JIRA_PASSWORD) {
    Authorization = `Basic ${Buffer.from(
      `${JIRA_USERNAME}:${JIRA_PASSWORD}`,
    ).toString('base64')}`
  } else {
    if (warned) {
      return
    }
    warned = true
    const message = `\`${cyan('JIRA_USERNAME')}\` and \`${cyan('JIRA_PASSWORD')}\` environments must be set for fetching Jira issues`
    if (isCI) {
      throw new Error(message)
    }
    logger.warn(message)
    return
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

  let issues: JiraIssue[]

  try {
    ;({ issues } = await xfetch<{ issues: JiraIssue[] }>(
      `https://jira.alauda.cn/rest/api/2/search?${new URLSearchParams({ jql })}`,
      { headers: { Authorization } },
    ))
  } catch (err) {
    if (err instanceof ResponseError) {
      const error = err as ResponseError<unknown>
      logger.error(
        `Failed to fetch release notes for query \`${red(releaseQuery)}\` with status \`${error.response.status}\` and ${error.data ? `data ${JSON.stringify(error.data, null, 2)}` : `message \`${error.message}\``}`,
      )
    }
    return
  }

  return (['en', 'zh'] as const).reduce(
    (acc, lang) =>
      Object.assign(acc, {
        [lang]: issues.length
          ? ({
              type: 'list',
              children: issuesToListItems(issues, lang, isMdx),
            } satisfies List)
          : ({
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  value: NO_ISSUE_MAPPER[lang] || NO_ISSUE_MAPPER.en,
                },
              ],
            } satisfies Paragraph),
      }),
    {},
  )
}

export const resolveRelease = async (
  releaseTemplates: Record<string, string>,
  releaseQuery: string,
  lang: string,
  isMdx: boolean,
) => {
  if (releaseCache.has(releaseQuery)) {
    const cached = await releaseCache.get(releaseQuery)
    return cached?.[lang] ?? cached?.en
  }

  const resolving = resolveRelease_(releaseTemplates, releaseQuery, isMdx)
  releaseCache.set(releaseQuery, resolving)
  const resolved = await resolving
  return resolved?.[lang] ?? resolved?.en
}
