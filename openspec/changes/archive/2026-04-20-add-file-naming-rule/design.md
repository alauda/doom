## Context

The doom-lint suite has 17 remark-lint rules enforcing documentation quality. All rules follow the same pattern: `lintRule` from `unified-lint-rule` + `visitParents` from `unist-util-visit-parents`. Rules operate on mdast AST nodes, reporting via `vfile.message()`.

The `file-naming` rule is unique: it validates the **vfile path** (filename), not AST content. It does not need to traverse the tree — it inspects `vfile.path` / `vfile.basename` / `vfile.dirname` at the root level.

## Goals / Non-Goals

**Goals:**

- Enforce lowercase-alphanumeric-underscore filenames for all `.md` / `.mdx` docs
- For index files, validate the parent directory name instead
- Integrate seamlessly into existing doom-lint preset

**Non-Goals:**

- Configurable patterns (hardcoded convention is sufficient)
- Validating directory names beyond index file parents
- Auto-fixing filenames

## Decisions

1. **Validate at root level, no AST traversal**: The rule checks `vfile.basename` (or parent dirname for index files) against a regex. No `visitParents` needed — just inspect the vfile metadata in the rule callback and return immediately.

2. **Regex pattern**: `^_?[a-z0-9]+(_[a-z0-9]+)*$` applied to the filename stem (without extension). This allows: `foo`, `foo_bar`, `_foo`, `_foo_bar`. Disallows: `foo_`, `Foo`, `foo-bar`, `foo bar`.

3. **Index file handling**: When `basename` is `index.md` or `index.mdx`, extract the last segment of `dirname` and validate that instead. If dirname is unavailable, skip validation.

4. **Export as named const** (`fileNaming`) following existing pattern (e.g. `noDeepHeading`).

## Risks / Trade-offs

- **Existing docs may violate**: Existing documentation files might not conform. Mitigation: users can disable the rule per-file with `doom-lint` directive comments, or the rule can be adopted incrementally.
- **No vfile.path in some contexts**: If the rule runs on stdin/virtual files without a path, it should silently skip. Mitigation: guard on `vfile.basename` existence.
