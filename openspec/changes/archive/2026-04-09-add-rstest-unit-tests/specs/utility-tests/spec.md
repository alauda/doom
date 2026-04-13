## ADDED Requirements

### Requirement: isValidUrl tests

The system SHALL have unit tests for `packages/export/src/html-export-pdf/utils/isValidUrl.ts` covering all protocol branches.

#### Scenario: Accepts http URLs

- **WHEN** `isValidUrl('http://example.com')` is called
- **THEN** it returns `true`

#### Scenario: Accepts https URLs

- **WHEN** `isValidUrl('https://example.com/path')` is called
- **THEN** it returns `true`

#### Scenario: Accepts file URLs

- **WHEN** `isValidUrl('file:///tmp/doc.pdf')` is called
- **THEN** it returns `true`

#### Scenario: Accepts data URLs

- **WHEN** `isValidUrl('data:text/plain;base64,SGVsbG8=')` is called
- **THEN** it returns `true`

#### Scenario: Rejects ftp URLs

- **WHEN** `isValidUrl('ftp://example.com')` is called
- **THEN** it returns `false`

#### Scenario: Rejects plain text

- **WHEN** `isValidUrl('not a url')` is called
- **THEN** it returns `false`

#### Scenario: Case insensitive

- **WHEN** `isValidUrl('HTTPS://EXAMPLE.COM')` is called
- **THEN** it returns `true`

### Requirement: getUrlLink tests

The system SHALL have unit tests for `packages/export/src/export-pdf-core/utils/getUrlLink.ts` covering URL parsing.

#### Scenario: Parses URL with hash

- **WHEN** `getUrlLink('https://example.com/path#anchor')` is called
- **THEN** it returns `{ link: 'https://example.com/path', hash: 'anchor' }`

#### Scenario: Parses URL without hash

- **WHEN** `getUrlLink('https://example.com/path')` is called
- **THEN** it returns `{ link: 'https://example.com/path', hash: '' }`

#### Scenario: Throws on invalid URL

- **WHEN** `getUrlLink('not-a-url')` is called
- **THEN** it throws a TypeError

### Requirement: formatDate tests

The system SHALL have unit tests for `packages/export/src/merge-pdfs/formatDate.ts` covering PDF date string formatting.

#### Scenario: Formats date with positive timezone offset

- **WHEN** `formatDate` is called with a Date object
- **THEN** it returns a string matching the pattern `D:YYYYMMDDHHmmSS[+-Z]HH'mm'`

#### Scenario: Zero-pads single-digit components

- **WHEN** `formatDate` is called with a date where month, day, hour, minute, or second are single digits
- **THEN** each component is zero-padded to two digits

### Requirement: replaceExt tests

The system SHALL have unit tests for `packages/export/src/html-export-pdf/utils/replaceExt.ts` covering extension replacement.

#### Scenario: Replaces extension

- **WHEN** `replaceExt('file.md', '.html')` is called
- **THEN** it returns `'file.html'`

#### Scenario: Preserves leading dot-slash

- **WHEN** `replaceExt('./dir/file.md', '.html')` is called
- **THEN** it returns `'./dir/file.html'`

#### Scenario: Handles empty string

- **WHEN** `replaceExt('', '.html')` is called
- **THEN** it returns `''`

### Requirement: convertPathToPosix tests

The system SHALL have unit tests for `packages/export/src/export-pdf-core/utils/convertPathToPosix.ts` covering Windows path conversion.

#### Scenario: Converts backslashes on Windows

- **WHEN** `convertPathToPosix` is called with `'dir\\file.txt'` on a Windows platform
- **THEN** it returns `'dir/file.txt'`

#### Scenario: Converts DOS device paths on Windows

- **WHEN** `convertPathToPosix` is called with `'\\\\.\\C:\\path'` on a Windows platform
- **THEN** it returns `'//.\\C:/path'` (device path prefix converted, backslashes replaced)

#### Scenario: Returns unchanged on non-Windows

- **WHEN** `convertPathToPosix` is called with any path on a non-Windows platform
- **THEN** it returns the path unchanged

### Requirement: parseToc tests

The system SHALL have unit tests for `packages/doom/src/plugins/replace/parse-toc.ts` covering table-of-contents extraction from mdast trees.

#### Scenario: Extracts title from first h1

- **WHEN** `parseToc` is called with an AST containing an h1 heading
- **THEN** the returned `title` equals the h1 text content

#### Scenario: Collects h2-h4 headings

- **WHEN** `parseToc` is called with headings at depths 2, 3, and 4
- **THEN** the returned `toc` array contains entries for each heading with correct `id`, `text`, and `depth`

#### Scenario: Skips h5+ headings by default

- **WHEN** `parseToc` is called without `allDepths` and headings include depth 5+
- **THEN** headings at depth 5 or greater are not included in `toc`

#### Scenario: Collects all depths when allDepths is true

- **WHEN** `parseToc(tree, true)` is called
- **THEN** all headings regardless of depth are included in `toc`

#### Scenario: Uses custom ID from text

- **WHEN** a heading text contains a custom ID (via `extractTextAndId` pattern)
- **THEN** the toc entry uses the custom ID instead of a slugified value

### Requirement: normalizeReferenceItems tests

The system SHALL have unit tests for the `normalizeReferenceItems` function in `packages/doom/src/plugins/replace/utils.ts`.

#### Scenario: Normalizes reference sources

- **WHEN** `normalizeReferenceItems` is called with an array of `ReferenceItem` objects
- **THEN** it returns a record keyed by source name with normalized properties including split `path` and `anchor`

#### Scenario: Handles duplicate source names

- **WHEN** `normalizeReferenceItems` is called with items containing duplicate `source.name` values
- **THEN** the duplicate is deduplicated and a warning is logged

### Requirement: getFrontmatterNode tests

The system SHALL have unit tests for the `getFrontmatterNode` function in `packages/doom/src/plugins/replace/utils.ts`.

#### Scenario: Returns YAML node when present

- **WHEN** `getFrontmatterNode` is called with an AST whose first child is a `yaml` node
- **THEN** it returns that YAML node

#### Scenario: Returns undefined when no frontmatter

- **WHEN** `getFrontmatterNode` is called with an AST whose first child is not a `yaml` node
- **THEN** it returns `undefined`

### Requirement: baseResolve and pkgResolve tests

The system SHALL have unit tests for path resolver utilities in `packages/doom/src/utils/helpers.ts`.

#### Scenario: baseResolve resolves from base directory

- **WHEN** `baseResolve('foo', 'bar')` is called
- **THEN** it returns a path resolved relative to `BASE_DIR`

#### Scenario: pkgResolve resolves from package directory

- **WHEN** `pkgResolve('src', 'index.ts')` is called
- **THEN** it returns a path resolved relative to `PKG_DIR`
