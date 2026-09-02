import path from 'node:path'

import matter from '@rspress/shared/gray-matter'
import { describe, expect, test } from '@rstest/core'

import { escapeMarkdownHeadingIds, stringifyMatter } from '#cli/helpers.ts'
import type { SegmentTranslationRequest } from '#cli/translate-call.ts'
import { maskAst } from '#cli/translate-mask.ts'
import { translateDocument } from '#cli/translate-pipeline.ts'
import {
  type SegmentCacheRecord,
  alignBySha,
  decodeRecord,
  encodeRecord,
} from '#cli/translate-segment-cache.ts'
import { mdxProcessor } from '#plugins/index.ts'

/**
 * Reusing what has not changed, and refusing to reuse what cannot be verified.
 *
 * The whole point of these is the second half. A cache that is trusted because
 * it was written down produces failures that look exactly like translation
 * defects, in a pipeline whose entire purpose is to tell those apart — so every
 * test here that shows something being reused has a twin showing it being
 * refused.
 */

const page = (
  prerequisites: string,
  verifying = 'Check that every node is ready.',
) => `---
title: Installing
weight: 10
---

# Installing

See the [installation guide](../global/install.mdx) and run \`kubectl apply\`.

## Prerequisites

${prerequisites}

## Installing the cluster

Run the installer and wait. Read the [troubleshooting notes](./trouble.mdx) if it stops.

## Verifying

${verifying} See the [status guide](./status.mdx).
`

const ORIGINAL = page(
  'You need a cluster and the `kubectl` command, plus the [prerequisites](./prereq.mdx).',
)
const EDITED = page(
  'You need a cluster and the `kubectl` command, plus the [prerequisites](./prereq.mdx). One more sentence was added here.',
)

const translated = (text: string) =>
  text
    .replace(/# Installing$/gm, '# 安装')
    .replace(/## Prerequisites/g, '## 前置条件')
    .replace(/## Installing the cluster/g, '## 安装集群')
    .replace(/See the/g, '请参阅')
    .replace(/You need/g, '你需要')
    .replace(/Run the installer and wait\./g, '运行安装程序并等待。')
    .replace(/## Verifying/g, '## 验证')
    .replace(/Check that every node is ready\./g, '检查每个节点是否就绪。')

/** The real `compose`, in miniature: the translation's frontmatter is replaced. */
const compose = () => (restored: string, cache?: SegmentCacheRecord) => {
  const { content, data } = matter(restored)
  return stringifyMatter(
    {
      title: typeof data.title === 'string' ? data.title : 'Installing',
      weight: 10,
      sourceSHA: 'test',
      ...(cache ? { i18nSegments: cache } : {}),
    },
    content.replace(/^\n+/u, ''),
  )
}

const translate = async ({
  source,
  previousDocument,
  answer = (request: SegmentTranslationRequest) =>
    translated(request.segment.text),
  segmentFloor = 0,
}: {
  source: string
  previousDocument?: string
  answer?: (request: SegmentTranslationRequest) => string
  segmentFloor?: number
}) => {
  const tree = mdxProcessor.parse(escapeMarkdownHeadingIds(source))
  const maskEntries = maskAst(tree)
  const maskedSource = mdxProcessor.stringify(tree)
  const asked: number[] = []

  const previous = previousDocument
    ? (() => {
        const parsed = matter(previousDocument)
        return {
          body: parsed.content,
          record: (parsed.data as { i18nSegments?: SegmentCacheRecord })
            .i18nSegments,
        }
      })()
    : undefined

  const result = await translateDocument({
    tree,
    maskedSource,
    maskEntries,
    processor: mdxProcessor,
    compose: compose(),
    targetPath: path.join('/docs', 'zh', 'install', 'installing.mdx'),
    sourceLabel: 'en/install/installing.mdx',
    sourceLanguage: 'English',
    targetLanguage: 'Chinese',
    translator: {
      calls: () => asked.length,
      translate: (request) => {
        asked.push(request.segment.index)
        return Promise.resolve(answer(request))
      },
    },
    checker: {
      check: () => Promise.resolve([]),
      assertCheckable: () => Promise.resolve(),
    },
    segmentFloor,
    previous,
  })

  return { result, asked }
}

describe('the segment cache', () => {
  test('a first translation records where every segment went', async () => {
    const { result } = await translate({ source: ORIGINAL })
    const record = (
      matter(result.document!).data as { i18nSegments?: SegmentCacheRecord }
    ).i18nSegments

    expect(record?.v).toBe(1)
    expect(record?.segs.length).toBeGreaterThan(0)
    // One per segment, less the one carrying the frontmatter — `compose`
    // rewrites that, so it is the one place the two coordinate systems could
    // disagree.
    expect(record?.segs.length).toBe(result.outcomes.length - 1)
    expect(result.outcomes.length).toBe(4)
  })

  test('editing one section retranslates one section', async () => {
    const first = await translate({ source: ORIGINAL })
    expect(first.asked).toEqual([0, 1, 2, 3])

    const second = await translate({
      source: EDITED,
      previousDocument: first.result.document,
    })

    // Segment 1 changed. Segment 0 carries the frontmatter and is never cached.
    // Segments 2 and 3 are untouched and are not asked for again.
    expect(second.asked).toEqual([0, 1])
    expect(second.result.outcomes[2].status).toBe('cached')
    expect(second.result.outcomes[3].status).toBe('cached')
    expect(second.result.document).toContain('运行安装程序并等待。')
    // And the reused segment came back with its real link, not a placeholder.
    expect(second.result.document).toContain('./trouble.mdx')
    expect(second.result.document).not.toContain('__DOOM_TR_')
  })

  test('a cut made under different settings is not reused', async () => {
    const first = await translate({ source: ORIGINAL })
    const document = matter(first.result.document!)
    const record = document.data.i18nSegments as SegmentCacheRecord

    for (const tampered of [
      { ...record, v: record.v + 1 },
      { ...record, cap: record.cap + 1 },
      { ...record, segs: ['nonsense'] },
    ]) {
      const previousDocument = stringifyMatter(
        { ...document.data, i18nSegments: tampered },
        document.content,
      )
      const again = await translate({ source: EDITED, previousDocument })
      expect(again.asked).toEqual([0, 1, 2, 3])
      expect(
        again.result.outcomes.every((outcome) => outcome.status !== 'cached'),
      ).toBe(true)
    }
  })

  test('a translation somebody edited by hand is not reused', async () => {
    // The record still says where the segment is, and it is still there. What
    // has changed is its content — a link somebody fixed in the target language
    // — and that makes it a translation of a different source than the one it
    // claims. Reusing it would put the edit back silently.
    const first = await translate({ source: ORIGINAL })
    const damaged = first.result.document!.replace(
      './trouble.mdx',
      './troubleshooting.mdx',
    )
    expect(damaged).not.toBe(first.result.document)

    const second = await translate({
      source: EDITED,
      previousDocument: damaged,
    })

    // Only the damaged segment is refused. The untouched one after it is still
    // reused — the check is per segment, so one hand-edit does not cost the
    // whole page.
    expect(second.asked).toEqual([0, 1, 2])
    expect(second.result.outcomes[2].status).toBe('translated')
    expect(second.result.outcomes[3].status).toBe('cached')
    // The hand-edit is gone: what ships is a translation of the current source.
    expect(second.result.document).toContain('./trouble.mdx')
    expect(second.result.document).not.toContain('./troubleshooting.mdx')
  })

  test('a translation whose blocks have moved is not reused', async () => {
    // Somebody added a paragraph at the top of the body, so every recorded
    // address now points one block early. The addresses still *resolve* — a
    // middle segment's range still holds the right number of blocks — so
    // nothing but checking the content itself can catch this. That is the point
    // of the check: an earlier version of this test only had a segment at the
    // very end, whose range ran off the end of the shifted body, and so it
    // passed without the verification ever running.
    const first = await translate({ source: ORIGINAL })
    const parsed = matter(first.result.document!)
    const shifted = stringifyMatter(
      parsed.data,
      `An added note.\n\n${parsed.content.replace(/^\n+/u, '')}`,
    )

    const second = await translate({
      source: EDITED,
      previousDocument: shifted,
    })

    expect(
      second.result.outcomes.every((outcome) => outcome.status !== 'cached'),
    ).toBe(true)
    // And nothing landed in the wrong section.
    expect(second.result.document).toContain(
      '## 安装集群\n\n运行安装程序并等待。',
    )
    expect(second.result.document).toContain(
      '## 验证\n\n检查每个节点是否就绪。',
    )
  })

  test('reuse survives a round trip: what is cached is what was written', async () => {
    const first = await translate({ source: ORIGINAL })
    const second = await translate({
      source: EDITED,
      previousDocument: first.result.document,
    })

    const sectionOf = (document: string, heading: string) =>
      document.slice(document.indexOf(heading)).split('\n## ')[0]

    // The untouched section is byte-identical across the two runs.
    expect(sectionOf(second.result.document!, '## 安装集群')).toBe(
      sectionOf(first.result.document!, '## 安装集群'),
    )
  })
})

describe('matching one cut against another', () => {
  test('an inserted segment does not shift the ones after it', () => {
    expect(alignBySha(['a', 'x', 'b', 'c'], ['a', 'b', 'c'])).toEqual([
      [0, 0],
      [2, 1],
      [3, 2],
    ])
  })

  test('a removed segment does not shift the ones after it', () => {
    expect(alignBySha(['a', 'c'], ['a', 'b', 'c'])).toEqual([
      [0, 0],
      [1, 2],
    ])
  })

  test('two identical segments cannot swap places', () => {
    // Both hashes match both positions; pairs still may not cross.
    const pairs = alignBySha(['a', 'a'], ['a', 'a'])
    expect(pairs).toEqual([
      [0, 0],
      [1, 1],
    ])
  })

  test('nothing in common matches nothing', () => {
    expect(alignBySha(['a', 'b'], ['c', 'd'])).toEqual([])
  })
})

describe('the record format', () => {
  test('survives a round trip', () => {
    for (const record of [
      {
        sha: '0123456789ab',
        address: { kind: 'blocks' as const, container: [], start: 0, end: 3 },
      },
      {
        sha: 'abcdef012345',
        address: { kind: 'blocks' as const, container: [7], start: 2, end: 5 },
      },
      {
        sha: 'ffffffffffff',
        address: {
          kind: 'blocks' as const,
          container: [7, 1],
          start: 0,
          end: 1,
        },
      },
      {
        sha: '00000000000a',
        address: { kind: 'attributes' as const, container: [7, 1] },
      },
    ]) {
      expect(decodeRecord(encodeRecord(record))).toEqual(record)
    }
  })

  test('rubbish decodes to nothing rather than to something wrong', () => {
    for (const entry of [
      '',
      'not-a-sha 0-1',
      '0123456789ab',
      '0123456789ab 3-1x',
      '0123456789ab a/0-1',
      '0123456789ab :attrs',
    ]) {
      expect(decodeRecord(entry)).toBeUndefined()
    }
  })
})
