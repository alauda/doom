---
description: 文档项目开发完成后我们可以将项目部署到 ACP 平台
weight: 6
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

### 合并目录结构

```sh
├── console-docs
│   ├── v4.0
│   ├── v4.1
│   ├── index.html
|   └── versions.yaml
│── console-devops-docs
│   ├── v4.0
│   ├── v4.1
│   ├── index.html
|   └── versions.yaml
│── console-tekton-docs
│   ├── v1.0
│   ├── v1.1
│   ├── index.html
|   └── versions.yaml
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
