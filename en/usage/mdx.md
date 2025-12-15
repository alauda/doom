# MDX

[MDX](https://mdxjs.com/) is an extension syntax of Markdown that allows the use of JSX syntax within Markdown. For usage, refer to [rspress MDX](https://rspress.dev/zh/guide/basic/use-mdx).

## rspress Components

Most of the [built-in components](https://rspress.dev/zh/guide/default-theme/components) provided by the `rspress` theme have been adjusted to global components, which can be used directly in `.mdx` files without import, including:

* `Badge`
* `Card`
* `LinkCard`
* `PackageManagerTabs`
* `Steps`
* `Tab/Tabs`
* `Toc`

Other less commonly used components can be imported from `rspress/theme`, for example:

```mdx title="preview.mdx"
import { SourceCode } from '@rspress/core/theme'

<SourceCode href="/" />
```

## doom Components

`doom` provides some global components to assist in documentation writing, which can be used directly without import. Currently, these include:

### `Overview`

Document overview component used to display the document directory

### `Directive`

Sometimes, due to nested indentation, the [custom container](https://rspress.dev/zh/guide/basic/use-mdx#%E8%87%AA%E5%AE%9A%E4%B9%89%E5%AE%B9%E5%99%A8) syntax may fail. You can use the `Directive` component as a replacement.

```mdx
- The directory structure of multilingual documents (`doc/en`) needs to be exactly the same as the documents under the `doc/zh` directory to ensure that the links in multilingual documents are identical except for the language identifier.

  <Directive type="danger" title="Note">
    If you are using automated translation tools, you do not need to worry about
    this issue. The automated translation tools will automatically generate the
    target language document directory structure based on `doc/zh`.
  </Directive>
```

* The directory structure of multilingual documents (`doc/en`) needs to be exactly the same as the documents under the `doc/zh` directory to ensure that the links in multilingual documents are identical except for the language identifier.

  <Directive type="danger" title="Note">
    If you are using automated translation tools, you do not need to worry about
    this issue. The automated translation tools will automatically generate the
    target language document directory structure based on `doc/zh`.
  </Directive>

### `ExternalSite`

Component for referencing external sites

```mdx
<ExternalSite name="connectors" />
```

<ExternalSite name="connectors" />

### `ExternalSiteLink`

Component for referencing external site links

```mdx
<ExternalSiteLink name="connectors" href="link.mdx#hash" children="Content" />
```

<ExternalSiteLink name="connectors" href="link.mdx#hash" children="Content" />

:::tip

In mdx, `<ExternalSiteLink name="connectors" href="link" children="Content" />` has a different meaning from the following content:

```mdx
<ExternalSiteLink name="connectors" href="link">
  Content {/* will be rendered inside a `p` element */}
</ExternalSiteLink>
```

If you do not want the text to be rendered inside a `p` element, you can pass it using the `children` attribute as shown in the example above.

:::

### `AcpApisOverview` and `ExternalApisOverview`

Components for referencing external site API overviews

```mdx
<AcpApisOverview />
{/* same as following */}
<ExternalApisOverview name="acp" />

<ExternalApisOverview name="connectors" />
```

<AcpApisOverview />

<ExternalApisOverview name="connectors" />

### Term

Term component, plain text, dynamically mounted and injected

```mdx
<Term name="company" textCase="capitalize" />
<Term name="product" textCase="lower" />
<Term name="productShort" textCase="upper" />
<Term name="alaudaCloudLink" />
```

<Term name="company" textCase="capitalize" />

<Term name="product" textCase="lower" />

<Term name="productShort" textCase="upper" />

<Term name="alaudaCloudLink" />

#### `props`

* `name`: Built-in term name, refer to [dynamic mount configuration file](/en/usage/deploy.md#overrides)
* `textCase`: Text case transformation, optional values are `lower`, `upper`, `capitalize`

### `TermsTable`

Built-in term list display component

```mdx
<TermsTable />
```

<TermsTable />

#### `props`

* `terms`: `NormalizedTermItem[]`, optional, custom term list for convenient reuse when rendering custom terms in internal documentation

### `JsonViewer`

```mdx
<JsonViewer value={{ key: 'value' }} />
```

<JsonViewer value={{ key: 'value' }} />

## Custom Component Reuse

According to the [convention](/en/usage/convention.md), we can extract reusable content into the `shared` directory, then import it where needed, for example:

```mdx
import CommonContent from './shared/CommonContent.mdx'

<CommonContent />
```

If you need to use more [runtime](https://rspress.dev/zh/api/client-api/api-runtime) related APIs, you can implement components with `.jsx/.tsx` and then import and use them in `.mdx` files.

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
Note: Currently, components exported from `.mdx` do not support passing `props`. Refer to [this issue](https://github.com/web-infra-dev/rspress/issues/1555). Therefore, for scenarios requiring `props` passing, please develop using `.jsx/.tsx` components.
:::
