import path from 'node:path'

import type { Root } from 'mdast'
import type { MdxJsxAttribute } from 'mdast-util-mdx-jsx'
import { lintRule } from 'unified-lint-rule'
import { visitParents } from 'unist-util-visit-parents'

import { SITES_FILE } from '../cli/constants.ts'
import type { DoomSite } from '../shared/types.ts'
import { pathExists } from '../utils/fs.ts'
import { resolveStaticConfig } from '../utils/helpers.ts'

const SITE_ELEMENTS = new Set([
  'ExternalApisOverview',
  'ExternalSite',
  'ExternalSiteLink',
])

const sitesConfigFilePath = path.resolve(SITES_FILE)

let sites: DoomSite[] | undefined

export const site = lintRule<Root>('doom:lint-site', async (root, vfile) => {
  if (!sites) {
    if (await pathExists(sitesConfigFilePath, 'file')) {
      sites = await resolveStaticConfig<DoomSite[]>(sitesConfigFilePath)
    } else {
      sites = []
    }
  }

  visitParents(
    root,
    ['mdxJsxFlowElement', 'mdxJsxTextElement'] as const,
    (element, parents) => {
      if (!sites?.length || !element.name || !SITE_ELEMENTS.has(element.name)) {
        return
      }

      const nameAttr = element.attributes.find(
        (attr): attr is MdxJsxAttribute =>
          attr.type === 'mdxJsxAttribute' && attr.name === 'name',
      )

      const nameVal = nameAttr?.value

      if (
        typeof nameVal === 'string' &&
        sites.some((site) => site.name === nameVal)
      ) {
        return
      }

      vfile.message(
        `Invalid site \`name\` property value \`${typeof nameVal === 'string' ? nameVal : nameVal?.value}\` which should be static string matching a site name from \`${SITES_FILE}\` config.`,
        {
          ancestors: [...parents, element],
          place: (nameAttr ?? element).position,
        },
      )
    },
  )
})
