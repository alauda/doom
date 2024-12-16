import { PluginShikiOptions } from '@rspress/plugin-shiki'
import { addClass, checkClass, createRangeTransformer } from '../utils.js'
import { IRangeTransformerOptions } from '../types.js'

export interface ITransformerCalloutsOptions extends IRangeTransformerOptions {
  classActivePre?: string
  classActiveLine?: string
}

export const createTransformerCallouts = (
  options: ITransformerCalloutsOptions = {},
): Exclude<PluginShikiOptions['transformers'], undefined>[0] => {
  const { classActiveLine = 'callout', classActivePre = 'has-callouts' } =
    options

  return {
    name: 'shiki-transformer:callouts',
    preTransformer: createRangeTransformer(
      {
        callout: classActiveLine,
      },
      options,
    ),
    postTransformer({ code }) {
      if (!checkClass(code, classActiveLine)) {
        return code
      }
      return addClass(code, classActivePre, 'pre')
    },
  }
}
