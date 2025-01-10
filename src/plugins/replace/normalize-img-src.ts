import fs from 'node:fs'
import path from 'node:path'

import { isExternalUrl, removeLeadingSlash } from '@rspress/core'
import { cloneDeep } from 'es-toolkit'
import type { Content } from 'mdast'
import type { MdxJsxFlowElement, MdxJsxTextElement } from 'mdast-util-mdx-jsx'
import { visit } from 'unist-util-visit'

import type { NormalizedReferenceSource } from './types.js'

const RELATIVE_URL_PATTERN = /^\.\.?\//

export const normalizeImgSrc = (
  content: Content,
  {
    refSource,
    localPublicBase,
    publicBase,
    sourceBase,
    targetBase,
    force,
  }: {
    refSource: NormalizedReferenceSource
    localPublicBase: string
    publicBase: string
    sourceBase: string
    targetBase: string
    force?: boolean
  },
) => {
  content = cloneDeep(content)

  const resolveImgSrc = (src: string, force?: boolean) => {
    if (isExternalUrl(src)) {
      return src
    }

    if (refSource.repo) {
      const targetDir = path.resolve(
        localPublicBase,
        '_remotes',
        refSource.name,
      )
      let sourcePath: string
      let targetPath: string
      let imageSrc: string
      if (RELATIVE_URL_PATTERN.test(src)) {
        sourcePath = path.resolve(sourceBase, src)
        imageSrc = path.relative(sourceBase, sourcePath)
        targetPath = path.resolve(targetDir, imageSrc)
      } else {
        imageSrc = removeLeadingSlash(src)
        sourcePath = path.resolve(publicBase, imageSrc)
        targetPath = path.resolve(targetDir, imageSrc)
      }

      fs.mkdirSync(path.dirname(targetPath), { recursive: true })

      if (force || !fs.existsSync(targetPath)) {
        fs.copyFileSync(sourcePath, targetPath)
      }

      return `/_remotes/${refSource.name}/${imageSrc}`
    } else if (!RELATIVE_URL_PATTERN.test(src)) {
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
