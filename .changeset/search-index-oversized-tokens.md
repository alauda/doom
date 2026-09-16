---
"@alauda/doom": patch
---

Keep pathologically long tokens out of the browser-side search index.

Opening the search box on the connectors documentation site crashed the tab with
`Out of Memory`. The index file it downloads is 1.1 MB; building the index from
it took **1970 MB of heap and 18.2 seconds** of blocked main thread. Measured on
the live site's index, in Node, with rspress's own `LocalProvider` parameters —
a browser costs more, because the tab also holds the DOM, React and the rest of
the page.

The cause was three pages whose YAML samples embed a base64-encoded SVG icon in
a `tekton.dev/icon` annotation — 11,819, 4,243 and 2,995 characters. rspress
configures FlexSearch with `tokenize: 'full'`, which indexes _every substring_
of every token, so a token's cost grows with the square of its length. Those
three blobs are **2% of the indexed text and were 91% of the memory**: the
twenty longest tokens alone accounted for 50.7% of the 6.1 million substrings
the index expanded into.

It is worth being precise that this is not about site size, because the obvious
reading is wrong. acp-docs has **3.7× more indexed text** across 914 pages and
builds its index in **230 MB and 4.3 seconds**. Its longest token is 184
characters. Length is the whole story.

A new `doom-search-index` plugin now strips tokens longer than 64 characters in
the `modifySearchIndexData` hook, just before the index file is written — an
official rspress hook, so nothing internal is patched or aliased. The same index
then builds in **72 MB and 1.1 seconds**. 64 leaves real prose alone: the
longest English words run 20-30 characters and long code identifiers 40-50.

Two things this deliberately does not do:

- **CJK runs are never stripped.** A long unpunctuated Chinese sentence matches
  `\p{L}{65,}` exactly the way a base64 blob does, and removing it would
  silently make that text unsearchable. Those runs are already handled by the
  dedicated CJK index, which splits them per character.
- **`toc[].charIndex` is shifted by the same amount the content lost.** The
  search UI uses those offsets to decide which heading a hit belongs to;
  shortening the content without moving them would attribute hits to the wrong
  section and link to the wrong anchor.

When something is stripped the build prints a warning naming the page and the
longest token, because a base64 payload or a credential sitting in a code sample
is worth telling the author about. Silence is the normal case.
