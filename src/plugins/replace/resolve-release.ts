import { logger } from '@rspress/shared/logger'
import { render } from 'ejs'
import type { Content, List, ListItem, PhrasingContent } from 'mdast'
import { cyan, red } from 'yoctocolors'

import { JiraIssue } from './types.js'

const releaseCache = new Map<
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

export const resolveRelease = async (
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
