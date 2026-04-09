## Why

The project currently has zero unit tests — validation relies entirely on type-coverage, linting, and docs builds. This leaves a significant class of logic bugs undetectable: pure function behavior, remark-lint rule correctness, AST transformation edge cases, and PDF utility outputs. Adding a test framework establishes a safety net for the ~17 remark-lint rules and ~10 pure utility modules that form the project's core domain logic.

Rstest is the natural choice — it's the Rspack ecosystem's testing framework (sibling to Rspress, which Doom is built on), offering native TypeScript/ESM support, SWC-powered transforms, and monorepo-aware configuration that aligns perfectly with the existing toolchain.

## What Changes

- Add `@rstest/core` as a root devDependency and configure monorepo-aware test runner
- Create root `rstest.config.ts` with per-package project configs for `@alauda/doom` and `@alauda/doom-export`
- Add `test`, `test:watch`, and `test:coverage` scripts to root `package.json`
- Create unit tests for pure utility functions in both packages (Tier 1: ~15-20 tests)
- Create unit tests for remark-lint rules using a shared test helper pattern (Tier 2: ~30-50 tests)
- Create a shared lint-rule test utility for building mdast trees and asserting vfile messages
- Update CI workflow to run `yarn test` alongside existing `build`, `lint`, `typecov` steps
- Exclude test files from TypeScript composite build outputs (`tsconfig.json` adjustments)

## Capabilities

### New Capabilities

- `test-infrastructure`: Rstest configuration, test scripts, CI integration, TypeScript build exclusions
- `utility-tests`: Unit tests for pure functions across both packages (isValidUrl, getUrlLink, formatDate, parseToc, etc.)
- `remark-lint-tests`: Unit tests for remark-lint rules with shared test helper for markdown→AST→messages pattern

### Modified Capabilities

<!-- No existing specs to modify -->

## Impact

- **Both packages affected**: `@alauda/doom` (remark-lint rules, plugin utils, path helpers) and `@alauda/doom-export` (PDF utils, URL/path helpers)
- **New devDependency**: `@rstest/core` (and optionally `@rstest/coverage-istanbul`) at root
- **CI**: New `test` step added to matrix — increases CI time but catches logic regressions
- **Type coverage**: Test files must be properly excluded from type-coverage runs; the 100% threshold must remain unaffected
- **Build**: Test files (`__tests__/**/*.test.ts`) excluded from `tsc -b` composite build via tsconfig adjustments
- **No runtime impact**: Tests are dev-only, no changes to published packages
