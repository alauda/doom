import fs from 'node:fs'
import path from 'node:path'

import { isExternalUrl, removeLeadingSlash } from '@rspress/core'
import { cloneDeep } from 'es-toolkit'
import type { Content } from 'mdast'
import type { MdxJsxFlowElement, MdxJsxTextElement } from 'mdast-util-mdx-jsx'
import { visit } from 'unist-util-visit'

import type { NormalizedReferenceSource } from './types.js'

const RELATIVE_URL_PATTERN = /^\.\.?\//

export interface NormalizeImgSrcOptions {
  refSource?: NormalizedReferenceSource
  localPublicBase: string
  publicBase?: string
  sourceBase: string
  targetBase: string
  force?: boolean
  translating?: readonly [string, string]
}

export const normalizeImgSrc = (
  content: Content,
  {
    refSource,
    localPublicBase,
    publicBase,
    sourceBase,
    targetBase,
    force,
    translating,
  }: NormalizeImgSrcOptions,
) => {
  content = cloneDeep(content)

  const resolveImgSrc = (src: string, force?: boolean) => {
    if (isExternalUrl(src)) {
      return src
    }

    if (refSource?.repo) {
      const targetDir = path.resolve(
        localPublicBase,
        '_remotes',
        refSource.name,
      )
      let sourcePath: string
      let imageSrc: string
      if (RELATIVE_URL_PATTERN.test(src)) {
        sourcePath = path.resolve(sourceBase, src)
        imageSrc = path.relative(sourceBase, sourcePath)
      } else {
        imageSrc = removeLeadingSlash(src)
        sourcePath = path.resolve(publicBase!, imageSrc)
      }

      const targetPath = path.resolve(targetDir, imageSrc)

      fs.mkdirSync(path.dirname(targetPath), { recursive: true })

      if (force || !fs.existsSync(targetPath)) {
        fs.copyFileSync(sourcePath, targetPath)
      }

      return `/_remotes/${refSource.name}/${imageSrc}`
    } else if (!RELATIVE_URL_PATTERN.test(src)) {
      if (translating) {
        const [source, target] = translating
        const sourcePrefix = `/${source}/`
        if (
          src.startsWith(sourcePrefix) &&
          fs.existsSync(
            path.resolve(
              localPublicBase,
              target,
              src.replace(sourcePrefix, ''),
            ),
          )
        ) {
          return src.replace(sourcePrefix, `/${target}/`)
        }
      }
      return src
    }

    if (translating && fs.existsSync(path.resolve(targetBase, src))) {
      return src
    }

    const targetSrc = path.relative(targetBase, path.resolve(sourceBase, src))
    return RELATIVE_URL_PATTERN.test(targetSrc) ? targetSrc : `./${targetSrc}`
  }

  visit(content, 'image', (node) => {
    node.url = resolveImgSrc(node.url, force)
  })

  visit(content, ['mdxJsxFlowElement', 'mdxJsxTextElement'], (node_) => {
    const node = node_ as MdxJsxFlowElement | MdxJsxTextElement

    if (node.name !== 'img') {
      return
    }

    const srcNode = node.attributes.find(
      (attr) => 'name' in attr && attr.name === 'src',
    )

    if (srcNode?.type !== 'mdxJsxAttribute') {
      return
    }

    const src = srcNode.value

    if (typeof src !== 'string') {
      return
    }

    srcNode.value = resolveImgSrc(src, force)
  })

  return content
}
