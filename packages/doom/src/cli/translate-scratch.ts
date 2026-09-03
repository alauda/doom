import fs from 'node:fs/promises'
import path from 'node:path'

import type {
  ExecutionEnv,
  ExecutionError as ExecutionErrorType,
  FileError as FileErrorType,
  FileInfo,
  Result,
  ShellExecOptions,
} from '@earendil-works/pi-agent-core'

/**
 * The namespace a translating agent lives in.
 *
 * Masking is what keeps a model from rewriting a link, an identifier or a code
 * block: those values are replaced by opaque placeholders before the document
 * is sent, so there is nothing in the model's context to rewrite. That
 * guarantee is a property of the *namespace*, not of any individual tool — the
 * unmasked bytes are never written into the scratch directory at all, so no
 * tool can return them and no tool has to remember not to.
 *
 * Which is exactly why the filesystem the tools run against has to be confined.
 * `NodeExecutionEnv` takes a `cwd`, but `cwd` only resolves *relative* paths:
 * an absolute path goes wherever it says. Without this wrapper an agent that
 * reads `/…/docs/en/install/installing.mdx` gets the real, unmasked source —
 * and everything downstream stays green, because nothing about the run looks
 * unusual. A protection that fails silently is the failure mode this whole
 * proposal exists to remove, so it gets a wrapper and a test that proves the
 * wrapper is load-bearing.
 */

/** Loaded lazily: pulling in pi costs ~450ms, and most doom commands never translate. */
export type PiNode = typeof import('@earendil-works/pi-agent-core/node')
export type PiCore = typeof import('@earendil-works/pi-agent-core')

export interface Pi {
  core: PiCore
  NodeExecutionEnv: PiNode['NodeExecutionEnv']
}

let loaded: Pi | undefined

export const loadPi = async (): Promise<Pi> => {
  loaded ??= {
    core: await import('@earendil-works/pi-agent-core'),
    NodeExecutionEnv: (await import('@earendil-works/pi-agent-core/node'))
      .NodeExecutionEnv,
  }
  return loaded
}

export interface JailedExecutionEnvOptions {
  /** Absolute path every operation is confined to. */
  root: string
  /** The environment being wrapped. */
  inner: ExecutionEnv
  /** `err`/`ok` and `FileError`/`ExecutionError` from pi, passed in to keep this module free of a static import. */
  pi: Pick<PiCore, 'err' | 'ok' | 'FileError' | 'ExecutionError'>
}

/**
 * Confines an {@link ExecutionEnv} to one directory.
 *
 * Anything addressed outside it comes back `not_found` — the same answer as a
 * path that does not exist, so the boundary does not double as an oracle for
 * what lives beyond it.
 */
export class JailedExecutionEnv implements ExecutionEnv {
  readonly cwd: string

  private readonly root: string
  private readonly inner: ExecutionEnv
  private readonly pi: JailedExecutionEnvOptions['pi']

  constructor({ root, inner, pi }: JailedExecutionEnvOptions) {
    this.root = path.resolve(root)
    this.cwd = this.root
    this.inner = inner
    this.pi = pi
  }

  /** `not_found` for everything outside, so the jail reveals nothing about what is out there. */
  private outside(addressed: string): Result<never, FileErrorType> {
    return this.pi.err(
      new this.pi.FileError(
        'not_found',
        `No such file or directory: ${addressed}`,
        addressed,
      ),
    )
  }

  /**
   * The addressed path, or `undefined` when it leaves the jail.
   *
   * Two checks, because either alone has a hole: the lexical one rejects
   * `../../etc/passwd` without touching the disk, and the symlink one rejects a
   * path that stays inside lexically but resolves outside.
   */
  private async confine(target: string) {
    const absolute = path.resolve(this.root, target)
    const relative = path.relative(this.root, absolute)
    if (
      relative !== '' &&
      (relative.startsWith('..') || path.isAbsolute(relative))
    ) {
      return undefined
    }
    // Follow symlinks on the deepest part of the path that exists. A link
    // created inside the jail could otherwise address anything on the machine.
    let existing = absolute
    for (;;) {
      try {
        const real = await fs.realpath(existing)
        const realRoot = await fs.realpath(this.root)
        const relativeReal = path.relative(realRoot, real)
        if (
          relativeReal !== '' &&
          (relativeReal.startsWith('..') || path.isAbsolute(relativeReal))
        ) {
          return undefined
        }
        return absolute
      } catch {
        const parent = path.dirname(existing)
        if (parent === existing) {
          return absolute
        }
        existing = parent
      }
    }
  }

  private async withPath<T>(
    target: string,
    run: (absolute: string) => Promise<Result<T, FileErrorType>>,
  ): Promise<Result<T, FileErrorType>> {
    const absolute = await this.confine(target)
    return absolute ? run(absolute) : this.outside(target)
  }

  absolutePath(target: string) {
    return this.withPath(target, (absolute) =>
      Promise.resolve(this.pi.ok<string, FileErrorType>(absolute)),
    )
  }

  async joinPath(parts: string[]) {
    return this.withPath(path.join(...parts), (absolute) =>
      Promise.resolve(this.pi.ok<string, FileErrorType>(absolute)),
    )
  }

  /**
   * Refused outright.
   *
   * The agent is given no shell tool, so nothing should reach this. It refuses
   * anyway: the reason there is no shell is that a shell reads any file and runs
   * any command in the build container, and that reason does not stop being true
   * if someone later adds a tool that uses `exec`.
   */
  exec(
    command: string,
    options?: ShellExecOptions,
  ): Promise<
    Result<
      { stdout: string; stderr: string; exitCode: number },
      ExecutionErrorType
    >
  > {
    void command
    void options
    return Promise.resolve(
      this.pi.err(
        new this.pi.ExecutionError(
          'shell_unavailable',
          'No shell is available while translating.',
        ),
      ),
    )
  }

  readTextFile(target: string, abortSignal?: AbortSignal) {
    return this.withPath(target, (absolute) =>
      this.inner.readTextFile(absolute, abortSignal),
    )
  }

  readTextLines(
    target: string,
    options?: { maxLines?: number; abortSignal?: AbortSignal },
  ) {
    return this.withPath(target, (absolute) =>
      this.inner.readTextLines(absolute, options),
    )
  }

  readBinaryFile(target: string, abortSignal?: AbortSignal) {
    return this.withPath(target, (absolute) =>
      this.inner.readBinaryFile(absolute, abortSignal),
    )
  }

  writeFile(
    target: string,
    content: string | Uint8Array,
    abortSignal?: AbortSignal,
  ) {
    return this.withPath(target, (absolute) =>
      this.inner.writeFile(absolute, content, abortSignal),
    )
  }

  appendFile(
    target: string,
    content: string | Uint8Array,
    abortSignal?: AbortSignal,
  ) {
    return this.withPath(target, (absolute) =>
      this.inner.appendFile(absolute, content, abortSignal),
    )
  }

  async renameFile(
    sourcePath: string,
    destinationPath: string,
    abortSignal?: AbortSignal,
  ) {
    const destination = await this.confine(destinationPath)
    if (!destination) {
      return this.outside(destinationPath)
    }
    return this.withPath(sourcePath, (absolute) =>
      this.inner.renameFile(absolute, destination, abortSignal),
    )
  }

  fileInfo(target: string, abortSignal?: AbortSignal) {
    return this.withPath(target, (absolute) =>
      this.inner.fileInfo(absolute, abortSignal),
    )
  }

  listDir(
    target: string,
    abortSignal?: AbortSignal,
  ): Promise<Result<FileInfo[], FileErrorType>> {
    return this.withPath(target, (absolute) =>
      this.inner.listDir(absolute, abortSignal),
    )
  }

  canonicalPath(target: string, abortSignal?: AbortSignal) {
    return this.withPath(target, (absolute) =>
      this.inner.canonicalPath(absolute, abortSignal),
    )
  }

  exists(target: string, abortSignal?: AbortSignal) {
    return this.withPath(target, (absolute) =>
      this.inner.exists(absolute, abortSignal),
    )
  }

  createDir(
    target: string,
    options?: { recursive?: boolean; abortSignal?: AbortSignal },
  ) {
    return this.withPath(target, (absolute) =>
      this.inner.createDir(absolute, options),
    )
  }

  remove(
    target: string,
    options?: {
      recursive?: boolean
      force?: boolean
      abortSignal?: AbortSignal
    },
  ) {
    return this.withPath(target, (absolute) =>
      this.inner.remove(absolute, options),
    )
  }

  /** Redirected inside the jail: the wrapped environment would use the system temp directory. */
  async createTempDir(prefix = 'tmp-', abortSignal?: AbortSignal) {
    const base = path.join(this.root, '.tmp')
    await fs.mkdir(base, { recursive: true })
    return this.withPath(base, () =>
      this.innerTempDir(base, prefix, abortSignal),
    )
  }

  private async innerTempDir(
    base: string,
    prefix: string,
    abortSignal?: AbortSignal,
  ): Promise<Result<string, FileErrorType>> {
    void abortSignal
    try {
      return this.pi.ok(await fs.mkdtemp(path.join(base, prefix)))
    } catch (error) {
      return this.pi.err(
        new this.pi.FileError(
          'unknown',
          `Could not create a temporary directory: ${error instanceof Error ? error.message : String(error)}`,
          base,
        ),
      )
    }
  }

  /** Redirected inside the jail, for the same reason as {@link createTempDir}. */
  async createTempFile(options?: {
    prefix?: string
    suffix?: string
    abortSignal?: AbortSignal
  }): Promise<Result<string, FileErrorType>> {
    const directory = await this.createTempDir('tmp-')
    if (!directory.ok) {
      return directory
    }
    const target = path.join(
      directory.value,
      `${options?.prefix ?? ''}file${options?.suffix ?? ''}`,
    )
    const written = await this.inner.writeFile(target, '')
    return written.ok ? this.pi.ok(target) : written
  }

  cleanup() {
    return this.inner.cleanup()
  }
}

/** Where the two documents live inside a scratch directory. */
export const SCRATCH_SOURCE = 'source'
export const SCRATCH_TRANSLATION = 'translation'

export interface Scratch {
  /** Absolute path of the scratch directory. */
  root: string
  /** The confined environment the agent's tools run against. */
  env: ExecutionEnv
  /** Path of the masked source, as the agent addresses it. */
  sourcePath: string
  /** Path of the document the agent produces, as the agent addresses it. */
  translationPath: string
  /** Whatever the agent has produced so far. */
  readTranslation(): Promise<string>
  /** Removes the directory. Best effort. */
  dispose(): Promise<void>
}

export interface CreateScratchOptions {
  /** Directory to create the scratch inside. */
  parentDir: string
  /** A name that makes the directory recognisable in a build log. */
  label: string
  /** The masked source document — never the raw one. */
  maskedSource: string
  /** `.mdx` or `.md`; kept so the agent sees the extension it is writing for. */
  extension: string
  /**
   * What the translation file starts as.
   *
   * Empty for a translation being written from nothing; the best rejected
   * attempt when a repair agent is being asked to fix one rather than to
   * produce one.
   */
  draft?: string
}

export const createScratch = async ({
  parentDir,
  label,
  maskedSource,
  extension,
  draft = '',
}: CreateScratchOptions): Promise<Scratch> => {
  const pi = await loadPi()
  await fs.mkdir(parentDir, { recursive: true })
  const root = await fs.mkdtemp(path.join(parentDir, `${label}-`))

  const sourcePath = path.join(root, `${SCRATCH_SOURCE}${extension}`)
  const translationPath = path.join(root, `${SCRATCH_TRANSLATION}${extension}`)

  await fs.writeFile(sourcePath, maskedSource)
  await fs.writeFile(translationPath, draft)

  const env = new JailedExecutionEnv({
    root,
    inner: new pi.NodeExecutionEnv({ cwd: root }),
    pi: pi.core,
  })

  return {
    root,
    env,
    sourcePath,
    translationPath,
    readTranslation: () => fs.readFile(translationPath, 'utf8'),
    dispose: () => fs.rm(root, { recursive: true, force: true }),
  }
}
