import path from 'node:path'

import matter from '@rspress/shared/gray-matter'
import { describe, expect, test } from '@rstest/core'

import { escapeMarkdownHeadingIds } from '#cli/helpers.ts'
import {
  buildUserPrompt,
  type SegmentTranslationRequest,
} from '#cli/translate-call.ts'
import type {
  TranslationChecker,
  TranslationFinding,
} from '#cli/translate-checker.ts'
import type { Judge } from '#cli/translate-judge.ts'
import { maskAst } from '#cli/translate-mask.ts'
import { translateDocument } from '#cli/translate-pipeline.ts'
import { planSegments } from '#cli/translate-segment.ts'
import { mdxProcessor } from '#plugins/index.ts'

/**
 * What the segment pipeline guarantees, driven by a scripted translator.
 *
 * These are claims about control flow, so the model is a function the test
 * writes: it decides what comes back for each segment, and the assertions are
 * about what the pipeline does in response. Whether the rules are any good is a
 * different question, answered by the rules' own specs and by running over a
 * real corpus.
 *
 * The claim these exist for is the ratchet: **a segment that has passed is
 * never lost**. That is the property the design this replaced did not have, and
 * the one whose absence turned a document that was one problem from finished
 * into 873 problems with no way back.
 */

const SOURCE = `---
title: Installing
weight: 10
---

# Installing

See the [installation guide](../global/install.mdx) and run \`kubectl apply\`.

## Prerequisites

You need a cluster and the \`kubectl\` command, plus the [prerequisites](./prereq.mdx).

## Installing the cluster

Run the installer and wait. Read the [troubleshooting notes](./trouble.mdx) if it stops.
`

/** A paragraph with enough masked content to matter, and enough bulk to split. */
const paragraph = (n: number) =>
  `Paragraph ${n} explains how to run \`kubectl get pods -n ns-${n}\` and then read the [guide](../g-${n}.mdx) before continuing with the next step.`

/**
 * A `<Tabs>` too large for the cap, so the segmenter drills into it.
 *
 * Both `<Tab>`s carry a translatable `label`, which becomes an attributes
 * segment of its own — and that segment's span, taken from the tag's node,
 * covers every line of the tab's children.
 */
const withTabs = () =>
  [
    '---',
    'title: Installing',
    '---',
    '',
    '# Installing',
    '',
    '<Tabs>',
    '',
    ...['Web Console', 'Command Line']
      .map((label, index) => [
        `<Tab label="${label}">`,
        '',
        ...Array.from(
          { length: 4 },
          (_, n) => `${paragraph(index * 10 + n)}\n`,
        ),
        '</Tab>',
        '',
      ])
      .flat(),
    '</Tabs>',
    '',
    '## After installing',
    '',
    paragraph(99),
    '',
  ].join('\n')

const prepare = (source = SOURCE, cap?: number) => {
  const tree = mdxProcessor.parse(escapeMarkdownHeadingIds(source))
  const maskEntries = maskAst(tree)
  const maskedSource = mdxProcessor.stringify(tree)
  // A floor of 0 so the three sections are three segments: the point here is
  // the machinery around segments, and a document small enough to read.
  const plan = planSegments({ tree, processor: mdxProcessor, floor: 0, cap })
  return { tree, maskEntries, maskedSource, plan }
}

/** A translator the test writes the answers for. */
const scripted = (answer: (request: SegmentTranslationRequest) => string) => {
  const seen: SegmentTranslationRequest[] = []
  let calls = 0
  return {
    seen,
    calls: () => calls,
    translate: (request: SegmentTranslationRequest) => {
      calls++
      seen.push(request)
      return Promise.resolve(answer(request))
    },
  }
}

/** A faithful translation of a segment: every placeholder back, prose changed. */
const translated = (text: string) =>
  text
    .replace(/# Installing$/gm, '# 安装')
    .replace(/## Prerequisites/g, '## 前置条件')
    .replace(/## Installing the cluster/g, '## 安装集群')
    .replace(/See the/g, '请参阅')
    .replace(/You need/g, '你需要')
    .replace(/Run the installer and wait\./g, '运行安装程序并等待。')

const checkerReturning = (
  findings: (content: string, call: number) => TranslationFinding[],
): TranslationChecker => {
  let call = 0
  return {
    check: (_targetPath, content) => Promise.resolve(findings(content, call++)),
    assertCheckable: () => Promise.resolve(),
  }
}

const judgeReturning = (findings: TranslationFinding[] = []) => {
  let readings = 0
  const seen: { fragment?: boolean }[] = []
  const judge: Judge & { seen: typeof seen } = {
    seen,
    readings: () => readings,
    review: (request) => {
      readings++
      seen.push(request)
      return Promise.resolve(findings)
    },
  }
  return judge
}

const run = async ({
  answer,
  checker = checkerReturning(() => []),
  segmentJudge,
  documentJudge,
  maxSegmentAttempts,
  maxAssemblyRounds,
  source,
  segmentCap,
  keepFrontmatter = true,
}: {
  answer: (request: SegmentTranslationRequest) => string
  checker?: TranslationChecker
  segmentJudge?: Judge
  documentJudge?: Judge
  maxSegmentAttempts?: number
  maxAssemblyRounds?: number
  source?: string
  /** Small enough to force a container to be drilled into. */
  segmentCap?: number
  /**
   * Whether the composed document carries frontmatter. Production always
   * writes `sourceSHA`, so this is only ever turned off to check that routing
   * does not silently depend on that.
   */
  keepFrontmatter?: boolean
}) => {
  const { tree, maskEntries, maskedSource } = prepare(source, segmentCap)
  const translator = scripted(answer)
  const result = await translateDocument({
    tree,
    maskedSource,
    maskEntries,
    processor: mdxProcessor,
    // The same shape as the real one: the translation's own frontmatter is
    // replaced, not stacked on top of. Appending would give the document two
    // frontmatter blocks, and every block index after it would be off by one —
    // which is exactly what made an earlier version of this harness route a
    // finding to the wrong segment.
    compose: (restored) => {
      const { content } = matter(restored)
      const body = content.replace(/^\n+/u, '')
      return keepFrontmatter ? `---\nsourceSHA: test\n---\n\n${body}` : body
    },
    targetPath: path.join('/docs', 'zh', 'install', 'installing.mdx'),
    sourceLabel: 'en/install/installing.mdx',
    sourceLanguage: 'English',
    targetLanguage: 'Chinese',
    translator,
    checker,
    segmentJudge,
    documentJudge,
    segmentFloor: 0,
    segmentCap,
    maxSegmentAttempts,
    maxAssemblyRounds,
  })
  return { result, translator }
}

describe('the segment pipeline', () => {
  test('a document whose segments all pass is assembled and returned', async () => {
    const { result, translator } = await run({
      answer: (request) => translated(request.segment.text),
    })

    expect(result.findings).toEqual([])
    expect(result.document).toContain('# 安装')
    expect(result.document).toContain('## 前置条件')
    // The masked link came back as the real one.
    expect(result.document).toContain('../global/install.mdx')
    expect(result.document).not.toContain('__DOOM_TR_')
    // One call per segment, and more than one segment.
    expect(result.outcomes.length).toBeGreaterThan(1)
    expect(translator.calls()).toBe(result.outcomes.length)
  })

  test('a segment that drops a placeholder is asked again, and only that segment', async () => {
    let damaged = true
    const { result, translator } = await run({
      answer: (request) => {
        const good = translated(request.segment.text)
        if (request.segment.index === 1 && damaged) {
          damaged = false
          return good.replace(/__DOOM_TR_ICODE_\d+__/, 'kubectl')
        }
        return good
      },
    })

    expect(result.document).toBeDefined()
    expect(result.findings).toEqual([])
    // One extra call, not a whole document redone.
    expect(translator.calls()).toBe(result.outcomes.length + 1)
    expect(result.outcomes[1].attempts).toBe(2)
    expect(result.outcomes[1].history[0][0].rule).toBe(
      'doom-translate:missing-placeholder',
    )
    // Its neighbours were asked once and never revisited.
    expect(result.outcomes[0].attempts).toBe(1)
  })

  test('a segment that never passes fails the document instead of shipping it', async () => {
    const { result } = await run({
      answer: (request) =>
        request.segment.index === 1
          ? translated(request.segment.text).replace(
              /__DOOM_TR_ICODE_\d+__/,
              'kubectl',
            )
          : translated(request.segment.text),
      maxSegmentAttempts: 2,
    })

    expect(result.document).toBeUndefined()
    expect(result.failure).toEqual({ kind: 'segment', segments: [1] })
    expect(result.outcomes[1].attempts).toBe(2)
    expect(result.findings[0].rule).toBe('doom-translate:missing-placeholder')
  })

  test('a segment that changes the heading structure is caught in the segment, not the page', async () => {
    // `translation-heading-sequence` reports against the whole document with no
    // line to route by. Checked per segment, the same defect arrives with the
    // segment attached.
    let damaged = true
    const { result } = await run({
      answer: (request) => {
        const good = translated(request.segment.text)
        if (request.segment.index === 1 && damaged) {
          damaged = false
          return good.replace('## 前置条件', '### 前置条件')
        }
        return good
      },
    })

    expect(result.document).toBeDefined()
    expect(result.outcomes[1].history[0][0].rule).toBe(
      'doom-translate:segment-heading-sequence',
    )
  })

  test('a segment that moves a heading’s anchor out of the end is caught, not shipped', async () => {
    // `{#id}` is an id only as the last thing in a heading; anywhere else it is
    // literal text. A translation can keep every placeholder and still lose the
    // id, simply by reordering the words around it — which is the natural thing
    // to do when the two languages disagree about where "on DCS" belongs. The
    // placeholder count still balances, so nothing but this notices.
    const source = [
      '---',
      'title: Installing',
      '---',
      '',
      '# Installing',
      '',
      'See the [installation guide](../global/install.mdx) and run `kubectl apply`.',
      '',
      '## Prepare These on DCS {#dcs-prereqs}',
      '',
      'You need a cluster and the `kubectl` command, plus the [prerequisites](./prereq.mdx).',
      '',
    ].join('\n')

    let moved = true
    const { result } = await run({
      source,
      answer: (request) => {
        const good = translated(request.segment.text)
        const carrier = /`__DOOM_TR_ANCHOR_\d+__`/u.exec(good)
        if (!moved || !carrier) {
          return good
        }
        moved = false
        // The carrier is still in the heading and still exactly once — it just
        // is not last any more.
        return good.replace(carrier[0], `${carrier[0]} 上准备`)
      },
    })

    const rules = result.outcomes
      .flatMap((outcome) => outcome.history)
      .flat()
      .map((finding) => finding.rule)
    expect(rules).toContain('doom-translate:segment-heading-anchor-moved')
    // Caught means retried, and the retry is what ships.
    expect(result.document).toBeDefined()
    expect(result.document).not.toContain('上准备')
  })

  test('a segment that drags in a neighbour’s placeholder is told which mistake it made', async () => {
    let polluted = true
    const { result, translator } = await run({
      answer: (request) => {
        const good = translated(request.segment.text)
        if (request.segment.index === 2 && polluted) {
          polluted = false
          // A placeholder from segment 0 — the shape of copying out of the tail.
          return `${good}\n\nAlso see __DOOM_TR_LINK_0__.\n`
        }
        return good
      },
    })

    expect(result.document).toBeDefined()
    const rejected = result.outcomes[2].history[0]
    expect(
      rejected.some(
        (f) => f.rule === 'doom-translate:out-of-segment-placeholder',
      ),
    ).toBe(true)

    // And the retry is not shown the tail it copied out of. Asserted on the
    // prompt the model actually receives, which is where that decision lives.
    const retries = translator.seen.filter(
      (request) => request.segment.index === 2,
    )
    expect(retries[0].attempt).toBe(1)
    expect(retries[1].attempt).toBe(2)
    expect(retries[0].previousTail).toBeDefined()
    expect(buildUserPrompt(retries[0])).toContain('<<<PREVIOUS')
    expect(buildUserPrompt(retries[1])).not.toContain('<<<PREVIOUS')
  })

  test('each segment is told where it sits in the page', async () => {
    // The prompt says the heading list is there "so you know where the segment
    // sits", which is only true if the segment's own section is marked. The
    // list without the mark is the same list on every call.
    const { translator } = await run({
      answer: (request) => translated(request.segment.text),
    })

    const marked = translator.seen.map((request) =>
      request.outline
        ?.split('\n')
        .find((line) => line.includes('← you are here'))
        ?.replace(/^\s*-\s*/u, '')
        .replace('  ← you are here', ''),
    )
    expect(marked).toEqual([
      // The first segment carries the frontmatter and the H1; its section is
      // the page's own title.
      'Installing',
      'Prerequisites',
      'Installing the cluster',
    ])
    // And the list itself is the whole page's, every time.
    for (const request of translator.seen) {
      expect(request.outline).toContain('Installing the cluster')
    }
  })

  test('a section name that repeats is marked where this segment actually is', async () => {
    // `Procedure`, `Prerequisites` and `Verification` sit under every top-level
    // heading of a real page, so the heading text does not identify a section.
    // Marking by text put the mark on the first heading of that name — telling
    // a segment in the CLI section it was in the console section, which is
    // worse than not marking anything at all.
    const long = (n: number) =>
      `Paragraph ${n} is long enough to force a split on its own. `.repeat(6)
    const twoWays = [
      '---',
      'title: Two ways',
      '---',
      '',
      '# Two ways',
      '',
      '## Install with the console',
      '',
      long(1),
      '',
      '### Procedure',
      '',
      'Click the button.',
      '',
      '## Install with the CLI',
      '',
      long(2),
      '',
      '### Procedure',
      '',
      'Run the command.',
      '',
    ].join('\n')

    const { translator } = await run({
      answer: (request) => request.segment.text,
      source: twoWays,
      segmentCap: 340,
    })

    // Which outline line each segment was marked on, by index rather than by
    // text — the two `Procedure` lines read identically, so text cannot tell
    // this test what it needs to know.
    const markedLine = (outline?: string) =>
      (outline ?? '')
        .split('\n')
        .findIndex((line) => line.includes('← you are here'))
    const outlines = translator.seen.map((request) =>
      markedLine(request.outline),
    )

    // The outline itself: `# Two ways`, two H2s, two identically named H3s.
    const outline = translator.seen[0].outline!.split('\n')
    expect(outline.length).toBe(5)
    expect(outline[2]).toContain('Procedure')
    expect(outline[4]).toContain('Procedure')

    // Every segment is marked exactly once, and never on a line that is not
    // its own section.
    expect(outlines.every((line) => line >= 0)).toBe(true)
    // The last segment starts at the *second* `### Procedure`, so its mark
    // belongs on outline line 4. Marking by text put it on line 2.
    expect(outlines.at(-1)).toBe(4)
    expect(outlines).toContain(2)
  })

  test('the model is never shown what masking removed', async () => {
    const seenByModel: string[] = []
    const seenByRules: string[] = []
    await run({
      answer: (request) => {
        seenByModel.push(JSON.stringify(request))
        return translated(request.segment.text)
      },
      checker: checkerReturning((content) => {
        seenByRules.push(content)
        return []
      }),
    })

    // The rules see the restored document — that is what is being checked.
    expect(
      seenByRules.some((content) => content.includes('../global/install.mdx')),
    ).toBe(true)
    // The model never does.
    expect(seenByModel.join('\n')).not.toContain('global/install.mdx')
  })
})

describe('the ratchet', () => {
  test('a segment that has passed survives a later attempt that is worse', async () => {
    // This is the incident, replayed at segment scale. The old design handed a
    // document that was one problem from done back to a model, took whatever
    // came back, and shipped the damage: 1 problem became 1000. Here the second
    // answer is garbage, and it simply does not count — what passed stays.
    let asked = 0
    const { result } = await run({
      answer: (request) => {
        if (request.segment.index !== 1) {
          return translated(request.segment.text)
        }
        asked++
        return asked === 1
          ? translated(request.segment.text)
          : // A rewrite that loses everything, exactly like the one that
            // turned 1 finding into 1000.
            '## 前置条件\n\n完全重写，占位符全部丢失。\n'
      },
      // Faults segment 1 once, by line, then is satisfied.
      checker: checkerReturning((_content, call) =>
        call === 0
          ? [
              {
                rule: 'doom-lint:some-line-rule',
                reason: 'something is off in the prerequisites',
                line: lineOf(_content, '前置条件'),
              },
            ]
          : [],
      ),
    })

    expect(result.document).toBeDefined()
    // The version that passed is the version that shipped.
    expect(result.document).toContain('你需要')
    expect(result.document).not.toContain('完全重写')
    // Every placeholder that segment carried is still there.
    expect(result.document).toContain('./prereq.mdx')
    expect(result.assemblyRounds).toBe(1)
    // It was asked again — the point is that being asked again cost nothing.
    expect(asked).toBeGreaterThan(1)
  })

  test('and the whole document is not put back at risk to fix one segment', async () => {
    const asked = new Map<number, number>()
    const { result } = await run({
      answer: (request) => {
        asked.set(
          request.segment.index,
          (asked.get(request.segment.index) ?? 0) + 1,
        )
        return translated(request.segment.text)
      },
      checker: checkerReturning((content, call) =>
        call === 0
          ? [
              {
                rule: 'doom-lint:some-line-rule',
                reason: 'something is off in the prerequisites',
                line: lineOf(content, '前置条件'),
              },
            ]
          : [],
      ),
    })

    expect(result.document).toBeDefined()
    // Only the faulted segment was redone; its neighbours were never reopened.
    expect(asked.get(1)).toBe(2)
    expect(asked.get(0)).toBe(1)
    expect(asked.get(2)).toBe(1)
  })
})

describe('failing', () => {
  test('the three ways to fail are told apart', async () => {
    const bad = (request: SegmentTranslationRequest) =>
      request.segment.index === 1
        ? translated(request.segment.text).replace(
            /__DOOM_TR_ICODE_\d+__/,
            'kubectl',
          )
        : translated(request.segment.text)

    const segmentFailure = await run({ answer: bad, maxSegmentAttempts: 1 })
    expect(segmentFailure.result.failure?.kind).toBe('segment')

    // A finding that names a line keeps being reported: routed, redone, still
    // there — that is an assembly failure.
    const assemblyFailure = await run({
      answer: (request) => translated(request.segment.text),
      checker: checkerReturning((content) => [
        {
          rule: 'doom-lint:some-line-rule',
          reason: 'still off',
          line: lineOf(content, '前置条件'),
        },
      ]),
      maxAssemblyRounds: 1,
    })
    expect(assemblyFailure.result.failure?.kind).toBe('assembly')

    // A finding with nothing to attribute it to is its own kind of failure —
    // and is deliberately not answered by redoing everything.
    const unlocatable = await run({
      answer: (request) => translated(request.segment.text),
      checker: checkerReturning(() => [
        {
          rule: 'doom-lint:translation-component-multiset',
          reason: 'Translation dropped 1 `<Term>`',
        },
      ]),
    })
    expect(unlocatable.result.failure?.kind).toBe('unlocatable')
    expect(unlocatable.result.assemblyRounds).toBe(0)
  })

  test('a document is never written out with blocking problems', async () => {
    for (const outcome of [
      await run({
        answer: (request) =>
          request.segment.index === 0 ? '' : translated(request.segment.text),
      }),
      await run({
        answer: (request) => translated(request.segment.text),
        checker: checkerReturning(() => [
          { rule: 'doom-lint:whatever', reason: 'no' },
        ]),
      }),
    ]) {
      expect(outcome.result.document).toBeUndefined()
      expect(outcome.result.findings.length).toBeGreaterThan(0)
    }
  })
})

describe('the reviewers', () => {
  test('what the segment reviewer blocks on sends that segment back', async () => {
    const judge = judgeReturning([
      {
        rule: 'doom-judge:omission',
        reason:
          'a whole bullet is missing — the source says: “contact support”',
      },
    ])
    const { result } = await run({
      answer: (request) => translated(request.segment.text),
      segmentJudge: judge,
      maxSegmentAttempts: 2,
    })

    expect(result.document).toBeUndefined()
    expect(result.failure?.kind).toBe('segment')
    expect(result.findings[0].rule).toBe('doom-judge:omission')
  })

  test('a readability note is reported and lets the document through', async () => {
    const judge = judgeReturning([
      {
        rule: 'doom-judge:fluency',
        reason: 'reads stiffly',
        blocking: false,
      },
    ])
    const { result } = await run({
      answer: (request) => translated(request.segment.text),
      segmentJudge: judge,
    })

    expect(result.document).toContain('# 安装')
    expect(result.findings.every((finding) => finding.blocking === false)).toBe(
      true,
    )
  })

  test('the reviewer is not asked about a segment the free checks already faulted', async () => {
    const judge = judgeReturning([])
    await run({
      // Every segment carries a link, so every segment is damaged — an earlier
      // version damaged only inline code, and the one segment without any
      // reached the reviewer and made this pass for the wrong reason.
      answer: (request) =>
        translated(request.segment.text).replace(
          /__DOOM_TR_LINK_\d+__/,
          './somewhere.mdx',
        ),
      segmentJudge: judge,
      maxSegmentAttempts: 1,
    })
    expect(judge.readings()).toBe(0)
  })

  test('a page that is one segment is reviewed as a page, not as a fragment', async () => {
    // The fragment prompt tells the reviewer that a missing beginning or end is
    // the cut's doing and not an omission. On a page that *is* the segment,
    // those are the omissions — and there is nothing else blocking to catch
    // them: the whole-page reviewer is advisory, and is not even asked when
    // there is one segment. Half of the real corpus is one segment.
    const onePage = `---\ntitle: Installing\n---\n\n# Installing\n\nSee the [installation guide](../global/install.mdx) and run \`kubectl apply\`.\n`

    const segmentJudge = judgeReturning()
    const documentJudge = judgeReturning()
    const { result } = await run({
      answer: (request) => translated(request.segment.text),
      source: onePage,
      segmentJudge,
      documentJudge,
    })

    expect(result.outcomes.length).toBe(1)
    expect(segmentJudge.readings()).toBe(1)
    expect(segmentJudge.seen[0].fragment).toBe(false)
    // And it is read once, not twice: the whole-page reviewer would be reading
    // the same text.
    expect(documentJudge.readings()).toBe(0)
  })

  test('a segment of a longer page is reviewed as a fragment', async () => {
    const segmentJudge = judgeReturning()
    const { result } = await run({
      answer: (request) => translated(request.segment.text),
      segmentJudge,
    })

    expect(result.outcomes.length).toBeGreaterThan(1)
    expect(segmentJudge.seen.length).toBe(result.outcomes.length)
    expect(
      segmentJudge.seen.every((request) => request.fragment === true),
    ).toBe(true)
  })

  test('a segment worked on twice does not report its notes twice', async () => {
    // A readability note is about the translation that shipped, and a segment
    // that an assembly round sent back was translated more than once. Appending
    // each pass's notes printed the surviving one again for every segment that
    // was ever revisited.
    const segmentJudge = judgeReturning([
      { rule: 'doom-judge:fluency', reason: 'reads stiffly', blocking: false },
    ])
    const { result } = await run({
      answer: (request) => translated(request.segment.text),
      segmentJudge,
      checker: checkerReturning((content, call) =>
        call === 0
          ? [
              {
                rule: 'doom-lint:some-line-rule',
                reason: 'something is off in the prerequisites',
                line: lineOf(content, '前置条件'),
              },
            ]
          : [],
      ),
    })

    expect(result.document).toBeDefined()
    expect(result.assemblyRounds).toBe(1)
    // Segment 1 was read twice by the reviewer…
    expect(segmentJudge.readings()).toBe(result.outcomes.length + 1)
    // …and still contributes one note, like every other segment.
    expect(
      result.findings.filter((finding) => finding.rule === 'doom-judge:fluency')
        .length,
    ).toBe(result.outcomes.length)
  })

  test('the whole-page reviewer reports and never blocks', async () => {
    const documentJudge = judgeReturning([
      {
        rule: 'doom-judge:mistranslation',
        reason: 'the term drifted between sections',
      },
    ])
    const { result } = await run({
      answer: (request) => translated(request.segment.text),
      documentJudge,
    })

    // Blocking as the reviewer reported it, advisory by the time it is here.
    expect(result.document).toBeDefined()
    expect(documentJudge.readings()).toBe(1)
    expect(
      result.findings.find(
        (finding) => finding.rule === 'doom-judge:mistranslation',
      )?.blocking,
    ).toBe(false)
  })
})

describe('routing a whole-document finding back to a segment', () => {
  test('a line inside a drilled container goes to the block that owns it, not to the container’s tag', async () => {
    const source = withTabs()
    const { plan } = prepare(source, 300)
    const attrs = plan.segments
      .filter((segment) => segment.address.kind === 'attributes')
      .map((segment) => segment.index)
    const owner = plan.segments.find((segment) =>
      segment.text.includes('Paragraph 12 '),
    )?.index
    // The fixture is only about anything if the container really was drilled
    // into and the labels really did become segments of their own.
    expect(attrs.length).toBe(2)
    expect(owner).toBeDefined()
    expect(attrs).not.toContain(owner)

    const { result } = await run({
      answer: (request) => request.segment.text,
      source,
      segmentCap: 300,
      checker: checkerReturning((content, call) =>
        call === 0
          ? [
              {
                rule: 'doom-lint:some-line-rule',
                reason: 'something is off in the second tab',
                line: lineOf(content, 'Paragraph 12 '),
              },
            ]
          : [],
      ),
    })

    expect(result.document).toBeDefined()
    // The block that holds the faulted line was asked again…
    expect(result.outcomes[owner!].attempts).toBe(2)
    // …and the `<Tab label="…">` segments, whose spans cover the same line
    // because they are taken from the whole tag node, were left alone. Taking
    // the first span that contains the line instead of the narrowest sent the
    // label back and left the real defect untouched.
    for (const index of attrs) {
      expect(result.outcomes[index].attempts).toBe(1)
    }
  })

  test('a pairwise rule is unlocatable whether or not the page has frontmatter', async () => {
    // Every `doom-lint:translation-*` rule reports on the root node, so its
    // line is 1 wherever the defect is. With frontmatter that 1 lands in the
    // yaml block and belongs to nobody; without one it lands on the first
    // segment by accident. Recognising the rule by name is what makes the same
    // defect fail the same way on both — rather than the shape of the page
    // deciding it.
    for (const keepFrontmatter of [true, false]) {
      const { result } = await run({
        answer: (request) => translated(request.segment.text),
        keepFrontmatter,
        checker: checkerReturning(() => [
          {
            rule: 'doom-lint:translation-component-multiset',
            reason: 'Translation dropped 1 `<Term>`',
            line: 1,
          },
        ]),
      })

      expect(result.failure?.kind).toBe('unlocatable')
      expect(result.assemblyRounds).toBe(0)
      // Nothing was sent back, so no segment paid for it.
      expect(result.outcomes.every((outcome) => outcome.attempts === 1)).toBe(
        true,
      )
    }
  })

  test('a label shared by a definition and its uses sends every segment that holds it back', async () => {
    // `REFID`/`FNID` are linkage keys: the definition and each reference mask
    // to the same token, so more than one segment expects it. Which of them
    // dropped it is exactly what the finding does not say, so all of them are
    // asked — routing to whichever happened to be recorded last is a coin flip.
    const shared = [
      '---',
      'title: Installing',
      '---',
      '',
      '# Installing',
      '',
      'Start from the [manual][handbook].',
      '',
      '## Prerequisites',
      '',
      'It is also covered in the [manual][handbook].',
      '',
      '[handbook]: https://example.com/handbook',
      '',
    ].join('\n')

    const { plan } = prepare(shared)
    const holders = plan.segments
      .filter((segment) =>
        [...segment.expected.keys()].some((token) => token.includes('refid')),
      )
      .map((segment) => segment.index)
    expect(holders.length).toBeGreaterThan(1)

    const token = [...plan.segments[holders[0]].expected.keys()].find((key) =>
      key.includes('refid'),
    )
    const { result } = await run({
      answer: (request) => request.segment.text,
      source: shared,
      checker: checkerReturning((_content, call) =>
        call === 0
          ? [
              {
                rule: 'doom-translate:missing-placeholder',
                reason: 'the label is gone',
                placeholder: token,
              },
            ]
          : [],
      ),
    })

    expect(result.document).toBeDefined()
    for (const index of holders) {
      expect(result.outcomes[index].attempts).toBe(2)
    }
  })
})

/** 1-indexed line the text first appears on — how a rule would report it. */
const lineOf = (content: string, needle: string) => {
  const index = content.split('\n').findIndex((line) => line.includes(needle))
  return index < 0 ? 1 : index + 1
}
