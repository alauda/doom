---
"@alauda/doom": minor
---

Review translations with a different model by default, and give the gateway a budget that can be set.

**The reviewer is no longer the translator.** Two readings by one model share that model's blind spots, and a model asked to review what it just wrote prefers it; taking more draws fixes neither. The default reviewer is now `grok-4.6` while the translator stays `gpt-5.6`.

Measured on 40 held-out pairs neither model had been run against, both reviewing under the same prompt: injection recall identical at 18/20, and the false-positive rate no worse — 3 of 40 documents flagged against 4 of 40. Those two numbers are one document apart, and the same model swings that far between samples, so this is not a claim that one model reviews better. It is a claim that the failures are not shared, which is the property being bought. In the round that measured it, the new reviewer caught a heading where "Collect Evidence Before Escalation" had become "before a version upgrade" — on a page the old arrangement passed.

`translate.judge.model` still decides for one site, and `ALAUDA_OPENAI_JUDGE_MODEL` for a whole gateway. Setting either to the translator's own id restores the previous behaviour.

**This requires the gateway to serve both models.** One that does not will fail on the first review, naming the model — set `translate.judge.model` to the translator's id there.

**How hard the gateway is driven is now a setting**, where it used to be two constants:

- `translate.concurrency` / `ALAUDA_OPENAI_CONCURRENCY` — how many documents are translated at once, and how many model calls may be in flight. Defaults to **2**, down from 10.
- `translate.requestsPerMinute` / `ALAUDA_OPENAI_REQUESTS_PER_MINUTE` — the budget in model requests a minute. It counts calls rather than documents, so the extra turns a repair round takes count against it. Defaults to **25**, down from 50.

Concurrency is one number rather than a pair that can drift apart, and a malformed value fails naming the variable instead of quietly falling back to the default: a run that is not the run that was asked for should say so.

The new defaults are deliberately lower than the old constants. Translating a corpus is not urgent, and a gateway shared with everything else is the resource worth protecting; a run that finishes later costs less than one that crowds out the rest of the platform.
