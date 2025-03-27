import fs from 'node:fs/promises'

import { glob } from 'tinyglobby'

import { isDoc } from '../shared/index.js'

export const parseBoolean = (value: string) =>
  !!value && !['0', 'false'].includes(value)

export const getMatchedDocFilePaths = (matched: string[]) =>
  Promise.all(
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
