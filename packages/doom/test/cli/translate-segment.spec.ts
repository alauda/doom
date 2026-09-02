import { describe, expect, test } from '@rstest/core'

import { escapeMarkdownHeadingIds } from '#cli/helpers.ts'
import {
  countPlaceholders,
  maskAst,
  restoreMaskedContent,
} from '#cli/translate-mask.ts'
import {
  DEFAULT_SEGMENT_CAP,
  SEGMENTER_VERSION,
  UnsplittableBlockError,
  assemble,
  planSegments,
} from '#cli/translate-segment.ts'
import { mdxProcessor } from '#plugins/index.ts'

/**
 * The deterministic half of the pipeline, tested without a model.
 *
 * Cutting a document up and putting it back together is a pure function, and
 * everything downstream — acceptance, retry, the cache — is built on it being
 * exactly that. So these are property tests rather than examples: the cut is
 * reproducible, it conserves what it cut, and putting an untranslated document
 * back together reproduces it byte for byte.
 *
 * The fixtures are generated here rather than taken from a real documentation
 * site: doom is a public repository.
 */

const paragraph = (n: number) =>
  `Paragraph ${n} explains how to run \`kubectl get pods -n namespace-${n}\` and then read the [cluster guide](../clusters/guide-${n}.mdx) before continuing with the next step of the procedure.`

const section = (n: number, paragraphs: number) =>
  [
    `## Section ${n}`,
    '',
    ...Array.from({ length: paragraphs }, (_, index) => [
      paragraph(n * 100 + index),
      '',
      '```bash',
      `kubectl apply -f manifest-${n}-${index}.yaml`,
      '```',
      '',
    ]).flat(),
  ].join('\n')

const document = ({
  sections = 6,
  paragraphs = 3,
}: { sections?: number; paragraphs?: number } = {}) =>
  [
    '---',
    'title: Installing the platform',
    'description: How to install it',
    'weight: 10',
    '---',
    '',
    '# Installing the platform {#install}',
    '',
    'This page covers the whole procedure, from the [prerequisites](./prereq.mdx) to the final check.',
    '',
    ...Array.from({ length: sections }, (_, index) =>
      section(index + 1, paragraphs),
    ),
  ].join('\n')

/** A `<Tabs>` big enough that the segmenter has to drill into it. */
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

/**
 * Reference links, an image reference and a footnote, all defined in a later
 * section than they are used.
 *
 * `[text][label]`, `![x][fig]` and `[^1]` are only reference nodes while the
 * definition they name is in scope, and a definition is written once, usually
 * at the bottom. So a segment that holds a use but not the definition parses
 * standalone as plain bracketed text — and stringifying that escapes both the
 * brackets and the underscores in the masked label, which destroys the
 * placeholder.
 */
const withReferences = () =>
  [
    '---',
    'title: Refs',
    '---',
    '',
    '# Refs',
    '',
    'Start from the [manual][handbook] and see the note[^1]. Also ![diagram][fig].',
    '',
    '## Prerequisites',
    '',
    'It is also covered in the [manual][handbook] and again[^1].',
    '',
    '## Where definitions live',
    '',
    'Definitions follow.',
    '',
    '[handbook]: https://example.com/handbook',
    '[fig]: ./diagram.png',
    '[^1]: The footnote text with `code`.',
    '',
  ].join('\n')

/** Masks a document the way `doom translate` does, and cuts it up. */
const prepare = (
  source: string,
  {
    cap = 400,
    hardCap,
    floor = 0,
  }: { cap?: number; hardCap?: number; floor?: number } = {},
) => {
  const tree = mdxProcessor.parse(escapeMarkdownHeadingIds(source))
  const maskEntries = maskAst(tree)
  const masked = mdxProcessor.stringify(tree)
  const plan = planSegments({
    tree,
    processor: mdxProcessor,
    cap,
    hardCap,
    floor,
  })
  return { tree, maskEntries, masked, plan }
}

/** What an untranslated run looks like: every segment comes back as it went out. */
const identity = (plan: ReturnType<typeof prepare>['plan']) =>
  plan.segments.map((segment) => segment.text)

describe('the segmenter', () => {
  test('cuts the same document the same way every time', () => {
    const source = document()
    const first = prepare(source)
    const second = prepare(source)

    expect(first.plan.segments.length).toBeGreaterThan(1)
    // Byte for byte, including the hashes the cache is keyed on.
    expect(JSON.stringify(second.plan.segments, replacer)).toBe(
      JSON.stringify(first.plan.segments, replacer),
    )
    expect(second.plan.segments.map((s) => s.sha)).toEqual(
      first.plan.segments.map((s) => s.sha),
    )
  })

  test('every placeholder in the document is accounted for exactly once', () => {
    // Measured here rather than trusting the segmenter's own assertion: if that
    // assertion were removed, this test still fails.
    for (const source of [document(), withTabs(), document({ sections: 1 })]) {
      const { masked, plan } = prepare(source)
      const accounted = new Map(plan.heldOut)
      for (const segment of plan.segments) {
        for (const [token, count] of segment.expected) {
          accounted.set(token, (accounted.get(token) ?? 0) + count)
        }
      }
      expect(sorted(accounted)).toEqual(sorted(countPlaceholders(masked)))
      expect(accounted.size).toBeGreaterThan(0)
    }
  })

  test('a `##` heading starts a segment', () => {
    const source = document({ sections: 4, paragraphs: 1 })
    const { plan, tree } = prepare(source, { cap: 4_000, floor: 0 })
    const startsWithHeading = plan.segments.filter((segment) => {
      if (segment.address.kind !== 'blocks') {
        return false
      }
      const first = tree.children.at(segment.address.start)
      return first?.type === 'heading' && first.depth === 2
    })
    // Four sections, well inside the cap: the cut follows the headings, not the
    // size.
    expect(startsWithHeading.length).toBe(4)
  })

  test('but only once the open segment is worth ending', () => {
    // Without a floor, a page of short sections becomes a page of short
    // segments — each one a model call and a judge reading, for no gain: an
    // edit still only ever costs the one segment it lands in. Measured over
    // 1030 real documents, the worst case was 104 segments averaging 115
    // characters for a page that fits in one.
    const source = document({ sections: 8, paragraphs: 1 })
    const { plan: fragmented } = prepare(source, { cap: 40_000, floor: 0 })
    const { plan: merged } = prepare(source, { cap: 40_000, floor: 2_000 })

    expect(fragmented.segments.length).toBeGreaterThan(merged.segments.length)
    // Nothing is lost by merging — the same conservation still holds.
    const accounted = new Map(merged.heldOut)
    for (const segment of merged.segments) {
      for (const [token, count] of segment.expected) {
        accounted.set(token, (accounted.get(token) ?? 0) + count)
      }
    }
    expect(sorted(accounted)).toEqual(
      sorted(countPlaceholders(prepare(source).masked)),
    )
  })

  test('the frontmatter travels with the section that follows it', () => {
    const { plan } = prepare(document())
    const [first] = plan.segments
    expect(first.text.startsWith('---\n')).toBe(true)
    // Not a segment on its own: the model sees `title` next to the page it titles.
    expect(first.text).toContain('# Installing the platform')
  })

  test('a container too large to send is drilled into, and its label still gets translated', () => {
    const { plan } = prepare(withTabs(), { cap: 300 })
    const attributeSegments = plan.segments.filter(
      (segment) => segment.address.kind === 'attributes',
    )
    expect(attributeSegments.length).toBeGreaterThan(0)
    expect(attributeSegments[0].text).toContain('label="Web Console"')
    // The tag itself is held by the assembler, not sent.
    expect(
      plan.segments.some((segment) => segment.text.includes('<Tabs>')),
    ).toBe(false)
  })

  test('a single block that cannot be divided fails the document by name', () => {
    const row = `| ${'cell '.repeat(20)} | ${'cell '.repeat(20)} |`
    const table = [
      '# Title',
      '',
      '| a | b |',
      '| - | - |',
      ...Array.from({ length: 40 }, () => row),
      '',
    ].join('\n')
    expect(() => prepare(table, { cap: 200, hardCap: 1_000 })).toThrow(
      UnsplittableBlockError,
    )
    // Under a hard cap it fits below, the same block is simply a segment of its
    // own — oversized on purpose, rather than a failure.
    const { plan } = prepare(table, { cap: 200, hardCap: 50_000 })
    expect(plan.segments.some((segment) => segment.text.length > 200)).toBe(
      true,
    )
  })

  test('the version and cap the cut was made under are reported', () => {
    const { plan } = prepare(document(), { cap: 500 })
    expect(plan.version).toBe(SEGMENTER_VERSION)
    expect(plan.cap).toBe(500)
    expect(DEFAULT_SEGMENT_CAP).toBeGreaterThan(500)
  })
})

describe('assembly', () => {
  test('putting an untranslated document back together reproduces it exactly', () => {
    // The core regression test for this layer: cutting and reassembling
    // introduces no diff of its own, so any diff a real run produces came from
    // the translation rather than from the machinery around it.
    //
    // The baseline is the masked document after one parse/stringify round trip,
    // not the masked document itself, because a translation is always parsed
    // once before it is restored — markdown's own normalisation applies on
    // either path. (Measured over 1030 real documents, exactly one is
    // normalised at all: a `<Tabs>` inside a list item gains a blank line. It
    // is a fixed point, so it does not churn on every build.) Anything beyond
    // that would be assembly losing or moving content, and is what this
    // catches.
    for (const [source, cap] of [
      [document(), 400],
      [document({ sections: 2, paragraphs: 6 }), 1_000],
      [withTabs(), 300],
    ] as const) {
      const { tree, plan, masked } = prepare(source, { cap })
      const { text } = assemble({
        tree,
        plan,
        processor: mdxProcessor,
        translations: identity(plan),
      })
      expect(text).toBe(mdxProcessor.stringify(mdxProcessor.parse(masked)))
    }
  })

  test('and the restored document is the one the un-segmented path would produce', () => {
    const source = document()
    const { tree, plan, masked, maskEntries } = prepare(source)
    const { text } = assemble({
      tree,
      plan,
      processor: mdxProcessor,
      translations: identity(plan),
    })
    expect(restoreMaskedContent(text, maskEntries, mdxProcessor)).toBe(
      restoreMaskedContent(masked, maskEntries, mdxProcessor),
    )
  })

  test('a translated segment lands where its source came from', () => {
    const { tree, plan } = prepare(document({ sections: 3 }))
    const translations = identity(plan).map((text, index) =>
      index === 1 ? text.replace(/Paragraph/g, '段落') : text,
    )
    const { text } = assemble({
      tree,
      plan,
      processor: mdxProcessor,
      translations,
    })
    expect(text).toContain('段落')
    // Only that segment changed; everything else is byte-identical.
    expect(text.match(/段落/g)!.length).toBe(
      plan.segments[1].text.match(/Paragraph/g)!.length,
    )
  })

  test('a translated tag label is written back onto the tag', () => {
    const { tree, plan } = prepare(withTabs(), { cap: 300 })
    const translations = plan.segments.map((segment) =>
      segment.address.kind === 'attributes'
        ? segment.text
            .replace('Web Console', '控制台')
            .replace('Command Line', '命令行')
        : segment.text,
    )
    const { text } = assemble({
      tree,
      plan,
      processor: mdxProcessor,
      translations,
    })
    expect(text).toMatch(/label="(控制台|命令行)"/)
  })

  test('a reference whose definition is in another segment survives the round trip', () => {
    // Assembly parses each segment's translation on its own before splicing it
    // back, so a use separated from its definition used to come back as escaped
    // text — `[manual][__DOOM_TR_REFID_0__]` stringified as
    // `\\[manual]\\[**DOOM\\_TR\\_REFID\\_0**]` — and the placeholder was gone.
    // All three reference kinds are here because they take three different
    // paths through masking and only one of them was covered before.
    const { tree, plan, masked, maskEntries } = prepare(withReferences())

    // The fixture only means anything if the uses and the definitions really
    // did land in different segments.
    expect(plan.segments.length).toBeGreaterThan(1)
    const holdsDefinition = plan.segments.findIndex((segment) =>
      /^\[__DOOM_TR_REFID_\d+__\]:/mu.test(segment.text),
    )
    const holdsUse = plan.segments.findIndex(
      (segment, index) =>
        index !== holdsDefinition &&
        /\]\[__DOOM_TR_REFID_\d+__\]/u.test(segment.text),
    )
    expect(holdsDefinition).toBeGreaterThanOrEqual(0)
    expect(holdsUse).toBeGreaterThanOrEqual(0)

    const { text } = assemble({
      tree,
      plan,
      processor: mdxProcessor,
      translations: identity(plan),
    })

    expect(text).toBe(mdxProcessor.stringify(mdxProcessor.parse(masked)))
    expect(restoreMaskedContent(text, maskEntries, mdxProcessor)).toBe(
      restoreMaskedContent(masked, maskEntries, mdxProcessor),
    )
    // Said directly as well, because the equalities above would also hold if
    // both sides were escaped.
    expect(text).not.toContain('\\[')
    expect(restoreMaskedContent(text, maskEntries, mdxProcessor)).toContain(
      '[manual][handbook]',
    )
  })

  test('every segment is given a locator for the next run', () => {
    const { tree, plan } = prepare(document())
    const { records } = assemble({
      tree,
      plan,
      processor: mdxProcessor,
      translations: identity(plan),
    })
    // One per segment, less the frontmatter-bearing one, which is deliberately
    // never cached.
    expect(records.length).toBe(plan.segments.length - 1)
    expect(records.every((record) => record.sha.length === 12)).toBe(true)
    const [first] = records
    expect(first.address.kind).toBe('blocks')
  })
})

const replacer = (_key: string, value: unknown) =>
  value instanceof Map ? [...value.entries()] : value

const sorted = (counts: Map<string, number>) =>
  [...counts.entries()].sort(([a], [b]) => a.localeCompare(b))
