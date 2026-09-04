# @alauda/doom

## 2.7.1

### Patch Changes

- [#355](https://github.com/alauda/doom/pull/355) [`b88a34d`](https://github.com/alauda/doom/commit/b88a34d01833fede85b85764bfb3f4ae7da1fec3) Thanks [@youyongsong](https://github.com/youyongsong)! - Stop a translation's broken bold from failing the whole document.

  `**bold**` only closes when the delimiters sit against the text, and CommonMark
  will not close a run that is preceded by punctuation and followed by a letter.
  `**Note:** text` is bold; the Chinese that drops the space, `**注意：**文本`, is
  not — it prints the asterisks to the page, and nothing else notices, because the
  document still parses, every link still resolves and every component is present.

  `no-unparsed-emphasis` catches it, but only over the assembled document, where
  the two rounds of sending segments back are shared by the whole page. Measured
  across four production builds of `immutable-infra-docs`: every one of the 22
  assembly send-backs was this rule, and it exhausted the rounds on three of six
  documents — and one document that fails discards every other document's accepted
  work in the same run.

  Three changes, from cause to backstop:
  - the translator's own prompt now states the constraint, where a repository
    replacing `translate.systemPrompt` cannot drop it;
  - a segment is now checked for it before it is frozen, so it arrives with the
    segment attached and gets three attempts and a repair agent — the same
    argument the heading and component collectors are already there for. Only
    delimiters the translation introduced are reported: a source that shows
    literal asterisks on purpose is left alone;
  - the assembled document may now send segments back four times instead of two.

## 2.7.0

### Minor Changes

- [#353](https://github.com/alauda/doom/pull/353) [`4c87d07`](https://github.com/alauda/doom/commit/4c87d074fc2d726d303cfba133f71c82ff764cbb) Thanks [@youyongsong](https://github.com/youyongsong)! - Translate a document a segment at a time, and never lose a segment that has passed.

  Since 2.6.0 a document was translated by one agent in one loop: it wrote the whole page, the checks ran over the whole page, and whatever it still had wrong went back to it. The unit of work, of acceptance and of retry were all "the document" — while the unit of failure was one placeholder. `install.mdx` in `immutable-infra-docs` has 871 of them, and every one has to come back byte-identical, so passing meant winning 871 coin tosses at once. It measurably could not: nine consecutive builds failed on it, and the third of them is the whole argument for this change. The first round left **one** problem. Repairing that one problem rewrote the file, and the next round reported **1000**; two more rounds got it to 873, which is every placeholder in the document. A translation that was one finding from finished became one with nothing left, and the harness had kept no copy of the good one.

  Nothing about that is fixed by more rounds or a bigger budget, so the unit changed instead.
  - **A segmenter cuts the document by code**, deterministically: at `##` headings once a segment is worth ending, at a size cap, and by descending into a container too large to send whole — the 24.9 KB `<Tabs>` in that document is four ordinary segments. Cutting and reassembling is verified to introduce no difference of its own, over 1058 real documents; a `<Tab label>` inside a container that was descended into becomes a segment of its own, because otherwise it is the one piece of the page nobody translates.
  - **Each segment is one ordinary model call**, not an agent, with the page's headings and the tail of the previous segment for context. The hardest segment in the corpus carries 177 placeholders, against 307 for the largest document that used to succeed whole; the median carries 5.
  - **A segment that passes is frozen.** Nothing touches it again — not a retry, not a repair, not a later assembly round. The document that ships is made of the version of each segment that passed, and that is true by construction rather than by care.
  - **Acceptance is four layers**, cheapest first: it parses, every placeholder is back exactly as often as it went out, its headings and components match its source, and a reviewer reads it against its source. Only the last costs a model call, and it is never spent on a segment the free ones have already faulted. The heading and component comparisons run the same collectors the whole-document rules run — checked per segment they arrive with a segment attached, where the same defect at page level has no line number and nothing to route by. A heading's `{#id}` is also checked for still being the last thing in its heading: it is an id only there, so a translation that reorders the words around it keeps every placeholder, balances every count, and still turns the explicit id into visible punctuation. Translating `install.mdx` produced exactly that on 1 of its 15 anchored headings, and nothing else in the four layers could see it.
  - **The reviewer is stricter than it was, on the pages where it is the only one.** It now takes three independent readings and blocks on a finding two of them agree about, against two readings that had to agree unanimously. A page short enough to be a single segment — over half of this corpus — is read as a whole page, not as a fragment, so a missing opening or a section that stops early counts as the omission it is; only a genuine piece of a longer page is told to ignore what falls outside it. The two together mean a short page whose translation quietly dropped its last section is now blocked where it previously shipped.
  - **A segment three attempts cannot fix goes to a repair agent** with `read`, `edit` and `check` — and deliberately no `write` and no `append`. "Prefer a targeted edit over a rewrite" used to be a sentence in a prompt while the model held `write`: one call, and the page was gone. Nothing it holds now takes a replacement for the file, so a rewrite would mean quoting the whole segment back byte for byte to edit it away — the expensive thing to reach for rather than the cheap one.
  - **Segments whose source did not change are reused** from the previous translation, recorded in an `i18nSegments` frontmatter field. The edit that set this whole incident off was `+1/-1` on one line and cost a retranslation of 3122 lines; it now costs one segment. Nothing is trusted because it was written down: a candidate is re-masked against the current source's own mask table and has to account for exactly the content that source expects, so a hand-edited translation, a stale record or a moved block is retranslated rather than reused.
  - **A failure says which segment, and which kind.** A segment nothing could translate, a whole-page check that kept failing, and a whole-page check nobody could attribute are three different situations reported three different ways — and a model writes a short analysis of the evidence into the build log, purely advisory, because working out what a red build meant used to take two rounds of log-gathering.

  `translate.maxRepairRounds` and `translate.maxTurns` are gone: both named a budget for a whole document, and there is no longer such a thing. Configuring either now fails with what replaced it rather than being ignored. New settings — `segmentCap`, `segmentFloor`, `maxSegmentAttempts`, `maxAssemblyRounds`, `contextTail`, `segmentCache`, `fullDocJudge`, `repairAgent.*`, `diagnose.*` — all have defaults, so no repository has to change anything.

## 2.6.1

### Patch Changes

- [#351](https://github.com/alauda/doom/pull/351) [`31b9053`](https://github.com/alauda/doom/commit/31b9053fb94ea04c2167f5b88dbb6f52c78881c4) Thanks [@youyongsong](https://github.com/youyongsong)! - Compare a translation with its source through the same parser, and stop reading a linked URL as prose.

  `tektoncd-operator` release-4.2, 4.6 and 4.8 all went red on `auto-translate-zh` over one line of an English source — `eg. HTTP_PROXY=http://10.10.10.10:8080` — and no repair round could clear it. Two defects were making the translator's own work unreadable to the checks that judge it:
  - **The two sides were parsed differently.** The document being checked came through the lint pipeline, which has `remark-directive`; the source it was compared against was parsed with the site's `mdxProcessor`, which does not. Anything directive syntax touches — a port in `http://host:8080`, a tag in `image:1.25`, a time in `10:30` — was a `textDirective` on one side and plain text on the other, and the difference was reported as damage. The syntax stack now lives in `remark-lint/syntax-plugins.ts` and both sides parse with it. `no-unmatched-anchor` reads anchors through it too, so a document's anchors no longer depend on whether the run happened to lint it before reading it.
  - **`translation-url-residue` walked into links.** Its premise is that a URL markdown turned into a link is protected structurally and belongs to `translation-link-isomorphism`; the implementation still counted the link's own label. `[http://host:8080](http://host:8080)` — the one spelling of a bare URL that Chinese sentence punctuation cannot corrupt — was therefore read as prose that had lost its URL. Between the two defects no spelling the translator could reach satisfied both rules, so the loop could only run out of rounds and fail the document.

  `translation-link-isomorphism` now also names the case it used to describe twice and explain never. A bare URL runs on until a space and markdown only drops trailing _ASCII_ punctuation, so `例如 http://host:8080。` links to `http://host:8080。` — an address that does not exist, in a document whose Chinese is correct. The finding says which character was swallowed and gives the spelling that keeps it outside the address, instead of reporting one lost target and one unexpected one and leaving the translator to work out which of the two it was supposed to change.

  Verified on 836 paired documents from a real corpus and on `doom lint` over the fixture site: findings identical before and after, so the corrections drop false reports without silencing real ones.

## 2.6.0

### Minor Changes

- [#347](https://github.com/alauda/doom/pull/347) [`c6fe198`](https://github.com/alauda/doom/commit/c6fe1989d356826a2dabaaeca18e213d6e5191c3) Thanks [@youyongsong](https://github.com/youyongsong)! - Fix a family of API-reference rendering defects where the components ignored facts already present in the CRD / OpenAPI sources, plus add offline integrity tooling.

  **Correctness — endpoints and schema now read the source instead of guessing:**
  - `<K8sAPI>` derives `namespaced` from the CRD's `spec.scope` instead of always defaulting to `true`, so `Cluster`-scoped resources no longer render an unreachable `/namespaces/{namespace}/` path. The `namespaced` prop still overrides.
  - Endpoint paths use the resource's real plural from `spec.names.plural` instead of guessing with `pluralize(kind)`, fixing hyphenated (`vpc-egress-gateways`) and irregular (`alaudaloadbalancer2`) plurals. A new `plural` prop is an escape hatch for OpenAPI-sourced resources. (`toLocaleLowerCase` → `toLowerCase`.)
  - When a page does not pass `apiVersion`, a multi-version CRD now renders the version `kubectl` resolves to — the highest-priority `served` version (GA > beta > alpha, apimachinery ordering) — instead of `spec.versions[0]`. This never publishes a `served: false` version. Both the schema and the endpoint-path version now come from this single resolved version. Configurable via `api.crdVersion: 'preferred' | 'storage' | 'first'`.
  - `<K8sAPI>` no longer renders endpoint paths it cannot derive. When an OpenAPI schema carries no `x-kubernetes-group-version-kind` — aggregation-layer documents routinely omit it — and no CRD backs the name, the group, version and kind used to fall back to empty strings and concatenate into `/api//` and `/api///{name}`, shipping a broken path on a green build. The endpoints section is now omitted, with a `console.error` naming the props to declare; the schema still renders. `apiVersion` + `apiKind` (plus `apiGroup` outside the core group) make the page render endpoints again.
  - `/status` (and the new `/scale`) endpoints follow what the source declares, not whether the schema happens to contain a `status` property — fixing both fabricated `/status` endpoints and missing ones. A CRD declares the subresource in `spec.versions[].subresources`; an OpenAPI document declares it by routing it, so its `paths` decide, and a document that routes the resource without a `/status` route renders none. A document that does not route the resource at all says nothing either way, so the schema property stays the fallback there. The new `hasStatus` prop overrides both.
  - `x-kubernetes-int-or-string` fields (carried under `anyOf`) now render their type (`integer|string`) instead of an empty cell.

  **Anchors and badges:**
  - Array-item schema sections (`.spec.foo[]`) no longer collide with their parent (`.spec.foo`) on the same HTML id; schema headings use a page-level stateful slugger, so every property section is uniquely addressable (HTML id uniqueness / WCAG 4.1.1).
  - OpenAPI operations without a `summary` no longer produce `id="undefined"` / `href="#undefined"` or bare numeric anchors; the heading id is derived from the method (and summary when present).
  - The `<OpenAPIPath>` Request Body **required** badge reads `requestBody.required` (the boolean on the request body) instead of the body schema's list of required _properties_.

  **New configuration and tooling:**
  - `api.references` accepts an object form `{ href, routePath?: string | false }`, separating the link href from the page-identity key used to decide inline expansion. Plain string values are unchanged. `routePath: false` explicitly means "always link, never expand".
  - `translate.copyOnlyDirectories` overrides which directories are copied instead of translated (default unchanged).
  - New `doom api check` command: an offline validation of the local CRD / OpenAPI sources — every file parses, CRDs have the right kind and a unique name, filenames follow the `<group>_<plural>.yaml` convention, and OpenAPI definitions do not conflict across files.
  - New `no-unresolved-api-ref` lint rule flags `<K8sAPI>` / `<K8sCrd>` / `<OpenAPIRef>` / `<OpenAPIPath>` / `<K8sPermissionTable>` references that cannot be resolved, before they ship as blank pages. It also flags a `<K8sAPI>` whose group, version and kind can be derived from neither the schema nor a CRD nor explicit props, so that failure surfaces at lint time instead of as a missing endpoints section.
  - Deterministic source ordering: schema files are sorted, and the `filepath` / `openapiPath` map key no longer depends on `process.cwd()`, so pinning a source is stable across working directories and `<OpenAPIPath>` uses a consistent first-match.

  **Other:**
  - `<K8sPermissionTable>` renders a visible "not found" row instead of silently dropping an unresolved function.
  - API component chrome (`Property`, `Type`, `Description`, `Required`, `Specification`, `API Endpoints`, `HTTP method`, `Common Parameters`, `Request Body`, `Response`, …) is now translated via `useTranslation` (en/zh/ru) instead of hardcoded English.
  - API reference pages surface their top-level properties in the page outline (previously a two-line TOC), while deeper nested properties stay excluded.

  > **Downstream impact:** the scope / plural / version / status fixes change the rendered endpoints on already-published pages (measured: immutable-infra-docs 8, asm-docs 4, aml-docs 4, acp-docs 3, plus fabricated `/status` across ~19 pages). `namespaced` (`docs/*/usage/api.md`) and the CRD default-version behavior were documented public defaults; downstream docs should re-review their API pages after upgrading.
  >
  > The OpenAPI-branch `/status` change was measured against the full consumer corpus (222 `<K8sAPI>` / `<K8sCrd>` tags across 11 repositories; 26 resolve to OpenAPI schemas, all of them in acp-docs): **no page changes**, because every document that routes one of those resources also routes its `/status`. The two pages whose documents do not are covered by the fallback rather than losing endpoints.

- [#350](https://github.com/alauda/doom/pull/350) [`cac2679`](https://github.com/alauda/doom/commit/cac267964df6d897c9d9252edb16a515c0d1f347) Thanks [@youyongsong](https://github.com/youyongsong)! - Translate in a checked loop instead of one call, and have a second reading judge the meaning.

  `doom translate` used to hand a document to the model once and write down whatever came back. Nothing read the result: a dropped bullet, a sentence that lost the product name, a page returned in the source language — all of it shipped, because the only gate downstream was whether the build could still resolve every link.

  Translating a document is now a bounded loop. The model writes, the same checks that `doom translate check` runs are applied to what it wrote, and any findings go back to it as its next instruction. The loop is bounded on purpose — `maxRepairRounds` per document and `maxTurns` overall — and exhausting either fails the document rather than shipping the best attempt so far. A failed document fails the whole run and nothing is uploaded, so a partial success cannot reach a translations repository. The final verdict is always the harness re-running the checks itself; the agent's own account of what it fixed is never taken as evidence.

  The agent works in a scratch directory it cannot escape, and it only ever sees masked content — the placeholders described above are never resolved inside the loop, so no repair round can rewrite a link or an identifier.

  Structure is not meaning, so a second reading looks at the two documents side by side and reports what the translation lost, added or got wrong. It is the only check that can see a translation which is well-formed, passes every structural rule, and is about something else. Two independent readings are taken and only findings both agree on count, which is what keeps a single confident misreading out of the results.

  Which model does that reading is now a choice:
  - `translate.judge.model` in a site's config, or `ALAUDA_OPENAI_JUDGE_MODEL` for a whole gateway;
  - unset, it stays the translator's model — the independence comes from a separate call with a separate job, not from a different model.

  A reviewer that is not the writer is worth having, because two readings by one model share its blind spots and its preference for its own output; a different model does not. It is not free, though: the pass/fail line for the judge is a measured property of the model behind it — its false-positive rate on translations believed to be good, and its recall on damage deliberately introduced — so changing the model means measuring both again before trusting it. The shipped default was calibrated; another model is not, until someone calibrates it.

  Reasoning levels are now read per model rather than per gateway. One endpoint can serve families that disagree about the vocabulary — one accepts `none` and rejects `minimal`, the other does the reverse — and a single map for the gateway makes whichever family it was not written for fail at the ends of the scale.

  The previous single-call path is gone rather than kept behind a flag: there is one way translations are produced, and rolling back means releasing a previous version.

- [#350](https://github.com/alauda/doom/pull/350) [`cac2679`](https://github.com/alauda/doom/commit/cac267964df6d897c9d9252edb16a515c0d1f347) Thanks [@youyongsong](https://github.com/youyongsong)! - Protect everything a translation model must not author, deterministically, instead of asking it not to touch things.

  `doom translate` used to send the whole document to the model with a detailed `**CRITICAL**: Do not translate or modify ANY link content` instruction, and only code blocks longer than 50 characters were actually protected. The instruction did not hold: translated documents came back with `<ExternalSiteLink … />` flattened into a markdown link, `../virtualization/virtual_machine/` collapsed into `../virtualization_virtual_machine/`, `../global_dr.mdx` rewritten as `../global.dr.mdx`, `how_to/` rewritten as `how-to/`, and links generated twice. None of that is visible to a build unless the resulting link happens to be dead, so it shipped.

  Link targets, image sources, code (fenced and inline, with no length floor), MDX JSX attribute values, `href`/`src` in raw HTML, custom heading anchors, bare URLs, MDX expressions and reference/footnote labels are now replaced with opaque placeholders before the document reaches the model, and restored afterwards. The model never has the real value in its context, so it cannot rewrite it.

  Restoring verifies the round trip and throws `MaskIntegrityError` — naming the file and each offending placeholder — when:
  - a placeholder came back fewer times than it went out (the model deleted the node it stood for);
  - it came back more often (the model duplicated it);
  - the model invented a placeholder that was never issued;
  - a placeholder ended up in a node kind it was not issued for;
  - the response, or the restored document, does not parse.

  Which JSX attributes carry prose is declared in `runtime/components/_translation-policy.ts` — `Directive.title`, `ExternalSiteLink.children`, `Tab.label`, `img.alt`. Everything else is masked, so a component nobody has classified yet fails safe: an untranslated label is visible and harmless, whereas a rewritten identifier is silent and breaks the page.

  Masking only ever touches AST nodes; it never pattern-matches inside prose text, so it cannot swallow content that should have been translated. Verified over 1789 real documents (914 English sources, 875 Chinese translations): mask → restore reproduces the document byte-for-byte in 1788 of them, the one difference being a pre-existing non-idempotency in remark's own stringifier that reproduces with no masking at all.

- [#350](https://github.com/alauda/doom/pull/350) [`cac2679`](https://github.com/alauda/doom/commit/cac267964df6d897c9d9252edb16a515c0d1f347) Thanks [@youyongsong](https://github.com/youyongsong)! - Review translations with a different model by default, and give the gateway a budget that can be set.

  **The reviewer is no longer the translator.** Two readings by one model share that model's blind spots, and a model asked to review what it just wrote prefers it; taking more draws fixes neither. The default reviewer is now `grok-4.6` while the translator stays `gpt-5.6`.

  Measured on 40 held-out pairs neither model had been run against, both reviewing under the same prompt: injection recall identical at 18/20, and the false-positive rate no worse — 3 of 40 documents flagged against 4 of 40. Those two numbers are one document apart, and the same model swings that far between samples, so this is not a claim that one model reviews better. It is a claim that the failures are not shared, which is the property being bought. In the round that measured it, the new reviewer caught a heading where "Collect Evidence Before Escalation" had become "before a version upgrade" — on a page the old arrangement passed.

  `translate.judge.model` still decides for one site, and `ALAUDA_OPENAI_JUDGE_MODEL` for a whole gateway. Setting either to the translator's own id restores the previous behaviour.

  **This requires the gateway to serve both models.** One that does not will fail on the first review, naming the model — set `translate.judge.model` to the translator's id there.

  **How hard the gateway is driven is now a setting**, where it used to be two constants:
  - `translate.concurrency` / `ALAUDA_OPENAI_CONCURRENCY` — how many documents are translated at once, and how many model calls may be in flight. Defaults to **2**, down from 10.
  - `translate.requestsPerMinute` / `ALAUDA_OPENAI_REQUESTS_PER_MINUTE` — the budget in model requests a minute. It counts calls rather than documents, so the extra turns a repair round takes count against it. Defaults to **25**, down from 50.

  Concurrency is one number rather than a pair that can drift apart, and a malformed value fails naming the variable instead of quietly falling back to the default: a run that is not the run that was asked for should say so.

  The new defaults are deliberately lower than the old constants. Translating a corpus is not urgent, and a gateway shared with everything else is the resource worth protecting; a run that finishes later costs less than one that crowds out the rest of the platform.

- [#350](https://github.com/alauda/doom/pull/350) [`cac2679`](https://github.com/alauda/doom/commit/cac267964df6d897c9d9252edb16a515c0d1f347) Thanks [@youyongsong](https://github.com/youyongsong)! - Check translations against the source they were made from, as lint rules, and add `doom translate check` to run those checks offline.

  Nothing has ever compared a translated document with its source. A translation could drop a bullet, rewrite a link into a different existing page, or come back verbatim in English, and every gate stayed green: the build only notices a link that resolves nowhere, and it notices it after the damaged file has already been committed back to the translations repository.

  The new `translation-parity` rules read two documents instead of one, paired exactly by the `sourceSHA` the translator writes:
  - **`translation-up-to-date`** — the pairing itself. Every other rule stands down unless this one is satisfied, and it says so out loud rather than skipping in silence.
  - **`translation-link-isomorphism`** — every link resolved against the document holding it, language segment stripped, multisets compared. Resolving is what makes it possible at all: a translation's asset links legitimately read `../../../en/networking/x.png` where the source reads `./x.png`, and both name the same file.
  - **`translation-component-multiset`** — a component is a thing on the page, not a turn of phrase; translating never adds or removes one.
  - **`translation-jsx-attribute-parity`** — component attributes are identifiers. Which ones are prose is declared once, in `runtime/components/_translation-policy.ts`, and is the same list the translator's masking uses.
  - **`translation-echoed-source`** — the model handed back what it was given.
  - **`translation-heading-sequence`**, **`translation-frontmatter-preservation`**, **`translation-length-ratio`**, **`translation-url-residue`**.

  `doom translate check [root]` runs them over translations that already exist, with no translation model involved — the offline way to survey which documents are damaged before deciding what is worth re-translating.

  Measured over a real corpus of 1768 translated documents: 14 findings, each one verified by hand, none of them false. They include three documents whose prose came back in English with only the frontmatter translated, a `<Term>` wrapped in backticks so it renders as literal source, two hyperlinks dropped from a page, a list item merged away, and — from the source side — a document whose frontmatter is missing its opening `---`, so `weight: 13` renders as a heading.

  Two rules were cut back to get there, and both cases are recorded in the rules themselves: comparing `src`/`href` as written reported every illustrated page, and matching anything shaped like `name.tld/path` reported API groups and annotation keys. `translation-terminology-adherence` ships but is deliberately **not** in the default rule set: run against the shared terminology table it reports 490 problems on a corpus that is substantially correct, because that table is a glossary of preferences rather than a set of invariants.

### Patch Changes

- [#350](https://github.com/alauda/doom/pull/350) [`cac2679`](https://github.com/alauda/doom/commit/cac267964df6d897c9d9252edb16a515c0d1f347) Thanks [@youyongsong](https://github.com/youyongsong)! - Keep the Chinese-typography rules on Chinese documents.

  `remark-lint-match-punctuation` and `remark-lint-no-chinese-punctuation-in-number` pair and place CJK punctuation. They joined the rule set when the only documents anyone linted were Chinese; now that translations are linted too, they read `pod’ами` — which is how Russian declines a Latin word — as an unmatched quotation mark and report every page that does it.

  Measured over a real corpus of 1728 translated documents, that was 17 of 19 findings, and none of the 17 was a defect. Both rules now apply only to documents under a `zh` directory. A document whose language cannot be told from its path keeps its messages: not knowing is a reason to report, not a reason to go quiet.

- [#350](https://github.com/alauda/doom/pull/350) [`cac2679`](https://github.com/alauda/doom/commit/cac267964df6d897c9d9252edb16a515c0d1f347) Thanks [@youyongsong](https://github.com/youyongsong)! - Stop `doom lint` from silently discarding messages on a trailing self-closing element.

  Message control drops messages that fall in a "gap" — a region of the file not represented in the tree. It decided a node's span was covered by walking its children, but a self-closing MDX element (`<K8sAPI name="…" />`) is a parent with an _empty_ `children` array, so its end offset was never recorded. When such an element was the last node, everything from its start to the end of the file became a gap and every message inside it was thrown away.

  A canonical API reference page is exactly that shape — a heading followed by a single `<K8sAPI … />` — so the rules written for those pages reported nothing at all, on a green build. Every rule's own spec passed throughout, because the specs did not run message control; a `lintMdxPipeline` test helper now does, and the regression case fails without the fix.

  Fixing that immediately surfaced a second defect it had been hiding: `no-unresolved-api-ref` read `metadata.name` straight off each permission source, while the permission plugin builds its runtime module from `items`. Against a `kind: List` source — what `kubectl get -o yaml` produces, and what this repository's own fixture is — the check therefore knew no function names at all and reported every `<K8sPermissionTable>` reference as unresolved. Both shapes are now read the way the runtime reads them.

- [#350](https://github.com/alauda/doom/pull/350) [`cac2679`](https://github.com/alauda/doom/commit/cac267964df6d897c9d9252edb16a515c0d1f347) Thanks [@youyongsong](https://github.com/youyongsong)! - Apply doom's lint rules to translated documents at all.

  `doom lint` reported success on a directory of translations having applied no rule to it. The remark config — which is what carries every doom lint rule, dead links included — was attached only to files under the source-language directory, so `zh/` and `ru/` documents were parsed and then checked against nothing. Linting a translation and linting nothing produced the same output.

  The remark config now covers every language directory. Spell checking stays scoped to the source language, where its dictionaries belong.

  The `translation-parity` rules also now run **before** `check-dead-links`, which rewrites link urls in place (`.mdx` to `.html`, language prefixes) as a side effect of asking rspress to resolve them. Comparing a rewritten translation against an unrewritten source reported 961 problems on a corpus that has one.

  Expect a first run over an existing repository to find things: these rules have never seen the translated half of it.

## 2.5.4

### Patch Changes

- [#343](https://github.com/alauda/doom/pull/343) [`935b096`](https://github.com/alauda/doom/commit/935b09662b6b8a05ae9d87b73c46e9766a263a27) Thanks [@youyongsong](https://github.com/youyongsong)! - Declare Doom's MDX global components in the built-in ESLint config so `doom lint` does not report them as undefined JSX identifiers.

## 2.5.3

### Patch Changes

- [#341](https://github.com/alauda/doom/pull/341) [`3d09242`](https://github.com/alauda/doom/commit/3d0924283d7da984352e6c87b40853b691f068ec) Thanks [@youyongsong](https://github.com/youyongsong)! - Add a lint rule that flags legacy MicroOS and KubeOS names in documentation.

- [#340](https://github.com/alauda/doom/pull/340) [`ad8af04`](https://github.com/alauda/doom/commit/ad8af04a8e33bb6a6dc3742456d1a23127472e88) Thanks [@youyongsong](https://github.com/youyongsong)! - Fix code block copying inside ordered lists so list markers are not included.

- Updated dependencies [[`ad8af04`](https://github.com/alauda/doom/commit/ad8af04a8e33bb6a6dc3742456d1a23127472e88)]:
  - @alauda/doom-export@0.4.2

## 2.5.2

### Patch Changes

- [#336](https://github.com/alauda/doom/pull/336) [`6eb862c`](https://github.com/alauda/doom/commit/6eb862c19a8fb9ea73988d350e039c8072dd1c4c) Thanks [@JounQin](https://github.com/JounQin)! - chore: bump dependencies

## 2.5.1

### Patch Changes

- [#334](https://github.com/alauda/doom/pull/334) [`b00b41b`](https://github.com/alauda/doom/commit/b00b41bd55f458c11a6fce5abfe817a17197f74e) Thanks [@JounQin](https://github.com/JounQin)! - fix: sort products by displayName

## 2.5.0

### Minor Changes

- [#327](https://github.com/alauda/doom/pull/327) [`ace4972`](https://github.com/alauda/doom/commit/ace4972a1b4b20504bf9c2d8d6414313df90ca72) Thanks [@JounQin](https://github.com/JounQin)! - chore: update dependencies and compatibility fixes
  - Update Rspress, Mermaid, OpenAI, YAML, and related dependencies.
  - Use Rspress shared helpers for gray matter and GitHub slug generation.
  - Adapt runtime component typings for updated dependencies.
  - Handle assistant responses without a readable stream body.
  - Check image links during dead-link linting.

- [#329](https://github.com/alauda/doom/pull/329) [`f665df4`](https://github.com/alauda/doom/commit/f665df4fe196557a59376bb331c3d18457448028) Thanks [@JounQin](https://github.com/JounQin)! - refactor: use smart doc sse parser - [#323](https://github.com/alauda/doom/pull/323)

- [#329](https://github.com/alauda/doom/pull/329) [`f665df4`](https://github.com/alauda/doom/commit/f665df4fe196557a59376bb331c3d18457448028) Thanks [@JounQin](https://github.com/JounQin)! - refactor: improve assistant style

### Patch Changes

- [#333](https://github.com/alauda/doom/pull/333) [`2e10478`](https://github.com/alauda/doom/commit/2e10478b2f8887a90252cf0fbd1af23382c40a3c) Thanks [@JounQin](https://github.com/JounQin)! - refactor(cli): improve code block handling during translation

- [#332](https://github.com/alauda/doom/pull/332) [`d3e9231`](https://github.com/alauda/doom/commit/d3e9231968d39bd33ba6ce6a9cdd997afbc82090) Thanks [@JounQin](https://github.com/JounQin)! - fix(cli): support relative file meta paths in translated code blocks

## 2.4.0

### Minor Changes

- [#321](https://github.com/alauda/doom/pull/321) [`e7f1157`](https://github.com/alauda/doom/commit/e7f115796882a9ecd4e329605942825d5959ced0) Thanks [@JounQin](https://github.com/JounQin)! - feat: add products and breadcrumb support

## 2.3.1

### Patch Changes

- [#319](https://github.com/alauda/doom/pull/319) [`c99c3ad`](https://github.com/alauda/doom/commit/c99c3ad2aebe66405136d7682913bc0ace404215) Thanks [@yangxiaolang](https://github.com/yangxiaolang)! - fix: adapt AI assistant streaming answer parsing

## 2.3.0

### Minor Changes

- [#318](https://github.com/alauda/doom/pull/318) [`f0f8b91`](https://github.com/alauda/doom/commit/f0f8b912d14799e738e1afbd4414ae22c3a7a456) Thanks [@JounQin](https://github.com/JounQin)! - feat: add heading anchor format lint rule

- [#317](https://github.com/alauda/doom/pull/317) [`652abba`](https://github.com/alauda/doom/commit/652abba1c9505b0822decf2513c510804e39e137) Thanks [@JounQin](https://github.com/JounQin)! - feat(remark-lint): add file-naming rule

- [#315](https://github.com/alauda/doom/pull/315) [`ada62f7`](https://github.com/alauda/doom/commit/ada62f758fbd14e129c60837ca6e43935c832e90) Thanks [@JounQin](https://github.com/JounQin)! - refactor: remove translate chunks in favor of streaming

## 2.2.0

### Minor Changes

- [#312](https://github.com/alauda/doom/pull/312) [`ffc03d0`](https://github.com/alauda/doom/commit/ffc03d070b93f7bdbb72f7faf86160c03d10593a) Thanks [@JounQin](https://github.com/JounQin)! - feat(remark-lint): add title-required rule

## 2.1.0

### Minor Changes

- [#306](https://github.com/alauda/doom/pull/306) [`f3176ef`](https://github.com/alauda/doom/commit/f3176efc1928fc8157433b582ccc2bfdaf80e932) Thanks [@JounQin](https://github.com/JounQin)! - chore: switch to OpenAI-compatible service config and rename related env vars

  Migration: replace `AZURE_OPENAI_ENDPOINT` / `AZURE_OPENAI_API_KEY` / `AZURE_OPENAI_MODEL` with `ALAUDA_OPENAI_BASE_URL` / `ALAUDA_OPENAI_API_KEY` / `ALAUDA_OPENAI_MODEL`.

## 2.0.0

### Major Changes

- [#303](https://github.com/alauda/doom/pull/303) [`13565e8`](https://github.com/alauda/doom/commit/13565e87bd19bdd711396689db8fecdc5bd1910c) Thanks [@JounQin](https://github.com/JounQin)! - chore!: alias deprecated K8sCrd to K8sAPI component

- [#301](https://github.com/alauda/doom/pull/301) [`460ae2d`](https://github.com/alauda/doom/commit/460ae2dde95114787627631f26b628786969380a) Thanks [@JounQin](https://github.com/JounQin)! - chore!: bump eslint v10

### Patch Changes

- [#304](https://github.com/alauda/doom/pull/304) [`603a0b8`](https://github.com/alauda/doom/commit/603a0b894e0d4d34af6f3f5b7db6548d0b77ee36) Thanks [@JounQin](https://github.com/JounQin)! - fix: resolve more components refs

## 1.22.1

### Patch Changes

- [#297](https://github.com/alauda/doom/pull/297) [`9796a59`](https://github.com/alauda/doom/commit/9796a59b497899a92bf9553d9cc948801087aa34) Thanks [@JounQin](https://github.com/JounQin)! - fix: should only consider stable original config nav length

## 1.22.0

### Minor Changes

- [#289](https://github.com/alauda/doom/pull/289) [`97b7680`](https://github.com/alauda/doom/commit/97b76804a0d4b02674e7442e2c3759daccc2a732) Thanks [@JounQin](https://github.com/JounQin)! - feat: add new rule no-unmatched-anchor

- [#292](https://github.com/alauda/doom/pull/292) [`be22246`](https://github.com/alauda/doom/commit/be22246117ae2492b403bd58b8a51fc9e5bd13b7) Thanks [@JounQin](https://github.com/JounQin)! - feat: deduplicate shared refs with a single component

- [#296](https://github.com/alauda/doom/pull/296) [`8db8744`](https://github.com/alauda/doom/commit/8db8744f982ccbf5f46b1a2a0c2e18a49c5f063c) Thanks [@JounQin](https://github.com/JounQin)! - feat: support download links via extensions

- [#290](https://github.com/alauda/doom/pull/290) [`6c73df6`](https://github.com/alauda/doom/commit/6c73df6e4e2322c4fe418fd898919ee6a42ab89c) Thanks [@JounQin](https://github.com/JounQin)! - feat: add new `callout` directive and component

### Patch Changes

- [#287](https://github.com/alauda/doom/pull/287) [`2d83618`](https://github.com/alauda/doom/commit/2d836180f4595c5073e7f2770de0a8f6391f491c) Thanks [@JounQin](https://github.com/JounQin)! - fix: ref in #/components/requestBodies/

## 1.21.5

### Patch Changes

- [#284](https://github.com/alauda/doom/pull/284) [`b55d473`](https://github.com/alauda/doom/commit/b55d4733ec23640e0f7f9614c554894f5fd7fc15) Thanks [@JounQin](https://github.com/JounQin)! - fix: downgrade to ESLint 9 temporarily

## 1.21.4

### Patch Changes

- [#282](https://github.com/alauda/doom/pull/282) [`25ed5d4`](https://github.com/alauda/doom/commit/25ed5d4c795d00149856686c59c577425bc0055a) Thanks [@JounQin](https://github.com/JounQin)! - fix: add @typescript-eslint/utils as dependency for eslint 10 compatibility across plugins

## 1.21.3

### Patch Changes

- [#280](https://github.com/alauda/doom/pull/280) [`d9a1cef`](https://github.com/alauda/doom/commit/d9a1cef1da28ab5e861e4672502ae2d53c7118b4) Thanks [@JounQin](https://github.com/JounQin)! - fix: @eslint/js not found issue

## 1.21.2

### Patch Changes

- [#278](https://github.com/alauda/doom/pull/278) [`2fc67ef`](https://github.com/alauda/doom/commit/2fc67efb39a7c3ebcaef86527d33777337aa2e31) Thanks [@JounQin](https://github.com/JounQin)! - chore: bump all dependencies

## 1.21.1

### Patch Changes

- [#275](https://github.com/alauda/doom/pull/275) [`4759bd4`](https://github.com/alauda/doom/commit/4759bd452f5e45edbbf9fa032495875e797c793c) Thanks [@renovate](https://github.com/apps/renovate)! - fix(deps): update rspress, ejs dependencies

- [#276](https://github.com/alauda/doom/pull/276) [`fdac5c3`](https://github.com/alauda/doom/commit/fdac5c355fe20ff84237d7a8b4de0c09a4ad09a8) Thanks [@JounQin](https://github.com/JounQin)! - fix: always calculate export

## 1.21.0

### Minor Changes

- [#271](https://github.com/alauda/doom/pull/271) [`4e049bd`](https://github.com/alauda/doom/commit/4e049bd5972abecd81e942dcaee24e3933e00ff7) Thanks [@JounQin](https://github.com/JounQin)! - feat: support adding api export entries automatically

## 1.20.5

### Patch Changes

- [#267](https://github.com/alauda/doom/pull/267) [`67d4d9a`](https://github.com/alauda/doom/commit/67d4d9aa940a743bc6c1ab03fcf0f9065a659d89) Thanks [@JounQin](https://github.com/JounQin)! - fix: known UI issues

- [`b43548a`](https://github.com/alauda/doom/commit/b43548a17b5167fb1db6475e20200f2de94667df) Thanks [@renovate[bot]](https://github.com/renovate%5Bbot%5D)! - fix(deps): update all dependencies, rspress/shiki, etc.

- [#269](https://github.com/alauda/doom/pull/269) [`a83d00a`](https://github.com/alauda/doom/commit/a83d00ae6a35f4fbd21ff6e65c51fedd0fb66085) Thanks [@JounQin](https://github.com/JounQin)! - fix: pdf missing outlines

- Updated dependencies [[`a83d00a`](https://github.com/alauda/doom/commit/a83d00ae6a35f4fbd21ff6e65c51fedd0fb66085)]:
  - @alauda/doom-export@0.4.1

## 1.20.4

### Patch Changes

- [#262](https://github.com/alauda/doom/pull/262) [`b134ee1`](https://github.com/alauda/doom/commit/b134ee1b19c944bdeeaf874e19101c6c97319f6e) Thanks [@JounQin](https://github.com/JounQin)! - fix: container style issue

## 1.20.3

### Patch Changes

- [#260](https://github.com/alauda/doom/pull/260) [`9e8c0f7`](https://github.com/alauda/doom/commit/9e8c0f70af88fc10c65eac90ce2db87eb1a792c7) Thanks [@JounQin](https://github.com/JounQin)! - fix: downgrade rspress for rsbuild regression temporarily

## 1.20.2

### Patch Changes

- [#257](https://github.com/alauda/doom/pull/257) [`77a3d81`](https://github.com/alauda/doom/commit/77a3d8151ef5e97ac8180d41e4d48455f7cb5900) Thanks [@JounQin](https://github.com/JounQin)! - fix: stick on eslint 9 temporarily

## 1.20.1

### Patch Changes

- [#256](https://github.com/alauda/doom/pull/256) [`1c29eb4`](https://github.com/alauda/doom/commit/1c29eb42d8af8e9a08acc010594d7c837d7128e0) Thanks [@JounQin](https://github.com/JounQin)! - fix: known callouts style issue

- [#254](https://github.com/alauda/doom/pull/254) [`ec5cc23`](https://github.com/alauda/doom/commit/ec5cc23e7f0be7a2a330fc0cf6afd6531bb8608f) Thanks [@JounQin](https://github.com/JounQin)! - feat: support exporting API docs in groups

## 1.20.0

### Minor Changes

- [#251](https://github.com/alauda/doom/pull/251) [`0e868d5`](https://github.com/alauda/doom/commit/0e868d584edf5c0a4d6f6cc5574e0fe0e80885e4) Thanks [@JounQin](https://github.com/JounQin)! - feat: override bookmarks according to sidebar config

### Patch Changes

- Updated dependencies [[`0e868d5`](https://github.com/alauda/doom/commit/0e868d584edf5c0a4d6f6cc5574e0fe0e80885e4)]:
  - @alauda/doom-export@0.4.0

## 1.19.1

### Patch Changes

- [#249](https://github.com/alauda/doom/pull/249) [`7d6ecec`](https://github.com/alauda/doom/commit/7d6ecec877794a6a79e25dda64224ba183cb1583) Thanks [@JounQin](https://github.com/JounQin)! - chore: bump rspress to v2.0.2 with other dependencies

## 1.19.0

### Minor Changes

- [#246](https://github.com/alauda/doom/pull/246) [`dc4507a`](https://github.com/alauda/doom/commit/dc4507ac2619aab2afaf8975f1115f5699419c49) Thanks [@JounQin](https://github.com/JounQin)! - feat: auto expandable code blocks

## 1.18.3

### Patch Changes

- [#243](https://github.com/alauda/doom/pull/243) [`bf7126a`](https://github.com/alauda/doom/commit/bf7126a3d461060ecefe47a1d68baf7c251612d6) Thanks [@JounQin](https://github.com/JounQin)! - feat: support linting site name usage

## 1.18.2

### Patch Changes

- [#241](https://github.com/alauda/doom/pull/241) [`ca885d9`](https://github.com/alauda/doom/commit/ca885d9d945f7ec7f5108f4704780106a9c9d25c) Thanks [@JounQin](https://github.com/JounQin)! - fix: api reference links

## 1.18.1

### Patch Changes

- [#238](https://github.com/alauda/doom/pull/238) [`18b83b1`](https://github.com/alauda/doom/commit/18b83b162abab341ee1a8758c01067e6a9ec9c46) Thanks [@JounQin](https://github.com/JounQin)! - fix: known issues

- [#240](https://github.com/alauda/doom/pull/240) [`702ccd2`](https://github.com/alauda/doom/commit/702ccd257252f07915017876767ea4f31de9df1b) Thanks [@JounQin](https://github.com/JounQin)! - chore: bump rspress to v2.0.0-rc.5

## 1.18.0

### Minor Changes

- [#236](https://github.com/alauda/doom/pull/236) [`92e7aaf`](https://github.com/alauda/doom/commit/92e7aaf649defc118ab1d422bc4766bb3887f203) Thanks [@JounQin](https://github.com/JounQin)! - feat: new K8sAPI component

## 1.17.6

### Patch Changes

- [#234](https://github.com/alauda/doom/pull/234) [`0be4926`](https://github.com/alauda/doom/commit/0be4926d80de74e58112785e07f1a435aa6d9693) Thanks [@JounQin](https://github.com/JounQin)! - fix: window reference on server

## 1.17.5

### Patch Changes

- [#232](https://github.com/alauda/doom/pull/232) [`8cc9fff`](https://github.com/alauda/doom/commit/8cc9fff23e6654051136f7e064dba485b2fe53d4) Thanks [@JounQin](https://github.com/JounQin)! - feat: use `masonry-layout` for overview

- [#233](https://github.com/alauda/doom/pull/233) [`e97c101`](https://github.com/alauda/doom/commit/e97c1019565883a234b076980b3258ed092f0383) Thanks [@JounQin](https://github.com/JounQin)! - chore: bump rspress to v2.0.0-rc.4

- [#229](https://github.com/alauda/doom/pull/229) [`60d53ec`](https://github.com/alauda/doom/commit/60d53eca3b517098c609fb37e6b79699b49e397a) Thanks [@JounQin](https://github.com/JounQin)! - fix: overview page style

- [#231](https://github.com/alauda/doom/pull/231) [`3c3badb`](https://github.com/alauda/doom/commit/3c3badb6eb10167f596c60ff8061d6066ad6804a) Thanks [@JounQin](https://github.com/JounQin)! - fix: use hack way to reuse builtin nav

## 1.17.4

### Patch Changes

- [#227](https://github.com/alauda/doom/pull/227) [`ca079e6`](https://github.com/alauda/doom/commit/ca079e69cfff16822dae1a3dd7069cd1f86fbef3) Thanks [@JounQin](https://github.com/JounQin)! - feat: support exporting APIs documents manually

## 1.17.3

### Patch Changes

- [#225](https://github.com/alauda/doom/pull/225) [`ea31a4c`](https://github.com/alauda/doom/commit/ea31a4c62120121e293b69921e98ff5f75b9a02b) Thanks [@JounQin](https://github.com/JounQin)! - fix: assistant style compatibility

## 1.17.2

### Patch Changes

- [#223](https://github.com/alauda/doom/pull/223) [`4d78da5`](https://github.com/alauda/doom/commit/4d78da5075197d445dc08fa8f7488ac36edb6f80) Thanks [@JounQin](https://github.com/JounQin)! - fix: exporting pdf style

- Updated dependencies [[`4d78da5`](https://github.com/alauda/doom/commit/4d78da5075197d445dc08fa8f7488ac36edb6f80)]:
  - @alauda/doom-export@0.3.1

## 1.17.1

### Patch Changes

- [#221](https://github.com/alauda/doom/pull/221) [`b105395`](https://github.com/alauda/doom/commit/b105395cdf4c1b5a0f9939542e8d950733b4cc82) Thanks [@JounQin](https://github.com/JounQin)! - fix: bump @alauda/doom-export

- Updated dependencies [[`b105395`](https://github.com/alauda/doom/commit/b105395cdf4c1b5a0f9939542e8d950733b4cc82)]:
  - @alauda/doom-export@0.3.0

## 1.17.0

### Minor Changes

- [#219](https://github.com/alauda/doom/pull/219) [`2e3453c`](https://github.com/alauda/doom/commit/2e3453c574cb0bcb5298a54b28dcc7ec99d3bee2) Thanks [@JounQin](https://github.com/JounQin)! - chore: bump rspress to v2.0.0-rc.2

## 1.16.4

### Patch Changes

- [#216](https://github.com/alauda/doom/pull/216) [`9f7c838`](https://github.com/alauda/doom/commit/9f7c838bc5c77bbc7190fb99e788222b6816585e) Thanks [@JounQin](https://github.com/JounQin)! - fix: $ref compatibility

## 1.16.3

### Patch Changes

- [#214](https://github.com/alauda/doom/pull/214) [`08c103a`](https://github.com/alauda/doom/commit/08c103ae5a83609c0e8562e79b7046b3d89072ae) Thanks [@JounQin](https://github.com/JounQin)! - chore: add @types/react as dependency for editor experience

## 1.16.2

### Patch Changes

- [#212](https://github.com/alauda/doom/pull/212) [`9976fc6`](https://github.com/alauda/doom/commit/9976fc6dbd4e6515d612b1d95416f83da5fb8edd) Thanks [@JounQin](https://github.com/JounQin)! - fix: schema in requestBody could be undefined

## 1.16.1

### Patch Changes

- [#210](https://github.com/alauda/doom/pull/210) [`81178e6`](https://github.com/alauda/doom/commit/81178e6726cb5d7925c08ea6d99c37485d8fdaa0) Thanks [@JounQin](https://github.com/JounQin)! - feat: support markdown for terms

## 1.16.0

### Minor Changes

- [#207](https://github.com/alauda/doom/pull/207) [`39e0f2f`](https://github.com/alauda/doom/commit/39e0f2f9f284b3a96e95a676aa05ce331a917aa4) Thanks [@JounQin](https://github.com/JounQin)! - refactor: remove bad attributes plugin

## 1.15.2

### Patch Changes

- [#205](https://github.com/alauda/doom/pull/205) [`e1a2a42`](https://github.com/alauda/doom/commit/e1a2a421bac741aaebba62257662776aeb08ca55) Thanks [@JounQin](https://github.com/JounQin)! - fix: sibling could be undefined

## 1.15.1

### Patch Changes

- [#202](https://github.com/alauda/doom/pull/202) [`b747fc6`](https://github.com/alauda/doom/commit/b747fc66e6c689ee8bb7bc285da669e3ca9b2586) Thanks [@JounQin](https://github.com/JounQin)! - fix: improve login style

## 1.15.0

### Minor Changes

- [#199](https://github.com/alauda/doom/pull/199) [`33bfc84`](https://github.com/alauda/doom/commit/33bfc84de23c39a014e8b3fd4bff32ed12c23c78) Thanks [@JounQin](https://github.com/JounQin)! - feat: require auth login for russian docs

### Patch Changes

- [#201](https://github.com/alauda/doom/pull/201) [`104bc64`](https://github.com/alauda/doom/commit/104bc6425a72c457400bfc5e42920669b55b44b3) Thanks [@JounQin](https://github.com/JounQin)! - chore: bump all (dev)Dependencies

- Updated dependencies [[`104bc64`](https://github.com/alauda/doom/commit/104bc6425a72c457400bfc5e42920669b55b44b3)]:
  - @alauda/doom-export@0.2.1

## 1.14.3

### Patch Changes

- [#197](https://github.com/alauda/doom/pull/197) [`31697e7`](https://github.com/alauda/doom/commit/31697e7f8532586025e430a83c0f4cc7e5dd6525) Thanks [@JounQin](https://github.com/JounQin)! - fix: incompatible styles with new rspress versions

## 1.14.2

### Patch Changes

- [#195](https://github.com/alauda/doom/pull/195) [`b5f3948`](https://github.com/alauda/doom/commit/b5f39485f41a68ded33b2e9e0d9672353b1fea34) Thanks [@JounQin](https://github.com/JounQin)! - fix: choices could be empty

## 1.14.1

### Patch Changes

- [#192](https://github.com/alauda/doom/pull/192) [`225863c`](https://github.com/alauda/doom/commit/225863c4c6c0c265314f0e3f06fa946b3f24c81b) Thanks [@JounQin](https://github.com/JounQin)! - fix: use streaming response instead

- [#194](https://github.com/alauda/doom/pull/194) [`25d9a02`](https://github.com/alauda/doom/commit/25d9a028b1d5606fab7a47b719cdfaf7106580a8) Thanks [@JounQin](https://github.com/JounQin)! - chore: enable intelligence on docs.alauda.cn

## 1.14.0

### Minor Changes

- [#190](https://github.com/alauda/doom/pull/190) [`d131ade`](https://github.com/alauda/doom/commit/d131adec79419ffc4c28693de89338b7002fb70c) Thanks [@JounQin](https://github.com/JounQin)! - chore: bump all (dev)Dependencies

### Patch Changes

- Updated dependencies [[`d131ade`](https://github.com/alauda/doom/commit/d131adec79419ffc4c28693de89338b7002fb70c)]:
  - @alauda/doom-export@0.2.0

## 1.13.3

### Patch Changes

- [#189](https://github.com/alauda/doom/pull/189) [`d29c615`](https://github.com/alauda/doom/commit/d29c615d1e314b2ae58f2b3ce0daaa99d814cb5d) Thanks [@JounQin](https://github.com/JounQin)! - chore: change legacy docs usage

- [#187](https://github.com/alauda/doom/pull/187) [`2373559`](https://github.com/alauda/doom/commit/237355938fd6557a7cb8b4c1b01c5344295c712f) Thanks [@JounQin](https://github.com/JounQin)! - feat: specify lang via cli

## 1.13.2

### Patch Changes

- [#184](https://github.com/alauda/doom/pull/184) [`3153e59`](https://github.com/alauda/doom/commit/3153e59e0feba6d5dd5270224651879ffff840b8) Thanks [@JounQin](https://github.com/JounQin)! - feat: support check dead links in lint command

- Updated dependencies [[`3153e59`](https://github.com/alauda/doom/commit/3153e59e0feba6d5dd5270224651879ffff840b8)]:
  - @alauda/doom-export@0.1.1

## 1.13.1

### Patch Changes

- [#182](https://github.com/alauda/doom/pull/182) [`71926d0`](https://github.com/alauda/doom/commit/71926d0e4363dd1405c15f779cd6c73d14583253) Thanks [@JounQin](https://github.com/JounQin)! - fix: ignore `internalRoutes` when `--ignore` enabled

## 1.13.0

### Minor Changes

- [#178](https://github.com/alauda/doom/pull/178) [`ba7a139`](https://github.com/alauda/doom/commit/ba7a139efaca094302897a8030f9513ac3610934) Thanks [@JounQin](https://github.com/JounQin)! - feat: support fixed language for edit repo

## 1.12.7

### Patch Changes

- [#176](https://github.com/alauda/doom/pull/176) [`a150af9`](https://github.com/alauda/doom/commit/a150af938ca21ebdc54c7b8661535997f256217f) Thanks [@JounQin](https://github.com/JounQin)! - chore(deps): bump `openai` for `api-key` header compatibility support

- [#176](https://github.com/alauda/doom/pull/176) [`a150af9`](https://github.com/alauda/doom/commit/a150af938ca21ebdc54c7b8661535997f256217f) Thanks [@JounQin](https://github.com/JounQin)! - fix: incorrect login state check

## 1.12.6

### Patch Changes

- [#173](https://github.com/alauda/doom/pull/173) [`2a05a10`](https://github.com/alauda/doom/commit/2a05a106b0e39ddf15fa163376a43fef3ebcfa82) Thanks [@JounQin](https://github.com/JounQin)! - fix: lock openai version temporarily

## 1.12.5

### Patch Changes

- [#172](https://github.com/alauda/doom/pull/172) [`d23382f`](https://github.com/alauda/doom/commit/d23382fc99b5951e56469fe618148c4a411d6ebc) Thanks [@JounQin](https://github.com/JounQin)! - chore(deps): bump rspress to v2.0.0-beta.30

- [#170](https://github.com/alauda/doom/pull/170) [`cce9a6a`](https://github.com/alauda/doom/commit/cce9a6a8f273224b9d34e8db3cb5972e0769f5b2) Thanks [@JounQin](https://github.com/JounQin)! - feat: add Authorization header support

## 1.12.4

### Patch Changes

- [#168](https://github.com/alauda/doom/pull/168) [`b2d05be`](https://github.com/alauda/doom/commit/b2d05be38b306cf8aca989dd35098b8221e3ad60) Thanks [@JounQin](https://github.com/JounQin)! - fix: throw on jira request errors

## 1.12.3

### Patch Changes

- [#166](https://github.com/alauda/doom/pull/166) [`7c18c84`](https://github.com/alauda/doom/commit/7c18c84b5893b6b2d5cfb6b26778b73d9bde052c) Thanks [@JounQin](https://github.com/JounQin)! - chore(deps): bump rspress to v2.0.0-beta.29

## 1.12.2

### Patch Changes

- [#164](https://github.com/alauda/doom/pull/164) [`1540a24`](https://github.com/alauda/doom/commit/1540a24596e9dee4ffef44a410971f6477eeff5b) Thanks [@JounQin](https://github.com/JounQin)! - fix: enable defaultWrapCode on exporting

## 1.12.1

### Patch Changes

- [#162](https://github.com/alauda/doom/pull/162) [`ce2ca1e`](https://github.com/alauda/doom/commit/ce2ca1ed48fcb97b69459b36ef225f9640f5928f) Thanks [@JounQin](https://github.com/JounQin)! - fix: css selector for tooltip

## 1.12.0

### Minor Changes

- [#160](https://github.com/alauda/doom/pull/160) [`1163f0b`](https://github.com/alauda/doom/commit/1163f0b2deefea323408e2b87f9dddebd2253c20) Thanks [@JounQin](https://github.com/JounQin)! - feat: migrate intelligence support

## 1.11.0

### Minor Changes

- [#159](https://github.com/alauda/doom/pull/159) [`a7af4c7`](https://github.com/alauda/doom/commit/a7af4c74813154ae408b56d27f45e9321deff778) Thanks [@JounQin](https://github.com/JounQin)! - feat: migrate to mono repo

### Patch Changes

- [#158](https://github.com/alauda/doom/pull/158) [`14f1b72`](https://github.com/alauda/doom/commit/14f1b72022a4db4b73e5d277a6866c2cca3c40c3) Thanks [@JounQin](https://github.com/JounQin)! - fix: overview matching logic

- [#156](https://github.com/alauda/doom/pull/156) [`01e8bf8`](https://github.com/alauda/doom/commit/01e8bf8b1774e37c1613ff636c2dff6f1e4fc934) Thanks [@JounQin](https://github.com/JounQin)! - chore(deps): bump rspress to v2.0.0-beta.28

- Updated dependencies [[`a7af4c7`](https://github.com/alauda/doom/commit/a7af4c74813154ae408b56d27f45e9321deff778)]:
  - @alauda/doom-export@0.1.0
