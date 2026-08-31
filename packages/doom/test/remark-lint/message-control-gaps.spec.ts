import { describe, expect, test } from '@rstest/core'

import { lintMdx, lintMdxPipeline } from './_helper.ts'

import { noLegacyOSNames } from '#remark-lint/index.ts'

/**
 * Message control used to discard lint messages that landed on a self-closing
 * MDX element at the end of a document.
 *
 * `detectGaps` treats any node with a `children` key as covered by walking its
 * children — but a self-closing element is a parent with an empty `children`
 * array, so its end offset was never recorded. When it was the last node,
 * everything from its start to the end of the file became a gap, and every
 * message inside it was dropped. A canonical API reference page is exactly that
 * shape (`# Title` followed by a single `<K8sAPI … />`), so the rules aimed at
 * those pages reported nothing at all, on a green build.
 *
 * Every rule's own spec passed throughout, because none of them ran message
 * control. That is what these cases are for.
 */
describe('lint pipeline: messages on a trailing self-closing element', () => {
  const trailing = ['# Title', '', '<Term name="MicroOS" />'].join('\n')
  const followed = [
    '# Title',
    '',
    '<Term name="MicroOS" />',
    '',
    'Some prose after the component.',
  ].join('\n')

  test('reports a violation on the last node of the document', async () => {
    const messages = await lintMdxPipeline(noLegacyOSNames, trailing)

    expect(messages).toHaveLength(1)
    expect(messages[0].reason).toContain('MicroOS')
  })

  test('reports it whether or not anything follows the component', async () => {
    const [withTrailingProse, withoutTrailingProse] = await Promise.all([
      lintMdxPipeline(noLegacyOSNames, followed),
      lintMdxPipeline(noLegacyOSNames, trailing),
    ])

    expect(withTrailingProse).toHaveLength(1)
    expect(withoutTrailingProse).toHaveLength(1)
  })

  test('message control changes nothing about what the rule reports', async () => {
    const [withControl, withoutControl] = await Promise.all([
      lintMdxPipeline(noLegacyOSNames, trailing),
      lintMdx(noLegacyOSNames, trailing),
    ])

    expect(withControl.map((message) => message.reason)).toEqual(
      withoutControl.map((message) => message.reason),
    )
  })

  test('still honours an inline disable comment', async () => {
    const messages = await lintMdxPipeline(
      noLegacyOSNames,
      [
        '# Title',
        '',
        '{/* lint disable no-legacy-os-names */}',
        '',
        '<Term name="MicroOS" />',
      ].join('\n'),
    )

    expect(messages).toHaveLength(0)
  })
})
