## Why

Authors can currently introduce id-bearing HTML or MDX elements like `<a id="hash" />`, `<a id="hash"></a>`, or `<span id="hash"></span>` inside headings or as separate blocks before/after headings, which creates inconsistent heading-id authoring and increases parsing complexity across markdown and MDX. We should enforce one canonical format now (`# Title {#hash}`) to keep docs style uniform and lint behavior predictable.

## What Changes

- Add a new remark-lint rule `doom-lint:heading-anchor-format` to forbid any id-bearing HTML/MDX element (for example `<a id="..." />`, `<a id="..."></a>`, or `<span id="..."></span>`) when placed inside headings or used as a standalone block before or after headings to emulate heading ids.
- Require explicit heading id syntax in heading text (`# Title {#hash}`) as the supported heading-anchor format.
- Add tests for accepted/rejected patterns, including inline, standalone-before, standalone-after, blank-line-separated, markdown, and MDX cases.
- Update lint messaging so violations clearly instruct the `{#hash}` replacement.

## Capabilities

### New Capabilities

- `heading-anchor-format-lint`: Enforce canonical heading anchor formatting by rejecting any id-bearing HTML/MDX elements used in, before, or after headings and requiring `{#id}` heading suffix syntax.

### Modified Capabilities

- None.

## Impact

- Affected code: `packages/doom/src/remark-lint/` (new rule + exports + config wiring) and `packages/doom/test/remark-lint/` (new coverage).
- Affected behavior: docs linting for heading anchors in markdown/MDX.
- No API/runtime changes expected outside lint diagnostics.
