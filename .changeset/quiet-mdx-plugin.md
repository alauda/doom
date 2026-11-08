---
"@alauda/doom": patch
---

Pin eslint-plugin-mdx to 3.8.3 to avoid the expensive full-page difference calculation introduced in 3.9, which can make documentation linting take more than 30 minutes.
