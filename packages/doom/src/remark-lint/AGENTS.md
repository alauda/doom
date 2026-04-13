# remark-lint

17 custom remark-lint rules for documentation quality enforcement. Built with `unified-lint-rule`.

## RULE CATALOG

| Rule                          | File                               | Checks                                         |
| ----------------------------- | ---------------------------------- | ---------------------------------------------- |
| check-dead-links              | `check-dead-links.ts`              | Detects broken internal links                  |
| list-item-punctuation         | `list-item-punctuation.ts`         | List item ending punctuation                   |
| list-item-size                | `list-item-size.ts`                | List item length limits                        |
| list-table-introduction       | `list-table-introduction.ts`       | Tables/lists must have intro text              |
| maximum-link-content-length   | `maximum-link-content-length.ts`   | Link text length limits                        |
| no-deep-heading               | `no-deep-heading.ts`               | Heading depth limits                           |
| no-deep-list                  | `no-deep-list.ts`                  | List nesting depth limits                      |
| no-empty-table-cell           | `no-empty-table-cell.ts`           | Empty table cells                              |
| no-heading-punctuation        | `no-heading-punctuation.ts`        | Forbidden heading punctuation                  |
| no-heading-special-characters | `no-heading-special-characters.ts` | Special chars in headings                      |
| no-heading-sup-sub            | `no-heading-sup-sub.ts`            | sup/sub elements in headings                   |
| no-multi-open-api-paths       | `no-multi-open-api-paths.ts`       | Duplicate OpenAPI paths in docs                |
| no-paragraph-indent           | `no-paragraph-indent.ts`           | Paragraph indentation                          |
| no-unmatched-anchor           | `no-unmatched-anchor.ts`           | Anchor references without targets              |
| site                          | `site.ts`                          | ExternalSite component name matches sites.yaml |
| table-size                    | `table-size.ts`                    | Table column/row limits                        |
| unit-case                     | `unit-case.ts`                     | Unit naming conventions                        |

## RULE PATTERN

```typescript
import { lintRule } from 'unified-lint-rule'
import { visitParents } from 'unist-util-visit-parents'

export default lintRule('doom-lint:rule-name', (tree, file) => {
  visitParents(tree, 'element', (node, ancestors) => {
    if (/* violation */) {
      file.message('Error message', node)
    }
  })
})
```

## HOW TO ADD A RULE

1. Create `src/remark-lint/my-rule.ts` following the pattern above
2. Export it from `src/remark-lint/index.ts`
3. Add unit tests in `test/remark-lint/my-rule.spec.ts`
4. Rule will be included in doom's lint pipeline automatically

## TESTING

Unit tests in `packages/doom/test/remark-lint/` — each rule has a corresponding `.spec.ts` file. Run with `yarn test` from repo root.

## NOTES

- `index.ts` aggregates all rules and exports the default doom-lint preset
- `utils.ts` provides shared helpers (AST traversal, text extraction)
- `site.ts` validates against `sites.yaml` in project root — unique to this project
- Rules use `remark-message-control` for directive-based suppression (`doom-lint` source)
