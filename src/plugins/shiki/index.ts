import type { RspressPlugin } from '@rspress/shared'
import {
  type BuiltinLanguage,
  type BuiltinTheme,
  type ShikiTransformer,
  type SpecialLanguage,
  createCssVariablesTheme,
} from 'shiki'

import { getHighlighter } from './highlighter.js'
import { rehypePluginShiki } from './rehypePlugin.js'
import {
  SHIKI_TRANSFORMER_LINE_NUMBER,
  createTransformerLineNumber,
} from './transformers/line-number.js'

export interface PluginShikiOptions {
  /**
   * Code highlighting theme, @see https://shiki.style/themes
   */
  theme?: BuiltinTheme | 'css-variables'
  /**
   * Code highlighting language, @see https://shiki.style/languages
   */
  langs?: Array<BuiltinLanguage | SpecialLanguage>
  /**
   * Custom shiki transformer, @see https://shiki.style/guide/transformers
   */
  transformers?: ShikiTransformer[]
}

export const SHIKI_DEFAULT_HIGHLIGHT_LANGUAGES: BuiltinLanguage[] = [
  'js',
  'ts',
  'jsx',
  'tsx',
  'json',
  'css',
  'scss',
  'less',
  'xml',
  'diff',
  'yaml',
  'md',
  'mdx',
  'bash',
]

const cssVariablesTheme = createCssVariablesTheme({
  name: 'css-variables',
  variablePrefix: '--shiki-',
  variableDefaults: {},
  fontStyle: true,
})

/**
 * The plugin is used to add the last updated time to the page.
 */
export function shikiPlugin({
  theme = 'css-variables',
  langs = [],
  transformers = [],
}: PluginShikiOptions = {}): RspressPlugin {
  return {
    name: 'doom-shiki',
    async config(config) {
      config.markdown = config.markdown || {}
      // Shiki will be integrated by rehype plugin, so we should use the javascript version markdown compiler.
      config.markdown.mdxRs = false
      config.markdown.codeHighlighter = 'shiki'
      config.markdown.rehypePlugins = config.markdown.rehypePlugins || []
      if (
        config.markdown.showLineNumbers &&
        !transformers.some(
          (transformerItem) =>
            transformerItem.name === SHIKI_TRANSFORMER_LINE_NUMBER,
        )
      ) {
        transformers.push(createTransformerLineNumber())
      }
      const highlighter = await getHighlighter({
        themes: [cssVariablesTheme],
        langs: [...SHIKI_DEFAULT_HIGHLIGHT_LANGUAGES, ...langs],
        transformers,
      })

      config.markdown.rehypePlugins.push([
        rehypePluginShiki,
        { highlighter, theme },
      ])
      return config
    },
  }
}

export * from './transformers/index.js'
