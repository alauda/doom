
# 约定

## 目录结构

左侧边栏默认基于文件目录结构自动生成，一级目录中 `index` 文件即文档首页，将展示为左导航首项，子文件夹中可以使用 `index.md` 或 `index.mdx` 并定义文档一级标题来设置左侧边栏分组标题，其他子文档将自动归并到当前分组下，嵌套子文件夹也遵循相同规则。

```sh
├── index.md
├── start.mdx
└── usage
    ├── index.mdx
    └── convention.md
```

同时我们约定

1. `public` 目录用于存放静态资源，如图片、视频等
2. `public/_remotes` 用于存放[远程引用文档](./reference)关联的静态资源，请勿直接依赖该目录的资源，可以将 `*/public/_remotes` 加入 `.gitignore` 避免提交到代码仓库
3. `shared` 目录用于存放公共组件、可复用的文档等，不会自动生成文档数据。

## 元数据

在文档的开头，可以通过 `frontmatter` 来定义文档的元数据，如标题、描述、作者、分类等。

```yaml
---
title: 标题
description: 描述
author: 作者
category: 分类
---
```

在文档正文中，参考 [MDX](./mdx) 使用 `.mdx` 文件时可以使用 `frontmatter` 来访问这些元数据。

## 排序

除 `index.md` 或 `index.mdx` 外，其他文档将默认按照文件名排序，可以通过自定义 `frontmatter` 中的 `weight` 值来调整文档在左侧边栏中的排序（`weight` 值越小排序越靠前）。

```yaml
---
weight: 1
---
```

::: warning
注意：目前左导航配置的变更需要重启服务才能生效，一般开发时不用过多关注。
:::

## 预览

有时在分组首页中我们不需要显示特别的内容，这时可以使用 `index.mdx` 文件并使用 `Overview` 组件来展示当前分组的文档列表，将展示分组列表文件的标题、描述和二级标题信息。

```mdx
# 使用

<Overview />
```

效果可以参考[使用](./)。
