import type { Root } from 'mdast'
import type { Extension as FromMarkdownExtension } from 'mdast-util-from-markdown'
import type { Plugin } from 'unified'

import { attributesTransformer } from './attributes-transformer.js'
import { mdastAttributes } from './mdast-attributes.js'
import { micromarkAttributes } from './micromark-attributes.js'
import type { AttributesExtension } from './types.js'

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
