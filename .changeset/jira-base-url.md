---
"@alauda/doom": minor
---

Make the Jira that release notes are fetched from configurable, with `JIRA_BASE_URL`.

A `release-notes-for-bugs` placeholder is filled from Jira's search API, and the
address of that API was written into the code — `https://jira.alauda.cn/rest/api/2/search`
— while only the credentials, `JIRA_USERNAME` and `JIRA_PASSWORD`, came from the
environment. A build that can reach Jira only through another host or port had no
way to say so, and a production build fails when it cannot fetch its release notes.

`JIRA_BASE_URL` is the Jira base URL: the scheme, the host, an optional port and an
optional context path, without `/rest/...`. doom appends `/rest/api/2/search` to it.
A trailing `/` is ignored, and an empty value counts as unset, which is the shape an
unset variable often arrives in. It is read for each request rather than when the
module loads, so it does not matter when the plugin was first imported.

Unset, the request is byte for byte the one doom sent before, so nothing changes for
a build that does not set it.
