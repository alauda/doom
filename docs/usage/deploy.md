---
description: 文档项目开发完成后我们可以将项目部署到 ACP 平台
weight: 8
---

# 部署

## 构建与预览

在部署之前，我们需要先对项目进行生产环境的构建，并在本地进行预览，以确保项目能够正常运行：

```bash
doom build # 构建静态产物
doom serve # 以生产模式预览构建产物
```

## 镜像构建

参考 [ci.yaml](https://gitlab-ce.alauda.cn/idp/Doom/-/blob/master/.build/ci.yaml) 创建流水线配置文件，以及 [Dockerfile](https://gitlab-ce.alauda.cn/idp/Doom/-/blob/master/Dockerfile) 用于构建纯静态资源镜像

```dockerfile
FROM build-harbor.alauda.cn/ops/alpine:latest

WORKDIR /docs

COPY . dist
```

## 部署到 ACP

### 多版本构建

默认情况下，`doom build` 会将构建产物输出到 `dist` 目录，如果需要构建多个版本的文档，可以通过 `-v` 参数指定版本号，例如：

```bash
# 一般由分支名确定，如 release-4.0 对应 4.0 版本
doom build -v 4.0 # 构建 v4.0 版本，产物输出到 dist/v4.0，文档访问路径为 {base}/v4.0
doom build -v master # 构建 master 版本，产物输出到 dist/master，文档访问路径为 {base}/master
doom build -v {other} # 构建其他版本，产物输出到 dist/{other}，文档访问路径为 {base}/{other}

# unversioned 为特殊版本号，用于构建无版本号的文档
doom build -v unversioned # 构建无版本号的文档，产物输出到 dist/unversioned，文档访问路径为 {base}
```

### 合并目录结构

```sh
├── console-platform
│   ├── v4.0
│   ├── v4.1
│   ├── index.html
│   ├── overrides.yaml
|   └── versions.yaml
│── console-devops-docs
│   ├── v4.0
│   ├── v4.1
│   ├── index.html
│   ├── overrides.yaml
|   └── versions.yaml
│── console-tekton-docs
│   ├── v1.0
│   ├── v1.1
│   ├── index.html
│   ├── overrides.yaml
|   └── versions.yaml
```

```html title="index.html"
<!DOCTYPE html>
<html>
  <head>
    <title>Redirecting...</title>
    <meta http-equiv="refresh" content="0; url=/console-docs/v4.1" />
  </head>
  <body>
    <p>Redirecting to <a href="/console-docs/v4.1">/console-docs/v4.1</a></p>
  </body>
</html>
```

#### 动态挂载配置文件 \{#overrides}

```yaml title="overrides.yaml"
# 术语信息，只需要挂载到 console-platform 一个入口即可，以下为无动态挂载的默认配置
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

# 文档信息，每个文档都可以挂载覆盖默认配置
title:
  en: Doom - Alauda
  zh: Doom - 灵雀云
logoText:
  en: Doom - Alauda
  zh: Doom - 灵雀云
```

```yaml title="versions.yaml"
- v4.0
- v4.1
```

### 随产品发布的文档

目前产品文档跟随 [chart-frontend](https://gitlab-ce.alauda.cn/frontend/chart-frontend/-/blob/master/chart/values.yaml#L78-107) 一起部署，因此对发布流程不需要变更，可以延续原 [alauda-docs](https://gitlab-ce.alauda.cn/alauda/alauda-docs) 发布流程，如果后续将所有产品文档进行拆分处理啧需要前端同时配合调整相关[发布流水线](https://edge.alauda.cn/console-devops/workspace/frontend/cd?delivery=packager-frontend-chart)中 `check-alauda-docs` 阶段的镜像检查配置

### 其他自托管的文档

对于不需要随产品发布的文档，例如当前 `doom` 文档，可以使用 idp 提供的 [webapp](https://edge.alauda.cn/console-acp/app-market/idp~alauda-idp~idp/chart/webapp.idp-repo/latest) 应用模板进行快速部署，目前依赖镜像构建完成后手动更新应用的镜像版本

:::info
后续将提供 PR 预览、gitops 等相关功能
:::
