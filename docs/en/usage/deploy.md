---
description: >-
  After completing the project development, we can deploy the project to the ACP
  platform.
weight: 8
sourceSHA: c87a4a8346bc7c7c09d4aa01777c7196f17d414fb6f8673371b6c91e8537c5fe
---

# Deployment

## Build and Preview

Before deployment, we need to build the project for the production environment and preview it locally to ensure the project runs correctly:

```bash
doom build # Build static artifacts
doom serve # Preview the build artifacts in production mode
```

## Multi-Version Builds

By default, `doom build` will output the build artifacts to the `dist` directory. If multiple versions of the documentation need to be built, you can specify the version number using the `-v` parameter, for example:

```bash
# Typically determined by the branch name, such as release-4.0 corresponding to version 4.0
doom build -v 4.0 # Build version 4.0, output artifacts to dist/4.0, documentation access path is {base}/4.0
doom build -v master # Build master version, output artifacts to dist/master, documentation access path is {base}/master
doom build -v {other} # Build other versions, output artifacts to dist/{other}, documentation access path is {base}/{other}

# unversioned and unversioned-x.y are special version numbers used for building documents without version prefixes
doom build -v unversioned # Build document without version prefix, output artifacts to dist/unversioned, documentation access path is {base}
doom build -v unversioned-4.0 # Build document without version prefix but display version number 4.0 in the navigation bar, output artifacts to dist/unversioned, documentation access path is {base}
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

## Dynamic Mounting Configuration File {#overrides}

```yaml title="overrides.yaml"
# Document information, each document can mount to override default configuration
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
