---
created: '2025-01-07'
---

# Component Quick Start

## 背景

Tekton Operator 携带有多个组件，每个组件都有各自的代码仓库，版本规划。

每个插件的开发流程都是类似的，本文档将介绍如何快速初始化一个插件，并注册到 Tekton Operator 中。

## 原则

- 尽可能统一流程，减少重复工作。

## 快速开始

### 1. 前置准备

#### 1.1 初始化代码仓库

在 <https://github.com/AlaudaDevops> 下创建一个新仓库，以 `tektoncd-` 开头，再添加对应开源组件的名称，比如 `tektoncd-pipeline`。

#### 1.2 初始化 submodule

将开源组件的代码仓库作为 submodule 添加到新仓库中，目前约定是在 `upstream` 目录下。

选择的分支建议是稳定的 release 分支，比如 `release-v0.56.x`。

```yaml
$ git submodule add -b release-v0.56.x https://github.com/tektoncd/pipeline upstream
```

#### 1.3 初始化 文档

参考平台统一的 [文档开发](https://product-doc-guide.alauda.cn/02_quick_start/01_doc_dev.html) 规范，初始化文档目录。

通常是:

1. 安装依赖: `npm install -g @alauda/doom`

2. 初始化文档目录: `doom new product-doc:site`

3. 本地预览: `npm run dev`

#### 1.4 准备 pac 配置 - 创建 `Repository` 配置

目前的流水线都是通过 pac 来管理和触发，因此需要简单配置下相关配置。

具体参考该文件: <https://gitlab-ce.alauda.cn/devops/edge/-/blob/master/cluster/devops/templates/devops/pac-tektoncd-pipeline.yaml>

预期是该配置都通过上面的 `gitops` 代码仓库来统一管理。

### 2. 脚手架配置

#### 2.1 初始化配置文件 `values.yaml`

```yaml
# global: root location for common arguments
global:
  registry:
    # address: registry address
    address: build-harbor.alauda.cn
  # version is the component version
  #   1. used by tekton-operator, record the version of this component
  #   2. sync to the configmap `pipelines-info`
  version: 'v0.56.9'
  # images records the related images and components
  # used to store the last changed commit for each component
  images:
    controller:
      # repository: image repository for the image
      repository: devops/tektoncd/pipeline/controller
      # tag: a tag for the component
      tag: latest
      # digest: a digest for the component
      digest: sha256:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
      # replace_image_prefix: replace the image prefix
      # this prefix cannot contains `:@` character
      replace_image_prefix: ghcr.io/tektoncd/pipeline/controller-
```

说明:

- `global.registry.address`: 为镜像仓库地址。
  - 通常是 `build-harbor.alauda.cn`。
- `global.version`: 为组件的版本号。
  - 最初就是配置开源组件的版本号，后续流水线中会自动更新该配置。
    - 因为 tekton-operator 是根据组件的版本号来判断是否需要更新该组件。所以按理说只要配置清单有变动，该组件的**版本**都需要变更，才能触发该组件的自动更新。
- `global.images`: 为依赖组件的镜像信息。
  - `controller`: 为组件的名称。
    - `repository`: 为镜像仓库地址。
    - `tag`: 为镜像的 tag。
    - `digest`: 为镜像的 digest。
    - `replace_image_prefix`: 为替换镜像地址的前缀。
      - 用于自动替换开源社区配置清单 `release.yaml` 中的部分镜像地址。
      - 该地址需要尽量准确，避免误替换。
      - 该地址中不能带有 `:@` 字符。
  - 如果有多个组件，可以继续添加。

#### 2.2 初始化 Makefile 配置文件

推荐在 `tekton-operator` 代码仓库中统一维护 `Makefile` 文件模板。

目前存在两个文件:

- `base.mk`: 为基础模板，包含了所有通用的功能。
  - 各组件的该文件应该都是一样的。
  - 如果需要添加新功能，建议同步回 `tekton-operator` 代码仓库。
- `Makefile`: 为具体组件的 `Makefile` 文件，继承了 `base.mk` 文件。
  - 该文件主要是配置组件的特有功能或配置。

比如这里是 `tektoncd-pipeline` 的 `Makefile` 文件:

```bash
include base.mk

# VERSION is the version of Tekton Pipeline
VERSION ?= v0.56.9

# RELEASE_YAML is the URL to get the release.yaml
RELEASE_YAML ?= https://storage.googleapis.com/tekton-releases/pipeline/previous/${VERSION}/release.yaml

# RELEASE_YAML_PATH is the path to save the release.yaml
RELEASE_YAML_PATH ?= release/release.yaml

# VERSION_CONFIGMAP_NAME is the name of the configmap that contains the component version
VERSION_CONFIGMAP_NAME ?= pipelines-info
```

说明:

- `VERSION`: 为当前组件的版本号。**重要**
  - 会基于该版本号获取开源社区的配置清单 `release.yaml`。
  - 会基于它更新 `values.yaml` 中的 `global.version` 字段，以及开源配置清单 `release.yaml` 中的组件版本信息。
- `RELEASE_YAML`: 为开源社区的配置清单地址。
- `RELEASE_YAML_PATH`: 为本地保存的配置清单地址。
  - **必须**是存放在 `release` 目录下，文件名可自定义。
- `VERSION_CONFIGMAP_NAME`: 为配置清单中记录组件版本号的 `configmap` 名称。

  - 比如 `tektoncd-pipeline` 组件的配置文件名称是 `pipelines-info`。

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
      # Contains pipelines version which can be queried by external
      # tools such as CLI. Elevated permissions are already given to
      # this ConfigMap such that even if we don't have access to
      # other resources in the namespace we still can have access to
      # this ConfigMap.
      version: v0.56.9
    ```

#### 2.3 初始化开源配置清单

做好了上面的 `Makefile` 配置后，可以直接通过 `make download-release-yaml` 命令下载开源社区的配置清单。

说明：

- 在下载完成配置清单后，自动通过 `yq` 命令格式化了下载后的 `yaml` 文件。
  - 这是为了方面后续自动更新镜像地址后，减少 `git diff` 中的干扰信息。

#### 2.4 初始化组件构建的 `Dockerfile` 配置

通常在 `.tekton/dockerfiles` 目录下维护各组件构建的 `Dockerfile` 文件。

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

说明:

- 尽量让镜像是可重复构建的
  - 比如指定了 golang 的构建参数
- 尽量以非 root 用户运行
  - Tekton 组件会有安全限制，如果是以 root 用户运行，可能会直接启动失败。
- 65534 用户是内部约定
  - 该基础镜像 `build-harbor.alauda.cn/ops/distroless-static:20220806` 中存在 `697` 及 `65534` 这2个普通用户。

#### 2.5 初始化组件构建的 pac 流水线

目前的组件构建都是通过 `pac` 触发，以及使用内部模板来构建。我们只需要做少了的配置即可快速构建出相关的组件。

这里以 `tektoncd-pipeline` 中的 `controller` 组件构建流水线为例介绍如何配置:

```yaml
apiVersion: tekton.dev/v1
kind: PipelineRun
metadata:
  name: build-controller-image
  annotations:
    pipelinesascode.tekton.dev/on-comment: "^((/test-all)|(/build-controller-image)|(/test-multi.*\ build-controller-image.*))$"
    pipelinesascode.tekton.dev/on-cel-expression: |-
      # **注意** 在该 `on-cel-expression` 中不支持注释。这里的注释只是为了方便解释说明，在最终的配置中请自行移除！！！
      #
      (
        # 关注相关文件的变动，自动触发流水线。
        # 支持的匹配规则详见：
        #   - https://pipelinesascode.com/docs/guide/matchingevents/#matching-a-pipelinerun-to-specific-path-changes
        #   - https://en.wikipedia.org/wiki/Glob_%28programming%29
        #   - https://pipelinesascode.com/docs/guide/cli/#test-globbing-pattern
        # TL;DR: 
        #   - 可以通过 ".tekton" 来匹配 `.tekton` 目录下的所有文件变更。
        #   - 可以通过 ".tekton/**" 来匹配 `.tekton` 目录下的所有文件变更。
        #   - 不能通过 ".tekton/.*" 来匹配 `.tekton` 目录下的所有文件变更。
        ".tekton/pr-build-controller-image.yaml".pathChanged() ||
        ".tekton/dockerfiles/controller.Dockerfile".pathChanged() ||
        ".tekton/patches".pathChanged() ||
        "upstream".pathChanged()
      ) && (
        # 这里建议保留，即 `values.yaml` 文件的变动，不能自动触发流水线。
        # 避免流水线自动更新该文件，导致无限的自动触发流水线。
        # 同时，如果当前变动的是主分支，还是应该继续判断是否需要触发流水线。
        !"values.yaml".pathChanged() || source_branch.matches("^(main|master|release-.*)$")
      ) &&
      ((
        # 这里的配置保持原样就行。
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
    # 使用的 pipeline 模板。具体流程定义及说明可以参考：
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
    # 这里是通用配置，不需要修改。
    - name: git-url
      value: '{{ repo_url }}'
    - name: git-revision
      value: '{{ source_branch }}'
    - name: git-commit
      value: '{{ revision }}'

    # **需调整** 调整为实际构建的镜像地址
    - name: image-repository
      value: build-harbor.alauda.cn/test/devops/tektoncd/pipeline/controller

    # **需调整** 调整为实际构建的镜像 dockerfile
    - name: dockerfile-path
      value: .tekton/dockerfiles/controller.Dockerfile

    # **需调整** 调整为实际构建的镜像构建上下文
    - name: context
      value: '.'

    # **需调整** 调整为实际需要关注的文件变动列表
    # **注意** 流水线会基于这些文件的变动，计算最后修改的 commit sha。
    #          该 sha 会用于镜像 label 中的 commit 信息，也会影响最终制品的 tag。
    - name: file-list-for-commit-sha
      value:
        - upstream
        - .tekton/patches
        - .tekton/dockerfiles/controller.Dockerfile
        - .tekton/pr-build-controller-image.yaml

    # **需调整** 调整为实际的操作
    - name: update-files-based-on-image
      value: |
        # The script can use this environment variable:
        #    - IMAGE: the image url with tag and digest, such as `registry.alauda.cn:60080/devops/noroot/alauda-docker-buildx:latest@sha256:1234567890`
        #    - IMAGE_URL: the image url without tag and digest, such as `registry.alauda.cn:60080/devops/noroot/alauda-docker-buildx`
        #    - IMAGE_TAG: the image tag, such as `latest`
        #    - IMAGE_DIGEST: the image digest, such as `sha256:1234567890`
        #    - LAST_CHANGED_COMMIT: the last changed commit sha

        # 使用基础镜像中的 yq，避免 `makefile` 自动安装。
        export YQ=$(which yq)

        # 根据构建出来的镜像完整信息，更新 `values.yaml` 文件。
        # 这里用到的脚步在基础镜像中。逻辑详见:
        #   - https://gitlab-ce.alauda.cn/ops/edge-devops-task/-/blob/master/images/yq/script/update_image_version.sh
        #   - https://gitlab-ce.alauda.cn/ops/edge-devops-task/blob/master/images/yq/script/replace_images_by_values.sh

        echo "update_image_version.sh values.yaml ${IMAGE}"
        update_image_version.sh values.yaml ${IMAGE}

        # **重要** 更新组件的版本号 
        # 会基于计算出来最后变动的 commit sha，作为版本号的后缀。

        # get current version, and remove the -.* suffix
        OLD_VERSION=$(yq eval '.global.version' values.yaml)
        # use the short commit sha as the version suffix
        export SUFFIX=${LAST_CHANGED_COMMIT:0:7}
        echo "update component version ${OLD_VERSION} suffix to ${SUFFIX}"
        make update-component-version

        # **重要** 基于最新的 `values.yaml` 文件更新 `release.yaml` 文件。

        echo "replace images in release/release.yaml"
        replace_images_by_values.sh release/release.yaml controller

    # **需调整** 如果镜像可以通过执行命令初步验证镜像是否构建成功，可以在这里添加。
    - name: test-script
      value: ''

    # **需调整** 按需添加。 `prepare-tools-image` 及 `prepare-command` 用于镜像构建前的准备工作。
    # 比如这里做了几件事:
    #   - 生成 `head` 文件，内容是 `upstream` 目录的 commit sha。一般 `Dockefile` 中会用到。
    #   - 设置 golang 环境变量
    #   - 更新 go mod 依赖，修复安全问题（可选）

    - name: prepare-tools-image
      value: 'build-harbor.alauda.cn/devops/builder-go:1.23'

    - name: prepare-command
      value: |
        #!/bin/bash
        set -ex

        # 生成 head 文件，内容是 upstream 目录的 commit sha
        cd upstream

        git rev-parse HEAD > ../head && cat ../head

        export GOPROXY=https://build-nexus.alauda.cn/repository/golang/,https://goproxy.cn,direct
        export CGO_ENABLED=0
        export GONOSUMDB=*
        export GOMAXPROCS=4

        export GOCACHE=/tmp/.cache/go-build
        mkdir -p $GOCACHE

        # upgrade go mod dependencies
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

    # **需调整** 按需添加。 `pre-commit-script` 用于在提交 commit 前的操作。
    - name: pre-commit-script
      value: |
        # remove `head` file
        rm -f head
        #
        # revert upstream directory avoid unnecessary changes
        cd upstream
        git checkout .
        cd .. # go back to the root directory

    # **需调整** 按需添加。如果镜像不需要扫描，可以启用该配置。
    # - name: ignore-trivy-scan
    #   value: "true"

  # 下面的配置一般不需要修改。
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
    # This secret will be replaced by the pac controller
    - name: basic-auth
      secret:
        secretName: '{{ git_auth_secret }}'
    - name: gitversion-config
      configMap:
        name: gitversion-config

  taskRunTemplate:
    # 让所有任务都以非 root 用户运行。
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

- `git-clone` 拉取代码
- `calculate-commit-sha` `git-version` `generate-tags` 计算镜像 tag
- `prepare-build` 做镜像构建前的准备
  - 比如更新某些文件
- `build-image` 构建镜像
- `test-image` 测试镜像（可选）
- `image-scan` 镜像扫描（可选）
- `update-files-based-on-image` 基于构建的镜像，更新文件
  - 比如将构建出来的镜像更新到 `values.yaml` 等文件中
- `commit` 提交本地修改（可选）
- `trigger-pipeline` 触发下游流水线（可选）

### 3. 触发流水线

在前面的准备工作完成后，可以通过 `pac` 触发流水线。

可以通过创建 PR，以及在 PR 或 commit 评论的方式触发流水线。

### 4. 注册到 Tekton Operator

预期是 `Tekton-Operator` 的流水线自动抓取各组件的配置清单（通常是 `release` 目录下的 YAML 配置清单），然后更新到 `Tekton-Operator` 的代码仓库中。以便下次构建 `Tekton-Operator` 时，可以带上对应组件的对应版本。

为了便于抓取，需要在 `Tekton-Operator` 代码仓库下的 `components.yaml` 文件中添加对应的组件信息。

```yaml
pipeline:
  # The repository and branch to use for the pipeline component
  github: AlaudaDevops/tektoncd-pipeline
  # The revison to use fetch for the component
  revision: main
  # This version will be automatically fetched from the corresponding branch of the code repository
  # It reads the `.global.version` field in values.yaml
  version: v0.66.0
```

说明:

- github: 为组件的代码仓库地址，格式为 `org/repo`。
- revision: 为组件的代码仓库的分支。
  - 可以是分支、tag、commit id。
- version: 为组件的版本号。
  - 通常是从对应代码仓库及对应 `revision` 下的`values.yaml` 中读取。
  - 每次抓取配置时会自动更新该字段，所以一般不需要手动维护。

## 待完善

### 1. 分支管理策略

### 2. patches 包如何管理
