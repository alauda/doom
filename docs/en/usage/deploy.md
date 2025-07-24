---
description: >-
  After the documentation project development is completed, we can deploy the
  project to the ACP platform
weight: 8
sourceSHA: 8895eb94077d2ba4d905499090cd1c9c694d34d64046c692bdfe48d0d2a40d6e
---

# Deployment

## Build and Preview

Before deployment, we need to build the project for production and preview it locally to ensure the project runs correctly:

```bash
doom build # Build static assets
doom serve # Preview the build assets in production mode
```

## Multi-version Build {#multi-version}

By default, `doom build` outputs the build artifacts to the `dist` directory. If you need to build multiple versions of the documentation, you can specify the version number with the `-v` parameter, for example:

```bash
# Usually determined by branch name, e.g., release-4.0 corresponds to version 4.0
doom build -v 4.0 # Build version 4.0, output to dist/4.0, documentation access path is {base}/4.0
doom build -v master # Build master version, output to dist/master, documentation access path is {base}/master
doom build -v {other} # Build other versions, output to dist/{other}, documentation access path is {base}/{other}

# unversioned and unversioned-x.y are special version numbers used to build documentation without version prefix
doom build -v unversioned # Build documentation without version prefix, output to dist/unversioned, documentation access path is {base}
doom build -v unversioned-4.0 # Build documentation without version prefix but showing version 4.0 in the navbar, output to dist/unversioned, documentation access path is {base}
```

## Merged Directory Structure

```sh
│── console-platform
│   ├── 4.0
│   ├── 4.1
│   ├── index.html
│   ├── overrides.yaml
│   └── versions.yaml
│── console-devops-docs
│   ├── 4.0
│   ├── 4.1
│   ├── index.html
│   ├── overrides.yaml
│   └── versions.yaml
│── console-tekton-docs
│   ├── 1.0
│   ├── 1.1
│   ├── index.html
│   ├── overrides.yaml
│   └── versions.yaml
```

```html title="index.html"
<!DOCTYPE html>
<html>
  <head>
    <title>Redirecting...</title>
    <meta http-equiv="refresh" content="0; url=/console-docs/4.1" />
  </head>
  <body>
    <p>Redirecting to <a href="/console-docs/4.1">/console-docs/4.1</a></p>
  </body>
</html>
```

## Dynamic Mount Configuration File {#overrides}

```yaml title="overrides.yaml"
# Documentation information, each document can mount to override default configuration
title:
  en: Doom - Alauda
  zh: Doom - 灵雀云
logoText:
  en: Doom - Alauda
  zh: Doom - 灵雀云
```

```yaml title="versions.yaml"
- '4.1'
- '4.0'
```
