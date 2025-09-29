import type { Root } from 'mdast'
import type { Extension as FromMarkdownExtension } from 'mdast-util-from-markdown'
import type { Plugin } from 'unified'

import { attributesTransformer } from './attributes-transformer.ts'
import { mdastAttributes } from './mdast-attributes.ts'
import { micromarkAttributes } from './micromark-attributes.ts'
import type { AttributesExtension } from './types.ts'

export interface AttributesData {
  micromarkExtensions?: AttributesExtension[]
  fromMarkdownExtensions?: FromMarkdownExtension[]
}

export const remarkAttributes: Plugin<[], Root> = function () {
  const data = this.data() as AttributesData

  function add<K extends keyof AttributesData>(
    key: K,
    value: NonNullable<AttributesData[K]>[number],
  ) {
    data[key] ||= []
    data[key].unshift(value)
  }

  add('micromarkExtensions', micromarkAttributes())
  add('fromMarkdownExtensions', mdastAttributes())

  return attributesTransformer
}
