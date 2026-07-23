---
"@alauda/doom": minor
---

Fix a family of API-reference rendering defects where the components ignored facts already present in the CRD / OpenAPI sources, plus add offline integrity tooling.

**Correctness — endpoints and schema now read the source instead of guessing:**

- `<K8sAPI>` derives `namespaced` from the CRD's `spec.scope` instead of always defaulting to `true`, so `Cluster`-scoped resources no longer render an unreachable `/namespaces/{namespace}/` path. The `namespaced` prop still overrides.
- Endpoint paths use the resource's real plural from `spec.names.plural` instead of guessing with `pluralize(kind)`, fixing hyphenated (`vpc-egress-gateways`) and irregular (`alaudaloadbalancer2`) plurals. A new `plural` prop is an escape hatch for OpenAPI-sourced resources. (`toLocaleLowerCase` → `toLowerCase`.)
- When a page does not pass `apiVersion`, a multi-version CRD now renders the version `kubectl` resolves to — the highest-priority `served` version (GA > beta > alpha, apimachinery ordering) — instead of `spec.versions[0]`. This never publishes a `served: false` version. Both the schema and the endpoint-path version now come from this single resolved version. Configurable via `api.crdVersion: 'preferred' | 'storage' | 'first'`.
- `/status` (and the new `/scale`) endpoints are rendered based on the version's declared `spec.versions[].subresources`, not on whether the schema happens to contain a `status` property — fixing both fabricated `/status` endpoints and missing ones.
- `x-kubernetes-int-or-string` fields (carried under `anyOf`) now render their type (`integer|string`) instead of an empty cell.

**Anchors and badges:**

- Array-item schema sections (`.spec.foo[]`) no longer collide with their parent (`.spec.foo`) on the same HTML id; schema headings use a page-level stateful slugger, so every property section is uniquely addressable (HTML id uniqueness / WCAG 4.1.1).
- OpenAPI operations without a `summary` no longer produce `id="undefined"` / `href="#undefined"` or bare numeric anchors; the heading id is derived from the method (and summary when present).
- The `<OpenAPIPath>` Request Body **required** badge reads `requestBody.required` (the boolean on the request body) instead of the body schema's list of required _properties_.

**New configuration and tooling:**

- `api.references` accepts an object form `{ href, routePath?: string | false }`, separating the link href from the page-identity key used to decide inline expansion. Plain string values are unchanged. `routePath: false` explicitly means "always link, never expand".
- `translate.copyOnlyDirectories` overrides which directories are copied instead of translated (default unchanged).
- New `doom api check` command: an offline validation of the local CRD / OpenAPI sources — every file parses, CRDs have the right kind and a unique name, filenames follow the `<group>_<plural>.yaml` convention, and OpenAPI definitions do not conflict across files.
- New `no-unresolved-api-ref` lint rule flags `<K8sAPI>` / `<K8sCrd>` / `<OpenAPIRef>` / `<OpenAPIPath>` / `<K8sPermissionTable>` references that cannot be resolved, before they ship as blank pages.
- Deterministic source ordering: schema files are sorted, and the `filepath` / `openapiPath` map key no longer depends on `process.cwd()`, so pinning a source is stable across working directories and `<OpenAPIPath>` uses a consistent first-match.

**Other:**

- `<K8sPermissionTable>` renders a visible "not found" row instead of silently dropping an unresolved function.
- API component chrome (`Property`, `Type`, `Description`, `Required`, `Specification`, `API Endpoints`, `HTTP method`, `Common Parameters`, `Request Body`, `Response`, …) is now translated via `useTranslation` (en/zh/ru) instead of hardcoded English.
- API reference pages surface their top-level properties in the page outline (previously a two-line TOC), while deeper nested properties stay excluded.

> **Downstream impact:** the scope / plural / version / status fixes change the rendered endpoints on already-published pages (measured: immutable-infra-docs 8, asm-docs 4, aml-docs 4, acp-docs 3, plus fabricated `/status` across ~19 pages). `namespaced` (`docs/*/usage/api.md`) and the CRD default-version behavior were documented public defaults; downstream docs should re-review their API pages after upgrading.
