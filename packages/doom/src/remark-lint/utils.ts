import fs from 'node:fs/promises'

import type { UserConfig } from '@rspress/shared'

import { loadConfig } from '../cli/load-config.ts'
import type { GlobalCliOptions } from '../types.ts'
import { OPTIONS_FILE } from '../utils/index.ts'

export const PUNCTUATION_REGEX = /\p{P}/u

let config: UserConfig | undefined
let configFilePath: string | undefined

export async function getConfig() {
  if (!config || !configFilePath) {
    let optionsText: string | undefined

    try {
      optionsText = await fs.readFile(OPTIONS_FILE, 'utf8')
    } catch {
      //
    }

    const { root, globalOptions } = (
      optionsText ? JSON.parse(optionsText) : {}
    ) as {
      root?: string
      globalOptions: GlobalCliOptions
    }

    ;({ config, configFilePath } = await loadConfig(root, globalOptions))
  }

  return { config, configFilePath }
}
