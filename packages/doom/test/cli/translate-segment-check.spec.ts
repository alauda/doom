import { describe, expect, test } from '@rstest/core'

import { escapeMarkdownHeadingIds } from '#cli/helpers.ts'
import { maskAst } from '#cli/translate-mask.ts'
import { checkSegment } from '#cli/translate-segment-check.ts'
import { planSegments } from '#cli/translate-segment.ts'
import { mdxProcessor } from '#plugins/index.ts'

/**
 * The comparisons a segment is accepted on, and why they are made here as well
 * as over the whole page.
 *
 * A pairwise rule that fires at assembly time names a defect but not a place:
 * it reports against the document, and the pipeline refuses — correctly — to
 * route a document-wide finding by line number. With no segment to send back,
 * the document simply fails, no repair round, blast radius the whole page.
 *
 * Checked per segment the same defect arrives with the segment attached and is
 * merely retranslated. `translation-url-residue` is the rule that proved this
 * the expensive way: it had no mirror here, fired once on an assembled page,
 * and took `connectors-operator` release-1.14 down for 22 hours.
 */

/** The one segment of a small document, with its content masked as the pipeline masks it. */
const segmentContaining = (source: string, needle: string) => {
  const tree = mdxProcessor.parse(escapeMarkdownHeadingIds(source))
  maskAst(tree)
  const plan = planSegments({ tree, processor: mdxProcessor, floor: 0 })
  const segment = plan.segments.find((candidate) =>
    candidate.text.includes(needle),
  )
  expect(segment).toBeDefined()
  return segment!
}

/** No judge: these are claims about the free layers, not about meaning. */
const check = (source: string, needle: string, translation: string) =>
  checkSegment({
    segment: segmentContaining(source, needle),
    translation,
    processor: mdxProcessor,
    sourceLanguage: 'English',
    targetLanguage: 'Chinese',
  })

const SOURCE = `---
title: Fetching
---

# Fetching

Fetch the archive from ftp://h/x.tar before you start.
`

describe('a URL written in prose, checked where it can be retranslated', () => {
  test('a segment that dropped one is faulted, with the segment attached', async () => {
    const findings = await check(
      SOURCE,
      'x.tar',
      ['# 获取', '', '开始之前先获取归档。'].join('\n'),
    )

    expect(findings.map((finding) => finding.rule)).toEqual([
      'doom-translate:segment-url-residue',
    ])
    expect(findings[0].reason).toContain('ftp://h/x.tar')
  })

  test('a translation that punctuates itself in Chinese is left alone', async () => {
    // The false positive: full-width brackets, no spaces, same URL. Nothing is
    // lost here and nothing should be reported.
    const findings = await check(
      SOURCE,
      'x.tar',
      // The escaped colon is how the segment itself spells it: the stringifier
      // escapes `ftp:` so `remark-directive` cannot read it as a directive, so
      // that is what the model is shown and what it writes back.
      ['# 获取', '', '开始之前，请先从（ftp\\://h/x.tar）获取归档。'].join(
        '\n',
      ),
    )

    expect(findings).toEqual([])
  })
})
