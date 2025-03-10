---
description: 配置 `doom` 文档工具
weight: 1
---

# 配置 \{#configuration}

## 配置文件 \{#config-file}

大部分情况下，我们只需要使用静态 `yaml` 配置文件即可，支持 `doom.config.yaml` 或 `doom.config.yml`，对于复杂场景，比如需要动态配置或自定义 `rspress` 插件时，可以使用 `js/ts` 配置文件，支持 `.js/.ts/.mjs/.mts/.cjs/.cts` 多种文件格式。

对于 `js/ts` 配置文件，我们需要导出配置，可以配合 `@alauda/doom/config` 中导出的 `defineConfig` 函数实现类型辅助：

```ts
import { defineConfig } from '@alauda/doom/config'

export default defineConfig({})
```

## 基础配置 \{#basic}

- `lang`：默认文档语言，为方便大部分项目使用，我们默认支持中英文文档，默认语言为 `en`，如果当前文档项目不需要多语言支持，可以将此项配置为 `null` 或 `undefined`
- `title`：文档标题，会显示在浏览器标签页上
- `logo`：文档左上角 logo，支持图片链接、文件路径，绝对路径代表 `public` 目录下的文件，相对路径代表相对于当前工具目录的文件，默认使用 `doom` 包内置的 alauda logo
- `logoText`：文档标题，会显示在左上角的 logo 处
- `icon`：文档 favicon，默认同 `logo`
- `base`：文档基础路径，用于部署到非根路径，如 `product-docs`，默认为 `/`
- `outDir`：构建产物目录，默认为 `dist/{base}/${version}`，如果指定此项，则变更为 `dist/{outDir}/{version}`，其中 `version` 可选，参考[多版本构建](./deploy#多版本构建)

## API 文档配置 \{#api}

```yaml
api:
  # CRD 定义文件路径，相对于 doom.config.* 所在目录，支持 glob 匹配，json/yaml 文件
  crds:
    - docs/shared/crds/*.yaml
  # OpenAPI 定义文件路径，相对于 doom.config.* 所在目录，支持 glob 匹配，json/yaml 文件
  openapis:
    - docs/shared/openapis/*.json
  # 渲染 openapi 相关的资源定义时，默认会在页面内联，如果需要将相关联的资源定义单独提取到文件中，可以配置以下选项
  # 参考 https://doom.alauda.cn/apis/references/CodeQuality.html#v1alpha1.CodeQualitySpec
  references:
    v1alpha1.CodeQualityBranch: /apis/references/CodeQualityBranch#v1alpha1.CodeQualityBranch
  # 可选，API 文档路径前缀，如果当前业务使用 gateway 等代理服务，可以配置此项
  pathPrefix: /apis
```

文档编写参考 [API 文档](./api)

## 权限说明文档配置 \{#permission}

```yaml
# 以下资源文件路径，相对于 doom.config.* 所在目录，支持 glob 匹配，json/yaml 文件
permission:
  functionresources:
    # `kubectl get functionresources`
    - docs/shared/functionresources/*.yaml
  roletemplates:
    # `kubectl get roletemplates -l auth.cpaas.io/roletemplate.official=true`
    - docs/shared/roletemplates/*.yaml
```

文档编写参考[权限说明文档](./permission)

## 引用文档配置 \{#reference}

```yaml
reference:
  - repo: alauda-public/product-doc-guide # 可选，引用文档仓库地址，如果不填写，则默认使用当前文档仓库地址
    branch: # [string] 可选，引用文档仓库分支
    publicBase: # [string] 可选，使用远程仓库时使用绝对路径 /images/xx.png 对应的静态资源所在目录，默认为 docs/public
    sources:
      - name: anchor # 引用文档名称，用于在文档中引用，全局唯一
        path: docs/index.mdx#介绍 # 引用文档路径，支持锚点定位，远程仓库相对于仓库根目录，本地相对于 doom.config.* 所在目录
        ignoreHeading: # [boolean] 可选，是否忽略标题，如果为 true，则不会在引用文档中显示锚点的标题
        processors: # 可选，引用文档内容处理器
          - type: ejsTemplate
            data: # ejs 模板参数，使用 `<%= data.xx %>` 访问
        frontmatterMode: merge # 可选，引用文档处理 frontmatter 模式，默认为 ignore，可选值为 ignore/merge/replace/remove
```

### `frontmatterMode`

- `ignore`：忽略引用文档的 frontmatter，保留使用当前文档的 frontmatter
- `merge`：合并引用文档的 frontmatter，如果有相同的 key，引用文档的值会覆盖当前文档的值
- `replace`：使用引用文档的 frontmatter 替换当前文档的 frontmatter
- `remove`：移除当前文档的 frontmatter

文档编写参考[引用文档](./reference)

## 发行说明配置 \{#release-notes}

```yaml
releaseNotes:
  queryTemplates:
    fixed: # 可包含 ejs 模板的 jql 语句
    unfixed:
```

```md title="release-notes.md"
<!-- release-notes-for-bugs?template=fixed&project=DevOps -->
```

```mdx title="release-notes.mdx"
{/* release-notes-for-bugs?template=fixed&project=DevOps */}
```

以上述 `template=fixed&project=DevOps` 为例，`fixed` 为 `queryTemplates` 中定义的模板名称，剩余的 `query` 参数 `project=DevOps` 将作为 [`ejs`](https://github.com/mde/ejs) 模板参数传递给 `fixed` 模板处理后作为 jira [`jql`](https://www.atlassian.com/zh/software/jira/guides/jql/overview#what-is-jql) 发起 `https://jira.alauda.cn/rest/api/2/search?jql=<jql>` 请求，此 API 要求鉴权，有如下两种方式提供环境变量：

1. 本地开发环境可以设置 `JIRA_USERNAME` 和 `JIRA_PASSWORD`
2. CI 流水线环境后续将自动注入 `JIRA_TOKEN`

`JIRA_TOKEN` 优先级高于 `JIRA_USERNAME` 和 `JIRA_PASSWORD`，如果同时设置，将优先使用 `JIRA_TOKEN`。

## 左导航配置 \{#sidebar}

```yaml
sidebar:
  collapsed: false # 可选，是否默认折叠左导航，默认折叠，文档内容不多时可以考虑设置为 false
```

## 内部文档路由 \{#internal-routes}

```yaml
internalRoutes: # 可选，支持 glob 匹配，相对于 docs 目录，匹配到的文件在 cli 启用 `-i, --ignore` 选项时会被忽略
  - '*/internal/**/*'
```

## `sites.yaml` 配置 \{#sites}

`sites.yaml` 配置文件用于配置当前文档站点关联的子站点信息，[引用外部站点组件](./mdx#externalsite)和构建单版本文档时会用到此处定义的信息。

```yaml
- name: connectors # 全站唯一名称
  base: /devops-connectors # 站点访问基础路径
  version: v1.1 # 构建多版本站点时 ExternalSite/ExternalSiteLink 跳转的版本

  displayName: # 站点显示名称，如果不填写或未匹配到语言，则默认使用 name
    en: DevOps Connectors
    zh: DevOps 连接器

  # 以下属性用于构建全站点时拉取镜像，如果不填写则在最终打包完整网站时将忽略此项
  # 一般对子站点引用需要配置相关信息，对父站点引用不需要配置
  repo: https://github.com/AlaudaDevops/connectors-operator # 站点仓库地址，如果是内部 gitlab 仓库，可以直接使用相关 slug，如 `alauda/product-docs`
  image: devops/connectors-docs # 站点构建镜像，用于构建全站点时拉取镜像
```

## 翻译配置 \{#translate}

```yaml
translate:
  # 系统提示语，ejs 模板，传入的参数有 `sourceLang`, `targetLang`, `additionalPrompts`
  # 其中 `sourceLang` 和 `targetLang` 是 `中文` 和 `英文` 两个字符串，
  #     `additionalPrompts` 为 `i18n` 中的 `additionalPrompts` 配置，可能为空
  # 默认的系统提示语如下，可以根据实际情况进行修改
  systemPrompt: |
## 角色
你是一位专业的技术文档工程师，擅长写作高质量的<%= targetLang %>技术分档。请你帮我准确地将以下<%= sourceLang %>翻译成<%= targetLang %>，风格与<%= targetLang %>技术文档保持一致。

## 规则
- 第一条消息为需要翻译的最新<%= sourceLang %>文档，第二条消息为之前翻译过的但内容可能过期的<%= targetLang %>文档，如果没有翻译过则为空
- 输入格式为 MDX 格式，输出格式也必须保留原始 MDX 格式，且不要额外包装在不必要的代码块中
- 文档中的资源链接不要翻译和替换
- MDX 组件中包含的内容需要翻译，MDX 组件参数的值不需要翻译，但以下这些特殊的 MDX 组件参数值需要翻译
  * 组件示例： <Tab label="参数值">组件包含的内容</Tab>，label 是 key 不用翻译，"参数值" 需要翻译
- 以下是常见的相关术语词汇对应表（中文 -> English）
  * ACP -> ACP
  * 灵雀云 -> Alauda
- 移除 {/* reference-start */}, {/* reference-end */}, <!-- reference-start --> 和 <!-- reference-end --> 相关的注释
- 翻译过程中务必保留原文中的 \\< 转义字符不要做任何转义变更

## 策略
分四步进行翻译工作：
1. 根据<%= sourceLang %>文档直译成<%= targetLang %>，保持原有格式，不要遗漏任何信息
2. 根据第一步直译的结果，指出其中存在的具体问题，要准确描述，不宜笼统的表示，也不要增加原文不存在的内容或格式，包括不仅限于
 - 不符合<%= targetLang %>表达习惯，明确指出不符合的地方
 - 语句不通顺，指出位置，不需要给出修改意见，意译时修复
 - 晦涩难懂，模棱两可，不易理解，可以尝试给出解释
3. 根据第一步直译的结果和第二步指出的问题，重新进行意译，保证内容的原意的基础上，使其更易于理解，更符合<%= targetLang %>技术文档的表达习惯，同时保持原有的格式不变
4. 当存在之前翻译过的<%= targetLang %>文档时，将第三步的结果分段与之前的<%= targetLang %>文档细致地比较，不要遗漏任何新的分段（包括文本、资源链接等），如果分段内翻译结果意思相近，仅仅表达方式不同的，且没有新增任何内容时，则该分段只需要保持之前翻译过的内容即可，不需要重复翻译

最终只需要输出最后一步的结果，不需要输出之前步骤的结果。

<%= additionalPrompts %>
```
