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
- `base`：文档基础路径，用于部署到非根路径
- `outDir`：构建产物目录，默认为 `dist/{base}`
