# cli

Commander-based CLI for the Doom documentation generator. Entry: `index.ts`.

## COMMANDS

| Command       | File           | Purpose                                    |
| ------------- | -------------- | ------------------------------------------ |
| dev           | `index.ts`     | Start Rspress dev server (default command) |
| build         | `index.ts`     | Build docs site via Rspress                |
| serve/preview | `index.ts`     | Serve built site                           |
| export        | `export.ts`    | Generate PDFs via `@alauda/doom-export`    |
| lint          | `lint.ts`      | Run remark-lint rules on docs              |
| new           | `new.ts`       | Scaffold new doc pages                     |
| translate     | `translate.ts` | Auto-translate MDX files via OpenAI        |

## KEY FILES

| File             | Purpose                                                                     |
| ---------------- | --------------------------------------------------------------------------- |
| `index.ts`       | CLI entry, command registration (Commander), dev/build/serve handlers       |
| `load-config.ts` | Config loader: reads `doom.config.yml`, normalizes locales/versions/plugins |
| `constants.ts`   | CWD, DEFAULT_CONFIGS, SITES_FILE constants                                  |
| `helpers.ts`     | CLI argument parsing helpers                                                |
| `export.ts`      | Serves built site, collects pages from sidebar, calls `generatePdf`         |
| `translate.ts`   | OpenAI translation pipeline with chunking, term-mapping, rate-limiting      |
| `lint.ts`        | Remark-lint runner for documentation                                        |
| `new.ts`         | Page scaffolding with prompts                                               |

## COMPLEXITY HOTSPOTS

| File             | Lines | Risk                                           |
| ---------------- | ----- | ---------------------------------------------- |
| `translate.ts`   | 708   | OpenAI translation pipeline, heavy async/regex |
| `load-config.ts` | 575   | Config normalization, many branches            |
| `export.ts`      | 308   | PDF export orchestration                       |

## NOTES

- `export.ts` orchestrates PDF generation by calling `@alauda/doom-export.generatePdf()`
