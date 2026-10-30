---
"@alauda/doom": minor
---

Upgrade Mermaid to v12.2.0 and switch the site defaults to `redux-color` / `redux-dark-color`.

Mermaid 12 makes `redux-color` and the `neo` look the default for many diagram types, and lays those types out with ELK. Doom used to force `theme: default` in light mode and `theme: dark` in dark mode, which would have kept the old palette after the upgrade. Light mode now names `redux-color`; dark mode names `redux-dark-color`, because Mermaid does not pick that palette from `dark` on its own.

Diagrams that do not set `theme`, `look`, or `layout` in front matter will look different.
