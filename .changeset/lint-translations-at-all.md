---
"@alauda/doom": patch
---

Apply doom's lint rules to translated documents at all.

`doom lint` reported success on a directory of translations having applied no rule to it. The remark config — which is what carries every doom lint rule, dead links included — was attached only to files under the source-language directory, so `zh/` and `ru/` documents were parsed and then checked against nothing. Linting a translation and linting nothing produced the same output.

The remark config now covers every language directory. Spell checking stays scoped to the source language, where its dictionaries belong.

The `translation-parity` rules also now run **before** `check-dead-links`, which rewrites link urls in place (`.mdx` to `.html`, language prefixes) as a side effect of asking rspress to resolve them. Comparing a rewritten translation against an unrewritten source reported 961 problems on a corpus that has one.

Expect a first run over an existing repository to find things: these rules have never seen the translated half of it.
