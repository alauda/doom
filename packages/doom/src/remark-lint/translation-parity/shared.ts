import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'

import type { Nodes, Root } from 'mdast'
import type { MdxJsxFlowElement, MdxJsxTextElement } from 'mdast-util-mdx'
import picomatch from 'picomatch'
import { visit } from 'unist-util-visit'
import type { VFile } from 'vfile'
import { parse as parseYaml } from 'yaml'

import { escapeMarkdownHeadingIds } from '../../cli/helpers.ts'
import {
  DEFAULT_COPY_ONLY_DIRECTORIES,
  SUPPORTED_LANGUAGES,
} from '../../shared/index.ts'
import { syntaxProcessor } from '../syntax-plugins.ts'
import { getConfig } from '../utils.ts'

/**
 * Shared plumbing for the `translation-parity` rules.
 *
 * These are the only lint rules that need a *second* document: they compare a
 * translation against the source it was made from. Everything they can say
 * follows from that pairing, so getting the pairing right — and refusing to
 * report anything when it is not right — is most of the work.
 *
 * The pairing itself is exact rather than heuristic: `doom translate` writes
 * `sourceSHA` (the sha256 of the source file's bytes) into every translation it
 * produces, so a translation and a source either belong together or do not.
 * There is no "probably the same version" state to reason about.
 */

export interface TranslationPair {
  /** language the document was translated from, e.g. `en` */
  sourceLang: string
  /** language of the document being linted, e.g. `zh` */
  targetLang: string
  /** path inside the locale directory, e.g. `install/installing.mdx` */
  relativePath: string
  /** absolute path of the source document */
  sourcePath: string
  sourceRaw: string
  sourceTree: Root
  sourceFrontmatter: Record<string, unknown>
  targetFrontmatter: Record<string, unknown>
  /**
   * The document is copied rather than translated (`translate.copyOnlyDirectories`).
   * Its structure must still match its source, but it is *supposed* to still be
   * in the source language — so asking whether it reads as Chinese asks the
   * wrong question of the right file.
   */
  isCopyOnly: boolean
}

export type TranslationStatus =
  /** not under the docs root, or is itself the source language */
  | { kind: 'not-a-translation' }
  /**
   * No `sourceSHA`: the document is maintained by hand — the documented escape
   * hatch is `i18n.disableAutoTranslation` in the source's frontmatter. Nothing
   * here can say anything about it.
   */
  | { kind: 'unmanaged' }
  | { kind: 'source-missing'; sourcePath: string }
  | { kind: 'stale'; sourcePath: string; expected: string; actual: string }
  | { kind: 'current'; pair: TranslationPair }

const matcherCache = new Map<string, (value: string) => boolean>()

/** Memoised, because it is asked once per document and the patterns never change. */
const isCopyOnlyMatcher = (patterns: readonly string[]) => {
  const key = patterns.join('\u0000')
  let matcher = matcherCache.get(key)
  if (!matcher) {
    // Same matcher tinyglobby uses to select these files in `doom translate`,
    // so what is checked here is exactly what is copied there.
    matcher = picomatch([...patterns])
    matcherCache.set(key, matcher)
  }
  return matcher
}

const frontmatterOf = (tree: Root): Record<string, unknown> => {
  const first = tree.children.at(0)
  if (first?.type !== 'yaml') {
    return {}
  }
  return (parseYaml(first.value) as Record<string, unknown> | null) ?? {}
}

interface CachedSource {
  sha: string
  raw: string
  tree: Root
}

const sourceCache = new Map<string, CachedSource>()

const loadSource = async (sourcePath: string): Promise<CachedSource> => {
  const raw = await fs.readFile(sourcePath, 'utf8')
  const sha = crypto.createHash('sha256').update(raw).digest('hex')
  const cached = sourceCache.get(sourcePath)
  if (cached?.sha === sha) {
    return cached
  }
  // The same syntax stack the document being linted came through: a
  // comparison between two differently-parsed trees measures the parsers.
  const processor = sourcePath.endsWith('.mdx')
    ? syntaxProcessor.mdx
    : syntaxProcessor.md
  // The same escaping `doom translate` applies before parsing: without it a
  // custom heading anchor is an MDX expression and the parse fails outright.
  const entry = {
    sha,
    raw,
    tree: processor.parse(escapeMarkdownHeadingIds(raw)),
  }
  sourceCache.set(sourcePath, entry)
  return entry
}

/**
 * Works out whether the document being linted is a translation, and if so
 * whether it still corresponds to its source.
 */
export const resolveTranslation = async (
  tree: Root,
  vfile: VFile,
): Promise<TranslationStatus> => {
  const { config } = await getConfig()
  const root = config.root
  if (!root || !vfile.path) {
    return { kind: 'not-a-translation' }
  }

  const relative = path.relative(root, vfile.path)
  if (relative.startsWith('..')) {
    return { kind: 'not-a-translation' }
  }

  const segments = relative.split(path.sep)
  const targetLang = segments[0]
  const sourceLang = config.lang ?? 'en'
  if (
    segments.length < 2 ||
    targetLang === sourceLang ||
    !SUPPORTED_LANGUAGES.includes(targetLang as never)
  ) {
    return { kind: 'not-a-translation' }
  }

  const targetFrontmatter = frontmatterOf(tree)
  const declared = targetFrontmatter.sourceSHA
  if (typeof declared !== 'string') {
    return { kind: 'unmanaged' }
  }

  const relativePath = segments.slice(1).join('/')
  const sourcePath = path.join(root, sourceLang, ...segments.slice(1))

  let source: CachedSource
  try {
    source = await loadSource(sourcePath)
  } catch {
    return { kind: 'source-missing', sourcePath }
  }

  if (source.sha !== declared) {
    return {
      kind: 'stale',
      sourcePath,
      expected: source.sha,
      actual: declared,
    }
  }

  return {
    kind: 'current',
    pair: {
      sourceLang,
      targetLang,
      relativePath,
      sourcePath,
      sourceRaw: source.raw,
      sourceTree: source.tree,
      sourceFrontmatter: frontmatterOf(source.tree),
      targetFrontmatter,
      isCopyOnly: isCopyOnlyMatcher(
        config.translate?.copyOnlyDirectories ?? DEFAULT_COPY_ONLY_DIRECTORIES,
      )(relativePath),
    },
  }
}

/** Resolves the pair, or nothing at all when there is nothing to compare. */
export const currentPair = async (tree: Root, vfile: VFile) => {
  const status = await resolveTranslation(tree, vfile)
  return status.kind === 'current' ? status.pair : undefined
}

// ---------------------------------------------------------------------------
// Collectors — everything below reads a tree and returns something comparable.
// ---------------------------------------------------------------------------

const isJsxElement = (
  node: Nodes,
): node is MdxJsxFlowElement | MdxJsxTextElement =>
  node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement'

/** Open tags of every component used in a document, counted by name. */
export const collectComponents = (tree: Root) => {
  const counts = new Map<string, number>()
  visit(tree, (node) => {
    if (isJsxElement(node) && node.name) {
      counts.set(node.name, (counts.get(node.name) ?? 0) + 1)
    }
  })
  return counts
}

/** The document's heading levels, in order. */
export const collectHeadingDepths = (tree: Root) => {
  const depths: number[] = []
  visit(tree, 'heading', (node) => {
    depths.push(node.depth)
  })
  return depths
}

/**
 * Every JSX attribute that carries a literal string value, keyed
 * `Component.attribute`. Expression values are read through to their source
 * text, which is what has to stay byte-identical.
 */
export const collectJsxAttributes = (tree: Root) => {
  const values = new Map<string, string[]>()
  visit(tree, (node) => {
    if (!isJsxElement(node) || !node.name) {
      return
    }
    for (const attr of node.attributes) {
      if (attr.type === 'mdxJsxExpressionAttribute') {
        push(values, `${node.name}.{...}`, attr.value)
        continue
      }
      if (attr.value == null) {
        continue
      }
      push(
        values,
        `${node.name}.${attr.name}`,
        typeof attr.value === 'string' ? attr.value : attr.value.value,
      )
    }
  })
  return values
}

const push = (map: Map<string, string[]>, key: string, value: string) => {
  const list = map.get(key)
  if (list) {
    list.push(value)
  } else {
    map.set(key, [value])
  }
}

const EXTERNAL_URL = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i
const LOCALE_PREFIX = new RegExp(
  `^/(?:${SUPPORTED_LANGUAGES.join('|')})(?=/|$)`,
)

/**
 * Resolves a link the way the site does — against the position of the document
 * that holds it — and then drops the language segment.
 *
 * This is what makes source and translation comparable at all. A translation's
 * links legitimately differ from the source's as *written*: assets are rewritten
 * to point back into the source-language tree (`../../../en/…/x.png`) because
 * they are not copied per language. Resolved and de-localised, both spellings
 * name the same file, so anything still different is a real difference.
 */
export const resolveLinkTarget = (url: string, docDirInRoot: string) => {
  const trimmed = url.trim()
  if (!trimmed || EXTERNAL_URL.test(trimmed) || trimmed.startsWith('#')) {
    return trimmed
  }
  const hashAt = trimmed.indexOf('#')
  const target = hashAt < 0 ? trimmed : trimmed.slice(0, hashAt)
  const hash = hashAt < 0 ? '' : trimmed.slice(hashAt)
  if (!target) {
    return trimmed
  }
  const absolute = target.startsWith('/')
    ? path.posix.normalize(target)
    : path.posix.resolve(`/${docDirInRoot}`, target)
  return absolute.replace(LOCALE_PREFIX, '') + hash
}

const LINK_ATTRIBUTES = new Set(['href', 'src'])
const HTML_LINK_ATTRIBUTE = /\b(?:href|src)\s*=\s*(["'])(.*?)\1/gi

/**
 * Every link target a document points at: markdown links and images, reference
 * definitions, `href`/`src` on components, and the same inside raw HTML.
 */
export const collectLinkTargets = (tree: Root, docDirInRoot: string) => {
  const targets: string[] = []
  const add = (url: string) => {
    const resolved = resolveLinkTarget(url, docDirInRoot)
    if (resolved) {
      targets.push(resolved)
    }
  }

  visit(tree, (node) => {
    switch (node.type) {
      case 'link':
      case 'image':
      case 'definition': {
        add(node.url)
        return
      }
      case 'html': {
        for (const [, , value] of node.value.matchAll(HTML_LINK_ATTRIBUTE)) {
          add(value)
        }
        return
      }
      default: {
        if (!isJsxElement(node)) {
          return
        }
        for (const attr of node.attributes) {
          if (
            attr.type === 'mdxJsxAttribute' &&
            LINK_ATTRIBUTES.has(attr.name) &&
            typeof attr.value === 'string'
          ) {
            add(attr.value)
          }
        }
      }
    }
  })

  return targets
}

/** Multiset difference, reported as what is missing and what is extra. */
export const diffMultiset = (
  expected: readonly string[],
  actual: readonly string[],
) => {
  const counts = new Map<string, number>()
  for (const value of expected) {
    counts.set(value, (counts.get(value) ?? 0) + 1)
  }
  for (const value of actual) {
    counts.set(value, (counts.get(value) ?? 0) - 1)
  }
  const missing: string[] = []
  const extra: string[] = []
  for (const [value, delta] of counts) {
    for (let i = 0; i < delta; i++) {
      missing.push(value)
    }
    for (let i = 0; i < -delta; i++) {
      extra.push(value)
    }
  }
  return { missing: missing.sort(), extra: extra.sort() }
}

/**
 * The document's prose — the text a reader reads, and the only text a
 * translation is supposed to change.
 *
 * Code, inline code and component attributes are excluded because they are not
 * prose: counting them would make a page full of `kubectl` commands look
 * untranslated, and would make a translated page look longer or shorter than it
 * is for reasons that have nothing to do with the translation.
 */
export const collectProseText = (tree: Root) => {
  const parts: string[] = []
  visit(tree, 'text', (node) => {
    parts.push(node.value)
  })
  return parts.join(' ')
}

/** The directory a document sits in, relative to the docs root, in posix form. */
export const docDirInRoot = (targetLang: string, relativePath: string) => {
  const dir = path.posix.dirname(`${targetLang}/${relativePath}`)
  return dir === '.' ? '' : dir
}
