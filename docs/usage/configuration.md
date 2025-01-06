---
description: 配置 `doom` 文档工具
weight: 1
---

# 配置

## 配置文件

大部分情况下，我们只需要使用静态 `yaml` 配置文件即可，支持 `doom.config.yaml` 或 `doom.config.yml`，对于复杂场景，比如需要动态配置或自定义 `rspress` 插件时，可以使用 `js/ts` 配置文件，支持 `.js/.ts/.mjs/.mts/.cjs/.cts` 多种文件格式。

对于 `js/ts` 配置文件，我们需要导出配置，可以配合 `@alauda/doom/config` 中导出的 `defineConfig` 函数实现类型辅助：

```ts
import { defineConfig } from '@alauda/doom/config'

export default defineConfig({})
```

`doom` 会在 `docs` 文件夹或当前工作目录下查找配置文件，如果没有找到，会使用默认配置，也可以通过 `cli` 指定文档目录：

```bash
doom dev my-docs
doom build my-docs
doom serve my-docs
```

还可以通过 `--config` 指定配置文件路径：

```bash
doom dev --config ./my-config.js
doom build --config ./my-config.js
doom serve --config ./my-config.js
```

## 基础配置

- `lang`：默认文档语言，为方便大部分项目使用，我们默认支持中英文文档，默认语言为 `en`，如果当前文档项目不需要多语言支持，可以将此项配置为 `null` 或 `undefined`
- `title`：文档标题，会显示在浏览器标签页上
- `logo`：文档左上角 logo，支持图片链接、文件路径，绝对路径代表 `public` 目录下的文件，相对路径代表相对于当前工具目录的文件，默认使用 `doom` 包内置的 alauda logo
- `logoText`：文档标题，会显示在左上角的 logo 处
- `icon`：文档 favicon，默认同 `logo`
- `base`：文档基础路径，用于部署到非根路径，如 `product-docs`，默认为 `/`
- `outDir`：构建产物目录，默认为 `dist/{base}/${version}`，如果指定此项，则变更为 `dist/{outDir}/{version}`，其中 `version` 可选，参考[多版本构建](./deploy#多版本构建)

## API 文档配置

```yaml
api:
  # CRD 定义文件路径，支持 glob 匹配，json/yaml 文件
  crds:
    - shared/crds/*.yaml
  # OpenAPI 定义文件路径，支持 glob 匹配，json/yaml 文件
  openapis:
    - shared/openapis/*.json
  # 渲染 openapi 相关的资源定义时，默认会在页面内联，如果需要将相关联的资源定义单独提取到文件中，可以配置以下选项
  # 参考 https://doom.alauda.cn/apis/references/CodeQuality.html#v1alpha1.CodeQualitySpec
  references:
    v1alpha1.CodeQualityBranch: /apis/references/CodeQualityBranch#v1alpha1.CodeQualityBranch
  # 可选，API 文档路径前缀，如果当前业务使用 gateway 等代理服务，可以配置此项
  pathPrefix: /apis
```

文档编写参考 [API 文档](./api)

## 引用文档配置

```yaml
reference:
  - repo: alauda-public/product-doc-guide # 可选，引用文档仓库地址，如果不填写，则默认使用当前文档仓库地址
    sources:
      - name: anchor # 引用文档名称，用于在文档中引用，全局唯一
        path: docs/index.mdx#介绍 # 引用文档路径，支持锚点定位，远程仓库相对于仓库根目录，本地相对于 doom.config.* 所在目录
        # ignoreHeading: [boolean] # 可选，是否忽略标题，如果为 true，则不会在引用文档中显示锚点的标题
```

文档编写参考[引用文档](./reference)

## `sites.yaml` 配置

`sites.yaml` 配置文件用于配置当前文档站点关联的子站点信息，[引用外部站点组件](./mdx#externalsite) 和构建单版本文档时会用到此处定义的信息。

```yaml
- name: connectors # 全站唯一名称
  displayName: # 站点显示名称，如果不填写或未匹配到语言，则默认使用 name
    en: DevOps Connectors
    zh: DevOps 连接器
  base: /devops-connectors # 站点访问基础路径
  repo: https://github.com/AlaudaDevops/connectors-operator # 站点仓库地址，如果是内部 gitlab 仓库，可以直接使用相关 slug，如 `alauda/product-docs`
  image: devops/connectors-docs # 站点构建镜像，用于构建全站点时拉取镜像
  defaultVersion: v1.1 # 可选，默认版本号，构建多版本站点时跳转的默认版本，如果不填写，则默认跳转到最新版本
```
