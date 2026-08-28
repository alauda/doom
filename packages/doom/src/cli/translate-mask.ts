import type { Code, InlineCode, Link, Root } from 'mdast'
import type {
  MdxFlowExpression,
  MdxJsxAttributeValueExpression,
  MdxJsxFlowElement,
  MdxJsxTextElement,
  MdxTextExpression,
} from 'mdast-util-mdx'
import { visit } from 'unist-util-visit'

import { isTranslatableJsxAttr } from '../runtime/components/_translation-policy.ts'

/**
 * Deterministic masking for `doom translate`.
 *
 * Everything a translation model must not author — link targets, identifiers,
 * code, JSX attribute values — is replaced by an opaque placeholder before the
 * document is sent, and put back afterwards. The model never sees the real
 * value, so it cannot rewrite it; and because every placeholder is counted on
 * the way back, deleting or duplicating one is detected instead of shipped.
 *
 * This generalises the code-block mechanism that has been in `helpers.ts` (and
 * in production) all along; the prompt-level "do not touch links" instructions
 * it replaces were detailed, and documents still came back with rewritten
 * links.
 */

export type MaskKind =
  /** the trailing `{#custom-id}` of a heading */
  | 'ANCHOR'
  /** a fenced code block, including its language and meta */
  | 'CODE'
  /** the url of a link reference definition */
  | 'DEF'
  /** an MDX expression, such as a `cspell` pragma comment */
  | 'EXPR'
  /** a footnote label, shared by its reference(s) and its definition */
  | 'FNID'
  /** an `href=` / `src=` value inside a raw HTML node */
  | 'HTMLATTR'
  /** inline code */
  | 'ICODE'
  /** the url of a markdown image */
  | 'IMG'
  /** an MDX JSX attribute value */
  | 'JSXATTR'
  /** the url of a markdown link */
  | 'LINK'
  /** a link/image reference label, shared by its uses and its definition */
  | 'REFID'
  /** a bare URL written in prose (a GFM autolink literal), masked whole */
  | 'URL'

const PLACEHOLDER_PREFIX = '__DOOM_TR_'

const placeholderOf = (kind: MaskKind, index: number) =>
  `${PLACEHOLDER_PREFIX}${kind}_${index}__`

/**
 * Matches any placeholder. Case-insensitive on purpose: remark lower-cases
 * reference identifiers when the translated document is parsed back, so
 * `REFID`/`FNID` placeholders return in a different case than they left in.
 */
const PLACEHOLDER_PATTERN = /__DOOM_TR_[A-Z]+_\d+__/gi

/**
 * Matches a placeholder even after markdown has chewed on it.
 *
 * A placeholder that ends up in a prose text position does not survive intact:
 * the leading `__` is strong emphasis, so `__DOOM_TR_LINK_7__` parses into a
 * `strong` node wrapping `DOOM_TR_LINK_7`, and the stringifier escapes it back
 * out as `\_\_DOOM\_TR\_LINK\_7\_\_`. Either way the exact token is gone from
 * the tree — which is why hallucinated placeholders are hunted in the raw
 * response text (with escapes stripped) rather than in the parsed AST.
 */
const LOOSE_PLACEHOLDER_PATTERN = /_{0,2}DOOM_TR_([A-Z]+)_(\d+)_{0,2}/gi

/** Every placeholder-ish token in a raw document, in canonical lower case. */
const collectLoosePlaceholders = (content: string) => {
  const tokens = new Set<string>()
  for (const match of content
    .replace(/\\/g, '')
    .matchAll(LOOSE_PLACEHOLDER_PATTERN)) {
    tokens.add(
      placeholderOf(
        match[1].toUpperCase() as MaskKind,
        +match[2],
      ).toLowerCase(),
    )
  }
  return tokens
}

const matchesPlaceholder = (value: string) => {
  PLACEHOLDER_PATTERN.lastIndex = 0
  return PLACEHOLDER_PATTERN.test(value)
}

const isExactPlaceholder = (value: string) => {
  const trimmed = value.trim()
  PLACEHOLDER_PATTERN.lastIndex = 0
  const match = PLACEHOLDER_PATTERN.exec(trimmed)
  return match?.[0] === trimmed ? trimmed : undefined
}

export interface MaskEntryBase {
  kind: MaskKind
  placeholder: string
  /**
   * How many times the placeholder must appear in the translated document.
   * Always 1, except for reference/footnote labels: those are a linkage key
   * shared between a definition and its use(s), so masking them to different
   * tokens would break the link itself.
   */
  occurrences: number
}

export interface UrlMaskEntry extends MaskEntryBase {
  kind: 'DEF' | 'IMG' | 'LINK'
  url: string
}

export interface IdMaskEntry extends MaskEntryBase {
  kind: 'FNID' | 'REFID'
  identifier: string
  label?: string | null
}

export interface JsxAttrMaskEntry extends MaskEntryBase {
  kind: 'JSXATTR'
  attrKind: 'expression' | 'spread' | 'string'
  value: MdxJsxAttributeValueExpression | string
}

export interface TextMaskEntry extends MaskEntryBase {
  kind: 'ANCHOR' | 'EXPR' | 'HTMLATTR' | 'ICODE'
  value: string
}

export interface CodeMaskEntry extends MaskEntryBase {
  kind: 'CODE'
  node: Code
}

export interface AutolinkMaskEntry extends MaskEntryBase {
  kind: 'URL'
  node: Link
}

export type MaskEntry =
  | AutolinkMaskEntry
  | CodeMaskEntry
  | IdMaskEntry
  | JsxAttrMaskEntry
  | TextMaskEntry
  | UrlMaskEntry

export type MaskFindingCode =
  /** the translated document lost a placeholder — a node was deleted */
  | 'missing-placeholder'
  /** a placeholder came back more often than it went out — a node was copied */
  | 'duplicate-placeholder'
  /** the model invented a placeholder-shaped token */
  | 'unregistered-placeholder'
  /** a placeholder survived restoration — it landed somewhere unexpected */
  | 'unrestored-placeholder'
  /** the model's output, or the restored document, is not valid markdown/MDX */
  | 'unparseable-output'
  /** the source already contained a placeholder-shaped token */
  | 'source-contains-placeholder'

export interface MaskFinding {
  code: MaskFindingCode
  placeholder?: string
  kind?: MaskKind
  expected?: number
  actual?: number
  detail?: string
}

const describeFinding = (finding: MaskFinding) => {
  const where = finding.placeholder ? ` ${finding.placeholder}` : ''
  switch (finding.code) {
    case 'missing-placeholder':
      return `missing-placeholder${where}: the translation dropped this ${finding.kind} (expected ${finding.expected}, found ${finding.actual})${finding.detail ? ` — ${finding.detail}` : ''}`
    case 'duplicate-placeholder':
      return `duplicate-placeholder${where}: the translation repeated this ${finding.kind} (expected ${finding.expected}, found ${finding.actual})${finding.detail ? ` — ${finding.detail}` : ''}`
    case 'unregistered-placeholder':
      return `unregistered-placeholder${where}: the translation invented a placeholder that was never issued`
    case 'unrestored-placeholder':
      return `unrestored-placeholder${where}: the placeholder ended up in a node kind it was not issued for${finding.detail ? ` — ${finding.detail}` : ''}`
    case 'unparseable-output':
      return `unparseable-output: ${finding.detail ?? 'unknown parse error'}`
    case 'source-contains-placeholder':
      return `source-contains-placeholder${where}: the source document already contains a reserved token`
  }
}

/**
 * Raised when the masked round trip does not hold. This is check `A1` of the
 * translation gate: it is not advisory, and it must never be swallowed — a
 * translation that fails it is structurally damaged.
 */
export class MaskIntegrityError extends Error {
  constructor(
    readonly findings: readonly MaskFinding[],
    readonly file?: string,
  ) {
    super(
      `Translation mask integrity check failed${file ? ` for ${file}` : ''}:\n${findings
        .map((finding) => `  - ${describeFinding(finding)}`)
        .join('\n')}`,
    )
    this.name = 'MaskIntegrityError'
  }
}

/** Minimal structural view of the remark processors in `plugins/replace`. */
export interface MaskProcessor {
  parse: (content: string) => Root
  stringify: (tree: Root) => string
}

type NodeLike = Record<string, unknown>

const isNodeLike = (value: unknown): value is NodeLike =>
  !!value && typeof value === 'object'

/**
 * Walks every object in a tree, skipping `position` (source offsets) and `data`
 * (derived, e.g. the estree of an MDX expression — counting it would count the
 * same placeholder twice).
 */
const walkNodes = (value: unknown, onNode: (node: NodeLike) => void) => {
  if (Array.isArray(value)) {
    for (const item of value) {
      walkNodes(item, onNode)
    }
    return
  }
  if (!isNodeLike(value)) {
    return
  }
  onNode(value)
  for (const [key, child] of Object.entries(value)) {
    if (key === 'position' || key === 'data') {
      continue
    }
    if (child && typeof child === 'object') {
      walkNodes(child, onNode)
    }
  }
}

/** Counts every placeholder occurrence held in a string field of the tree. */
const collectPlaceholderCounts = (tree: Root) => {
  const counts = new Map<string, number>()
  walkNodes(tree, (node) => {
    for (const [key, value] of Object.entries(node)) {
      // `label` is only the raw spelling of `identifier` — remark fills it back
      // in when the document is re-parsed, and counting both would report every
      // reference twice.
      if (key === 'type' || key === 'label' || typeof value !== 'string') {
        continue
      }
      PLACEHOLDER_PATTERN.lastIndex = 0
      for (const match of value.matchAll(PLACEHOLDER_PATTERN)) {
        const token = match[0].toLowerCase()
        counts.set(token, (counts.get(token) ?? 0) + 1)
      }
    }
  })
  return counts
}

/**
 * Refuses to mask a document that already speaks the placeholder language.
 *
 * Matching loosely matters here: a reserved token sitting in prose comes back
 * from the model in its markdown-mangled form, which would then be reported as
 * a placeholder the model invented — a false red that no amount of retrying
 * could clear.
 */
const assertSourceHasNoPlaceholders = (tree: Root) => {
  const found = new Set<string>()
  walkNodes(tree, (node) => {
    for (const [key, value] of Object.entries(node)) {
      if (key === 'type' || typeof value !== 'string') {
        continue
      }
      for (const token of collectLoosePlaceholders(value)) {
        found.add(token)
      }
    }
  })
  if (found.size > 0) {
    throw new MaskIntegrityError(
      [...found].map((placeholder) => ({
        code: 'source-contains-placeholder' as const,
        placeholder,
      })),
    )
  }
}

const AUTOLINK_PREFIXES = ['', 'http://', 'https://', 'mailto:', 'tel:']

/**
 * A bare URL in prose. GFM parses `https://…`, `www.…` and `a@b.com` into a
 * `link` whose only child is the URL text itself, so there is nothing in it to
 * translate — masking the node whole also removes the model's habit of
 * rewriting it into `[url](url)`.
 */
const isAutolinkLiteral = (node: Link) => {
  if (node.children.length !== 1) {
    return false
  }
  const [child] = node.children
  if (child.type !== 'text' || !child.value) {
    return false
  }
  return AUTOLINK_PREFIXES.some(
    (prefix) => node.url === `${prefix}${child.value}`,
  )
}

const HEADING_ANCHOR_PATTERN = /\{#[^}\s]+\}\s*$/
const HTML_ATTR_PATTERN = /\b(href|src)(\s*=\s*)(["'])(.*?)\3/gi

/**
 * Replaces every value a translation model must not author with a placeholder,
 * in place, and returns the table needed to put them back.
 *
 * Masking works on **AST nodes only**. It never pattern-matches inside a prose
 * text node: that is the one way this could swallow content that should have
 * been translated, and it is ruled out structurally rather than by care.
 * Anything only recognisable as a text pattern (a bare domain with no scheme,
 * say) is deliberately left alone and covered by a check instead — a check that
 * misfires costs one finding to review, whereas a mask that misfires hides
 * prose from the reader.
 */
export const maskAst = (tree: Root): MaskEntry[] => {
  assertSourceHasNoPlaceholders(tree)

  const entries: MaskEntry[] = []
  const counters = new Map<MaskKind, number>()

  const nextPlaceholder = (kind: MaskKind) => {
    const index = counters.get(kind) ?? 0
    counters.set(kind, index + 1)
    return placeholderOf(kind, index)
  }

  const push = (entry: MaskEntry) => {
    entries.push(entry)
    return entry.placeholder
  }

  // Reference and footnote labels are shared linkage keys: the definition and
  // every use must keep matching, so they share one placeholder and record how
  // many times it is expected back.
  const sharedLabels = new Map<string, IdMaskEntry>()
  const shareLabel = (
    kind: 'FNID' | 'REFID',
    identifier: string,
    label?: string | null,
  ) => {
    const key = `${kind}:${identifier.toLowerCase()}`
    const existing = sharedLabels.get(key)
    if (existing) {
      existing.occurrences++
      return existing.placeholder
    }
    const entry: IdMaskEntry = {
      kind,
      placeholder: nextPlaceholder(kind),
      occurrences: 1,
      identifier,
      label,
    }
    sharedLabels.set(key, entry)
    entries.push(entry)
    return entry.placeholder
  }

  // 1. Heading anchors, before inline code: the anchor is carried by an
  //    `inlineCode` node, which must not then be masked again as inline code.
  visit(tree, 'heading', (heading) => {
    const last = heading.children.at(-1)
    if (last?.type !== 'text') {
      return
    }
    const match = HEADING_ANCHOR_PATTERN.exec(last.value)
    if (!match) {
      return
    }
    const placeholder = push({
      kind: 'ANCHOR',
      placeholder: placeholderOf('ANCHOR', counters.get('ANCHOR') ?? 0),
      occurrences: 1,
      value: match[0],
    })
    counters.set('ANCHOR', (counters.get('ANCHOR') ?? 0) + 1)
    last.value = last.value.slice(0, match.index)
    const carrier: InlineCode = { type: 'inlineCode', value: placeholder }
    if (last.value === '') {
      heading.children[heading.children.length - 1] = carrier
    } else {
      heading.children.push(carrier)
    }
  })

  // 2. Links: a bare URL is masked whole, a written link keeps its text.
  visit(tree, 'link', (node, index, parent) => {
    if (parent && index != null && isAutolinkLiteral(node)) {
      const placeholder = push({
        kind: 'URL',
        placeholder: nextPlaceholder('URL'),
        occurrences: 1,
        node: { ...node },
      })
      parent.children[index] = { type: 'inlineCode', value: placeholder }
      // Continue after the replacement so the carrier is not masked again.
      return index + 1
    }
    node.url = push({
      kind: 'LINK',
      placeholder: nextPlaceholder('LINK'),
      occurrences: 1,
      url: node.url,
    })
  })

  visit(tree, 'image', (node) => {
    node.url = push({
      kind: 'IMG',
      placeholder: nextPlaceholder('IMG'),
      occurrences: 1,
      url: node.url,
    })
  })

  // 3. Reference-style links and footnotes.
  visit(tree, 'definition', (node) => {
    node.url = push({
      kind: 'DEF',
      placeholder: nextPlaceholder('DEF'),
      occurrences: 1,
      url: node.url,
    })
    const placeholder = shareLabel('REFID', node.identifier, node.label)
    node.identifier = placeholder
    // Only the identifier carries the token: setting the label too would put the
    // same placeholder in the tree twice and break the occurrence count.
    delete node.label
  })

  visit(tree, ['imageReference', 'linkReference'], (node_) => {
    const node = node_ as { identifier: string; label?: string | null }
    const placeholder = shareLabel('REFID', node.identifier, node.label)
    node.identifier = placeholder
    // Only the identifier carries the token: setting the label too would put the
    // same placeholder in the tree twice and break the occurrence count.
    delete node.label
  })

  visit(tree, ['footnoteDefinition', 'footnoteReference'], (node_) => {
    const node = node_ as { identifier: string; label?: string | null }
    const placeholder = shareLabel('FNID', node.identifier, node.label)
    node.identifier = placeholder
    // Only the identifier carries the token: setting the label too would put the
    // same placeholder in the tree twice and break the occurrence count.
    delete node.label
  })

  // 4. JSX attributes: mask by default, translate only what is declared prose.
  visit(tree, ['mdxJsxFlowElement', 'mdxJsxTextElement'], (node_) => {
    const node = node_ as MdxJsxFlowElement | MdxJsxTextElement
    for (const attr of node.attributes) {
      if (attr.type === 'mdxJsxExpressionAttribute') {
        const placeholder = push({
          kind: 'JSXATTR',
          placeholder: nextPlaceholder('JSXATTR'),
          occurrences: 1,
          attrKind: 'spread',
          value: attr.value,
        })
        attr.value = placeholder
        delete attr.data
        continue
      }
      if (attr.value == null) {
        // A boolean attribute — `<Foo bar />` — has no value to protect.
        continue
      }
      if (typeof attr.value === 'string') {
        if (isTranslatableJsxAttr(node.name, attr.name)) {
          continue
        }
        attr.value = push({
          kind: 'JSXATTR',
          placeholder: nextPlaceholder('JSXATTR'),
          occurrences: 1,
          attrKind: 'string',
          value: attr.value,
        })
        continue
      }
      const placeholder = push({
        kind: 'JSXATTR',
        placeholder: nextPlaceholder('JSXATTR'),
        occurrences: 1,
        attrKind: 'expression',
        value: attr.value,
      })
      attr.value = {
        type: 'mdxJsxAttributeValueExpression',
        value: placeholder,
      }
    }
  })

  // 5. Raw HTML: the value is markup, not prose, so its `href`/`src` are read
  //    with attribute syntax rather than by pattern-matching prose.
  visit(tree, 'html', (node) => {
    node.value = node.value.replace(
      HTML_ATTR_PATTERN,
      (_match, name: string, equals: string, quote: string, value: string) => {
        const placeholder = push({
          kind: 'HTMLATTR',
          placeholder: nextPlaceholder('HTMLATTR'),
          occurrences: 1,
          value,
        })
        return `${name}${equals}${quote}${placeholder}${quote}`
      },
    )
  })

  // 6. Code. No length floor: a short block is as unsafe to retranslate as a
  //    long one, and an over-masked comment stays readable English.
  visit(tree, 'code', (node) => {
    const placeholder = push({
      kind: 'CODE',
      placeholder: nextPlaceholder('CODE'),
      occurrences: 1,
      node: { ...node },
    })
    node.value = placeholder
    delete node.lang
    delete node.meta
  })

  // 7. Inline code, last: the anchor and autolink carriers are inline code too.
  visit(tree, 'inlineCode', (node) => {
    if (matchesPlaceholder(node.value)) {
      return
    }
    node.value = push({
      kind: 'ICODE',
      placeholder: nextPlaceholder('ICODE'),
      occurrences: 1,
      value: node.value,
    })
  })

  // 8. MDX expressions, including the comments the docs rely on
  //    (`{/* cspell:disable-next-line */}` must survive translation).
  visit(tree, ['mdxFlowExpression', 'mdxTextExpression'], (node_) => {
    const node = node_ as MdxFlowExpression | MdxTextExpression
    node.value = push({
      kind: 'EXPR',
      placeholder: nextPlaceholder('EXPR'),
      occurrences: 1,
      value: node.value,
    })
    delete node.data
  })

  return entries
}

const restoreEntries = (tree: Root, entries: readonly MaskEntry[]) => {
  const byPlaceholder = new Map<string, MaskEntry>()
  for (const entry of entries) {
    byPlaceholder.set(entry.placeholder.toLowerCase(), entry)
  }

  const lookup = (value: string, kind: MaskKind) => {
    const token = isExactPlaceholder(value)
    if (!token) {
      return
    }
    const entry = byPlaceholder.get(token.toLowerCase())
    return entry?.kind === kind ? entry : undefined
  }

  visit(tree, 'link', (node) => {
    const entry = lookup(node.url, 'LINK')
    if (entry?.kind === 'LINK') {
      node.url = entry.url
    }
  })

  visit(tree, 'image', (node) => {
    const entry = lookup(node.url, 'IMG')
    if (entry?.kind === 'IMG') {
      node.url = entry.url
    }
  })

  visit(tree, 'definition', (node) => {
    const urlEntry = lookup(node.url, 'DEF')
    if (urlEntry?.kind === 'DEF') {
      node.url = urlEntry.url
    }
  })

  visit(
    tree,
    [
      'definition',
      'footnoteDefinition',
      'footnoteReference',
      'imageReference',
      'linkReference',
    ],
    (node_) => {
      const node = node_ as { identifier: string; label?: string | null }
      const entry =
        lookup(node.identifier, 'REFID') ?? lookup(node.identifier, 'FNID')
      if (entry?.kind === 'REFID' || entry?.kind === 'FNID') {
        node.identifier = entry.identifier
        node.label = entry.label ?? entry.identifier
      }
    },
  )

  visit(tree, ['mdxJsxFlowElement', 'mdxJsxTextElement'], (node_) => {
    const node = node_ as MdxJsxFlowElement | MdxJsxTextElement
    for (const attr of node.attributes) {
      if (attr.type === 'mdxJsxExpressionAttribute') {
        const entry = lookup(attr.value, 'JSXATTR')
        if (entry?.kind === 'JSXATTR' && typeof entry.value === 'string') {
          attr.value = entry.value
          delete attr.data
        }
        continue
      }
      if (typeof attr.value === 'string') {
        const entry = lookup(attr.value, 'JSXATTR')
        if (entry?.kind === 'JSXATTR' && typeof entry.value === 'string') {
          attr.value = entry.value
        }
        continue
      }
      if (attr.value?.type === 'mdxJsxAttributeValueExpression') {
        const entry = lookup(attr.value.value, 'JSXATTR')
        if (entry?.kind === 'JSXATTR' && typeof entry.value !== 'string') {
          attr.value = entry.value
        }
      }
    }
  })

  visit(tree, 'html', (node) => {
    node.value = node.value.replace(PLACEHOLDER_PATTERN, (token) => {
      const entry = byPlaceholder.get(token.toLowerCase())
      return entry?.kind === 'HTMLATTR' ? entry.value : token
    })
  })

  visit(tree, 'code', (node) => {
    const entry = lookup(node.value, 'CODE')
    if (entry?.kind === 'CODE') {
      Object.assign(node, entry.node)
    }
  })

  visit(tree, ['mdxFlowExpression', 'mdxTextExpression'], (node_) => {
    const node = node_ as MdxFlowExpression | MdxTextExpression
    const entry = lookup(node.value, 'EXPR')
    if (entry?.kind === 'EXPR') {
      node.value = entry.value
      delete node.data
    }
  })

  // Inline code carries three kinds: real inline code, a masked bare URL, and a
  // masked heading anchor. The latter two are put back as the nodes they came
  // from, so the carrier must be replaced rather than rewritten.
  visit(tree, 'inlineCode', (node, index, parent) => {
    const token = isExactPlaceholder(node.value)
    if (!token) {
      return
    }
    const entry = byPlaceholder.get(token.toLowerCase())
    if (!entry) {
      return
    }
    if (entry.kind === 'ICODE') {
      node.value = entry.value
      return
    }
    if (!parent || index == null) {
      return
    }
    if (entry.kind === 'URL') {
      parent.children[index] = entry.node
      return index + 1
    }
    if (entry.kind === 'ANCHOR') {
      parent.children[index] = { type: 'text', value: entry.value }
      return index + 1
    }
  })
}

/**
 * Puts the masked values back and proves the round trip held.
 *
 * Three assertions, all of them free:
 *
 * 1. every placeholder comes back exactly as often as it went out — fewer means
 *    the model deleted the node, more means it copied it;
 * 2. no placeholder-shaped token appears that was never issued;
 * 3. the restored document still parses.
 *
 * Any failure throws {@link MaskIntegrityError} with the offending placeholders
 * named. There is deliberately no lenient path: a document that fails here is
 * damaged, and shipping it is how the damage became invisible in the first
 * place.
 */
export const restoreMaskedContent = (
  translatedContent: string,
  entries: readonly MaskEntry[],
  processor: MaskProcessor,
): string => {
  let tree: Root
  try {
    tree = processor.parse(translatedContent)
  } catch (error) {
    throw new MaskIntegrityError([
      {
        code: 'unparseable-output',
        detail: `the model's output is not valid markdown/MDX: ${error instanceof Error ? error.message : String(error)}`,
      },
    ])
  }

  const findings: MaskFinding[] = []
  const counts = collectPlaceholderCounts(tree)

  for (const entry of entries) {
    const token = entry.placeholder.toLowerCase()
    const actual = counts.get(token) ?? 0
    counts.delete(token)
    if (actual === entry.occurrences) {
      continue
    }
    findings.push({
      code:
        actual < entry.occurrences
          ? 'missing-placeholder'
          : 'duplicate-placeholder',
      placeholder: entry.placeholder,
      kind: entry.kind,
      expected: entry.occurrences,
      actual,
      detail: describeEntry(entry),
    })
  }

  const registered = new Set(
    entries.map((entry) => entry.placeholder.toLowerCase()),
  )
  for (const token of collectLoosePlaceholders(translatedContent)) {
    if (!registered.has(token)) {
      findings.push({ code: 'unregistered-placeholder', placeholder: token })
    }
  }

  if (findings.length > 0) {
    throw new MaskIntegrityError(findings)
  }

  restoreEntries(tree, entries)

  const restored = processor.stringify(tree)

  try {
    processor.parse(restored)
  } catch (error) {
    throw new MaskIntegrityError([
      {
        code: 'unparseable-output',
        detail: `the restored document does not parse: ${error instanceof Error ? error.message : String(error)}`,
      },
    ])
  }

  const leftovers = collectLoosePlaceholders(restored)
  if (leftovers.size > 0) {
    throw new MaskIntegrityError(
      [...leftovers].map((placeholder) => ({
        code: 'unrestored-placeholder' as const,
        placeholder,
        detail: 'the model moved it into a node kind it was not issued for',
      })),
    )
  }

  return restored
}

const describeEntry = (entry: MaskEntry) => {
  const preview = (value: string) =>
    value.length > 60 ? `${value.slice(0, 57)}…` : value
  switch (entry.kind) {
    case 'DEF':
    case 'IMG':
    case 'LINK':
      return preview(entry.url)
    case 'FNID':
    case 'REFID':
      return preview(entry.identifier)
    case 'CODE':
      return preview(entry.node.value)
    case 'URL':
      return preview(entry.node.url)
    case 'JSXATTR':
      return preview(
        typeof entry.value === 'string' ? entry.value : entry.value.value,
      )
    default:
      return preview(entry.value)
  }
}
