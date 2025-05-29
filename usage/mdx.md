# MDX

[MDX](https://mdxjs.com/) 是一种 Markdown 的扩展语法，允许在 Markdown 中使用 JSX 语法，使用方式可以参考 [rspress MDX](https://rspress.dev/zh/guide/basic/use-mdx)。

## rspress 组件

`rspress` 主题提供的[内置组件](https://rspress.dev/zh/guide/default-theme/components)大部分已调整为全局组件，可以在 `.mdx` 文件中无需导入直接使用，包括：

* `Badge`
* `Card`
* `LinkCard`
* `PackageManagerTabs`
* `Steps`
* `Tab/Tabs`
* `Toc`

其他不常用的组件可以通过 `@rspress/core/theme` 导入使用，例如：

```mdx title="preview.mdx"
import { SourceCode } from '@rspress/core/theme'

<SourceCode href="/" />
```

## doom 组件

`doom` 提供了一些全局组件来辅助文档编写，不需要导入即可直接使用，目前包括：

### `Overview`

文档概览组件，用于展示文档目录

### `Directive`

有时，由于嵌套缩进，[自定义容器](https://rspress.dev/zh/guide/basic/use-mdx#%E8%87%AA%E5%AE%9A%E4%B9%89%E5%AE%B9%E5%99%A8)语法可能失效，可以使用 `Directive` 组件代替

```mdx
- 多语言文档(`doc/en`)的目录结构需要与 `doc/zh` 目录下的文档完全一致，保证多语言文档的链接除了语言标识外完全相同。

  <Directive type="danger" title="注意">
    如果是使用自动化翻译工具进行翻译，则无需关心该问题，自动化翻译工具会自动根据
    `doc/zh` 生成目标语言文档的目录结构。
  </Directive>
```

* 多语言文档(`doc/en`)的目录结构需要与 `doc/zh` 目录下的文档完全一致，保证多语言文档的链接除了语言标识外完全相同。

  如果是使用自动化翻译工具进行翻译，则无需关心该问题，自动化翻译工具会自动根据
  `doc/zh` 生成目标语言文档的目录结构。

### `ExternalSite`

引用外部站点组件

```mdx
<ExternalSite name="connectors" />
```

### `ExternalSiteLink`

引用外部站点链接组件

```mdx
<ExternalSiteLink name="connectors" href="link.mdx#hash" children="Content" />
```

:::tip

在 mdx 中 `<ExternalSiteLink name="connectors" href="link" children="Content" />` 与下面的内容含义不同

```mdx
<ExternalSiteLink name="connectors" href="link">
  Content {/* 将渲染在 `p` 元素内 */}
</ExternalSiteLink>
```

如果不希望文本渲染在 `p` 元素内，可以像上面的示例一样使用 `children` 属性传递

:::

### `AcpApisOverview` 与 `ExternalApisOverview`

引用外部站点 API 概览组件

```mdx
<AcpApisOverview />
{/* same as following */}
<ExternalApisOverview name="acp" />

<ExternalApisOverview name="connectors" />
```

### Term

术语组件，纯文本，动态挂载注入

```mdx
<Term name="company" textCase="capitalize" />
<Term name="product" textCase="lower" />
<Term name="productShort" textCase="upper" />
```

#### `props`

* `name`: 内置术语名称，参考[动态挂载配置文件](/zh/usage/deploy.md#overrides)
* `textCase`: 文本大小写转换，可选值为`lower`, `upper`, `capitalize`

### `TermsTable`

内置术语列表展示组件

```mdx
<TermsTable />
```

#### `props`

* `terms`: `NormalizedTermItem[]`，可选，自定义术语列表，方便内部文档渲染自定义术语时复用

### `JsonViewer`

```mdx
<JsonViewer value={{ key: 'value' }} />
```

## 自定义组件复用

根据[约定](/zh/usage/convention.md)，我们可以将需要复用的内容抽取到 `shared` 目录中，然后在需要的地方引入即可，比如：

```mdx
import CommonContent from './shared/CommonContent.mdx'

<CommonContent />
```

如果需要使用更多 [runtime](https://rspress.dev/zh/api/client-api/api-runtime) 相关的 API，可以使用 `.jsx/.tsx` 实现组件，然后在 `.mdx` 文件中引入使用。

```tsx
// shared/CommonContent.tsx
export const CommonContent = () => {
  const { page } = usePageData()
  return <div>{page.title}</div>
}

// showcase/content.mdx
import { CommonContent } from './shared/CommonContent'
;<CommonContent />
```

:::warning
注意：目前 `.mdx` 导出的组件不支持 `props` 传参，参考[此 issue](https://github.com/web-infra-dev/rspress/issues/1555)，因此需要传递 `props` 的场景请使用 `.jsx/.tsx` 组件进行开发
:::
