---
created: 2025-01-07
sourceSHA: 83a2ad9d35acdfb56ad37e9f5230d92703549274a3c60a5ac5636a80b913cf8a
---

# 组件快速开始

## 背景

Tekton Operator 包含多个组件，每个组件都有各自的代码仓库和版本规划。

每个 plugin 的开发流程都类似。本文档将介绍如何快速初始化一个 plugin 并将其注册到 Tekton Operator。

## 原则

- 尽可能统一流程，以减少重复工作。

## 快速开始

### 1. 前置条件

#### 1.1 初始化代码仓库

在 <https://github.com/AlaudaDevops> 下创建一个新仓库，名称以 `tektoncd-` 开头，后接对应的开源组件名称，例如 `tektoncd-pipeline`。

#### 1.2 初始化 Submodule

将开源组件的代码仓库作为 submodule 添加到新仓库下，当前约定放在 `upstream` 目录中。

建议选择一个稳定的 release 分支，例如 `release-v0.56.x`。

```yaml
$ git submodule add -b release-v0.56.x https://github.com/tektoncd/pipeline upstream
```

#### 1.3 初始化文档

请参考平台统一的 [documentation development](https://product-doc-guide.alauda.cn/02_quick_start/01_doc_dev.html) 规范初始化文档目录。

通常包括以下步骤：

1. 安装依赖：`npm install -g @alauda/doom`

2. 初始化文档目录：`doom new product-doc:site`

3. 本地预览：`npm run dev`

#### 1.4 准备 PAC 配置 - 创建仓库配置

目前 pipelines 通过 PAC 进行管理和触发，因此需要进行基础配置。

具体可参考以下文件：<https://gitlab-ce.alauda.cn/devops/edge/-/blob/master/cluster/devops/templates/devops/pac-tektoncd-pipeline.yaml>

预期是通过上面的 `gitops` 代码仓库统一管理这份配置。

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
      # this prefix cannot contain `:@` character
      replace_image_prefix: ghcr.io/tektoncd/pipeline/controller-
```

说明：

- `global.registry.address`：镜像仓库地址。
  - 通常为 `build-harbor.alauda.cn`。
- `global.version`：组件版本号。
  - 初始时为开源组件的版本，后续会在 pipeline 中自动更新。
    - tekton-operator 会使用组件版本号来判断是否需要更新。因此，每当配置发生变更时，组件的 **version** 也必须变化，以触发自动更新。
- `global.images`：依赖组件的镜像信息。
  - `controller`：组件名称。
    - `repository`：镜像仓库地址。
    - `tag`：镜像 tag。
    - `digest`：镜像 digest。
    - `replace_image_prefix`：用于替换镜像地址的前缀。
      - 用于自动替换开源社区配置文件 `release.yaml` 中的某些镜像地址。
      - 该地址应尽可能准确，以避免错误替换。
      - 该地址不能包含 `:@` 字符。
  - 如果有多个组件，可以继续追加。

#### 2.2 初始化 Makefile 配置

建议在 `tekton-operator` 代码仓库中统一维护 `Makefile` 模板。

目前有两个文件：

- `base.mk`：作为基础模板，包含所有通用功能。
  - 该文件在所有组件中应保持一致。
  - 如果需要新增功能，建议同步回 `tekton-operator` 代码仓库。
- `Makefile`：特定组件的 `Makefile`，继承自 `base.mk`。
  - 该文件主要配置组件的特有功能或设置。

例如，`tektoncd-pipeline` 的 `Makefile` 如下：

```bash
include base.mk

# VERSION is the version of Tekton Pipeline
VERSION ?= v0.56.9

# RELEASE_YAML is the URL to get release.yaml
RELEASE_YAML ?= https://storage.googleapis.com/tekton-releases/pipeline/previous/${VERSION}/release.yaml

# RELEASE_YAML_PATH is the path to save the release.yaml
RELEASE_YAML_PATH ?= release/release.yaml

# VERSION_CONFIGMAP_NAME is the name of the configmap that contains the component version
VERSION_CONFIGMAP_NAME ?= pipelines-info
```

说明：

- `VERSION`：当前组件的版本号。**重要**
  - 该版本号用于拉取对应开源社区的配置列表 `release.yaml`。
  - 同时也会更新 `values.yaml` 中的 `global.version` 字段，以及开源配置列表 `release.yaml` 中的组件版本信息。
- `RELEASE_YAML`：开源社区配置列表的地址。
- `RELEASE_YAML_PATH`：配置列表在本地保存的地址。
  - **必须** 保存在 `release` 目录中，文件名可以自定义。
- `VERSION_CONFIGMAP_NAME`：在配置列表中记录组件版本号的 `configmap` 名称。
  - 例如，`tektoncd-pipeline` 组件对应的配置文件名是 `pipelines-info`。

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

#### 2.3 初始化开源配置列表

在配置好上述 `Makefile` 后，可以直接通过执行 `make download-release-yaml` 命令下载开源社区的配置列表。

说明：

- 配置下载完成后，下载到的 `yaml` 文件会自动通过 `yq` 命令进行格式化。
  - 这样便于后续自动更新镜像地址，并减少 `git diff` 中的噪音。

#### 2.4 初始化组件构建的 Dockerfile 配置

用于构建各组件的 `Dockerfile` 通常维护在 `.tekton/dockerfiles` 目录下。

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

- 目标是确保镜像能够可重复构建。
  - 例如，会定义特定的 Golang 构建参数。
- 尽量以非 root 用户运行。
  - Tekton 组件受到安全限制，使用 root 用户可能导致启动失败。
- 用户 65534 是内部约定。
  - 基础镜像 `build-harbor.alauda.cn/ops/distroless-static:20220806` 中有两个普通用户，`697` 和 `65534`。

#### 2.5 初始化组件构建的 PAC pipeline

目前组件构建通过 PAC 触发，并使用内部模板进行组装。我们只需要做少量配置，就可以快速构建对应组件。

下面以 `tektoncd-pipeline` 中 `controller` 组件的构建 pipeline 为例：

```yaml
apiVersion: tekton.dev/v1
kind: PipelineRun
metadata:
  name: build-controller-image
  annotations:
    pipelinesascode.tekton.dev/on-comment: "^((/test-all)|(/build-controller-image)|(/test-multi.*\ build-controller-image.*))$"
    pipelinesascode.tekton.dev/on-cel-expression: |-
      # **Note** The use of comments is not supported in this `on-cel-expression`. The comments present here are for explanatory purposes; please ensure they are removed in the final configuration!!!
      #
      (
        # Watch for file changes in relevant directories to automatically trigger the pipeline.
        # Rules for supported matching can be found at:
        #   - https://pipelinesascode.com/docs/guide/matchingevents/#matching-a-pipelinerun-to-specific-path-changes
        #   - https://en.wikipedia.org/wiki/Glob_%28programming%29
        #   - https://pipelinesascode.com/docs/guide/cli/#test-globbing-pattern
        # TL;DR:
        #   - You may match all changes in the `.tekton` directory with ".tekton".
        #   - You may match all changes in the `.tekton` directory with ".tekton/**".
        #   - You cannot match all changes in the `.tekton` directory with ".tekton/.*".
        ".tekton/pr-build-controller-image.yaml".pathChanged() ||
        ".tekton/dockerfiles/controller.Dockerfile".pathChanged() ||
        ".tekton/patches".pathChanged() ||
        "upstream".pathChanged()
      ) && (
        # It is advisable to retain this check—changes to the `values.yaml` file should not automatically trigger the pipeline.
        # To prevent the pipeline from automatically updating this file and causing infinite trigger loops.
        # Moreover, if the current changes are in the main branch, it will still assess whether the pipeline should be triggered.
        !"values.yaml".pathChanged() || source_branch.matches("^(main|master|release-.*)$")
      ) &&
      ((
        # This configuration can remain unchanged.
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
    # This is the pipeline template to be used. For detailed definitions and explanations, refer to:
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
    # The following general configurations do not require modification.
    - name: git-url
      value: '{{ repo_url }}'
    - name: git-revision
      value: '{{ source_branch }}'
    - name: git-commit
      value: '{{ revision }}'

    # **To adjust** Change to the actual image repository to be built
    - name: image-repository
      value: build-harbor.alauda.cn/test/devops/tektoncd/pipeline/controller

    # **To adjust** Change to the actual Dockerfile used for building the image
    - name: dockerfile-path
      value: .tekton/dockerfiles/controller.Dockerfile

    # **To adjust** Change to the actual build context for the image
    - name: context
      value: '.'

    # **To adjust** Change to the actual list of monitored file changes
    # **Note** The pipeline will compute the final commit sha based on these file changes.
    #          This sha will be reflected in the image label's commit information and affect the final artifact's tag.
    - name: file-list-for-commit-sha
      value:
        - upstream
        - .tekton/patches
        - .tekton/dockerfiles/controller.Dockerfile
        - .tekton/pr-build-controller-image.yaml

    # **To adjust** Change to the necessary operations
    - name: update-files-based-on-image
      value: |
        # The script can use these environment variables:
        #    - IMAGE: the image URL with tag and digest, e.g., `registry.alauda.cn:60080/devops/noroot/alauda-docker-buildx:latest@sha256:1234567890`
        #    - IMAGE_URL: the image URL excluding tag and digest, e.g., `registry.alauda.cn:60080/devops/noroot/alauda-docker-buildx`
        #    - IMAGE_TAG: the image tag, e.g., `latest`
        #    - IMAGE_DIGEST: the image digest, e.g., `sha256:1234567890`
        #    - LAST_CHANGED_COMMIT: the last changed commit sha

        # Use the yq from the base image to prevent automatic installation with `makefile`.
        export YQ=$(which yq)

        # Update `values.yaml` based on the complete information of the built image.
        # The script logic employed here can be found in the base image:
        #   - https://gitlab-ce.alauda.cn/ops/edge-devops-task/-/blob/master/images/yq/script/update_image_version.sh
        #   - https://gitlab-ce.alauda.cn/ops/edge-devops-task/blob/master/images/yq/script/replace_images_by_values.sh

        echo "update_image_version.sh values.yaml ${IMAGE}"
        update_image_version.sh values.yaml ${IMAGE}

        # **Important** Update the component's version number
        # A suffix will be generated based on the computed last changed commit sha.

        # Retain the current version while removing the -.* suffix
        OLD_VERSION=$(yq eval '.global.version' values.yaml)
        # Use the short commit sha as the version suffix
        export SUFFIX=${LAST_CHANGED_COMMIT:0:7}
        echo "update component version ${OLD_VERSION} suffix to ${SUFFIX}"
        make update-component-version

        # **Important** Update the `release.yaml` based on the latest `values.yaml`.

        echo "replace images in release/release.yaml"
        replace_images_by_values.sh release/release.yaml controller

    # **To adjust** If the image can be validated through preliminary command executions to ensure successful builds, include it here.
    - name: test-script
      value: ''

    # **To adjust** Append additional functionalities. `prepare-tools-image` and `prepare-command` facilitate pre-build preparation of the image.
    # For example, several tasks are executed:
    #   - Generate the `head` file, documenting the upstream directory's commit sha. Generally used within the Dockerfile.
    #   - Set Golang environment variables.
    #   - Update go mod dependencies to address security issues (optional).

    - name: prepare-tools-image
      value: 'build-harbor.alauda.cn/devops/builder-go:1.23'

    - name: prepare-command
      value: |
        #!/bin/bash
        set -ex

        # Generate the head file, which contains the commit sha of the upstream directory
        cd upstream

        git rev-parse HEAD > ../head && cat ../head

        export GOPROXY=https://build-nexus.alauda.cn/repository/golang/,https://goproxy.cn,direct
        export CGO_ENABLED=0
        export GONOSUMDB=*
        export GOMAXPROCS=4

        export GOCACHE=/tmp/.cache/go-build
        mkdir -p $GOCACHE

        # Upgrade go mod dependencies
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

    # **To adjust** Add as needed. `pre-commit-script` is for actions prior to committing.
    - name: pre-commit-script
      value: |
        # remove `head` file
        rm -f head
        #
        # revert upstream directory to prevent unnecessary changes
        cd upstream
        git checkout .
        cd .. # return to the root directory

    # **To adjust** Additional configurations, enable this if the image should not be scanned.
    # - name: ignore-trivy-scan
    #   value: "true"

  # Subsequent configurations generally do not require modification.
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
    # This secret will be replaced by the pac controller.
    - name: basic-auth
      secret:
        secretName: '{{ git_auth_secret }}'
    - name: gitversion-config
      configMap:
        name: gitversion-config

  taskRunTemplate:
    # Ensure all tasks run as a non-root user.
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

该 pipeline 实现的功能说明：

- `git-clone`：拉取代码
- `calculate-commit-sha`、`git-version`、`generate-tags`：计算镜像 tag
- `prepare-build`：准备镜像构建
  - 例如，更新某些文件
- `build-image`：构建镜像
- `test-image`：测试镜像（可选）
- `image-scan`：扫描镜像（可选）
- `update-files-based-on-image`：根据生成的镜像更新文件
  - 例如，将构建出的镜像反映到 `values.yaml` 及其他文件中
- `commit`：提交本地变更（可选）
- `trigger-pipeline`：触发下游 pipeline（可选）

### 3. 触发 pipeline

完成前置工作后，就可以通过 PAC 触发 pipeline。

这可以通过创建 PR，并在 PR 或 commit 中使用评论来激活 pipeline。

### 4. 注册到 Tekton Operator

预期 `Tekton-Operator` 的 pipeline 会自动拉取各组件的配置列表（通常是 `release` 目录下的 YAML 配置文件），并随后将其更新到 `Tekton-Operator` 代码仓库中。这样就可以确保相应的组件版本被纳入下一次 `Tekton-Operator` 构建中。

为了便于拉取，需要将组件信息添加到 `Tekton-Operator` 代码仓库中的 `components.yaml` 文件里。

```yaml
pipeline:
  # The repository and branch to use for the pipeline component
  github: AlaudaDevops/tektoncd-pipeline
  # The revision to use to pull the component
  revision: main
  # This version will be automatically retrieved from the corresponding branch of the code repository
  # It reads the `.global.version` field in values.yaml
  version: v0.66.0
```

说明：

- `github`：组件代码仓库地址，格式为 `org/repo`。
- `revision`：该代码仓库对应的分支。
  - 可以是分支、tag 或 commit ID。
- `version`：组件版本号。
  - 通常从 `values.yaml` 中对应仓库和特定 `revision` 提取。
  - 该字段会随着每次配置拉取自动更新，因此一般无需手动维护。

## 可改进的方面

### 1. 分支管理策略

### 2. 补丁包管理
