import { describe, expect, test } from '@rstest/core'

import {
  formatSmartDocMarkdown,
  parseSmartDocMessage,
  parseStreamContent,
  SmartDocSseParser,
} from '#global/Intelligence/AIAssistant/utils.ts'

describe('SmartDocSseParser', () => {
  test('filters metadata events and replaces trace tags', () => {
    const parser = new SmartDocSseParser()

    const firstChunk = parser.push('data: hel')
    expect(firstChunk.content).toBe('')
    expect(firstChunk.pending).toBe('data: hel')

    const secondChunk = parser.push(
      'lo \n\ndata: {"type":"metadata","title":"ignore me"}\n\ndata: <trace>ok</trace>\n\ndata: [DONE]\n\n',
    )

    expect(secondChunk.content).toBe('hello <plg-hf-trace>ok</plg-hf-trace>')
    expect(secondChunk.pending).toBe('')
    expect(secondChunk.events).toHaveLength(4)
    expect(secondChunk.events[1].isMetadata).toBe(true)
    expect(secondChunk.events[3].isTerminal).toBe(true)
  })

  test('keeps docs blocks in the snapshot when configured for ref doc extraction', () => {
    const parser = new SmartDocSseParser({
      ignoreDocsBlocks: false,
    })

    parser.push('data: <docs>\n\n')
    parser.push(
      'data: [{"id":1,"path":"/doc","content":"Doc","cos_sim":0.9}]\n\n',
    )
    const result = parser.push('data: </docs>\n\ndata: answer\n\n')

    expect(result.content).toBe(
      '<docs>[{"id":1,"path":"/doc","content":"Doc","cos_sim":0.9}]</docs>answer',
    )
  })
})

describe('parseSmartDocMessage', () => {
  test('extracts docs, think blocks, errors, and final result', () => {
    const result = parseSmartDocMessage(
      '<docs>[{"id":1,"path":"/doc","content":"Doc","cos_sim":0.9}]</docs><think>reasoning</think>final answer<error>warning</error>',
    )

    expect(result.result).toBe('final answer')
    expect(result.thoughtProcess).toBe('reasoning')
    expect(result.errors).toEqual(['warning'])
    expect(result.refDocs).toEqual([
      {
        id: 1,
        path: '/doc',
        content: 'Doc',
        cos_sim: 0.9,
      },
    ])
  })
})

describe('formatSmartDocMarkdown', () => {
  test('converts parsed content into readable markdown', () => {
    const result = formatSmartDocMarkdown(
      [
        'Intro---**1. Preparation Stage**Before running any installation commands, complete the following:• First item.  • Second item.',
        '**Step 1: Run commands**On node:tar -xvf package.tar -C /tmp',
        'cd /tmp',
        'Notes:  • Keep disk space.',
      ].join('\n'),
    )

    expect(result).toContain('## 1. Preparation Stage')
    expect(result).toContain('- First item.')
    expect(result).toContain('- Second item.')
    expect(result).toContain('### Step 1: Run commands')
    expect(result).toContain('On node:')
    expect(result).toContain('tar -xvf package.tar -C /tmp')
    expect(result).toContain('cd /tmp')
    expect(result).toContain('**Notes:**')
  })
})

describe('parseStreamContent', () => {
  test('keeps ref docs for existing UI rendering and formats the answer markdown', () => {
    const parsed = parseStreamContent(
      '<docs>[{"id":1,"path":"/doc","content":"Doc","cos_sim":0.9}]</docs><think>reasoning</think>Intro---**1. Preparation Stage**Before running any installation commands:• First item.',
    )

    expect(parsed.refDocs).toEqual([
      {
        id: 1,
        path: '/doc',
        content: 'Doc',
        cos_sim: 0.9,
      },
    ])
    expect(parsed.thinkingProcess).toBe('reasoning')
    expect(parsed.content).toContain('## 1. Preparation Stage')
    expect(parsed.content).toContain('- First item.')
  })

  test('hides incomplete docs blocks and preserves in-progress thinking', () => {
    const parsed = parseStreamContent('prefix<docs>[{"id":1}]<think>reasoning')

    expect(parsed.refDocs).toEqual([])
    expect(parsed.thinkingProcess).toBe('reasoning')
    expect(parsed.content).toBe('prefix')
  })
})
