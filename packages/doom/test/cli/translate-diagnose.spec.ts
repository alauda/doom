import { describe, expect, test } from '@rstest/core'

import { buildEvidence } from '#cli/translate-diagnose.ts'
import type { SegmentOutcome } from '#cli/translate-pipeline.ts'

/**
 * The evidence a failure is explained from.
 *
 * Only the assembly is tested, not the explanation: what a model writes is not
 * a thing to assert on, and nothing branches on it anyway. What is worth
 * asserting is that the evidence is actually there — a diagnosis written from
 * an empty brief reads exactly like one written from a full brief, and is
 * worthless in a way nobody would notice.
 */

const outcome = (
  index: number,
  overrides: Partial<SegmentOutcome> = {},
): SegmentOutcome => ({
  index,
  status: 'translated',
  label: { line: 100 * index + 1, heading: `Section ${index}` },
  attempts: 1,
  history: [],
  findings: [],
  ...overrides,
})

describe('the failure brief', () => {
  test('names the segment, the section, and how the findings moved', () => {
    const evidence = buildEvidence({
      sourceLabel: 'en/global/install.mdx',
      failure: { kind: 'segment', segments: [1] },
      assemblyRounds: 0,
      findings: [
        { rule: 'doom-translate:missing-placeholder', reason: 'gone again' },
      ],
      outcomes: [
        outcome(0),
        outcome(1, {
          status: 'failed',
          attempts: 3,
          label: { line: 820, heading: 'Installing the cluster' },
          history: [
            [
              {
                rule: 'doom-translate:missing-placeholder',
                reason: 'one gone',
              },
            ],
            [
              { rule: 'doom-translate:missing-placeholder', reason: 'still' },
              { rule: 'doom-judge:omission', reason: 'a bullet went missing' },
            ],
          ],
          findings: [
            {
              rule: 'doom-translate:missing-placeholder',
              reason: 'gone again',
            },
          ],
        }),
        outcome(2, { status: 'cached' }),
      ],
    })

    expect(evidence).toContain('en/global/install.mdx')
    expect(evidence).toContain('Installing the cluster')
    expect(evidence).toContain('source line 820')
    expect(evidence).toContain('segment(s) 2 were never accepted')
    // The shape of the failure over time, which is the whole question.
    expect(evidence).toContain('attempt 1 rejected with 1 finding(s)')
    expect(evidence).toContain('attempt 2 rejected with 2 finding(s)')
    expect(evidence).toContain('doom-judge:omission')
    // And the run as a whole, so "one bad segment" and "nothing worked" read
    // differently.
    expect(evidence).toContain('1 translated, 1 failed, 1 cached')
  })

  test('says which kind of failure it was, in words', () => {
    const kinds = {
      assembly: 'the assembled page kept failing',
      unlocatable: 'could not be attributed to any segment',
    } as const
    for (const [kind, phrase] of Object.entries(kinds)) {
      const evidence = buildEvidence({
        sourceLabel: 'en/a.mdx',
        failure: { kind } as never,
        assemblyRounds: 2,
        findings: [],
        outcomes: [outcome(0)],
      })
      expect(evidence).toContain(phrase)
      expect(evidence).toContain('Assembly rounds used: 2')
    }
  })
})
