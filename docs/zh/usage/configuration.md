---
description: 配置 `doom` 文档工具
weight: 1
---

# 配置 {#configuration}

## 配置文件 {#config-file}

大部分情况下，我们只需要使用静态 `yaml` 配置文件即可，支持 `doom.config.yaml` 或 `doom.config.yml`，对于复杂场景，比如需要动态配置或自定义 `rspress` 插件时，可以使用 `js/ts` 配置文件，支持 `.js/.ts/.mjs/.mts/.cjs/.cts` 多种文件格式。

对于 `js/ts` 配置文件，我们需要导出配置，可以配合 `@alauda/doom/config` 中导出的 `defineConfig` 函数实现类型辅助：

```ts
import { defineConfig } from '@alauda/doom/config'

export default defineConfig({})
```

## 基础配置 {#basic}

- `lang`：默认文档语言，为方便大部分项目使用，我们默认支持中英文文档，默认语言为 `en`，如果当前文档项目不需要多语言支持，可以将此项配置为 `null` 或 `undefined`
- `title`：文档标题，会显示在浏览器标签页上
- `logo`：文档左上角 logo，支持图片链接、文件路径，绝对路径代表 `public` 目录下的文件，相对路径代表相对于当前工具目录的文件，默认使用 `doom` 包内置的 alauda logo
- `logoText`：文档标题，会显示在左上角的 logo 处
- `icon`：文档 favicon，默认同 `logo`
- `base`：文档基础路径，用于部署到非根路径，如 `product-docs`，默认为 `/`
- `outDir`：构建产物目录，默认为 `dist/{base}/{version}`，如果指定此项，则变更为 `dist/{outDir}/{version}`，其中 `version` 可选，参考[多版本构建](./deploy#多版本构建)

## API 文档配置 {#api}

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

## 权限说明文档配置 {#permission}

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

## 引用文档配置 {#reference}

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

文档编写参考[引用文档](./reference#reference)

## 发行说明配置 {#release-notes}

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

以上述 `template=fixed&project=DevOps` 为例，`fixed` 为 `queryTemplates` 中定义的模板名称，剩余的 `query` 参数 `project=DevOps` 将作为 [`ejs`](https://github.com/mde/ejs) 模板参数传递给 `fixed` 模板处理后作为 jira [`jql`](https://www.atlassian.com/zh/software/jira/guides/jql/overview#what-is-jql) 发起 `https://jira.alauda.cn/rest/api/2/search?jql=<jql>` 请求，此 API 要求鉴权，须提供 `JIRA_USERNAME` 和 `JIRA_PASSWORD` 环境变量才能预览生效

## 左导航配置 {#sidebar}

```yaml
sidebar:
  collapsed: false # 可选，是否默认折叠左导航，默认折叠，文档内容不多时可以考虑设置为 false
```

## 内部文档路由配置 {#internal-routes}

```yaml
internalRoutes: # 可选，支持 glob 匹配，相对于 docs 目录，在 cli 启用 `-i, --ignore` 选项时匹配到的路由/文件会被忽略
  - '*/internal/**'
```

## 仅包含文档路由配置 {#only-include-routes}

```yaml
onlyIncludeRoutes: # 可选，支持 glob 匹配，相对于 docs 目录，在 cli 启用 `-i, --ignore` 选项时只有此配置下的路由/文件会被启用，可同时配合 `internalRoutes` 进一步排除其中的部分路由
  - '*/internal/**'
internalRoutes:
  - '*/internal/overview.mdx'
```

## 语言高亮插件配置 {#highlight}

```yaml
shiki:
  theme: # optional, https://shiki.style/themes
  langs: # optional, https://shiki.style/languages
  transformers: # optional, only available in js/ts config, https://shiki.style/guide/transformers
```

:::warning
未配置的语言将在命令行提示告警，并回退到 `plaintext` 渲染
:::

## `sites.yaml` 配置 {#sites}

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

## 翻译配置 {#translate}

```yaml
translate:
  # 系统提示语，ejs 模板，传入的参数有 `sourceLang`, `targetLang`, `userPrompt`, `additionalPrompts`, `terms`, `titleTranslationPrompt`
  # 其中 `sourceLang` 和 `targetLang` 是 `中文` 和 `英文` 两个字符串，
  #     `userPrompt` 为下述用户全局配置，可能为空
  #     `additionalPrompts` 为文档 `frontmatter.i18n` 中的 `additionalPrompts` 配置，可能为空
  #     `terms` 和 `titleTranslationPrompt` 为根据文档内容包含的术语和标题动态生成的提示语，用于让 AI 根据术语对照表和标题对照表进行翻译，可能为空
  # 默认的系统提示语如下，可以根据实际情况进行修改
  systemPrompt: |
You are a professional technical documentation engineer, skilled in writing high-quality technical documentation in <%= targetLang %>. Please accurately translate the following text from <%= sourceLang %> to <%= targetLang %>, maintaining the style consistent with technical documentation in <%= sourceLang %>.

## Baseline Requirements
- Sentences should be fluent and conform to the expression habits of the <%= targetLang %> language.
- Input format is MDX; output format must also retain the original MDX format. Do not translate the names of jsx components such as <Overview />, and do not wrap output in unnecessary code blocks.
- **CRITICAL**: Do not translate or modify ANY link content in the document. This includes:
  - URLs in markdown links: [text](URL) - keep URL exactly as is
  - Reference-style links: [text][ref] and [ref]: URL - keep both ref and URL unchanged
  - Inline URLs: https://example.com - keep completely unchanged
  - Image links: ![alt](src) - keep src unchanged, but alt text can be translated
  - Anchor links: [text](#anchor) - keep #anchor unchanged
  - Any href attributes in HTML tags - keep unchanged
- Do not translate professional technical terms and proper nouns, including but not limited to: Kubernetes, Docker, CLI, API, REST, GraphQL, JSON, YAML, Git, GitHub, GitLab, AWS, Azure, GCP, Linux, Windows, macOS, Node.js, React, Vue, Angular, TypeScript, JavaScript, Python, Java, Go, Rust, etc. Keep these terms in their original form.
- The title field and description field in frontmatter should be translated, other frontmatter fields should retain and do not translate.
- Content within MDX components needs to be translated, whereas MDX component names and parameter keys do not.
- Do not modify or translate any placeholders in the format of __ANCHOR_N__ (where N is a number). These placeholders must be kept exactly as they appear in the source text.
- Keep original escape characters like backslash, angle brackets, etc. unchanged during translation.
- Do not add any escape characters to special characters like [], (), {}, etc. unless they were explicitly present in the source text. For example:
  - If source has "Architecture [Optional]", keep it as "Architecture [Optional]" (not "Architecture \\[Optional]")
  - If source has "Function (param)", keep it as "Function (param)" (not "Function \\(param)")
  - Only add escape characters if they were present in the original text
- Preserve and do not translate the following comments, nor modify their content:
  - {/* release-notes-for-bugs */}
  - <!-- release-notes-for-bugs -->
- Remove and do not retain the following comments:
  - {/* reference-start */}
  - {/* reference-end */}
  - <!-- reference-start -->
  - <!-- reference-end -->
- Ensure the original Markdown format remains intact during translation, such as frontmatter, code blocks, lists, tables, etc.
- Do not translate the content of the code block.
<% if (titleTranslationPrompt) { %>
<%- titleTranslationPrompt %>
<% } %>
<% if (terms) { %>
<%- terms %>
<% } %>

<% if (userPrompt || additionalPrompts) { %>
## Additional Requirements
These are additional requirements for the translation. They should be met along with the baseline requirements, and in case of any conflict, the baseline requirements should take precedence.

The text for translation is provided below, within triple quotes:
"""
<% if (userPrompt) { %>
<%- userPrompt %>
<% } %>

<% if (additionalPrompts) { %>
<%- additionalPrompts %>
<% } %>
"""
<% } %>
```

## 在代码仓库编辑文档 {#edit-repo}

```yaml
editRepoBaseUrl: alauda/doom/tree/main/docs # https://github.com/ 前缀可以省略，仅当启用 `-R, --edit-repo` 命令行标志符时生效
```

## 文档检查配置 {#lint}

```yaml
lint:
  cspellOptions: # 可选，cspell 配置项，参考 https://github.com/streetsidesoftware/cspell/tree/main/packages/cspell-eslint-plugin#options
```

## Algolia 搜索配置 {#algolia}

```yaml
algolia: # 可选，Algolia 搜索配置，仅当启用 `-a, --algolia` 命令行标志符时生效
  appId: # Algolia 应用 ID
  apiKey: # Algolia API Key
  indexName: # Algolia 索引名称
```

请使用 `public/robots.txt` 进行 Algolia 爬虫验证

::: info

由于 `rspress` 当前架构限制，使用 Algolia 搜索功能需通过[自定义主题](https://rspress.dev/zh/guide/advanced/custom-theme) 实现，因此为统一使用相关主题功能，我们提供了 `@alauda/doom/theme` 主题入口，请添加以下主题配置文件启用：

```ts title "theme/index.ts"
export * from '@alauda/doom/theme'
```

:::

## Sitemap 配置 {#sitemap}

```yaml
siteUrl: https://docs.alauda.cn # 可选，站点 URL，用于生成 sitemap，仅当启用 `-S, --site-url` 命令行标志符时生效
```
