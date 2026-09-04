---
"@alauda/doom": patch
---

Stop a translation's broken bold from failing the whole document.

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
