import path from 'node:path'

import { describe, expect, test } from '@rstest/core'
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'
import { unified } from 'unified'
import { VFile } from 'vfile'

import { fileNaming } from '#remark-lint/file-naming.ts'
import { getConfig } from '#remark-lint/utils.ts'

const processor = unified().use(remarkParse).use(remarkStringify)

const { config } = await getConfig()

async function lintWithPath(filePath: string) {
  const file = await processor()
    .use(fileNaming as unknown as Parameters<typeof processor.use>[0])
    .process(
      new VFile({
        value: '# Test\n',
        path: path.resolve(config.root!, filePath),
      }),
    )
  return file.messages
}

describe('file-naming', () => {
  test('allows valid simple filename', async () => {
    const messages = await lintWithPath('getting_started.md')
    expect(messages).toHaveLength(0)
  })

  test('allows valid filename with numbers', async () => {
    const messages = await lintWithPath('chapter1.md')
    expect(messages).toHaveLength(0)
  })

  test('allows underscore prefix', async () => {
    const messages = await lintWithPath('_sidebar.md')
    expect(messages).toHaveLength(0)
  })

  test('allows mdx extension', async () => {
    const messages = await lintWithPath('my_component.mdx')
    expect(messages).toHaveLength(0)
  })

  test('flags uppercase letters', async () => {
    const messages = await lintWithPath('GettingStarted.md')
    expect(messages).toHaveLength(1)
    expect(String(messages[0])).toContain('GettingStarted')
  })

  test('flags hyphens', async () => {
    const messages = await lintWithPath('getting-started.md')
    expect(messages).toHaveLength(1)
    expect(String(messages[0])).toContain('getting-started')
  })

  test('flags trailing underscore', async () => {
    const messages = await lintWithPath('getting_started_.md')
    expect(messages).toHaveLength(1)
    expect(String(messages[0])).toContain('getting_started_')
  })

  test('validates parent directory for index.md', async () => {
    const messages = await lintWithPath('getting_started/index.md')
    expect(messages).toHaveLength(0)
  })

  test('flags invalid parent directory for index.md', async () => {
    const messages = await lintWithPath('Getting-Started/index.md')
    expect(messages).toHaveLength(1)
    expect(String(messages[0])).toContain('Getting-Started')
  })

  test('validates parent directory for index.mdx', async () => {
    const messages = await lintWithPath('my_section/index.mdx')
    expect(messages).toHaveLength(0)
  })

  test('ignores files in apis directory', async () => {
    const messages = await lintWithPath(
      `${config.lang ? config.lang + '/' : ''}apis/Deployment.mdx`,
    )
    expect(messages).toHaveLength(0)
  })

  test('skips when no basename available', async () => {
    const file = await processor()
      .use(fileNaming as unknown as Parameters<typeof processor.use>[0])
      .process(new VFile({ value: '# Test\n' }))
    expect(file.messages).toHaveLength(0)
  })
})
