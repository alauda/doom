---
created: '2025-01-07'
sourceSHA: 1b8f823fa2113e3040f4995d879c7349663878e4cef764b13939e89710e19c4c
---

# Быстрый старт компонента

## Предыстория

Tekton Operator включает несколько компонентов, каждый из которых имеет свой собственный кодовый репозиторий и планирование версий.

Процесс разработки для каждого плагина схож. В этом документе будет представлено, как быстро инициализировать плагин и зарегистрировать его в Tekton Operator.

## Принципы

- Унифицируйте процессы насколько это возможно, чтобы уменьшить повторяющуюся работу.

## Быстрый старт

### 1. Предварительные требования

#### 1.1 Инициализация кодового репозитория

Создайте новый репозиторий на <https://github.com/AlaudaDevops>, начиная с `tektoncd-`, за которым следует соответствующее название открытого компонента, например, `tektoncd-pipeline`.

#### 1.2 Инициализация подмодуля

Добавьте кодовый репозиторий открытого компонента как подмодуль под новый репозиторий, в настоящее время согласовано помещать его в каталог `upstream`.

Рекомендуется выбрать стабильную ветку выпуска, такую как `release-v0.56.x`.

```yaml
$ git submodule add -b release-v0.56.x https://github.com/tektoncd/pipeline upstream
```

#### 1.3 Инициализация документации

Согласно объединённым [стандартам разработки документации](https://product-doc-guide.alauda.cn/02_quick_start/01_doc_dev.html) для платформы, инициализируйте каталог документации.

Обычно это включает в себя:

1. Установите зависимости: `npm install -g @alauda/doom`

2. Инициализация документации: `doom new product-doc:site`

3. Предварительный просмотр локально: `npm run dev`

#### 1.4 Подготовка конфигурации PAC - Создание конфигурации репозитория

В настоящее время конвейеры управляются и запускаются через PAC, поэтому требуется базовая конфигурация.

Обратитесь к этому файлу за спецификациями: <https://gitlab-ce.alauda.cn/devops/edge/-/blob/master/cluster/devops/templates/devops/pac-tektoncd-pipeline.yaml>

Ожидается, что эта конфигурация будет единообразно управляться через вышеупомянутый кодовый репозиторий `gitops`.

### 2. Конфигурация каркаса

#### 2.1 Инициализация конфигурационного файла `values.yaml`

```yaml
# global: корневая локация для общих аргументов
global:
  registry:
    # address: адрес реестра
    address: build-harbor.alauda.cn
  # версия - это версия компонента
  #   1. использована tekton-operator, записать версию этого компонента
  #   2. синхронизируется с configmap `pipelines-info`
  version: 'v0.56.9'
  # изображения записывают связанные изображения и компоненты
  # используется для хранения последней изменённой коммиты для каждого компонента
  images:
    controller:
      # repository: репозиторий изображения для изображения
      repository: devops/tektoncd/pipeline/controller
      # tag: тег для компонента
      tag: latest
      # digest: дайджест для компонента
      digest: sha256:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
      # replace_image_prefix: заменить префикс изображения
      # этот префикс не может содержать символы `:@`
      replace_image_prefix: ghcr.io/tektoncd/pipeline/controller-
```

Пояснение:

- `global.registry.address`: Адрес репозитория изображений.
  - Обычно это `build-harbor.alauda.cn`.
- `global.version`: Номер версии компонента.
  - Первоначально это версия открытого компонента, которая будет обновляться автоматически в последующих конвейерах.
    - Tekton-оператор использует номер версии компонента, чтобы определить, требуется ли обновление. Поэтому каждый раз, когда в конфигурации происходит изменение, **версия** компонента также должна изменяться, чтобы инициировать его автоматическое обновление.
- `global.images`: Информация об изображениях зависимых компонентов.
  - `controller`: Название компонента.
    - `repository`: Адрес репозитория изображения.
    - `tag`: Тег изображения.
    - `digest`: Дайджест изображения.
    - `replace_image_prefix`: Префикс для замены адресов изображений.
      - Используется для автоматической замены определённых адресов изображений в конфигурационном файле открытого сообщества `release.yaml`.
      - Этот адрес должен быть как можно более точным, чтобы предотвратить неправильные замены.
      - Адрес не может содержать символы `:@`.
  - Если есть несколько компонентов, вы можете продолжить их добавление.

#### 2.2 Инициализация конфигурации Makefile

Рекомендуется единообразно поддерживать шаблон `Makefile` в кодовом репозитории `tekton-operator`.

В данный момент имеется два файла:

- `base.mk`: Этот файл служит базовым шаблоном и включает все общие функциональности.
  - Этот файл должен оставаться одинаковым для всех компонентов.
  - Если необходимо добавить новые функции, рекомендуется синхронизировать их обратно в кодовый репозиторий `tekton-operator`.
- `Makefile`: Это специфический `Makefile` компонента, наследующий от `base.mk`.
  - Этот файл в основном настраивает уникальные особенности или настройки компонента.

Например, `Makefile` для `tektoncd-pipeline` выглядит следующим образом:

```bash
include base.mk

# VERSION - это версия Tekton Pipeline
VERSION ?= v0.56.9

# RELEASE_YAML - это URL для получения release.yaml
RELEASE_YAML ?= https://storage.googleapis.com/tekton-releases/pipeline/previous/${VERSION}/release.yaml

# RELEASE_YAML_PATH - это путь для сохранения release.yaml
RELEASE_YAML_PATH ?= release/release.yaml

# VERSION_CONFIGMAP_NAME - это название configmap, который содержит номер версии компонента
VERSION_CONFIGMAP_NAME ?= pipelines-info
```

Пояснение:

- `VERSION`: Номер версии текущего компонента. **Важно**
  - Этот номер версии используется для получения соответствующего списка конфигураций открытого сообщества `release.yaml`.
  - Он также обновит поле `global.version` в `values.yaml` и информацию о версии компонента в списке конфигураций открытого кода `release.yaml`.
- `RELEASE_YAML`: Адрес списка конфигураций открытого сообщества.
- `RELEASE_YAML_PATH`: Адрес, по которому список конфигураций сохраняется локально.
  - **Обязательно** хранить в каталоге `release`, хотя имя файла можно настроить.
- `VERSION_CONFIGMAP_NAME`: Название `configmap`, который записывает номер версии компонента в списке конфигураций.

  - Например, имя файла конфигурации для компонента `tektoncd-pipeline` — это `pipelines-info`.

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
      # Содержит версии конвейеров, которые могут запрашиваться внешними
      # инструментами, такими как CLI. Повышенные права уже предоставлены
      # этому ConfigMap, так что даже если у нас нет доступа к
      # другим ресурсам в пространстве имен, мы все равно сможем получить доступ к
      # этому ConfigMap.
      version: v0.56.9
    ```

#### 2.3 Инициализация списка конфигураций открытого кода

После настройки вышеуказанного `Makefile` вы можете напрямую скачать список конфигураций открытого сообщества, используя команду `make download-release-yaml`.

Пояснение:

- После завершения скачивания конфигурации загруженный файл `yaml` будет автоматически отформатирован с помощью команды `yq`.
  - Это сделано для облегчения автоматических обновлений адресов изображений позже и уменьшения "шума" в `git diff`.

#### 2.4 Инициализация конфигурации Dockerfile для сборки компонентов

`Dockerfile` для сборки каждого компонента обычно поддерживается в каталоге `.tekton/dockerfiles`.

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

Пояснение:

- Цель состоит в том, чтобы убедиться, что изображение создается воспроизводимо.
  - Например, определены специфические параметры сборки Golang.
- Стремитесь запускать как неподобный пользователь, когда это возможно.
  - Компоненты Tekton подлежат ограничениям безопасности, и запуск от имени суперпользователя может привести к сбоям запуска.
- Пользователь 65534 является внутренней конвенцией.
  - Базовое изображение `build-harbor.alauda.cn/ops/distroless-static:20220806` имеет двух обычных пользователей: `697` и `65534`.

#### 2.5 Инициализация конвейера PAC для сборки компонентов

В настоящее время сборки компонентов инициируются через PAC, используя внутренние шаблоны для сборки. Нам нужно лишь внести несколько конфигураций, чтобы быстро построить соответствующие компоненты.

Вот пример конфигурации для строительного конвейера компонента `controller` в `tektoncd-pipeline`:

```yaml
apiVersion: tekton.dev/v1
kind: PipelineRun
metadata:
  name: build-controller-image
  annotations:
    pipelinesascode.tekton.dev/on-comment: "^((/test-all)|(/build-controller-image)|(/test-multi.*\ build-controller-image.*))$"
    pipelinesascode.tekton.dev/on-cel-expression: |-
      # **Примечание** Использование комментариев не поддерживается в этом `on-cel-expression`. Комментарии, представленные здесь, носят пояснительный характер; пожалуйста, убедитесь, что они удалены в окончательной конфигурации!!!
      #
      (
        # Следите за изменениями файлов в соответствующих каталогах, чтобы автоматически инициировать конвейер.
        # Правила поддерживаемого сопоставления можно найти на:
        #   - https://pipelinesascode.com/docs/guide/matchingevents/#matching-a-pipelinerun-to-specific-path-changes
        #   - https://en.wikipedia.org/wiki/Glob_%28programming%29
        #   - https://pipelinesascode.com/docs/guide/cli/#test-globbing-pattern
        # Кратко:
        #   - Вы можете сопоставить все изменения в каталоге `.tekton` с ".tekton".
        #   - Вы можете сопоставить все изменения в каталоге `.tekton` с ".tekton/**".
        #   - Вы не можете сопоставить все изменения в каталоге `.tekton` с ".tekton/.*".
        ".tekton/pr-build-controller-image.yaml".pathChanged() ||
        ".tekton/dockerfiles/controller.Dockerfile".pathChanged() ||
        ".tekton/patches".pathChanged() ||
        "upstream".pathChanged()
      ) && (
        # Рекомендуется сохранить эту проверку - изменения в файле `values.yaml` не должны автоматически инициировать конвейер.
        # Чтобы предотвратить автоматическое обновление этого файла конвейером и вызвать бесконечные циклы инициирования.
        # Более того, если текущие изменения находятся в основной ветке, он всё равно будет оценивать, следует ли инициировать конвейер.
        !"values.yaml".pathChanged() || source_branch.matches("^(main|master|release-.*)$")
      ) &&
      ((
        # Эта конфигурация может оставаться неизменной.
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
    # Это шаблон конвейера, который будет использоваться. Для подробных определений и объяснений смотрите:
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
    # Следующие общие конфигурации не требуют модификации.
    - name: git-url
      value: '{{ repo_url }}'
    - name: git-revision
      value: '{{ source_branch }}'
    - name: git-commit
      value: '{{ revision }}'

    # **Для корректировки** Измените на фактический репозиторий изображений, который будет построен.
    - name: image-repository
      value: build-harbor.alauda.cn/test/devops/tektoncd/pipeline/controller

    # **Для корректировки** Измените на фактический Dockerfile, используемый для сборки изображения.
    - name: dockerfile-path
      value: .tekton/dockerfiles/controller.Dockerfile

    # **Для корректировки** Измените на фактический контекст сборки для изображения.
    - name: context
      value: '.'

    # **Для корректировки** Измените на фактический список отслеживаемых изменений файлов.
    # **Примечание** Конвейер вычислит окончательный sha коммита на основе этих изменений файлов.
    #          Этот sha отразится в информации о коммите в метаданных изображения и повлияет на тег финального артефакта.
    - name: file-list-for-commit-sha
      value:
        - upstream
        - .tekton/patches
        - .tekton/dockerfiles/controller.Dockerfile
        - .tekton/pr-build-controller-image.yaml

    # **Для корректировки** Если изображение можно проверить с помощью предварительных команд, чтобы гарантировать успешность сборок, включите сюда.
    - name: test-script
      value: ''

    # **Для корректировки** Добавьте дополнительные функциональности. `prepare-tools-image` и `prepare-command` способствуют предварительной подготовке изображения к сборке.
    # Например, выполняются несколько задач:
    #   - Сгенерируйте файл `head`, документируя коммит sha каталога upsteam. Обычно используется в Dockerfile.
    #   - Установите переменные окружения Golang.
    #   - Обновите зависимости go модулей, чтобы решить проблемы безопасности (по желанию).

    - name: prepare-tools-image
      value: 'build-harbor.alauda.cn/devops/builder-go:1.23'

    - name: prepare-command
      value: |
        #!/bin/bash
        set -ex

        # Сгенерируйте файл head, который содержит коммит sha каталога upsteam.
        cd upstream

        git rev-parse HEAD > ../head && cat ../head

        export GOPROXY=https://build-nexus.alauda.cn/repository/golang/,https://goproxy.cn,direct
        export CGO_ENABLED=0
        export GONOSUMDB=*
        export GOMAXPROCS=4

        export GOCACHE=/tmp/.cache/go-build
        mkdir -p $GOCACHE

        # Обновить зависимости go модулей.
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

    # **Для корректировки** Добавьте при необходимости. `pre-commit-script` актуален для действий, выполнения перед коммитом.
    - name: pre-commit-script
      value: |
        # удалите файл `head`
        rm -f head
        #
        # верните каталог upstream обратно, чтобы предотвратить ненужные изменения.
        cd upstream
        git checkout .
        cd .. # вернуться в корневой каталог

    # **Для корректировки** Дополнительные конфигурации, активируйте, если изображение не должно быть проверено.
    # - name: ignore-trivy-scan
    #   value: "true"

  # Последующие конфигурации, как правило, не требуют модификации.
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
    # Этот секрет будет заменён контроллером pac.
    - name: basic-auth
      secret:
        secretName: '{{ git_auth_secret }}'
    - name: gitversion-config
      configMap:
        name: gitversion-config

  taskRunTemplate:
    # Обеспечьте выполнение всех задач как неподобного пользователя.
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

Пояснение функциональности, реализуемой этим конвейером:

- `git-clone`: извлечение кода
- `calculate-commit-sha`, `git-version`, `generate-tags`: вычисление тега изображения
- `prepare-build`: подготовка к сборке изображения
  - Например, обновите определённые файлы
- `build-image`: построить изображение
- `test-image`: протестировать изображение (по желанию)
- `image-scan`: проверить изображение (по желанию)
- `update-files-based-on-image`: обновить файлы на основе созданного изображения
  - Например, отобразите построенное изображение в `values.yaml` и других файлах
- `commit`: отправить локальные изменения (по желанию)
- `trigger-pipeline`: инициировать последующие конвейеры (по желанию)

### 3. Инициирование конвейера

После завершения подготовительных работ вы можете инициировать конвейер через PAC.

Это можно сделать, создав PR и используя комментарии в PR или коммит, чтобы активировать конвейер.

### 4. Регистрация в Tekton Operator

Ожидается, что конвейеры `Tekton-Operator` автоматически извлекают список конфигураций каждого компонента (обычно YAML-конфигурационные файлы в каталоге `release`) и затем обновляют их в кодовом репозитории `Tekton-Operator`. Это гарантирует, что соответствующие версии компонентов могут быть включены в следующую сборку `Tekton-Operator`.

Чтобы содействовать извлечению информации, необходимо добавить компонент в файл `components.yaml` в кодовом репозитории `Tekton-Operator`.

```yaml
pipeline:
  # Репозиторий и ветка, которые будут использоваться для компонента конвейера
  github: AlaudaDevops/tektoncd-pipeline
  # Ревизия, которая будет использоваться для извлечения компонента
  revision: main
  # Эта версия будет автоматически извлечена из соответствующей ветки кодового репозитория
  # Читает поле `.global.version` в values.yaml
  version: v0.66.0
```

Пояснение:

- `github`: Адрес кодового репозитория компонента в формате `org/repo`.
- `revision`: Ветка, связанная с этим кодовым репозиторием.
  - Это может быть ветка, тег или commit ID.
- `version`: Номер версии компонента.
  - Обычно извлекается из соответствующего репозитория и конкретного `revision` в `values.yaml`.
  - Это поле будет автоматически обновляться с каждым извлечением конфигурации, что в целом устраняет необходимость в ручном обслуживании.

## Области для улучшения

### 1. Стратегия управления ветками

### 2. Управление пакетами патчей
