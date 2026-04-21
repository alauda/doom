## Context

The Doom monorepo includes custom `remark-lint` rules under `packages/doom/src/remark-lint` and runs them through `remarkrc.ts` in markdown/MDX lint flows. Existing anchor handling allows ids extracted from headings, HTML nodes, and MDX JSX attributes. This flexibility permits id-bearing elements such as `<a id="..." />`, `<a id="..."></a>`, or `<span id="..."></span>` inside headings or as standalone blocks immediately before or after headings, which conflicts with the desired canonical heading id style (`{#id}` suffix in the heading text).

This change introduces a focused lint constraint for heading anchor formatting while preserving current lint architecture: rule modules exported from `remark-lint/index.ts`, configured in `remarkrc.ts`, and covered by `packages/doom/test/remark-lint` tests.

## Goals / Non-Goals

**Goals:**

- Enforce a single heading anchor style for headings: `# Title {#hash}`.
- Forbid any id-bearing HTML/MDX element (such as `<a id="hash" />`, `<a id="hash"></a>`, or `<span id="hash"></span>`) when it appears inside headings or as a standalone block immediately before or after heading blocks.
- Produce clear diagnostics that tell authors to migrate to `{#hash}` in the heading text.
- Add regression tests covering markdown and MDX invalid/valid cases.

**Non-Goals:**

- Rewriting existing markdown files automatically.
- Changing non-heading anchor behaviors for unrelated contexts.
- Altering runtime rendering behavior outside lint diagnostics.

## Decisions

1. **Create a dedicated rule (`heading-anchor-format`) instead of overloading existing `no-unmatched-anchor`.**
   - Rationale: `no-unmatched-anchor` validates link targets and anchor existence; this change is style-enforcement for heading markup. Splitting concerns keeps diagnostics precise and maintenance simpler.
   - Alternative considered: extending `no-unmatched-anchor` with formatting checks. Rejected due to mixed responsibility and increased complexity.

2. **Detect forbidden patterns in heading content and in surrounding standalone id-bearing blocks.**
   - Rationale: the requirement includes elements “besides or insides headings,” including block-separated forms before and after headings.
   - Implementation direction: inspect heading descendants for id-bearing HTML/MDX nodes and inspect nearby sibling nodes around headings for standalone id-bearing HTML/MDX elements, tolerating blank-line separation that still produces adjacent block nodes in the AST.
   - Alternative considered: only checking heading descendants. Rejected because it misses before/after-heading anti-patterns.

3. **Keep `{#id}` as the only accepted heading-anchor declaration in diagnostics messaging.**
   - Rationale: canonical style must be explicit; error messages should guide migration directly.
   - Alternative considered: continuing to mention `<a id="...">` as acceptable fallback. Rejected as it contradicts this capability.

4. **Follow existing remark-lint conventions for rule registration and testing.**
   - Rationale: minimize integration risk by matching repository patterns (`lintRule`, `vfile.message`, rule export in `index.ts`, activation in `remarkrc.ts`, test helper usage in `packages/doom/test/remark-lint/_helper.ts`).

## Risks / Trade-offs

- **False positives for intentionally placed id-bearing HTML near headings** → Mitigation: scope surrounding-node checks to heading-adjacent standalone blocks and require `id` attributes rather than matching specific tag names.
- **Rule overlap/conflicting diagnostics with existing anchor checks** → Mitigation: keep this rule focused on formatting and keep `no-unmatched-anchor` focused on reachability; align message wording.
- **MDX syntax variation edge cases** → Mitigation: include MDX fixtures in tests for both HTML node and JSX-like forms across multiple element names.
- **Adoption friction for contributors used to HTML anchors** → Mitigation: provide explicit fix guidance in lint errors and docs examples.
