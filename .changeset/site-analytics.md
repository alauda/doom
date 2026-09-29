---
"@alauda/doom": minor
---

Add opt-in site analytics for the official documentation sites: `doom build --analytics`.

We have no data on how the docs are read. This adds four signals, chosen to
answer three questions — which versions are still read, what readers cannot
find, and which pages have problems:

- page views, split by site, version and language;
- site search queries, with the result count, so zero-result searches show
  what is missing;
- 404 pages, with the in-site page that linked to them;
- a "Was this page helpful?" widget under each doc page: 👍, or 👎 with
  reasons (steps did not work / outdated / missing information / hard to
  understand / other). There is no free-text box.

`docs.alauda.io` reports to PostHog (EU); `docs.alauda.cn` reports to Tencent
Cloud RUM, so mainland readers' data stays in China. Both use the same event
names and fields.

Offline packages must never phone home, and they are built from the same
`doom.config.yml` as the online site. So the switch is a CLI flag, not config:

- without `--analytics` the analytics code, both SDKs and the keys are
  removed from the bundle entirely;
- with it, a page still reports nothing unless it is served from one of the
  listed hosts, and `/russian/` is excluded;
- no cookies or `localStorage` (Tencent RUM keeps a tab-scoped session id in
  `sessionStorage`, which cannot be turned off), and Do Not Track / Global
  Privacy Control are honoured.

Only online builds (`build-online-io`, `build-online-cn`) should pass the flag.
The widget is part of the `@alauda/doom/theme` layout, so sites without that
theme entry get statistics but no widget.
