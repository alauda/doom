import type { Root } from 'mdast'
import remarkDirective from 'remark-directive'
import remarkFrontmatter from 'remark-frontmatter'
import remarkGfm from 'remark-gfm'
import remarkMdx from 'remark-mdx'
import remarkParse from 'remark-parse'
import type { Plugin, Processor } from 'unified'
import { unified } from 'unified'

/**
 * The syntax extensions a document is parsed with, in one place.
 *
 * This exists because the `translation-parity` rules compare two trees, and for
 * a comparison to mean anything both trees have to have been parsed the same
 * way. They were not: the document being linted came through the lint pipeline
 * (these plugins), while the source it was compared against was parsed with the
 * site's `mdxProcessor`, which has no `remark-directive`. Anything directive
 * syntax touches — a port in `http://host:8080`, a tag in `image:1.25`, a time
 * in `10:30` — then became a `textDirective` on one side and stayed plain text
 * on the other, and the rules reported the difference as damage the translator
 * could not repair, because nothing it could write would make the two sides
 * agree.
 *
 * `remark-directive` is in the list because the site renders with it
 * (`plugins/directives`), so it is what the published page actually is.
 */
export const SYNTAX_PLUGINS = [
  remarkDirective,
  remarkFrontmatter,
  remarkGfm,
] as unknown as Plugin<[], never>[]

/** Parse-only view of the stack — the rules never stringify the source. */
export interface SyntaxProcessor {
  parse: (content: string) => Root
}

const build = (mdx: boolean): SyntaxProcessor => {
  let processor = unified().use(remarkParse) as unknown as Processor
  for (const plugin of SYNTAX_PLUGINS) {
    processor = processor.use(plugin)
  }
  if (mdx) {
    processor = processor.use(remarkMdx)
  }
  return processor.freeze() as unknown as SyntaxProcessor
}

/**
 * Parses a document exactly as the lint pipeline does — the reference side of
 * every `translation-parity` comparison.
 */
export const syntaxProcessor = {
  md: build(false),
  mdx: build(true),
}
