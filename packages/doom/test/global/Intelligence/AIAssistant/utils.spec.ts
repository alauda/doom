import { describe, expect, test } from '@rstest/core'

import {
  consumeSSEEvents,
  getAnswerDelta,
  parseStreamContent,
} from '#global/Intelligence/AIAssistant/utils.ts'

describe('consumeSSEEvents', () => {
  test('parses sse data lines incrementally and keeps incomplete remainder', () => {
    const result = consumeSSEEvents(
      'event: trace\ndata: {"type":"metadata"}\ndata: hello\ndata: partial',
    )

    expect(result.events).toEqual([
      {
        event: 'trace',
        data: '{"type":"metadata"}',
      },
      {
        event: 'trace',
        data: 'hello',
      },
    ])
    expect(result.event).toBe('trace')
    expect(result.remainder).toBe('data: partial')
  })

  test('clears event type after blank line', () => {
    const result = consumeSSEEvents('event: trace\ndata: hello\n\n')

    expect(result.events).toEqual([
      {
        event: 'trace',
        data: 'hello',
      },
    ])
    expect(result.event).toBeUndefined()
    expect(result.remainder).toBe('')
  })

  test('preserves meaningful leading spaces in data lines', () => {
    const result = consumeSSEEvents('data: can\ndata:  speak\ndata:  english\n')

    expect(result.events).toEqual([
      {
        data: 'can',
      },
      {
        data: ' speak',
      },
      {
        data: ' english',
      },
    ])
  })
})

describe('getAnswerDelta', () => {
  test('ignores metadata and trace events', () => {
    expect(
      getAnswerDelta({
        data: '{"type":"metadata","history_truncated":true}',
      }),
    ).toBe('')
    expect(
      getAnswerDelta({
        event: 'trace',
        data: '{"content":"tool call"}',
      }),
    ).toBe('')
  })

  test('extracts plain text and json delta payloads', () => {
    expect(getAnswerDelta({ data: 'hello' })).toBe('hello')
    expect(
      getAnswerDelta({
        data: '{"type":"message.delta","delta":" world"}',
      }),
    ).toBe(' world')
  })
})

describe('parseStreamContent', () => {
  test('strips docs and thinking blocks from displayed content', () => {
    const parsed = parseStreamContent(
      '<docs>[{"id":1,"path":"/doc","content":"Doc","cos_sim":0.9}]</docs><think>reasoning</think>answer',
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
    expect(parsed.content).toBe('answer')
  })

  test('hides incomplete docs blocks and preserves in-progress thinking', () => {
    const parsed = parseStreamContent('prefix<docs>[{"id":1}]<think>reasoning')

    expect(parsed.refDocs).toEqual([])
    expect(parsed.thinkingProcess).toBe('reasoning')
    expect(parsed.content).toBe('prefix')
  })
})
