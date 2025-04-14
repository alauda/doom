---
created: '2025-01-07'
---

# Component Quick Start

## Background

Tekton Operator includes multiple components, each with its own code repository and version planning.

The development process for each plugin is similar. This document will introduce how to quickly initialize a plugin and register it to the Tekton Operator.

## Principles

- Unify processes as much as possible to reduce repetitive work.

## Quick Start

### 1. Prerequisites

#### 1.1 Initialize the Code Repository

Create a new repository under <https://github.com/AlaudaDevops>, beginning with `tektoncd-`, followed by the corresponding open source component name, e.g., `tektoncd-pipeline`.

#### 1.2 Initialize Submodule

Add the open source component's code repository as a submodule under the new repository, currently agreed upon being in the `upstream` directory.

It is advisable to choose a stable release branch, such as `release-v0.56.x`.

```yaml
$ git submodule add -b release-v0.56.x https://github.com/tektoncd/pipeline upstream
```

#### 1.3 Initialize the Documentation

Refer to the unified [documentation development](https://product-doc-guide.alauda.cn/02_quick_start/01_doc_dev.html) standards for the platform to initialize the documentation directory.

Typically, this includes:

1. Install dependencies: `npm install -g @alauda/doom`

2. Initialize the documentation directory: `doom new product-doc:site`

3. Preview locally: `npm run dev`

#### 1.4 Prepare PAC Configuration - Create Repository Configuration

Currently, pipelines are managed and triggered through PAC, therefore basic configuration is required.

Refer to this file for specifics: <https://gitlab-ce.alauda.cn/devops/edge/-/blob/master/cluster/devops/templates/devops/pac-tektoncd-pipeline.yaml>

The expectation is that this configuration will be uniformly managed through the above `gitops` code repository.

### 2. Scaffolding Configuration

#### 2.1 Initialize Configuration File `values.yaml`

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

Explanation:

- `global.registry.address`: The address of the image repository.
  - Typically, this is `build-harbor.alauda.cn`.
- `global.version`: The version number of the component.
  - Initially, this is the version of the open source component, which will be updated automatically in subsequent pipelines.
    - The tekton-operator uses the component version number to determine if an update is necessary. Hence, any time there is a change in the configuration, the component's **version** must also change to trigger its automatic update.
- `global.images`: Information about the images of dependent components.
  - `controller`: The name of the component.
    - `repository`: The address of the image repository.
    - `tag`: The image tag.
    - `digest`: The image digest.
    - `replace_image_prefix`: The prefix for replacing image addresses.
      - Used to automatically replace certain image addresses in the open source community’s configuration file `release.yaml`.
      - This address should be as accurate as possible to prevent incorrect replacements.
      - The address cannot contain the `:@` character.
  - If there are multiple components, you may continue to add them.

#### 2.2 Initialize Makefile Configuration

It is recommended to uniformly maintain the `Makefile` template within the `tekton-operator` code repository.

Currently, there are two files:

- `base.mk`: This file serves as a base template and includes all common functionalities.
  - This file should remain the same across all components.
  - If new features need to be added, it is recommended to synchronize them back to the `tekton-operator` code repository.
- `Makefile`: This is the specific component's `Makefile`, inheriting from `base.mk`.
  - This file primarily configures the unique features or settings of the component.

For instance, the `Makefile` for `tektoncd-pipeline` looks like this:

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

Explanation:

- `VERSION`: The version number of the current component. **Important**
  - This version number is used to fetch the corresponding open source community’s configuration list `release.yaml`.
  - It will also update the `global.version` field in `values.yaml` and the component version information in the open source configuration list `release.yaml`.
- `RELEASE_YAML`: The address of the open source community's configuration list.
- `RELEASE_YAML_PATH`: The address where the configuration list is saved locally.
  - **Must** be stored within the `release` directory, although the file name can be customized.
- `VERSION_CONFIGMAP_NAME`: The name of the `configmap` that records the component version number in the configuration list.

  - For example, the configuration file name for the `tektoncd-pipeline` component is `pipelines-info`.

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

#### 2.3 Initialize Open Source Configuration List

After configuring the above `Makefile`, you can directly download the open source community’s configuration list by using the command `make download-release-yaml`.

Explanation:

- Once the configuration download is complete, the downloaded `yaml` file will be automatically formatted using the `yq` command.
  - This is to facilitate easier automatic updates of image addresses later and reduce noise in `git diff`.

#### 2.4 Initialize Dockerfile Configuration for Component Builds

The `Dockerfile` for building each component is typically maintained in the `.tekton/dockerfiles` directory.

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

Explanation:

- The goal is to ensure that the image is reproducibly built.
  - For example, specific Golang build parameters are defined.
- Aim to run as a non-root user whenever possible.
  - Tekton components are subject to security limitations, and running as the root user may lead to startup failures.
- User 65534 is an internal convention.
  - The base image `build-harbor.alauda.cn/ops/distroless-static:20220806` has two ordinary users, `697` and `65534`.

#### 2.5 Initialize PAC Pipeline for Component Builds

Currently, component builds are triggered via PAC, employing internal templates for assembly. We only need to make a few configurations to quickly build corresponding components.

Here’s an example configuration for the build pipeline of the `controller` component within `tektoncd-pipeline`:

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
    #   - Generate the `head` file, documenting the upstream directory’s commit sha. Generally used within the Dockerfile.
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

Explanation of functionalities implemented by this pipeline:

- `git-clone`: pull the code
- `calculate-commit-sha`, `git-version`, `generate-tags`: compute the image tag
- `prepare-build`: prepare for image building
  - For example, update certain files
- `build-image`: build the image
- `test-image`: test the image (optional)
- `image-scan`: scan the image (optional)
- `update-files-based-on-image`: update files based on the created image
  - For instance, reflect the built image into `values.yaml` and other files
- `commit`: submit local changes (optional)
- `trigger-pipeline`: initiate downstream pipelines (optional)

### 3. Triggering the Pipeline

Once the preparatory work is completed, you can trigger the pipeline via PAC.

This can be accomplished by creating a PR and utilizing comments in the PR or commit to activate the pipeline.

### 4. Registering with the Tekton Operator

The expectation is that the `Tekton-Operator` pipelines automatically retrieve each component's configuration list (usually the YAML configuration files in the `release` directory) and subsequently update them in the `Tekton-Operator` code repository. This ensures that the corresponding component versions can be included in the next `Tekton-Operator` build.

To facilitate the retrieval, the component information must be added to the `components.yaml` file in the `Tekton-Operator` code repository.

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

Explanation:

- `github`: The address of the component's code repository in `org/repo` format.
- `revision`: The branch associated with that code repository.
  - This can be a branch, tag, or commit ID.
- `version`: The version number of the component.
  - Typically extracted from the corresponding repository and specific `revision` in `values.yaml`.
  - This field will automatically update with each configuration retrieval, thereby generally eliminating the need for manual maintenance.

## Areas for Improvement

### 1. Branch Management Strategy

### 2. Patch Package Management
