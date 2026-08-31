---
"@alauda/doom": patch
---

Stop `doom lint` from silently discarding messages on a trailing self-closing element.

Message control drops messages that fall in a "gap" — a region of the file not represented in the tree. It decided a node's span was covered by walking its children, but a self-closing MDX element (`<K8sAPI name="…" />`) is a parent with an _empty_ `children` array, so its end offset was never recorded. When such an element was the last node, everything from its start to the end of the file became a gap and every message inside it was thrown away.

A canonical API reference page is exactly that shape — a heading followed by a single `<K8sAPI … />` — so the rules written for those pages reported nothing at all, on a green build. Every rule's own spec passed throughout, because the specs did not run message control; a `lintMdxPipeline` test helper now does, and the regression case fails without the fix.

Fixing that immediately surfaced a second defect it had been hiding: `no-unresolved-api-ref` read `metadata.name` straight off each permission source, while the permission plugin builds its runtime module from `items`. Against a `kind: List` source — what `kubectl get -o yaml` produces, and what this repository's own fixture is — the check therefore knew no function names at all and reported every `<K8sPermissionTable>` reference as unresolved. Both shapes are now read the way the runtime reads them.
