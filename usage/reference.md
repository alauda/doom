
# 引用文档

在 Markdown 文件中：

```md
<!-- reference-start#name -->

<!-- reference-end -->
```

在 MDX 文件中：

```mdx
{/* reference-start#name */}

{/* reference-end */}
```

上述 `name` 为引用文档的名称，参考[引用文档配置](./configuration#reference)，如果引用的文档内容使用了远程仓库图片静态资源，相关静态资源将自动存储在本地 `<root>/public/_remotes/<name>` 目录下。

以下为使用 `<!-- reference-start#ref -->` 的实例：

<!-- reference-start#ref -->

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

<!-- reference-end -->
