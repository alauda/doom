import fs from 'node:fs/promises'

import { glob } from 'tinyglobby'

import { FALSY_VALUES, isDoc } from '../shared/index.js'

export const parseBoolean = (value: string) =>
  !!value && !FALSY_VALUES.has(value)

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
