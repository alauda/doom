import { describe, expect, test } from '@rstest/core'

import { lint } from './_helper.ts'

import { noUnopenedFrontmatter } from '#remark-lint/no-unopened-frontmatter.ts'

/**
 * The shape here is the one found on acp-docs: a document opening
 * `weight: 13` / `---`, which markdown reads as a level-two heading called
 * "weight: 13" rather than as frontmatter.
 */

describe('no-unopened-frontmatter', () => {
  test('says nothing about frontmatter that opened', async () => {
    const messages = await lint(
      noUnopenedFrontmatter,
      '---\nweight: 13\n---\n\n# Title\n\nBody.\n',
    )
    expect(messages).toHaveLength(0)
  })

  test('says nothing about a document that simply has no frontmatter', async () => {
    // 88 of acp-docs' 914 English documents are like this — generated api
    // pages and index pages. A rule that reported them would report 88 files
    // to find one bug.
    const messages = await lint(noUnopenedFrontmatter, '# Overview\n\nBody.\n')
    expect(messages).toHaveLength(0)
  })

  test('flags a frontmatter key underlined into a heading', async () => {
    const messages = await lint(
      noUnopenedFrontmatter,
      'weight: 13\n---\n\n# Automatic Interconnection of Subnets\n\nBody.\n',
    )
    expect(messages).toHaveLength(1)
    expect(String(messages[0])).toContain('weight: 13')
    expect(String(messages[0])).toContain('never opened')
  })

  test('leaves an ordinary heading that happens to contain a colon alone', async () => {
    for (const markdown of [
      '## Note: read this first\n\nBody.\n',
      '## Step 1: install\n\nBody.\n',
      'Note: read this first\n---\n\nBody.\n',
    ]) {
      const messages = await lint(noUnopenedFrontmatter, markdown)
      expect([markdown, messages.length]).toEqual([markdown, 0])
    }
  })

  test('only the first node counts', async () => {
    // A heading further down that reads like a key is someone writing about
    // frontmatter, not frontmatter that failed to open.
    const messages = await lint(
      noUnopenedFrontmatter,
      '# Title\n\nSet the weight:\n\n## weight: 13\n\nBody.\n',
    )
    expect(messages).toHaveLength(0)
  })
})
