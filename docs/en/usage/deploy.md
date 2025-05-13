---
description: >-
  After completing the project development, we can deploy the project to the ACP
  platform.
weight: 8
sourceSHA: b8be77fb7d7f9a2fb5fc34de8b0423df711c0220a02acad1c602f6cb2d3ab36a
---

# Deployment

## Build and Preview

Before deployment, we need to build the project for the production environment and preview it locally to ensure the project runs correctly:

```bash
doom build # Build static artifacts
doom serve # Preview the build artifacts in production mode
```

## Image Build

Refer to the [ci.yaml](https://gitlab-ce.alauda.cn/idp/Doom/-/blob/master/.build/ci.yaml) to create the pipeline configuration file, and use the [Dockerfile](https://gitlab-ce.alauda.cn/idp/Doom/-/blob/master/Dockerfile) to build a pure static resource image.

```dockerfile
FROM build-harbor.alauda.cn/ops/alpine:latest

WORKDIR /docs

COPY . dist
```

## Deploy to ACP

### Multi-Version Build

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

### Merged Directory Structure

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

#### Dynamic Mounting Configuration File {#overrides}

```yaml title="overrides.yaml"
# Terminology information only needs to be mounted to the console-platform entry once, the following is the default configuration without dynamic mounting
# https://gitlab-ce.alauda.cn/idp/Doom/-/blob/master/src/terms.ts#L11
terms:
  company:
    en: Alauda
    zh: 灵雀云
  product:
    en: Alauda Container Platform
    zh: 灵雀云容器平台
  productShort:
    en: ACP

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

### Documentation Released with the Product

Currently, product documentation is deployed together with [chart-frontend](https://gitlab-ce.alauda.cn/frontend/chart-frontend/-/blob/master/chart/values.yaml#L78-107). Therefore, there is no need to change the release process, and it can continue to follow the original [alauda-docs](https://gitlab-ce.alauda.cn/alauda/alauda-docs) release process. If all product documentation is split later, it will require the front end to adjust the relevant [release pipeline](https://edge.alauda.cn/console-devops/workspace/frontend/cd?delivery=packager-frontend-chart) image check configuration in the `check-alauda-docs` phase simultaneously.

### Other Self-Hosted Documentation

For documentation that does not need to be released with the product, such as the current `doom` documentation, you can use the IDP-provided [webapp](https://edge.alauda.cn/console-acp/app-market/idp~alauda-idp~idp/chart/webapp.idp-repo/latest) application template for quick deployment. Currently, it relies on manually updating the application’s image version after building the image.

:::info
PR preview, gitops, and other related features will be provided in the future.
:::
