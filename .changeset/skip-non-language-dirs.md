---
"@alauda/doom": patch
---

Only a supported language's directory is a language. Any other directory under
the docs root is now skipped with a warning instead of failing the build.

Every directory directly under the docs root used to become a language, apart
from `dist`, `node_modules`, `public` and `shared`. Each language gets a
`/<lang>/products` page whose heading comes from doom's word list, and the word
list only has `en`, `zh` and `ru`. So when `tektoncd-operator` added a shell
script under `docs/scripts/`, `scripts` became a language, and every docs build
of both its branches failed from then on (65 runs over two days, none green)
with an error that says nothing about the directory:

```text
Page "/scripts/products" SSG rendering failed.
TypeError: Cannot read properties of undefined (reading 'all_product_documentation')
```

Nor could a site work around it: there is no option to name the languages, and
a `themeConfig.locales` list in the config is appended to the detected one
rather than replacing it.

A directory is now a language only if its name is one of
`SUPPORTED_LANGUAGES`, the list `doom lint` and `doom translate` already use.
Any other directory is left out of the site the way `shared/` is — none of its
files becomes a page — and the build says which one it skipped:

```text
Skipped `docs/scripts`: not a language directory (doom builds en, zh, ru), so no pages are built from it, like `shared`
```

`-I` / `-E` still pick the languages first; a directory they leave out is
skipped silently, as before. The same rule covers a directory of pages in a
language doom does not support, such as `docs/ja/`: its pages are not built, and
the warning is the only sign of it.
