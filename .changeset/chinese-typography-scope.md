---
"@alauda/doom": patch
---

Keep the Chinese-typography rules on Chinese documents.

`remark-lint-match-punctuation` and `remark-lint-no-chinese-punctuation-in-number` pair and place CJK punctuation. They joined the rule set when the only documents anyone linted were Chinese; now that translations are linted too, they read `pod’ами` — which is how Russian declines a Latin word — as an unmatched quotation mark and report every page that does it.

Measured over a real corpus of 1728 translated documents, that was 17 of 19 findings, and none of the 17 was a defect. Both rules now apply only to documents under a `zh` directory. A document whose language cannot be told from its path keeps its messages: not knowing is a reason to report, not a reason to go quiet.
