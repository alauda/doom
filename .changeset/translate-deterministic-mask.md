---
"@alauda/doom": minor
---

Protect everything a translation model must not author, deterministically, instead of asking it not to touch things.

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
