---
"@alauda/doom": minor
---

The reviewer reads a segment once, and only reads again to confirm a finding.

Measured on 2026-09-04 over 80 readings of translations the pipeline had already
accepted: a reading that finds nothing is the common case (97%), the two that
found something were right, and the extra readings only ever confirmed what the
first one saw. So the vote is now taken only when there is something blocking to
vote on: a clean first reading is final, a first reading with a blocking finding
is followed by the other readings and the same 2-of-3 (or 2-of-2) rule. What is
sent back does not change; what a segment that passes costs does — one reading
instead of three, which on this gateway is most of the calls a document makes.

Four smaller things from the same day's measurements, all on the translation
side of a build:

- a segment that is nothing but headings and components — half the index pages
  of a site — is not reviewed at all: there is no sentence to read, and the
  deterministic checks already hold the heading and the components to the
  source;
- a rejection in the build log now carries what the reviewer said, not only the
  rule name. Whether the reviewer was right took a day of probing to answer,
  because its reasons had been printed nowhere;
- a gateway that refuses is waited for for about five minutes instead of about
  thirty seconds, for the translation call and the reviewer alike. Four builds
  sharing one account were refused for minutes at a time, and the old budget
  turned that into failed documents;
- one document's error is that document's failure, not the run's. A reviewer
  reading that was refused past its retries used to throw out of the run and
  take every other document still in flight with it; it is now reported with
  the other failures at the end, and the documents already written stay written.
