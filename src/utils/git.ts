import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { logger } from '@rspress/shared/logger'
import { simpleGit } from 'simple-git'
import { cyan, red } from 'yoctocolors'

const remotesFolder = path.resolve(os.homedir(), '.doom/remotes')

const DEFAULT_USERNAME = 'oauth2'

const {
  GITHUB_USERNAME = DEFAULT_USERNAME,
  GITHUB_TOKEN,
  GITLAB_USERNAME = DEFAULT_USERNAME,
  GITLAB_TOKEN,
} = process.env

export const resolveRepo = async (
  repo: string,
  force?: boolean,
  branch?: string,
) => {
  const url = new URL(repo, 'https://gitlab-ce.alauda.cn')

  const slug = url.pathname.slice(1)

  if (!slug) {
    logger.error(`Invalid repository URL: ${red(repo)}`)
    return
  }

  const repoFolder = path.resolve(remotesFolder, slug)

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
    logger.info(`Cloning remote \`${cyan(slug)}\` repository...`)
    switch (url.hostname) {
      case 'github.com': {
        if (GITHUB_TOKEN) {
          url.username = GITHUB_USERNAME
          url.password = GITHUB_TOKEN
        }

        break
      }
      case 'gitlab-ce.alauda.cn': {
        if (GITLAB_TOKEN) {
          url.username = GITLAB_USERNAME
          url.password = GITLAB_TOKEN
        }

        break
      }
      default: {
        logger.warn(
          `Unsupported remote host: ${red(url.hostname)}, use on your own risk`,
        )
      }
    }

    await git.clone(url.toString(), repoFolder, ['--depth', '1'])
  }

  const currentBranch = (await git.raw(['branch', '--show-current'])).trim()

  const options = ['--depth', '1', '--force']

  if (branch && branch !== currentBranch) {
    logger.info(`Switching to branch \`${cyan(branch)}\`...`)
    await git.fetch('origin', `${branch}:${branch}`, options)
    await git.checkout(branch)
  } else if (force) {
    logger.info(`Pulling latest changes for \`${cyan(slug)}\`...`)

    const pull = () =>
      git.pull([...options, '--rebase', '--allow-unrelated-histories'])

    try {
      await pull()
    } catch {
      await pull()
    }
  }

  return repoFolder
}
