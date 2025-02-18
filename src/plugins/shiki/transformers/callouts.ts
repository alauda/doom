import { transformerNotationMap } from '@shikijs/transformers'
import type { ShikiTransformer } from 'shiki'

export interface ITransformerCalloutsOptions {
  classActivePre?: string
  classActiveLine?: string
}

export const createTransformerCallouts = (
  options: ITransformerCalloutsOptions = {},
): ShikiTransformer => {
  const { classActiveLine = 'callout', classActivePre = 'has-callouts' } =
    options

  return transformerNotationMap(
    {
      classMap: {
        callout: classActiveLine,
      },
      classActivePre,
    },
    'shiki-transformer:callouts',
  )
}
