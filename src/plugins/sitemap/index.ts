// based on https://github.com/jl917/rspress-plugin-sitemap/blob/master/src/index.ts

import fs from 'node:fs'
import { dirname } from 'node:path'

import type { RspressPlugin } from '@rspress/shared'
import { logger } from '@rspress/shared/logger'

export type ChangeFreq =
  | 'always'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'never'

export type Priority =
  | '0.0'
  | '0.1'
  | '0.2'
  | '0.3'
  | '0.4'
  | '0.5'
  | '0.6'
  | '0.7'
  | '0.8'
  | '0.9'
  | '1.0'

export interface Sitemap {
  loc: string
  lastmod?: string
  changefreq?: ChangeFreq
  priority?: Priority
}

export interface Options {
  domain?: string
  customMaps?: Record<string, Sitemap>
  defaultPriority?: Priority
  defaultChangeFreq?: ChangeFreq
}

const generateNode = (sitemap: Sitemap): string => {
  let result = '<url>'
  for (const [tag, value] of Object.entries(sitemap) as Array<
    [keyof Sitemap, Sitemap[keyof Sitemap]]
  >) {
    result += `<${tag}>${value}</${tag}>`
  }
  result += '</url>'
  return result
}

const generateXml = (sitemaps: Sitemap[]) => {
  logger.log(`Generate sitemap.xml for ${sitemaps.length} pages.`)
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemaps.reduce(
    (node, sitemap) => node + generateNode(sitemap),
    '',
  )}</urlset>`
}

export function sitemapPlugin(options?: Options): RspressPlugin {
  options = {
    domain: 'https://rspress.dev',
    customMaps: {},
    defaultChangeFreq: 'monthly',
    defaultPriority: '0.5',
    ...options,
  }
  const sitemaps: Sitemap[] = []
  const set = new Set()
  return {
    name: 'rspress-plugin-sitemap',
    extendPageData(pageData, isProd) {
      if (!isProd || set.has(pageData.id)) {
        return
      }
      set.add(pageData.id)
      sitemaps.push({
        loc: `${options.domain}${pageData.routePath}`,
        lastmod: fs.statSync(pageData._filepath).mtime.toISOString(),
        priority: pageData.routePath === '/' ? '1.0' : options.defaultPriority,
        changefreq: options.defaultChangeFreq,
        ...options.customMaps?.[pageData.routePath],
      })
    },
    afterBuild(config, isProd) {
      if (!isProd) {
        return
      }
      const outputPath = `${config.outDir || 'doc_build'}/sitemap.xml`
      fs.mkdirSync(dirname(outputPath), { recursive: true })
      fs.writeFileSync(outputPath, generateXml(sitemaps))
    },
  }
}
