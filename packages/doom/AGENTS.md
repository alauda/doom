# packages/doom

**Package**: `@alauda/doom` — CLI, Rspress plugins, remark-lint rules, React runtime, theme overrides.

## STRUCTURE

```
src/
├── cli/           # Commander CLI: build, dev, export, lint, new, translate
├── plugins/       # Rspress plugins (9): api, auto-sidebar, auto-toc, directives, global, mermaid, permission, replace, shiki
├── remark-lint/   # 17 custom unified-lint-rule rules for docs quality
├── runtime/       # React components: K8s APIs, OpenAPI, hooks, translations
├── theme/         # Rspress theme overrides: Layout, CodeBlock, Search, VersionsNav
├── shared/        # Internal helpers: constants, types (DoomSite, K8s metadata), getPdfName
├── global/        # Global UI features: Intelligence/AIAssistant (OpenAI integration)
├── login/         # Login page components
├── utils/         # General utilities
├── config.ts      # Doom config loader (exported as @alauda/doom/config)
├── eslint.ts      # ESLint config factory (exported as @alauda/doom/eslint)
├── cspell.ts      # CSpell config (exported as @alauda/doom/cspell)
├── types.ts       # Public types (exported as @alauda/doom/types)
└── remarkrc.ts    # Remark configuration
test/
├── plugins/       # Plugin unit tests (replace/)
├── remark-lint/   # Remark-lint rule tests
└── utils/         # Utility function tests
```

## EXPORTS MAP

| Subpath                | Points to              | Purpose                                        |
| ---------------------- | ---------------------- | ---------------------------------------------- |
| `@alauda/doom/config`  | `src/config.ts`        | Site config loader                             |
| `@alauda/doom/eslint`  | `src/eslint.ts`        | ESLint config factory (includes doom() helper) |
| `@alauda/doom/cspell`  | `src/cspell.ts`        | CSpell preset                                  |
| `@alauda/doom/runtime` | `src/runtime/index.ts` | React runtime components for MDX               |
| `@alauda/doom/theme`   | `src/theme/index.ts`   | Rspress theme entry                            |
| `@alauda/doom/types`   | `src/types.ts`         | Public TypeScript types                        |

## WHERE TO LOOK

| Task                        | File(s)                                                                |
| --------------------------- | ---------------------------------------------------------------------- |
| Add CLI command             | `src/cli/index.ts` (register), new file in `src/cli/`                  |
| Add Rspress plugin          | New dir in `src/plugins/`, export from `src/plugins/index.ts`          |
| Add remark-lint rule        | New file in `src/remark-lint/`, export from `src/remark-lint/index.ts` |
| Add runtime component       | `src/runtime/components/`, export from `src/runtime/index.ts`          |
| Modify theme                | `src/theme/` — extends Rspress default theme                           |
| Change site config shape    | `src/config.ts` + `src/types.ts`                                       |
| Virtual module registration | Plugin's `addRuntimeModules` hook                                      |

## CONVENTIONS (PACKAGE-SPECIFIC)

- Binary entry: `lib/cli/index.js` (compiled from `src/cli/index.ts`)
- Plugin pattern: factory returning `RspressPlugin` with hooks — see `src/plugins/AGENTS.md`
- Remark plugins: unified `Plugin` functions mutating mdast AST

## NOTES

- `src/global/Intelligence/AIAssistant/` uses OpenAI API — requires API key at runtime
- `shim.d.ts` and `global.d.ts` provide ambient type declarations
- Complexity hotspots documented in child AGENTS.md files (cli/, runtime/, plugins/)
