---
created: '2025-01-07'
sourceSHA: 1b8f823fa2113e3040f4995d879c7349663878e4cef764b13939e89710e19c4c
---

## 问题描述

1. 文档中有些部分的长句、复杂结构可能会导致理解困难，比如“每个插件的开发过程是类似的。本文档将介绍如何快速初始化一个插件并将其注册到 Tekton Operator。”这句话的内容结构较为松散，容易造成理解上的障碍。
2. 一些术语和表达在文档中没有详细说明，比如“PAC” 在文中虽然出现多次，但没有进行初步解释，使得不熟悉该术语的读者可能无法理解。

## 意译

# 组件快速入门

## 背景

Tekton Operator 包含多个组件，每个组件有各自的代码仓库和版本规划。

每个插件的开发过程相似。本文档将指导您如何快速初始化一个插件，并将其注册到 Tekton Operator。

## 原则

- 尽可能统一流程，以减少重复工作。

## 快速开始

### 1. 前置准备

#### 1.1 初始化代码仓库

在 <https://github.com/AlaudaDevops> 下创建一个新仓库，名称以 `tektoncd-` 开头，并跟上相应的开源组件名称，例如 `tektoncd-pipeline`。

#### 1.2 初始化子模块

将开源组件的代码仓库作为子模块添加到新仓库中，默认放置在 `upstream` 目录。

建议选择一个稳定的发布分支，例如 `release-v0.56.x`。

```yaml
$ git submodule add -b release-v0.56.x https://github.com/tektoncd/pipeline upstream
```

#### 1.3 初始化文档

请参考统一的 [文档开发](https://product-doc-guide.alauda.cn/02_quick_start/01_doc_dev.html) 标准，初始化文档目录。

通常，这包括以下几步：

1. 安装依赖：`npm install -g @alauda/doom`
2. 初始化文档目录：`doom new product-doc:site`
3. 本地预览：`npm run dev`

#### 1.4 准备 PAC 配置 - 创建仓库配置

目前的流水线通过 PAC（Pipeline as Code）进行管理和触发，因此需要进行基础配置。

具体配置请参考该文件：<https://gitlab-ce.alauda.cn/devops/edge/-/blob/master/cluster/devops/templates/devops/pac-tektoncd-pipeline.yaml>

预计该配置将通过上述 `gitops` 代码仓库统一管理。

### 2. 脚手架配置

#### 2.1 初始化配置文件 `values.yaml`

```yaml
# global: 常见参数的根位置
global:
  registry:
    # address: 镜像仓库地址
    address: build-harbor.alauda.cn
  # version 为组件的版本
  #   1. 被 tekton-operator 使用，以记录该组件的版本
  #   2. 同步至 configmap `pipelines-info`
  version: 'v0.56.9'
  # images 保存相关的镜像和组件信息
  # 用以记录每个组件最后一次修改的提交信息
  images:
    controller:
      # repository: 镜像的仓库地址
      repository: devops/tektoncd/pipeline/controller
      # tag: 组件的标签
      tag: latest
      # digest: 组件的摘要
      digest: sha256:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
      # replace_image_prefix: 替换镜像的前缀
      # 该前缀不能包含 `:@` 字符
      replace_image_prefix: ghcr.io/tektoncd/pipeline/controller-
```

说明：

- `global.registry.address`：镜像仓库的地址，通常为 `build-harbor.alauda.cn`。
- `global.version`：组件的版本号，初始由开源组件版本号设定，后续流水线会自动更新此值。
  - tekton-operator 会根据组件版本号判断是否需要更新，因此每次配置变更时，组件的 **版本** 也需变更，以触发自动更新。
- `global.images`：依赖组件的镜像信息。
  - `controller`：组件名称。
    - `repository`：镜像仓库地址。
    - `tag`：镜像标签。
    - `digest`：镜像摘要。
    - `replace_image_prefix`：用来替换镜像地址的前缀，务必准确以避免错误替换，且不得包含 `:@` 字符。

如需添加多个组件，可继续扩展。

#### 2.2 初始化 Makefile 配置

建议在 `tekton-operator` 代码仓库统一维护 `Makefile` 模板。

当前包含两个文件：

- `base.mk`：基础模板，包含所有通用功能，应在所有组件中保持一致。
  - 若添加新功能，应考虑将其同步回 `tekton-operator` 代码仓库。
- `Makefile`：特定组件的 `Makefile`，继承自 `base.mk`。
  - 专门用于配置该组件的独特功能或设置。

例如，`tektoncd-pipeline` 的 `Makefile` 如下：

```bash
include base.mk

# VERSION 是 Tekton Pipeline 的版本
VERSION ?= v0.56.9

# RELEASE_YAML 是获取 release.yaml 的 URL
RELEASE_YAML ?= https://storage.googleapis.com/tekton-releases/pipeline/previous/${VERSION}/release.yaml

# RELEASE_YAML_PATH 是保存 release.yaml 的路径
RELEASE_YAML_PATH ?= release/release.yaml

# VERSION_CONFIGMAP_NAME 是记录组件版本号的 configmap 名称
VERSION_CONFIGMAP_NAME ?= pipelines-info
```

说明：

- `VERSION`：当前组件的版本号。**重要**
  - 此版本号用于获取开源社区的配置列表 `release.yaml`，并按照此更新 `values.yaml` 中的 `global.version` 和配置列表中每个组件的版本信息。
- `RELEASE_YAML`：开源社区的配置列表地址。
- `RELEASE_YAML_PATH`：在本地保存的配置列表地址，通常需要存放于 `release` 目录，文件名可以自定义。
- `VERSION_CONFIGMAP_NAME`：记录组件版本号的配置文件名称，例如 `pull`。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: pipelines-info
  namespace: tekton-pipelines
  labels:
    app.kubernetes.io/instance: default
    app.kubernetes.io/part-of: tekton-pipelines
data:
  # 包含可以被外部工具如 CLI 查询到的流水线版本
  version: v0.56.9
```

#### 2.3 初始化开源配置列表

配置上述 `Makefile` 后，可以直接运行命令 `make download-release-yaml` 下载开源社区的配置列表。

说明：

- 下载完成后，下载的 `yaml` 文件将自动通过 `yq` 命令格式化。
  - 这样做是为了减少后续自动更新镜像地址时 `git diff` 中的干扰信息。

#### 2.4 初始化组件构建的 Dockerfile 配置

每个组件构建用的 `Dockerfile` 通常在 `.tekton/dockerfiles` 目录下维护。

```dockerfile
ARG GO_BUILDER=build-harbor.alauda.cn/devops/builder-go:1.23
ARG RUNTIME=build-harbor.alauda.cn/ops/distroless-static:20220806

FROM $GO_BUILDER AS builder

WORKDIR /go/src/github.com/tektoncd/pipeline
COPY upstream .
COPY .tekton/patches patches/
RUN set -e; for f in patches/*.patch; do echo ${f}; [[ -f ${f} ]] || continue; git apply ${f}; done
COPY head HEAD
ENV GODEBUG="http2server=0" \
    GOMAXPROCS=4 \
	GOFLAGS=-buildvcs=false \
	CGO_ENABLED=0
RUN go build -trimpath -ldflags="-w -s -X 'knative.dev/pkg/changeset.rev=$(cat HEAD)'" -mod=vendor -tags disable_gcp -v -o /tmp/controller \
    ./cmd/controller

FROM $RUNTIME
ARG VERSION=pipeline-main

ENV CONTROLLER=/usr/local/bin/controller \
    KO_APP=/ko-app \
    KO_DATA_PATH=/kodata

COPY --from=builder /tmp/controller /ko-app/controller
COPY head ${KO_DATA_PATH}/HEAD

USER 65534

ENTRYPOINT ["/ko-app/controller"]
```

说明：

- 目标是确保镜像可重复构建。
- 尽可能以非 root 用户运行，Tekton 组件面临安全限制，以 root 用户启动可能导致失败。
- 采用用户 65534 是内部约定，基础镜像 `build-harbor.alauda.cn/ops/distroless-static:20220806` 中存在两个普通用户。

#### 2.5 初始化组件构建的 PAC 流水线

组件构建通过 PAC 触发，使用内部模板进行组装。仅需少量配置以快速构建相应组件。

以下是 `tektoncd-pipeline` 中 `controller` 组件构建流水线的配置示例：

```yaml
apiVersion: tekton.dev/v1
kind: PipelineRun
metadata:
  name: build-controller-image
  annotations:
    pipelinesascode.tekton.dev/on-comment: "^((/test-all)|(/build-controller-image)|(/test-multi.*\ build-controller-image.*))$"
    pipelinesascode.tekton.dev/on-cel-expression: |-
      # **注意** 此 `on-cel-expression` 不支持注释。请确保最终配置中移除注释！
      #
      (
        # 监控相关目录的文件变化，以自动触发流水线。
        # 匹配规则详见：
        #   - https://pipelinesascode.com/docs/guide/matchingevents/#matching-a-pipelinerun-to-specific-path-changes
        #   - https://en.wikipedia.org/wiki/Glob_%28programming%29
        #   - https://pipelinesascode.com/docs/guide/cli/#test-globbing-pattern
        # 整体要点：
        #   - 可以使用 ".tekton" 匹配 `.tekton` 目录的所有变化。
        #   - 可以使用 ".tekton/**" 匹配 `.tekton` 目录的所有变化。
        #   - 不能使用 ".tekton/.*" 匹配 `.tekton` 目录的所有变化。
        ".tekton/pr-build-controller-image.yaml".pathChanged() ||
        ".tekton/dockerfiles/controller.Dockerfile".pathChanged() ||
        ".tekton/patches".pathChanged() ||
        "upstream".pathChanged()
      ) && (
        # 建议保留此检查，不应自动触发 `values.yaml` 文件的变化。
        # 防止在流水线中造成无限触发循环。
        # 同时，如果当前的更改在主分支，仍需判断是否触发流水线。
        !"values.yaml".pathChanged() || source_branch.matches("^(main|master|release-.*)$")
      ) &&
      ((
        # 此配置可保持原样。
        event == "push" && (
          source_branch.matches("^(main|master|release-.*)$") ||
          target_branch.matches("^(main|master|release-.*)$") ||
          target_branch.startsWith("refs/tags/")
        )
      ) || (
        event == "pull_request" && (
          target_branch.matches("^(main|master|release-.*)$")
        )
      ))
    pipelinesascode.tekton.dev/max-keep-runs: '1'
spec:
  pipelineRef:
    # 使用的流水线模板，详细定义和说明请参考：
    #   https://tekton-hub.alauda.cn/alauda/pipeline/clone-image-build-test-scan
    resolver: hub
    params:
      - name: catalog
        value: alauda
      - name: type
        value: tekton
      - name: kind
        value: pipeline
      - name: name
        value: clone-image-build-test-scan
      - name: version
        value: '0.2'

  params:
    # 以下通用配置无需修改。
    - name: git-url
      value: '{{ repo_url }}'
    - name: git-revision
      value: '{{ source_branch }}'
    - name: git-commit
      value: '{{ revision }}'

    # **需调整** 更改为实际构建的镜像地址
    - name: image-repository
      value: build-harbor.alauda.cn/test/devops/tektoncd/pipeline/controller

    # **需调整** 更改为实际的 Dockerfile
    - name: dockerfile-path
      value: .tekton/dockerfiles/controller.Dockerfile

    # **需调整** 更改为实际构建的镜像上下文
    - name: context
      value: '.'

    # **需调整** 关注的文件变更列表
    # **注意** 流水线将计算这些文件变化的最终提交 sha。
    - name: file-list-for-commit-sha
      value:
        - upstream
        - .tekton/patches
        - .tekton/dockerfiles/controller.Dockerfile
        - .tekton/pr-build-controller-image.yaml

    # **需调整** 更改为必要操作
    - name: update-files-based-on-image
      value: |
        # 脚本可以使用这些环境变量：
        #    - IMAGE: 带标签和摘要的镜像 URL，例如 `registry.alauda.cn:60080/devops/noroot/alauda-docker-buildx:latest@sha256:1234567890`
        #    - IMAGE_URL: 不带标签和摘要的镜像 URL，例如 `registry.alauda.cn:60080/devops/noroot/alauda-docker-buildx`
        #    - IMAGE_TAG: 镜像标签，例如 `latest`
        #    - IMAGE_DIGEST: 镜像摘要，例如 `sha256:1234567890`
        #    - LAST_CHANGED_COMMIT: 最后修改的提交 sha

        # 使用基础镜像的 yq，避免与 `makefile` 自动安装冲突。
        export YQ=$(which yq)

        # 更新 `values.yaml` 文件，基于构建镜像的全部信息。
        echo "update_image_version.sh values.yaml ${IMAGE}"
        update_image_version.sh values.yaml ${IMAGE}

        # **重要** 更新组件版本号，基于最后修改提交 sha 生成版本后缀。

        OLD_VERSION=$(yq eval '.global.version' values.yaml)
        export SUFFIX=${LAST_CHANGED_COMMIT:0:7}
        echo "update component version ${OLD_VERSION} suffix to ${SUFFIX}"
        make update-component-version

        # **重要** 更新 `release.yaml` 基于最新的 `values.yaml`。

        echo "replace images in release/release.yaml"
        replace_images_by_values.sh release/release.yaml controller

    # **需调整** 如需初步验证镜像构建成功，可在此添加。
    - name: test-script
      value: ''

    # **需调整** 按需添加。 `prepare-tools-image` 和 `prepare-command` 是镜像构建前的准备工作。
    - name: prepare-tools-image
      value: 'build-harbor.alauda.cn/devops/builder-go:1.23'

    - name: prepare-command
      value: |
        #!/bin/bash
        set -ex

        # 生成 head 文件，记录 upstream 目录的提交 sha
        cd upstream
        git rev-parse HEAD > ../head && cat ../head

        export GOPROXY=https://build-nexus.alauda.cn/repository/golang/,https://goproxy.cn,direct
        export CGO_ENABLED=0
        export GONOSUMDB=*
        export GOMAXPROCS=4

        export GOCACHE=/tmp/.cache/go-build
        mkdir -p $GOCACHE

        # 升级 go mod 依赖
        go get github.com/docker/docker@v25.0.7
        go get github.com/cloudevents/sdk-go/v2@v2.15.2
        go get github.com/Azure/azure-sdk-for-go/sdk/azidentity@v1.6.0
        go get github.com/hashicorp/go-retryablehttp@v0.7.7
        go get golang.org/x/crypto@v0.31.0
        go get google.golang.org/protobuf@v1.33.0
        go get gopkg.in/go-jose/go-jose.v2@v2.6.3

        go mod tidy
        go mod vendor
        git diff go.mod

    # **需调整** 可按需添加。 `pre-commit-script` 用于提交前的操作。
    - name: pre-commit-script
      value: |
        # 删除 `head` 文件
        rm -f head
        #
        # 恢复 upstream 目录以避免不必要的变更
        cd upstream
        git checkout .
        cd ..

    # **需调整** 如果镜像不需扫描，可启用此配置。
    # - name: ignore-trivy-scan
    #   value: "true"

  # 后续配置通常无需修改。
  workspaces:
    - name: source
      volumeClaimTemplate:
        spec:
          accessModes:
            - ReadWriteMany
          resources:
            requests:
              storage: 1Gi
    - name: dockerconfig
      secret:
        secretName: build-harbor.kauto.docfj
    - name: basic-auth
      secret:
        secretName: '{{ git_auth_secret }}'
    - name: gitversion-config
      configMap:
        name: gitversion-config

  taskRunTemplate:
    # 确保所有任务运行时均为非 root 用户。
    podTemplate:
      securityContext:
        runAsUser: 65532
        runAsGroup: 65532
        fsGroup: 65532
        fsGroupChangePolicy: 'OnRootMismatch'

  taskRunSpecs:
    - pipelineTaskName: prepare-build
      computeResources:
        limits:
          cpu: '4'
          memory: 4Gi
        requests:
          cpu: '2'
          memory: 2Gi
```

该流水线实现的功能说明：

- `git-clone`：拉取代码
- `calculate-commit-sha`、`git-version`、`generate-tags`：计算镜像标签
- `prepare-build`：准备镜像构建
- `build-image`：构建镜像
- `test-image`：测试镜像（可选）
- `image-scan`：镜像扫描（可选）
- `update-files-based-on-image`：将构建镜像的相关信息更新到配置文件中
- `commit`：提交本地修改（可选）
- `trigger-pipeline`：触发下游流水线（可选）

### 3. 触发流水线

完成前期准备后，可以通过 PAC 触发流水线。

可通过创建 PR 和在 PR 或提交中使用评论来激活流水线。

### 4. 注册到 Tekton Operator

期望 `Tekton-Operator` 流水线能自动获取各组件的配置列表，通常为 `release` 目录中的 YAML 文件，随之更新至 `Tekton-Operator` 代码仓库。确保在下次 `Tekton-Operator` 构建中能够包含相应组件的版本信息。

为方便获取，需在 `Tekton-Operator` 代码仓库的 `components.yaml` 文件中增加对应组件的信息。

```yaml
pipeline:
  # 使用的组件的代码仓库及分支
  github: AlaudaDevops/tektoncd-pipeline
  # 拉取组件的版本
  revision: main
  # 该版本将自动获取相应代码仓库的对应分支
  version: v0.66.0
```

说明：

- `github`：组件代码仓库的地址，格式为 `org/repo`。
- `revision`：该代码仓库使用的分支，可以是分支、标签或提交 ID。
- `version`：组件的版本号，通常从相应代码仓库及其特定 `revision` 中提取。
  - 此字段在每次获取配置时会自动更新，通常无需手动维护。

## 待完善

### 1. 分支管理策略

### 2. 补丁包管理
