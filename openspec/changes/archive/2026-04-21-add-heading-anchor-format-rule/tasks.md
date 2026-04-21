## 1. Rule implementation

- [x] 1.1 Add `packages/doom/src/remark-lint/heading-anchor-format.ts` implementing `doom-lint:heading-anchor-format` with detection for any id-bearing HTML/MDX element used inside headings or as surrounding before/after-heading blocks.
- [x] 1.2 Export the new rule in `packages/doom/src/remark-lint/index.ts` and enable it in `packages/doom/src/remarkrc.ts` following existing plugin registration conventions.

## 2. Diagnostics and behavior alignment

- [x] 2.1 Define lint messages that explicitly recommend rewriting violations to `# Title {#hash}` and include offending id-bearing element context.
- [x] 2.2 Ensure rule scope only targets id-bearing elements associated with headings, including before/after-heading block forms with blank-line separation, to avoid unrelated non-heading false positives.

## 3. Test coverage

- [x] 3.1 Add `packages/doom/test/remark-lint/heading-anchor-format.spec.ts` with markdown cases: valid `{#id}` heading, invalid inline `<a>` and `<span>` heading elements, invalid standalone before-heading blocks, invalid standalone after-heading blocks, and blank-line-separated before/after cases.
- [x] 3.2 Add MDX-focused coverage using the existing lint test helpers to validate JSX/MDX id-bearing element violations near heading nodes across multiple element names.

## 4. Verification

- [x] 4.1 Run `yarn build` and fix any compile/type issues introduced by the new rule.
- [x] 4.2 Run `yarn lint` and ensure the new rule implementation and tests follow project style/lint requirements.
- [x] 4.3 Run `yarn typecov` to confirm coverage remains at 100% after adding the rule and tests.
