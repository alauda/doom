import type { Root } from 'mdast'
import remarkMdx from 'remark-mdx'
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'
import type { Processor } from 'unified'
import { unified } from 'unified'
import { VFile } from 'vfile'

import doomLint from '../remark-lint/index.ts'
import { forgetDocumentAnchors } from '../remark-lint/no-unmatched-anchor.ts'
import {
  SYNTAX_PLUGINS,
  TRANSLATION_CHECK_RULES,
} from '../remark-lint/rule-sets.ts'
import { resolveTranslation } from '../remark-lint/translation-parity/shared.ts'

/**
 * Checking one translated document — the single implementation, used from all
 * three places that need it.
 *
 * 1. `doom translate check`, over translations that are already on disk;
 * 2. the `check` tool the translating agent calls to see its own work;
 * 3. the harness's own verification, which is what lets a translation finish.
 *
 * They share a function rather than a convention. "The agent is checked
 * against the same rules it checks itself with" is then true in the literal
 * sense — there is one rule set because there is one call.
 */

export interface TranslationFinding {
  /** Rule id, e.g. `doom-lint:translation-component-multiset`. */
  rule: string
  reason: string
  line?: number
  column?: number
}

/**
 * Raised when a document cannot be checked at all.
 *
 * This is not a finding: a finding says the translation is wrong, this says
 * nothing was examined. The distinction matters because the failure mode of
 * the pairwise rules is to return quietly — a translation whose path or
 * frontmatter is not what they expect is not a translation as far as they are
 * concerned, and every rule passes. Silence and success look identical, so the
 * caller has to be told which one it got.
 */
export class TranslationNotCheckableError extends Error {
  constructor(
    readonly targetPath: string,
    reason: string,
  ) {
    super(`Cannot check \`${targetPath}\`: ${reason}`)
    this.name = 'TranslationNotCheckableError'
  }
}

const buildProcessor = (mdx: boolean) => {
  let processor = unified()
    .use(remarkParse)
    .use(remarkStringify) as unknown as Processor
  for (const plugin of SYNTAX_PLUGINS) {
    processor = processor.use(plugin)
  }
  if (mdx) {
    processor = processor.use(remarkMdx)
  }
  // Message control is what makes `<!-- lint disable -->` work. Included so a
  // document says the same thing here as it does under `doom lint`.
  processor = processor.use(doomLint) as unknown as Processor
  for (const rule of TRANSLATION_CHECK_RULES) {
    processor = processor.use(rule)
  }
  return processor.freeze()
}

export interface TranslationChecker {
  /** Every problem the rules find in `content`, judged as the document at `targetPath`. */
  check(targetPath: string, content: string): Promise<TranslationFinding[]>
  /**
   * Confirms the pairwise rules will actually compare this document against a
   * source, and throws {@link TranslationNotCheckableError} when they will not.
   */
  assertCheckable(targetPath: string, content: string): Promise<void>
}

export const createTranslationChecker = (): TranslationChecker => {
  const mdxProcessor = buildProcessor(true)
  const mdProcessor = buildProcessor(false)
  const processorFor = (targetPath: string) =>
    targetPath.endsWith('.mdx') ? mdxProcessor : mdProcessor

  const check = async (targetPath: string, content: string) => {
    // A lint run over a directory sees each path once, so rules are free to
    // cache what a path contained. This does not: the same path holds different
    // content on every repair turn, and a rule reading last turn's copy would
    // report a problem the repair already fixed. `no-unmatched-anchor` is the
    // one rule that caches today — it is not in this rule set any more, but the
    // invariant is a property of the checker rather than of that rule.
    forgetDocumentAnchors(targetPath)

    let vfile: VFile
    try {
      vfile = await processorFor(targetPath).process(
        new VFile({ path: targetPath, value: content }),
      )
    } catch (error) {
      return [
        {
          rule: 'doom-lint:unparseable',
          reason: `the document does not parse: ${error instanceof Error ? error.message : String(error)}`,
        },
      ]
    }

    return vfile.messages.map((message) => ({
      rule: message.ruleId ?? 'unknown',
      reason: message.reason,
      line: message.line ?? undefined,
      column: message.column ?? undefined,
    }))
  }

  return {
    check,
    async assertCheckable(targetPath, content) {
      const processor = processorFor(targetPath)
      let tree: Root
      try {
        tree = processor.parse(
          new VFile({ path: targetPath, value: content }),
        ) as Root
      } catch (error) {
        throw new TranslationNotCheckableError(
          targetPath,
          `it does not parse: ${error instanceof Error ? error.message : String(error)}`,
        )
      }
      const status = await resolveTranslation(
        tree,
        new VFile({ path: targetPath, value: content }),
      )
      switch (status.kind) {
        case 'current': {
          return
        }
        case 'not-a-translation': {
          throw new TranslationNotCheckableError(
            targetPath,
            'the pairwise rules do not see it as a translation — the path is not `<docs root>/<language>/…`, or the language is the source language',
          )
        }
        case 'unmanaged': {
          throw new TranslationNotCheckableError(
            targetPath,
            'it carries no `sourceSHA`, so nothing pairs it with a source',
          )
        }
        case 'source-missing': {
          throw new TranslationNotCheckableError(
            targetPath,
            `its source \`${status.sourcePath}\` does not exist`,
          )
        }
        case 'stale': {
          throw new TranslationNotCheckableError(
            targetPath,
            `its \`sourceSHA\` names a different version of \`${status.sourcePath}\` than the one on disk`,
          )
        }
      }
    },
  }
}

/** One finding, rendered for a person reading a build log. */
export const describeFinding = (finding: TranslationFinding) =>
  `${finding.rule}${finding.line ? ` (line ${finding.line})` : ''}: ${finding.reason}`
