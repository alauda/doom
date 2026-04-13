# plugins

Rspress plugins for the Doom documentation generator. Each plugin is a factory returning an `RspressPlugin` object.

## PLUGIN CATALOG

| Plugin       | Directory       | Purpose                                                                                         |
| ------------ | --------------- | ----------------------------------------------------------------------------------------------- |
| api          | `api/`          | Generates virtual runtime modules for CRDs and OpenAPIs (`doom-@api-*`)                         |
| auto-sidebar | `auto-sidebar/` | Scans docs tree, generates nav/sidebar config from filesystem                                   |
| auto-toc     | `auto-toc/`     | Inserts `<Toc />` component at first h2 via remark transform                                    |
| directives   | `directives/`   | Converts remark-directive nodes to MDX/hast (callouts, custom blocks)                           |
| global       | `global/`       | Registers global styles, UI components, virtual modules (`doom-@global-virtual`), login page    |
| mermaid      | `mermaid/`      | Converts mermaid code blocks to `<Mermaid />` MDX elements                                      |
| permission   | `permission/`   | Generates permission-related virtual modules (functionResources, roleTemplates)                 |
| replace      | `replace/`      | Complex: resolves reference blocks, release notes, normalizes images — **writes files to disk** |
| shiki        | `shiki/`        | Syntax highlighting transformers (callouts)                                                     |

## PLUGIN PATTERN

```typescript
// Factory returning RspressPlugin
export const myPlugin = (options: Options): RspressPlugin => ({
  name: 'doom-my-plugin',
  config(config, utils) { /* modify Rspress config */ },
  addRuntimeModules(config, isProd) { /* return { 'module-name': source } */ },
  globalStyles: '/path/to/styles.scss',
  markdown: { globalComponents: [...] },
  addPages(config) { /* return extra page definitions */ },
})
```

## REMARK/REHYPE PLUGINS WITHIN

Several plugins contain remark/rehype transforms as sub-files:

- `auto-toc/remark-auto-toc.ts` — inserts ToC import + component
- `directives/remark-directives.ts` — directive→MDX transform
- `mermaid/remark-mermaid.ts` — mermaid codeblock→MDX
- `replace/remark-replace.ts` — reference resolution + file writes (**side effects**)
- `replace/rehype-normalize-link.ts` — link normalization
- `replace/remark-explicit-jsx.ts` — explicit JSX handling
- `shiki/transformers/callouts.ts` — shiki callout transformer

## VIRTUAL MODULES

When adding a new virtual module via `addRuntimeModules`:

1. Create the module source string in your plugin
2. Return it from `addRuntimeModules` with a unique name (e.g., `doom-@my-virtual`)
3. **Add the module name to ESLint `import-x/no-unresolved` ignore list** in `eslint.config.js`

Current virtual modules: `doom-@api-crdsMap`, `doom-@api-openapisMap`, `doom-@api-virtual`, `doom-@global-virtual`, `doom-@permission-functionResourcesMap`, `doom-@permission-roleTemplatesMap`

## NOTES

- `shared.ts` at plugin root provides `createMdxImport` helper for AST import nodes
- `auto-sidebar` removes the default `auto-nav-sidebar` plugin via `utils.removePlugin`
- `api` plugin normalizes OpenAPI v2→v3 via `swagger2openapi` and converts schemas via `openapi-schema-to-json-schema`
- Unit tests in `packages/doom/test/plugins/` — run with `yarn test` from repo root
