
# 部署

## 构建与预览

在部署之前，我们需要先对项目进行生产环境的构建，并在本地进行预览，以确保项目能够正常运行：

```bash
doom build # 构建静态产物
doom serve # 以生产模式预览构建产物
```

## 多版本构建

默认情况下，`doom build` 会将构建产物输出到 `dist` 目录，如果需要构建多个版本的文档，可以通过 `-v` 参数指定版本号，例如：

```bash
# 一般由分支名确定，如 release-4.0 对应 4.0 版本
doom build -v 4.0 # 构建 4.0 版本，产物输出到 dist/4.0，文档访问路径为 {base}/4.0
doom build -v master # 构建 master 版本，产物输出到 dist/master，文档访问路径为 {base}/master
doom build -v {other} # 构建其他版本，产物输出到 dist/{other}，文档访问路径为 {base}/{other}

# unversioned 和 unversioned-x.y 为特殊版本号，用于构建无版本号前缀的文档
doom build -v unversioned # 构建无版本号前缀的文档，产物输出到 dist/unversioned，文档访问路径为 {base}
doom build -v unversioned-4.0 # 构建无版本号前缀但导航栏展示版本号 4.0 的文档，产物输出到 dist/unversioned，文档访问路径为 {base}
```

## 合并目录结构

```sh
│── console-platform
│   ├── 4.0
│   ├── 4.1
│   ├── index.html
│   ├── overrides.yaml
│   └── versions.yaml
│── console-devops-docs
│   ├── 4.0
│   ├── 4.1
│   ├── index.html
│   ├── overrides.yaml
│   └── versions.yaml
│── console-tekton-docs
│   ├── 1.0
│   ├── 1.1
│   ├── index.html
│   ├── overrides.yaml
│   └── versions.yaml
```

```html title="index.html"
<!DOCTYPE html>
<html>
  <head>
    <title>Redirecting...</title>
    <meta http-equiv="refresh" content="0; url=/console-docs/4.1" />
  </head>
  <body>
    <p>Redirecting to <a href="/console-docs/4.1">/console-docs/4.1</a></p>
  </body>
</html>
```

## 动态挂载配置文件 \{#overrides}

```yaml title="overrides.yaml"
# 文档信息，每个文档都可以挂载覆盖默认配置
title:
  en: Doom - Alauda
  zh: Doom - 灵雀云
logoText:
  en: Doom - Alauda
  zh: Doom - 灵雀云
```

```yaml title="versions.yaml"
- '4.1'
- '4.0'
```
