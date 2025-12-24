# 基本介绍

Doom 是基于 [rspress](https://rspress.dev/zh/) 开发的、适用于 Alauda 内部使用的文档开发工具，它通过实现丰富的内置插件方便文档用户开箱即用。

## 基础能力

- 自动生成可配置权重（顺序）的左侧侧边栏
- 静态文档全文搜索
- 多语言支持

## 基于 Markdown 及其扩展 MDX

MDX 是一种功能强大的内容开发方式。你不仅仅可以像往常一样编写 Markdown 文件，而且可以在 Markdown 的内容中使用 React 组件：

![](https://lf3-static.bytednsdoc.com/obj/eden-cn/uhbfnupenuhf/rspress/mdx-intro.png)

详情可以查看[「使用 MDX」 文档](https://rspress.dev/zh/guide/basic/use-mdx)。

## 开始尝试

下面让我们[快速开始](/start.md)使用 Doom 吧！

## 开始[#](#开始)

### [开始](/start.html)

- [创建项目](/start.html#create)
- [命令行工具](/start.html#cli)

## 使用[#](#使用)

### [配置](/usage/configuration.html)

配置 `doom` 文档工具- [配置文件](/usage/configuration.html#config-file)
- [基础配置](/usage/configuration.html#basic)
- [API 文档配置](/usage/configuration.html#api)
- [权限说明文档配置](/usage/configuration.html#permission)
- [引用文档配置](/usage/configuration.html#reference)
- [发行说明配置](/usage/configuration.html#release-notes)
- [左导航配置](/usage/configuration.html#sidebar)
- [内部文档路由配置](/usage/configuration.html#internal-routes)
- [仅包含文档路由配置](/usage/configuration.html#only-include-routes)
- [语言高亮插件配置](/usage/configuration.html#highlight)
- [](/usage/configuration.html#sites)
- [翻译配置](/usage/configuration.html#translate)
- [在代码仓库编辑文档](/usage/configuration.html#edit-repo)
- [文档导出配置](/usage/configuration.html#export)
- [文档检查配置](/usage/configuration.html#lint)
- [Algolia 搜索配置](/usage/configuration.html#algolia)
- [Sitemap 配置](/usage/configuration.html#sitemap)

### [约定](/usage/convention.html)

基于“约定大于配置”的理念，我们约定文档的组织方式以自动生成左侧边栏等相关内容- [目录结构](/usage/convention.html#目录结构)
- [元数据](/usage/convention.html#元数据)
- [排序](/usage/convention.html#排序)
- [预览](/usage/convention.html#预览)

### [Markdown](/usage/markdown.html)

- [Callouts](/usage/markdown.html#callouts)
- [Mermaid](/usage/markdown.html#mermaid)

### [MDX](/usage/mdx.html)

使用 MDX 可以实现动态内容的展示和内容复用- [rspress 组件](/usage/mdx.html#rspress-组件)
- [doom 组件](/usage/mdx.html#doom-组件)
- [自定义组件复用](/usage/mdx.html#自定义组件复用)

### [国际化](/usage/i18n.html)

在可复用组件中使用国际化文本- [](/usage/i18n.html#i18njson)
- [](/usage/i18n.html#tstsx)
- [](/usage/i18n.html#mdx)

### [API 文档](/usage/api.html)

- [高级 API](/usage/api.html#高级-api)
- [CRD](/usage/api.html#crd)
- [公共引用](/usage/api.html#公共引用)
- [指定 openapi 路径](/usage/api.html#指定-openapi-路径)

### [权限说明文档](/usage/permission.html)

- [](/usage/permission.html#props)
- [示例](/usage/permission.html#示例)

### [引用文档](/usage/reference.html)

- [引用文档配置](/usage/reference.html#reference)

### [部署](/usage/deploy.html)

文档项目开发完成后我们可以将项目部署到 ACP 平台- [构建与预览](/usage/deploy.html#构建与预览)
- [多版本构建](/usage/deploy.html#multi-version)
- [合并目录结构](/usage/deploy.html#合并目录结构)
- [动态挂载配置文件](/usage/deploy.html#overrides)

## APIs[#](#apis)

### [高级 API](/apis/advanced-apis/index.html)

### [CRDs](/apis/crds/index.html)

### [公共引用](/apis/references/index.html)

