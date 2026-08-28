---
"@alauda/doom": minor
---

Translate in a checked loop instead of one call, and have a second reading judge the meaning.

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
