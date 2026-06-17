# AGENTS.md

## OVERVIEW

Doom — documentation generator built on Rspress. Monorepo: CLI + theme + runtime + plugins (`@alauda/doom`) and PDF export engine (`@alauda/doom-export`). TypeScript, React, unified/remark ecosystem.

## STRUCTURE

```
doom/
├── packages/doom/       # Main package: CLI, theme, runtime, plugins, remark-lint
├── packages/export/     # PDF export via Playwright + pdf-lib + pyodide
├── docs/                # Production documentation content (zh/en)
├── fixture-docs/        # Test/dev documentation fixture
├── theme/               # Theme entry re-export (theme/index.ts)
├── dist/                # Built docs output (gitignored in practice)
└── patches/             # patch-package patches
```

## WHERE TO LOOK

| Task                | Location                         | Notes                                                                                |
| ------------------- | -------------------------------- | ------------------------------------------------------------------------------------ |
| CLI commands        | `packages/doom/src/cli/`         | Commander-based: build, dev, export, lint, new, translate                            |
| Rspress plugins     | `packages/doom/src/plugins/`     | api, auto-sidebar, auto-toc, directives, global, mermaid, permission, replace, shiki |
| Remark lint rules   | `packages/doom/src/remark-lint/` | 17 custom rules via unified-lint-rule                                                |
| Runtime components  | `packages/doom/src/runtime/`     | React components for docs site (K8s APIs, OpenAPI, etc.)                             |
| Theme overrides     | `packages/doom/src/theme/`       | Rspress theme: Layout, CodeBlock, Search, VersionsNav                                |
| PDF generation      | `packages/export/src/`           | Playwright printer → per-page PDF → merge → outlines                                 |
| Site config         | `doom.config.yml`                | Lang, API globs, export scopes, Algolia, references                                  |
| Fixture site config | `fixture-docs/doom.config.yml`   | Test site: cspell words, release notes queries, route filters                        |

## CONVENTIONS

- **No semicolons** — Prettier `semi: false`
- **Single quotes** — except `.changeset/*.md` (double quotes)
- **ESM only** — `"type": "module"` in all packages
- **TypeScript 6** with `strict: true`, `NodeNext` module resolution, `rewriteRelativeImportExtensions`
- **100% type coverage** — enforced via `type-coverage` (`atLeast: 100`, `strict: true`)
- **Conventional Commits** — changesets for versioning/release
- **Published docs dependency** — downstream docs consume published `@alauda/doom`; add a changeset for user-facing fixes that must reach those docs
- **Yarn 4 Berry** — `nodeLinker: node-modules`, strict `--immutable` in CI
- **Node ≥22.18.0** for `@alauda/doom`, ≥20.19.0 for `@alauda/doom-export`

## ANTI-PATTERNS (THIS PROJECT)

- Virtual module names (`doom-@api-*`, `doom-@global-virtual`, `virtual-site-data`) must be added to ESLint `import-x/no-unresolved` ignore list when created
- `@typescript-eslint/no-non-null-assertion` is OFF — non-null assertions allowed
- `@typescript-eslint/no-misused-promises` is OFF
- `remark-replace` plugin writes files to disk during build — be aware of side effects
- Pyodide warnings in `packages/export/pyodide/` are upstream (use-after-free pointer) — do not modify vendored files

## COMMANDS

```bash
yarn install              # Install deps (Yarn 4 Berry)
yarn build                # Clean + tsc -b (composite build)
yarn dev                  # Dev mode: swc-node with watch on CLI
yarn doom <cmd>           # Run CLI from source (swc-node)
yarn fixture              # Dev server with fixture-docs
yarn docs                 # Build + export docs
yarn docs:build           # Build docs site
yarn docs:export          # Export docs to PDF
yarn lint                 # ESLint
yarn format               # Prettier --write
yarn test                 # Unit tests (rstest)
yarn typecov              # Type coverage check (must be 100%)
yarn release              # Build + changeset publish
```

## BUILD & CI

- **CI matrix**: Node [20, 22, 24] — runs `build`, `docs`, `lint`, `test`, `typecov` in parallel
- **Release**: changesets/action on push to main → `changeset publish`
- **GH Pages**: builds docs + exports PDFs, deploys to doom.js.org via peaceiris/actions-gh-pages
- **Autofix**: PR auto-formatting via autofix-ci
- **pkg-pr-new**: per-commit package publish (parallel to changesets)

## NOTES

- Dev CLI runs TypeScript directly via `@swc-node/register` — no build needed for dev
- `packages/doom` mixes server (CLI) and client (React runtime/theme) code in one package
- Inter-package dependency: `@alauda/doom` → `@alauda/doom-export` (generatePdf, Page types)
- `doom.config.yml` `lang: zh` — default language is Chinese
- Algolia keys in doom.config.yml are public search-only keys
- `tsconfig.json` path aliases point to source (not lib) for dev convenience
- `simple-git-hooks` + `nano-staged` for pre-commit formatting
