# theme

Rspress theme overrides for Doom. Exported as `@alauda/doom/theme`. Extends the default Rspress theme.

## FILES

| File                 | Purpose                                                            |
| -------------------- | ------------------------------------------------------------------ |
| `index.ts`           | Theme entry: re-exports Layout and Search overrides                |
| `Layout.tsx`         | Custom layout wrapper (adds global features around Rspress layout) |
| `CodeBlock.tsx`      | Custom code block rendering                                        |
| `Search.tsx`         | Algolia-powered search integration                                 |
| `EditLink.tsx`       | Custom edit link component                                         |
| `useEditLink.ts`     | Hook for edit link URL generation                                  |
| `AutoExpandable.tsx` | Auto-expanding sidebar component                                   |
| `VersionsNav/`       | Version navigation dropdown component                              |

## THEME ENTRY CHAIN

`theme/index.ts` (repo root) → `packages/doom/src/theme/index.ts` → individual components

The root `theme/` directory contains a single `index.ts` that re-exports from this package — Rspress expects the theme entry at project root.

## NOTES

- Theme components are client-side React (browser rendering)
- Algolia search keys configured in `doom.config.yml` (public search-only)
- `VersionsNav/` handles multi-version docs navigation
- Styles live in `packages/doom/styles/` (sibling to `src/`)
