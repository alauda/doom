## Why

Documentation filenames lack consistent naming enforcement. Files with uppercase letters, spaces, hyphens, or trailing underscores create URL inconsistencies, broken cross-references, and poor developer experience. A lint rule prevents these issues at authoring time.

## What Changes

- Add a new `doom-lint:file-naming` remark-lint rule that validates document filenames
- Filenames must match `^_?[a-z0-9]+(_[a-z0-9]+)*\.(md|mdx)$` — lowercase letters, numbers, underscores only; may start with underscore but not end with one
- For `index.md` / `index.mdx` files, validate the parent directory name (basename) instead
- Integrate the rule into the existing doom-lint preset

## Capabilities

### New Capabilities

- `file-naming-rule`: Remark-lint rule enforcing document filename conventions (lowercase, numbers, underscores only)

### Modified Capabilities

## Impact

- `packages/doom/src/remark-lint/` — new rule file + index.ts re-export
- `packages/doom/test/remark-lint/` — new test file
- No cross-package impact; no new dependencies; no virtual modules; type-coverage unaffected
