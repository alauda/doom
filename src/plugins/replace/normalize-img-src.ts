import fs from 'node:fs'
import path from 'node:path'

import { isExternalUrl, removeLeadingSlash } from '@rspress/core'
import { cloneDeep } from 'es-toolkit'
import type { RootContent } from 'mdast'
import type { MdxJsxFlowElement, MdxJsxTextElement } from 'mdast-util-mdx-jsx'
import { visit } from 'unist-util-visit'

import type { NormalizedReferenceSource } from './types.js'
import { RELATIVE_URL_PATTERN } from './utils.js'

export interface NormalizeImgSrcOptions {
  refSource?: NormalizedReferenceSource
  localPublicBase: string
  publicBase?: string
  sourceBase: string
  targetBase: string
  force?: boolean
  translating?: {
    source: string
    target: string
    copy?: boolean
  }
}

export const normalizeImgSrc = (
  content: RootContent,
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

      if (force || !fs.existsSync(targetPath)) {
        fs.mkdirSync(path.dirname(targetPath), { recursive: true })
        fs.copyFileSync(sourcePath, targetPath)
      }

      return `/_remotes/${refSource.name}/${imageSrc}`
    } else if (!RELATIVE_URL_PATTERN.test(src)) {
      if (translating) {
        const { source, target, copy } = translating
        const sourcePrefix = `/${source}/`
        if (src.startsWith(sourcePrefix)) {
          const filename = src.slice(sourcePrefix.length)
          const targetPath = path.resolve(localPublicBase, target, filename)
          let targetExisted = fs.existsSync(targetPath)
          if (!targetExisted && copy) {
            fs.mkdirSync(path.dirname(targetPath), { recursive: true })
            fs.copyFileSync(
              path.resolve(localPublicBase, source, filename),
              targetPath,
            )
            targetExisted = true
          }
          if (targetExisted) {
            return `/${target}/${filename}`
          }
        }
      }
      return src
    }

    let sourcePath = path.resolve(sourceBase, src)
    let targetPath = path.resolve(targetBase, src)

    if (translating) {
      const { source, target, copy } = translating

      const assetsSourcePrefix = `./assets/${source}/`
      if (src.startsWith(assetsSourcePrefix)) {
        const filename = src.slice(assetsSourcePrefix.length)
        const targetSrc = `./assets/${target}/${filename}`
        const sourceTargetPath = path.resolve(sourceBase, targetSrc)
        if (fs.existsSync(sourceTargetPath)) {
          src = targetSrc
          sourcePath = sourceTargetPath
          targetPath = path.resolve(targetBase, src)
        }
      }

      let targetExisted = fs.existsSync(targetPath)
      if (!targetExisted && copy) {
        fs.mkdirSync(path.dirname(targetPath), { recursive: true })
        fs.copyFileSync(sourcePath, targetPath)
        targetExisted = true
      }
      if (targetExisted) {
        return src
      }
    }

    const targetSrc = path.relative(targetBase, sourcePath)
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
