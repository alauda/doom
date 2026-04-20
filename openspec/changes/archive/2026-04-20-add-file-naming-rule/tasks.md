## 1. Core Implementation

- [x] 1.1 Create `packages/doom/src/remark-lint/file-naming.ts` implementing the `doom-lint:file-naming` rule using `lintRule` from `unified-lint-rule`. Validate `vfile.basename` stem against `^_?[a-z0-9]+(_[a-z0-9]+)*$`. For `index.md`/`index.mdx`, validate last segment of `vfile.dirname`. Skip if no basename available.
- [x] 1.2 Export `fileNaming` from `packages/doom/src/remark-lint/index.ts` via `export * from './file-naming.ts'`

## 2. Testing

- [x] 2.1 Create `packages/doom/test/remark-lint/file-naming.spec.ts` with test cases covering: valid filenames, underscore prefix, uppercase rejection, hyphen rejection, trailing underscore rejection, mdx support, index file parent directory validation, missing path skip

## 3. Validation

- [x] 3.1 Run `yarn build` and verify no compilation errors
- [x] 3.2 Run `yarn lint` and verify no lint errors
- [x] 3.3 Run `yarn test` and verify all tests pass including new file-naming tests
- [x] 3.4 Run `yarn typecov` and verify 100% type coverage maintained
