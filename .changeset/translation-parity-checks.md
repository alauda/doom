---
"@alauda/doom": minor
---

Check translations against the source they were made from, as lint rules, and add `doom translate check` to run those checks offline.

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
