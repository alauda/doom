import type { HtmlRendererOptions } from 'shiki'

export type TLineOptions = NonNullable<HtmlRendererOptions['lineOptions']>
export interface ITransformerResult {
  code: string
  lineOptions: TLineOptions
}

export interface ITransformerOptions {
  code: string
  lang: string
}

export type TPreTransformer = (
  options: ITransformerOptions,
) => ITransformerResult

export interface IRangeTransformerOptions {
  tagRegExp?: RegExp
}
