---
"@alauda/doom": patch
---

Compare a translation with its source through the same parser, and stop reading a linked URL as prose.

`tektoncd-operator` release-4.2, 4.6 and 4.8 all went red on `auto-translate-zh` over one line of an English source — `eg. HTTP_PROXY=http://10.10.10.10:8080` — and no repair round could clear it. Two defects were making the translator's own work unreadable to the checks that judge it:

- **The two sides were parsed differently.** The document being checked came through the lint pipeline, which has `remark-directive`; the source it was compared against was parsed with the site's `mdxProcessor`, which does not. Anything directive syntax touches — a port in `http://host:8080`, a tag in `image:1.25`, a time in `10:30` — was a `textDirective` on one side and plain text on the other, and the difference was reported as damage. The syntax stack now lives in `remark-lint/syntax-plugins.ts` and both sides parse with it. `no-unmatched-anchor` reads anchors through it too, so a document's anchors no longer depend on whether the run happened to lint it before reading it.
- **`translation-url-residue` walked into links.** Its premise is that a URL markdown turned into a link is protected structurally and belongs to `translation-link-isomorphism`; the implementation still counted the link's own label. `[http://host:8080](http://host:8080)` — the one spelling of a bare URL that Chinese sentence punctuation cannot corrupt — was therefore read as prose that had lost its URL. Between the two defects no spelling the translator could reach satisfied both rules, so the loop could only run out of rounds and fail the document.

`translation-link-isomorphism` now also names the case it used to describe twice and explain never. A bare URL runs on until a space and markdown only drops trailing _ASCII_ punctuation, so `例如 http://host:8080。` links to `http://host:8080。` — an address that does not exist, in a document whose Chinese is correct. The finding says which character was swallowed and gives the spelling that keeps it outside the address, instead of reporting one lost target and one unexpected one and leaving the translator to work out which of the two it was supposed to change.

Verified on 836 paired documents from a real corpus and on `doom lint` over the fixture site: findings identical before and after, so the corrections drop false reports without silencing real ones.
