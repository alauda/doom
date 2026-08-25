import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { NodeExecutionEnv } from '@earendil-works/pi-agent-core/node'
import { afterAll, beforeAll, describe, expect, test } from '@rstest/core'

import { createScratch } from '#cli/translate-scratch.ts'

/**
 * The jail is the reason masking holds.
 *
 * Every case here is paired with the same call against an unjailed
 * `NodeExecutionEnv`. That pairing is the point: it shows what the agent would
 * have been able to reach, so the test fails if the jail is ever removed or
 * bypassed, rather than passing vacuously against a filesystem that happens not
 * to contain anything interesting.
 */

let workspace: string
let secretPath: string
const SECRET = 'the unmasked source, with real links: [x](../real/target.mdx)'

beforeAll(async () => {
  workspace = await fs.mkdtemp(path.join(os.tmpdir(), 'doom-jail-'))
  secretPath = path.join(workspace, 'en-source.mdx')
  await fs.writeFile(secretPath, SECRET)
})

afterAll(async () => {
  await fs.rm(workspace, { recursive: true, force: true })
})

const scratchIn = (label: string) =>
  createScratch({
    parentDir: path.join(workspace, 'scratch'),
    label,
    maskedSource: '# Title\n\nSee __DOOM_TR_LINK_0__.\n',
    extension: '.mdx',
  })

describe('the scratch directory an agent translates in', () => {
  test('the agent can read the masked source it was given', async () => {
    const scratch = await scratchIn('reads')
    const read = await scratch.env.readTextFile(scratch.sourcePath)
    expect(read.ok).toBe(true)
    expect(read.ok && read.value).toContain('__DOOM_TR_LINK_0__')
    await scratch.dispose()
  })

  test('an absolute path outside the scratch is not found — and would be readable without the jail', async () => {
    const scratch = await scratchIn('absolute')

    const jailed = await scratch.env.readTextFile(secretPath)
    expect(jailed.ok).toBe(false)
    expect(!jailed.ok && jailed.error.code).toBe('not_found')

    // What the agent would have got instead. `cwd` only resolves relative
    // paths, so the unmasked source is one absolute path away.
    const unjailed = await new NodeExecutionEnv({
      cwd: scratch.root,
    }).readTextFile(secretPath)
    expect(unjailed.ok).toBe(true)
    expect(unjailed.ok && unjailed.value).toBe(SECRET)

    await scratch.dispose()
  })

  test('climbing out with `..` is not found', async () => {
    const scratch = await scratchIn('traversal')
    const escape = path.relative(scratch.root, secretPath)
    expect(escape.startsWith('..')).toBe(true)

    const jailed = await scratch.env.readTextFile(escape)
    expect(jailed.ok).toBe(false)
    expect(!jailed.ok && jailed.error.code).toBe('not_found')

    const unjailed = await new NodeExecutionEnv({
      cwd: scratch.root,
    }).readTextFile(escape)
    expect(unjailed.ok).toBe(true)

    await scratch.dispose()
  })

  test('a symlink that stays inside lexically but points outside is not found', async () => {
    const scratch = await scratchIn('symlink')
    const link = path.join(scratch.root, 'looks-local.mdx')
    await fs.symlink(secretPath, link)

    const jailed = await scratch.env.readTextFile(link)
    expect(jailed.ok).toBe(false)
    expect(!jailed.ok && jailed.error.code).toBe('not_found')

    const unjailed = await new NodeExecutionEnv({
      cwd: scratch.root,
    }).readTextFile(link)
    expect(unjailed.ok).toBe(true)
    expect(unjailed.ok && unjailed.value).toBe(SECRET)

    await scratch.dispose()
  })

  test('writing outside the scratch is not found, and leaves the target alone', async () => {
    const scratch = await scratchIn('write')
    const victim = path.join(workspace, 'victim.mdx')
    await fs.writeFile(victim, 'original')

    const jailed = await scratch.env.writeFile(victim, 'overwritten')
    expect(jailed.ok).toBe(false)
    expect(!jailed.ok && jailed.error.code).toBe('not_found')
    expect(await fs.readFile(victim, 'utf8')).toBe('original')

    await scratch.dispose()
  })

  test('renaming out of the scratch is refused', async () => {
    const scratch = await scratchIn('rename')
    const escaped = await scratch.env.renameFile(
      scratch.translationPath,
      path.join(workspace, 'stolen.mdx'),
    )
    expect(escaped.ok).toBe(false)
    expect(!escaped.ok && escaped.error.code).toBe('not_found')
    await scratch.dispose()
  })

  test('listing a directory outside is not found', async () => {
    const scratch = await scratchIn('list')
    const listed = await scratch.env.listDir(workspace)
    expect(listed.ok).toBe(false)
    expect(!listed.ok && listed.error.code).toBe('not_found')
    await scratch.dispose()
  })

  test('there is no shell', async () => {
    const scratch = await scratchIn('shell')
    const ran = await scratch.env.exec(`cat ${secretPath}`)
    expect(ran.ok).toBe(false)
    expect(!ran.ok && ran.error.code).toBe('shell_unavailable')
    await scratch.dispose()
  })

  test('temporary files are created inside the scratch, not in the system temp directory', async () => {
    const scratch = await scratchIn('temp')
    const directory = await scratch.env.createTempDir()
    expect(directory.ok).toBe(true)
    expect(
      directory.ok &&
        path.relative(scratch.root, directory.value).startsWith('..'),
    ).toBe(false)

    const file = await scratch.env.createTempFile({ suffix: '.mdx' })
    expect(file.ok).toBe(true)
    expect(
      file.ok && path.relative(scratch.root, file.value).startsWith('..'),
    ).toBe(false)
    await scratch.dispose()
  })

  test('the agent writes its translation where the harness reads it', async () => {
    const scratch = await scratchIn('roundtrip')
    const written = await scratch.env.writeFile(
      scratch.translationPath,
      '# 标题\n',
    )
    expect(written.ok).toBe(true)
    expect(await scratch.readTranslation()).toBe('# 标题\n')
    await scratch.dispose()
  })
})
