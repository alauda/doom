## Context

Doom is a documentation generator monorepo with two packages (`@alauda/doom` and `@alauda/doom-export`). The project currently has zero unit tests — validation relies on type-coverage (100% strict), ESLint, and docs builds. The codebase is TypeScript 6, ESM-only, built on Rspress (part of the Rstack ecosystem), using Yarn 4 Berry.

The TypeScript build uses composite project references: each package's `tsconfig.json` specifies `"include": ["src"]`, `"outDir": "lib"`, `"rootDir": "src"`. The root runs `tsc -b` which only compiles files under each package's `src/`. Published packages only include `lib/` via the `"files"` field.

## Goals / Non-Goals

**Goals:**

- Establish rstest as the project's unit test framework with monorepo-aware configuration
- Create a reusable lint-rule test helper pattern for testing the 17 custom remark-lint rules
- Achieve initial test coverage for all pure utility functions and all pure AST-based lint rules
- Integrate tests into CI pipeline alongside existing `build`, `lint`, `typecov` steps

**Non-Goals:**

- Testing React runtime/theme components (requires DOM environment, different testing strategy)
- Integration tests for IO-heavy modules (git clone, Jira API, PDF binary operations) — deferred to a later phase
- Achieving specific coverage percentage thresholds — focus on correctness of core logic first
- Replacing type-coverage or lint as validation mechanisms — tests complement, not replace

## Decisions

### 1. Test File Placement: `packages/<pkg>/test/` outside `src/`

**Decision**: Place test files in `packages/<pkg>/test/` directories, mirroring the source structure.

**Rationale**: The package tsconfigs already restrict compilation to `"include": ["src"]`. Placing tests outside `src/` means:

- No tsconfig changes needed — tests are naturally excluded from `tsc -b` compilation
- No risk of test files compiled to `lib/` or published to npm
- Clean separation between production and test code
- rstest handles its own TypeScript compilation via SWC — tests don't need to be in the tsc project

**Alternatives considered**:

- _Co-located `src/__tests__/`_: Would require adding `"exclude"` patterns to both package tsconfigs. Rejected because it adds config complexity and risks accidentally compiling tests if patterns drift.
- _Root-level `test/` directory_: The root `.gitignore` contains `/test` and `/test.*`, which would require gitignore edits. Package-level `test/` dirs avoid this issue entirely.

**Directory structure**:

```
packages/doom/test/
├── remark-lint/
│   ├── _helper.ts              # Shared lint rule test helper
│   ├── no-deep-heading.test.ts
│   ├── maximum-link-content-length.test.ts
│   └── ...
├── plugins/replace/
│   ├── parse-toc.test.ts
│   └── utils.test.ts
└── utils/
    └── helpers.test.ts

packages/export/test/
├── html-export-pdf/utils/
│   ├── isValidUrl.test.ts
│   └── replaceExt.test.ts
├── export-pdf-core/utils/
│   ├── getUrlLink.test.ts
│   └── convertPathToPosix.test.ts
└── merge-pdfs/
    └── formatDate.test.ts
```

### 2. Rstest Configuration: Root projects + shared config

**Decision**: Root `rstest.config.ts` with `projects: ['packages/*']` and per-package configs importing shared settings. Following the pattern used by Rslib and other Rstack projects.

**Rationale**: Rstest natively supports multi-project monorepos. Per-package configs allow different settings (e.g., test timeout, environment) while sharing common options.

**Alternatives considered**:

- _Single root config with inline projects_: Less flexible when packages need different environments.
- _`@rstest/adapter-rsbuild`_: Unnecessary — Doom's test targets are server-side Node.js code (CLI, plugins, lint rules), not React components. The adapter adds complexity without benefit for pure Node.js unit tests.

### 3. Explicit Imports over Globals

**Decision**: Use `import { describe, test, expect } from '@rstest/core'` rather than `globals: true`.

**Rationale**: The codebase enforces strict typing and 100% type-coverage. Explicit imports provide better IDE support, type checking, and align with the project's disciplined ESM-first style.

### 4. Lint Rule Test Helper Pattern

**Decision**: Create a shared `_helper.ts` module that provides a `lint(rule, markdown, options?)` function returning `vfile.messages`.

**Rationale**: All 14 pure remark-lint rules follow the same pattern: parse markdown → run rule → assert messages. A shared helper eliminates boilerplate across ~40+ test cases. The helper uses `remark` + `remark-gfm` + `remark-frontmatter` to match the project's actual processing pipeline.

Pattern (based on remarkjs/remark-lint and React Native Website test patterns):

```typescript
import { remark } from 'remark'
import remarkGfm from 'remark-gfm'
import remarkFrontmatter from 'remark-frontmatter'
import type { Plugin } from 'unified'

export async function lint(rule: Plugin, markdown: string) {
  const file = await remark()
    .use(remarkGfm)
    .use(remarkFrontmatter)
    .use(rule)
    .process(markdown)
  return file.messages
}
```

For MDX-based rules (`no-multi-open-api-paths`, `site`), an extended helper adds `remark-mdx`.

### 5. Type Coverage Compatibility

**Decision**: Add `"**/test/**"` to the `typeCoverage.ignoreFiles` array in root `package.json`.

**Rationale**: Test files may use assertions, mocks, and patterns that don't achieve 100% type coverage. Since tests are dev-only code, excluding them preserves the existing 100% threshold without compromising production code quality.

## Risks / Trade-offs

**[rstest pre-1.0 maturity]** → Rstest is v0.9.x, actively developed but pre-1.0. Mitigation: The API is Jest-compatible and stable; the Rstack team uses it in production for Rspack/Rsbuild/Rslib. Migration to Vitest would be trivial if needed (`rs.*` → `vi.*`).

**[Lint rules with IO dependencies]** → Three rules (`check-dead-links`, `no-unmatched-anchor`, `site`) require file IO and project config. Testing them properly requires mocking `fs`, `getConfig()`, and processors. Mitigation: Defer IO-dependent rule tests to a later phase; focus on the 14 pure AST rules first.

**[SWC vs tsc type checking]** → rstest uses SWC for compilation, not tsc. SWC doesn't type-check. Mitigation: `tsc -b` and type-coverage already provide comprehensive type checking in CI. rstest only needs to compile and run tests.

**[Module-level side effects in test subjects]** → Some modules (`replace/utils.ts`) construct frozen unified processors and snapshot `process.env.CI` at import time. Mitigation: Document which modules have import-time side effects; use `rs.mock()` for module-level mocking where needed.
