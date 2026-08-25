import { describe, expect, test } from '@rstest/core'

import { lint, lintMdxPipeline } from './_helper.ts'

import { noUnparsedEmphasis } from '#remark-lint/no-unparsed-emphasis.ts'

/**
 * The `**` cases here are the shapes actually found on the acp-docs corpus:
 * a table header written `|** Parameter **|`, an unclosed run, and a Chinese
 * translation whose closing delimiter is followed by a letter. The `__` cases
 * are from the CommonMark rules — that delimiter does not occur in the corpus
 * at all, so the tests are the only thing holding it up.
 */

describe('no-unparsed-emphasis', () => {
  test('says nothing about emphasis that works', async () => {
    for (const markdown of [
      'This is **bold** text.\n',
      'This is __bold__ text.\n',
      'This is *italic* and _italic_.\n',
      '**注意**：这一句是粗体。\n',
      'A path like `a/**/b` is code, not emphasis.\n',
      'Intraword underscores such as snake__case stay alone.\n',
    ]) {
      const messages = await lint(noUnparsedEmphasis, markdown)
      expect([markdown, messages.length]).toEqual([markdown, 0])
    }
  })

  test('flags delimiters padded with spaces — the table-header shape', async () => {
    const messages = await lint(
      noUnparsedEmphasis,
      '| ** Parameter ** | Description |\n| --- | --- |\n| a | b |\n',
    )
    expect(messages).toHaveLength(1)
    expect(String(messages[0])).toContain('printed to the page')
  })

  test('flags a closing delimiter that is followed by a letter', async () => {
    // What a translation produces when it drops the space the source had:
    // `**Important:** Before…` becomes `**重要提示：**卸载…`.
    const messages = await lint(
      noUnparsedEmphasis,
      '\\*\\*重要提示：\\*\\*卸载插件前，必须先卸载依赖插件。\n',
    )
    expect(messages).toHaveLength(1)
    expect(String(messages[0])).toContain('**')
  })

  test('flags a run that is never closed', async () => {
    const messages = await lint(
      noUnparsedEmphasis,
      'Set **Failed jobs history limit** (default: 20)** somewhere.\n',
    )
    expect(messages).toHaveLength(1)
  })

  test('flags a stranded `__` at a word boundary', async () => {
    const messages = await lint(noUnparsedEmphasis, 'Set __ bold __ here.\n')
    expect(messages).toHaveLength(1)
  })

  test('survives message control — it is not swallowed at the end of a document', async () => {
    const messages = await lintMdxPipeline(
      noUnparsedEmphasis,
      '# Title\n\n** Parameter **\n\n<K8sAPI name="v1.Pod" />\n',
    )
    expect(messages).toHaveLength(1)
  })

  test('a document that means the asterisks can say so', async () => {
    const messages = await lintMdxPipeline(
      noUnparsedEmphasis,
      '# Title\n\n{/* lint disable no-unparsed-emphasis */}\n\nWrite ** like this ** to get literal asterisks.\n',
    )
    expect(messages).toHaveLength(0)
  })
})
