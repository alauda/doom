# packages/export

**Package**: `@alauda/doom-export` — PDF generation engine: Playwright browser → per-page PDF → merge → outlines.

## STRUCTURE

```
src/
├── export-pdf-core/          # Core pipeline: generatePdf, types, utils
│   ├── generatePdf.ts        # Main entry: orchestrates print → merge → outline
│   ├── types.ts              # Public types: Page, CommandOptions, PDFOutline
│   └── utils/                # mergePDF, setOutlines, getUrlLink, convertPathToPosix
├── html-export-pdf/          # Playwright-based HTML→PDF primitives
│   ├── core/printer.ts       # Printer class: browser lifecycle, page routing, PDF output
│   ├── core/outline.ts       # DOM outline extraction → PDF bookmarks
│   └── utils/                # getDirname, isValidUrl, and helpers
├── merge-pdfs/               # PDF merge utilities
├── helpers.ts                # pkgResolve for package path resolution
└── index.ts                  # Public entry: re-exports export-pdf-core
pyodide/                      # Vendored Pyodide runtime (DO NOT MODIFY)
```

## PUBLIC API

Consumed by `@alauda/doom` CLI (`packages/doom/src/cli/export.ts`):

- `generatePdf(options)` — main function, receives pages + config, returns exported path + outlines
- `Page`, `PDFOutline`, `PDFOutlineInfo`, `GeneratePdfOptions` — types

## WHERE TO LOOK

| Task                       | File(s)                                                                            |
| -------------------------- | ---------------------------------------------------------------------------------- |
| Change PDF generation flow | `src/export-pdf-core/generatePdf.ts`                                               |
| Modify page rendering      | `src/html-export-pdf/core/printer.ts`                                              |
| Fix PDF bookmarks/outlines | `src/html-export-pdf/core/outline.ts` + `src/export-pdf-core/utils/setOutlines.ts` |
| Change PDF merge behavior  | `src/export-pdf-core/utils/mergePDF.ts`                                            |
| Update public types        | `src/export-pdf-core/types.ts`                                                     |

## COMPLEXITY HOTSPOTS

| File                                  | Lines | Risk                                                    |
| ------------------------------------- | ----- | ------------------------------------------------------- |
| `src/html-export-pdf/core/outline.ts` | 340   | DOM→outline parsing, recursive tree transforms          |
| `src/html-export-pdf/core/printer.ts` | 330   | Browser lifecycle, request routing, resource management |

## NOTES

- Playwright + Chromium pinned at 1.57.0 — browser must be installed for export
- `pyodide/` is vendored upstream — contains use-after-free warnings (known, upstream issue)
- Published files: `lib/` + `pyodide/` — pyodide assets shipped with package
- No unit tests — validation via docs export in CI (`yarn docs:export`)
