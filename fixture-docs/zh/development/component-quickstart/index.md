---
created: '2025-01-07'
sourceSHA: 5ece6f3f536ea1ffebb6240f54176c72c35d3b48277942d4ac9d3a52d45ff842
---

# Component Quick Start

## 背景

Tekton Operator 包含多个组件，每个组件均有各自的代码仓库和版本规划。

每个插件的开发过程是类似的。本文档将介绍如何快速初始化一个插件并将其注册到 Tekton Operator。

## 原则

- 尽可能统一流程，以减少重复工作。

## 快速开始

### 1. 前置准备

#### 1.1 初始化代码仓库

在 <https://github.com/AlaudaDevops> 下创建一个新仓库，以 `tektoncd-` 开头，并接上相应的开源组件名称，例如 `tektoncd-pipeline`。

#### 1.2 初始化子模块

将开源组件的代码仓库作为子模块添加到新仓库中，当前约定放置于 `upstream` 目录。

建议选择稳定的发布分支，例如 `release-v0.56.x`。

```yaml
$ git submodule add -b release-v0.56.x https://github.com/tektoncd/pipeline upstream
```

#### 1.3 初始化文档

参考统一的 [文档开发](https://product-doc-guide.alauda.cn/02_quick_start/01_doc_dev.html) 标准，初始化文档目录。

通常包括：

1. 安装依赖：`npm install -g @alauda/doom`

2. 初始化文档目录：`doom new product-doc:site`

3. 本地预览：`npm run dev`

#### 1.4 准备 PAC 配置 - 创建仓库配置

目前的流水线都是通过 PAC 进行管理和触发，因此需要基础配置。

具体参考此文件：<https://gitlab-ce.alauda.cn/devops/edge/-/blob/master/cluster/devops/templates/devops/pac-tektoncd-pipeline.yaml>

预期是该配置通过上述 `gitops` 代码仓库统一管理。

### 2. 脚手架配置

#### 2.1 初始化配置文件 `values.yaml`

```yaml
# global: common arguments root location
global:
  registry:
    # address: registry address
    address: build-harbor.alauda.cn
  # version 是组件的版本
  #   1. 被 tekton-operator 使用，记录该组件的版本
  #   2. 同步至 configmap `pipelines-info`
  version: 'v0.56.9'
  # images 记录相关的镜像和组件
  # 用于存储每个组件最后修改的提交信息
  images:
    controller:
      # repository: 镜像的仓库地址
      repository: devops/tektoncd/pipeline/controller
      # tag: 组件的标签
      tag: latest
      # digest: 组件的摘要
      digest: sha256:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
      # replace_image_prefix: 替换镜像前缀
      # 该前缀不能包含 `:@` 字符
      replace_image_prefix: ghcr.io/tektoncd/pipeline/controller-
```

说明：

- `global.registry.address`：镜像仓库地址。
  - 通常为 `build-harbor.alauda.cn`。
- `global.version`：组件的版本号。
  - 起初为开源组件的版本号，后续流水线中会自动更新此值。
    - 因为 tekton-operator 根据组件版本号来判断是否需要更新。因而每当配置发生变更时，该组件的 **版本** 也需同时变更，以触发其自动更新。
- `global.images`：依赖组件镜像信息。
  - `controller`：组件名称。
    - `repository`：镜像仓库地址。
    - `tag`：镜像标签。
    - `digest`：镜像摘要。
    - `replace_image_prefix`：替换镜像地址的前缀。
      - 用于自动替换开源社区的配置文件 `release.yaml` 中的部分镜像地址。
      - 该地址应尽可能准确，以避免不当替换。
      - 该地址中不能包含 `:@` 字符。
  - 如果存在多个组件，可以继续添加。

#### 2.2 初始化 Makefile 配置

建议在 `tekton-operator` 代码仓库中统一维护 `Makefile` 文件模板。

目前包含两个文件：

- `base.mk`：基础模板，包含所有通用功能。
  - 所有组件的该文件应相同。
  - 若需添加新功能，建议将其同步回 `tekton-operator` 代码仓库。
- `Makefile`：特定组件的 `Makefile`，继承自 `base.mk`。
  - 该文件主要配置组件的特有功能或设置。

例如，`tektoncd-pipeline` 的 `Makefile` 如下所示：

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
  - 此版本号用于获取开源社区的配置列表 `release.yaml`。
  - 并基于此更新 `values.yaml` 中的 `global.version` 字段，以及配置列表 `release.yaml` 中的组件版本信息。
- `RELEASE_YAML`：开源社区的配置列表地址。
- `RELEASE_YAML_PATH`：本地保存的配置列表地址。
  - **必须** 存放在 `release` 目录，文件名可自定义。
- `VERSION_CONFIGMAP_NAME`：记录组件版本号的配置文件名称。

  - 例如，`tektoncd-pipeline` 组件的配置文件名称为 `pipelines-info`。

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
      # 此 ConfigMap 已给予较高权限，即使对命名空间内其他资源没有访问权限，也能访问此 ConfigMap。
      version: v0.56.9
    ```

#### 2.3 初始化开源配置列表

完成上述 `Makefile` 配置后，可以直接通过命令 `make download-release-yaml` 下载开源社区的配置列表。

说明：

- 下载完成后，自动利用 `yq` 命令格式化下载的 `yaml` 文件。
  - 旨在后续自动更新镜像地址时，减少 `git diff` 中的干扰信息。

#### 2.4 初始化组件构建的 Dockerfile 配置

每个组件构建的 `Dockerfile` 通常在 `.tekton/dockerfiles` 目录下维护。

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

- 旨在确保镜像可重复构建。
  - 例如，明确指定 Golang 构建参数。
- 尽可能以非 root 用户运行。
  - Tekton 组件受安全限制，以 root 用户运行可能导致启动失败。
- 用户 65534 是内部约定。
  - 基础镜像 `build-harbor.alauda.cn/ops/distroless-static:20220806` 中存在 `697` 和 `65534` 两个普通用户。

#### 2.5 初始化组件构建的 PAC 流水线

目前，组件构建通过 PAC 触发，并使用内部模板进行组装。只需进行少量配置，即可快速构建相应组件。

以下是 `tektoncd-pipeline` 中 `controller` 组件构建流水线配置示例：

```yaml
apiVersion: tekton.dev/v1
kind: PipelineRun
metadata:
  name: build-controller-image
  annotations:
    pipelinesascode.tekton.dev/on-comment: "^((/test-all)|(/build-controller-image)|(/test-multi.*\ build-controller-image.*))$"
    pipelinesascode.tekton.dev/on-cel-expression: |-
      # **注意** 此 `on-cel-expression` 不支持注释。这里的注释仅供说明，最终配置中需移除！！！
      #
      (
        # 关注相关目录文件变动，自动触发流水线。
        # 支持的匹配规则详见：
        #   - https://pipelinesascode.com/docs/guide/matchingevents/#matching-a-pipelinerun-to-specific-path-changes
        #   - https://en.wikipedia.org/wiki/Glob_%28programming%29
        #   - https://pipelinesascode.com/docs/guide/cli/#test-globbing-pattern
        # TL;DR:
        #   - 可以使用 ".tekton" 匹配 `.tekton` 目录中的所有变化。
        #   - 可以使用 ".tekton/**" 匹配 `.tekton` 目录中的所有变化。
        #   - 不能使用 ".tekton/.*" 匹配 `.tekton` 目录中的所有变化。
        ".tekton/pr-build-controller-image.yaml".pathChanged() ||
        ".tekton/dockerfiles/controller.Dockerfile".pathChanged() ||
        ".tekton/patches".pathChanged() ||
        "upstream".pathChanged()
      ) && (
        # 建议保留此检查，`values.yaml` 文件的变动不应自动触发流水线。
        # 以避免流水线自动更新此文件，从而造成无限触发循环。
        # 此外，如果当前变动在主分支中，则仍应判断是否触发流水线。
        !"values.yaml".pathChanged() || source_branch.matches("^(main|master|release-.*)$")
      ) &&
      ((
        # 此配置可以保持原样。
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
    # 使用的流水线模板。详见具体定义与说明：
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

    # **需调整** 更改为实际构建的 Dockerfile
    - name: dockerfile-path
      value: .tekton/dockerfiles/controller.Dockerfile

    # **需调整** 更改为实际构建的镜像上下文
    - name: context
      value: '.'

    # **需调整** 更改为实际需要关注的文件变更列表
    # **注意** 流水线将根据这些文件的变动计算最后修改的提交 Sha。
    #          该 Sha 将用于镜像标签中的提交信息，并影响最终构件的标签。
    - name: file-list-for-commit-sha
      value:
        - upstream
        - .tekton/patches
        - .tekton/dockerfiles/controller.Dockerfile
        - .tekton/pr-build-controller-image.yaml

    # **需调整** 更改为必要的操作
    - name: update-files-based-on-image
      value: |
        # 脚本可以使用以下环境变量：
        #    - IMAGE: 带标签和摘要的镜像 URL，例如 `registry.alauda.cn:60080/devops/noroot/alauda-docker-buildx:latest@sha256:1234567890`
        #    - IMAGE_URL: 不带标签和摘要的镜像 URL，例如 `registry.alauda.cn:60080/devops/noroot/alauda-docker-buildx`
        #    - IMAGE_TAG: 镜像标签，例如 `latest`
        #    - IMAGE_DIGEST: 镜像摘要，例如 `sha256:1234567890`
        #    - LAST_CHANGED_COMMIT: 最后修改的提交 sha

        # 使用基础镜像中的 yq，避免使用 `makefile` 自动安装。
        export YQ=$(which yq)

        # 根据构建生成的镜像完整信息，更新 `values.yaml` 文件。
        # 这里的逻辑脚本详见基础镜像：
        #   - https://gitlab-ce.alauda.cn/ops/edge-devops-task/-/blob/master/images/yq/script/update_image_version.sh
        #   - https://gitlab-ce.alauda.cn/ops/edge-devops-task/blob/master/images/yq/script/replace_images_by_values.sh

        echo "update_image_version.sh values.yaml ${IMAGE}"
        update_image_version.sh values.yaml ${IMAGE}

        # **重要** 更新组件的版本号
        # 基于计算得到的最后修改的提交 sha，生成版本号后缀。

        # 获取当前版本，去掉 -.* 后缀
        OLD_VERSION=$(yq eval '.global.version' values.yaml)
        # 使用短提交 sha 作为版本后缀
        export SUFFIX=${LAST_CHANGED_COMMIT:0:7}
        echo "update component version ${OLD_VERSION} suffix to ${SUFFIX}"
        make update-component-version

        # **重要** 基于最新的 `values.yaml` 更新 `release.yaml`。

        echo "replace images in release/release.yaml"
        replace_images_by_values.sh release/release.yaml controller

    # **需调整** 如果通过初步命令执行可验证镜像构建是否成功，可以在此添加。
    - name: test-script
      value: ''

    # **需调整** 按需增加。 `prepare-tools-image` 和 `prepare-command` 用于镜像构建前的准备工作。
    # 例如，执行如下任务:
    #   - 生成 `head` 文件，记录 upstream 目录的提交 sha，通常在 Dockerfile 中会涉及到。
    #   - 设置 Golang 环境变量。
    #   - 更新 Go mod 依赖以处理安全问题（可选）。

    - name: prepare-tools-image
      value: 'build-harbor.alauda.cn/devops/builder-go:1.23'

    - name: prepare-command
      value: |
        #!/bin/bash
        set -ex

        # 生成 head 文件，内容为 upstream 目录的提交 sha
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

    # **需调整** 按需添加。 `pre-commit-script` 用于提交前的操作。
    - name: pre-commit-script
      value: |
        # 删除 `head` 文件
        rm -f head
        #
        # 还原 upstream 目录以避免不必要的变更
        cd upstream
        git checkout .
        cd .. # 返回根目录

    # **需调整** 按需添加。如果镜像不需扫描，可以启用此配置。
    # - name: ignore-trivy-scan
    #   value: "true"

  # 后续配置一般无需修改。
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
    # 此 secret 将被 PAC 控制器替换。
    - name: basic-auth
      secret:
        secretName: '{{ git_auth_secret }}'
    - name: gitversion-config
      configMap:
        name: gitversion-config

  taskRunTemplate:
    # 确保所有任务都以非 root 用户运行。
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
  - 例如，更新某些文件
- `build-image`：构建镜像
- `test-image`：测试镜像（可选）
- `image-scan`：镜像扫描（可选）
- `update-files-based-on-image`：根据构建的镜像更新文件
  - 例如，将构建的镜像及相关信息更新到 `values.yaml` 等文件中
- `commit`：提交本地修改（可选）
- `trigger-pipeline`：触发下游流水线（可选）

### 3. 触发流水线

完成前期准备后，可以通过 PAC 触发流水线。

可通过创建 PR 和在 PR 或提交中使用评论来激活流水线。

### 4. 注册到 Tekton Operator

预期是 `Tekton-Operator` 的流水线自动获取各组件的配置列表（通常是 `release` 目录中的 YAML 配置文件），并随之更新至 `Tekton-Operator` 的代码仓库。以确保在下一个 `Tekton-Operator` 构建中，可以携带相应组件的对应版本。

为方便获取，需在 `Tekton-Operator` 代码仓库中的 `components.yaml` 文件中增加对应的组件信息。

```yaml
pipeline:
  # 使用的组件的代码仓库及分支
  github: AlaudaDevops/tektoncd-pipeline
  # 拉取组件时使用的版本
  revision: main
  # 该版本将自动从相应代码仓库的对应分支中获取
  # 读取 `values.yaml` 中的 `.global.version` 字段
  version: v0.66.0
```

说明：

- `github`：组件的代码仓库地址，格式为 `org/repo`。
- `revision`：对应代码仓库的分支。
  - 可以是分支、标签或提交 ID。
- `version`：组件的版本号。
  - 通常从相应代码仓库及其特定 `revision` 的 `values.yaml` 中提取。
  - 此字段在每次获取配置时会自动更新，因此通常无需手动维护。

## 待完善

### 1. 分支管理策略

### 2. 补丁包如何管理
