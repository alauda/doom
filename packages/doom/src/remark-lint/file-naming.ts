import path from 'node:path'

import type { Root } from 'mdast'
import { lintRule } from 'unified-lint-rule'

import { getConfig } from './utils.ts'

const VALID_NAME_PATTERN = /^_?[a-z0-9]+(?:_[a-z0-9]+)*$/

export const fileNaming = lintRule<Root>(
  'doom-lint:file-naming',
  async (_root, vfile) => {
    if (!vfile.path) {
      return
    }

    const { config } = await getConfig()

    const relativePath = path.relative(config.root!, vfile.path)

    const prefix = config.lang ? config.lang + '/' : ''

    // Ignore files outside the root directory
    if (
      relativePath.startsWith('..') ||
      relativePath === `${prefix}index.md` ||
      relativePath === `${prefix}index.mdx` ||
      relativePath.startsWith(`${prefix}apis/`)
    ) {
      return
    }

    const stem = vfile.stem!
    const isIndex = stem === 'index'
    const basename = isIndex ? path.basename(vfile.dirname!) : stem

    if (!VALID_NAME_PATTERN.test(basename)) {
      vfile.message(
        `${isIndex ? 'Directory name' : 'Filename'} "${basename}" does not match the required pattern: lowercase letters, numbers, and underscores only, must not end with underscore`,
      )
    }
  },
)
