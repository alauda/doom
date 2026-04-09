## 1. Test Infrastructure Setup

- [x] 1.1 Install `@rstest/core` as a root devDependency (`yarn add -D @rstest/core`)
- [x] 1.2 Create root `rstest.config.ts` with `projects: ['packages/*']`
- [x] 1.3 Create `packages/doom/rstest.config.ts` with `testEnvironment: 'node'`, include `test/**/*.test.ts`, import shared settings
- [x] 1.4 Create `packages/export/rstest.config.ts` with `testEnvironment: 'node'`, include `test/**/*.test.ts`, import shared settings
- [x] 1.5 Add `test` and `test:watch` scripts to root `package.json` (`rstest run` / `rstest watch`)
- [x] 1.6 Add `"**/test/**"` to `typeCoverage.ignoreFiles` in root `package.json`
- [x] 1.7 Add `yarn test` step to CI workflow (`.github/workflows/ci.yml`) alongside build, lint, typecov

## 2. Export Package Utility Tests

- [x] 2.1 Create `packages/export/test/html-export-pdf/utils/isValidUrl.test.ts` — test all protocol branches (http, https, file, data, ftp-reject, plain-text-reject, case-insensitive)
- [x] 2.2 Create `packages/export/test/export-pdf-core/utils/getUrlLink.test.ts` — test URL-with-hash, URL-without-hash, invalid-URL-throws
- [x] 2.3 Create `packages/export/test/merge-pdfs/formatDate.test.ts` — test PDF date string format, zero-padding, timezone offset sign
- [x] 2.4 Create `packages/export/test/html-export-pdf/utils/replaceExt.test.ts` — test extension replacement, leading dot-slash preservation, empty string
- [x] 2.5 Create `packages/export/test/export-pdf-core/utils/convertPathToPosix.test.ts` — test backslash conversion, DOS device path, no-op on non-Windows

## 3. Doom Package Utility Tests

- [x] 3.1 Create `packages/doom/test/plugins/replace/parse-toc.test.ts` — test h1 title extraction, h2-h4 collection, h5+ skip, allDepths flag, custom ID
- [x] 3.2 Create `packages/doom/test/plugins/replace/utils.test.ts` — test normalizeReferenceItems (normal + duplicates), getFrontmatterNode (present + absent)
- [x] 3.3 Create `packages/doom/test/utils/helpers.test.ts` — test baseResolve, pkgResolve path resolution

## 4. Remark-Lint Test Helper

- [x] 4.1 Create `packages/doom/test/remark-lint/_helper.ts` — shared `lint(rule, markdown)` using remark + remark-gfm + remark-frontmatter, plus `lintMdx` variant with remark-mdx

## 5. Remark-Lint Rule Tests

- [x] 5.1 Create `packages/doom/test/remark-lint/no-deep-heading.test.ts` — allows h1-h5, flags h6
- [x] 5.2 Create `packages/doom/test/remark-lint/maximum-link-content-length.test.ts` — allows short text, flags long text, skips URL-like text
- [x] 5.3 Create `packages/doom/test/remark-lint/list-item-punctuation.test.ts` — consistent punctuation, inconsistent flags, last-item period, skips single-item
- [x] 5.4 Create `packages/doom/test/remark-lint/list-item-size.test.ts` — allows <=10 items, flags >10
- [x] 5.5 Create `packages/doom/test/remark-lint/list-table-introduction.test.ts` — allows list after paragraph, flags list after heading
- [x] 5.6 Create `packages/doom/test/remark-lint/no-deep-list.test.ts` — allows depth 4, flags depth 5
- [x] 5.7 Create `packages/doom/test/remark-lint/no-empty-table-cell.test.ts` — allows filled cells, flags empty cells
- [x] 5.8 Create `packages/doom/test/remark-lint/no-heading-punctuation.test.ts` — allows clean headings, flags trailing punctuation, allows `?` in FAQ files
- [x] 5.9 Create `packages/doom/test/remark-lint/no-heading-special-characters.test.ts` — allows normal text, flags special chars
- [x] 5.10 Create `packages/doom/test/remark-lint/no-heading-sup-sub.test.ts` — allows plain text, flags sup/sub tags
- [x] 5.11 Create `packages/doom/test/remark-lint/no-multi-open-api-paths.test.ts` — allows single OpenAPIPath, flags multiple (uses lintMdx helper)
- [x] 5.12 Create `packages/doom/test/remark-lint/no-paragraph-indent.test.ts` — allows unindented, flags indented paragraphs
- [x] 5.13 Create `packages/doom/test/remark-lint/table-size.test.ts` — allows multi-row/col, flags single-row, flags single-column
- [x] 5.14 Create `packages/doom/test/remark-lint/unit-case.test.ts` — allows correct casing, flags wrong casing

## 6. Validation

- [x] 6.1 Run `yarn test` — all tests pass with exit code 0
- [x] 6.2 Run `yarn build` — no test files in lib output
- [x] 6.3 Run `yarn lint` — no lint errors in test files
- [x] 6.4 Run `yarn typecov` — 100% type coverage maintained (test files excluded)
