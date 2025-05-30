---
description: Configure `doom` documentation tool
weight: 1
sourceSHA: cdfb35537b7a4a9d39fa1ede177c331c6f73d3aa531f3169df3671b705433138
---

# Configuration {#configuration}

## Configuration File {#config-file}

In most cases, a static `yaml` configuration file is sufficient. It supports `doom.config.yaml` or `doom.config.yml`. For more complex scenarios, such as requiring dynamic configurations or customizing `rspress` plugins, `js/ts` configuration files can be used, supporting various formats like `.js/.ts/.mjs/.mts/.cjs/.cts`.

For `js/ts` configuration files, we need to export the configuration, which can be achieved using the `defineConfig` function exported from `@alauda/doom/config` for type assistance:

```ts
import { defineConfig } from '@alauda/doom/config'

export default defineConfig({})
```

## Basic Configuration {#basic}

- `lang`: The default document language. To accommodate most projects, we support both Chinese and English documents by default, with the default language set to `en`. If the current document project does not require multilingual support, this can be set to `null` or `undefined`.
- `title`: The document title, which will appear in the browser tab.
- `logo`: The logo in the top left corner of the document. It supports image links and file paths; absolute paths reference files in the `public` directory, while relative paths refer to files relative to the current tool directory. By default, it uses the built-in Alauda logo from the `doom` package.
- `logoText`: The document title that will display at the logo location in the top left corner.
- `icon`: The document favicon, which defaults to the same as `logo`.
- `base`: The base path for the document, used for deployment to non-root paths, such as `product-docs`, defaults to `/`.
- `outDir`: The output directory for build artifacts, defaulting to `dist/{base}/{version}`. If specified, it changes to `dist/{outDir}/{version}` where `version` is optional. Refer to [multi-version builds](./deploy#multi-version-builds).

## API Documentation Configuration {#api}

```yaml
api:
  # CRD definition file path, relative to the directory where doom.config.* is located; supports glob matching, json/yaml files.
  crds:
    - docs/shared/crds/*.yaml
  # OpenAPI definition file path, relative to the directory where doom.config.* is located; supports glob matching, json/yaml files.
  openapis:
    - docs/shared/openapis/*.json
  # When rendering OpenAPI related resource definitions, they are inline on the page by default. If you want to extract related resource definitions into a separate file, you can configure the following options.
  # Refer to https://doom.alauda.cn/apis/references/CodeQuality.html#v1alpha1.CodeQualitySpec
  references:
    v1alpha1.CodeQualityBranch: /apis/references/CodeQualityBranch#v1alpha1.CodeQualityBranch
  # Optional, the API documentation path prefix. If the current business uses a gateway or proxy service, this option can be configured.
  pathPrefix: /apis
```

For writing documentation, refer to [API documentation](./api).

## Permission Explanation Document Configuration {#permission}

```yaml
# Resource file paths below are relative to the directory where doom.config.* is located; supports glob matching, json/yaml files.
permission:
  functionresources:
    # `kubectl get functionresources`
    - docs/shared/functionresources/*.yaml
  roletemplates:
    # `kubectl get roletemplates -l auth.cpaas.io/roletemplate.official=true`
    - docs/shared/roletemplates/*.yaml
```

For writing documentation, refer to [permissions documentation](./permission).

## Reference Document Configuration {#reference}

```yaml
reference:
  - repo: alauda-public/product-doc-guide # Optional, the repository address of the reference document. If not filled, the current document repository address will be used by default.
    branch: # [string] Optional, the branch of the reference document repository.
    publicBase: # [string] Optional, when using a remote repository, the absolute path to the static resource directory corresponding to /images/xx.png, defaults to docs/public.
    sources:
      - name: anchor # The name of the reference document, used for referencing in the document and must be globally unique.
        path: docs/index.mdx#introduction # The path to the reference document; supports anchor positioning. Remote paths are relative to the repository root, and local paths are relative to the directory where doom.config.* is located.
        ignoreHeading: # [boolean] Optional, whether to ignore the title. If true, the heading title will not be shown in the referenced document.
        processors: # Optional, content processors for the referenced document.
          - type: ejsTemplate
            data: # ejs template parameters, accessed using `<%= data.xx %>`.
        frontmatterMode: merge # Optional, the mode for processing the frontmatter of the referenced document, defaults to ignore. Possible values are ignore/merge/replace/remove.
```

### `frontmatterMode`

- `ignore`: Ignores the frontmatter of the referenced document, keeping the current document's frontmatter.
- `merge`: Merges the frontmatter of the referenced document. If there are the same keys, the values from the referenced document will overwrite the current document's values.
- `replace`: Replaces the current document's frontmatter with that of the referenced document.
- `remove`: Removes the current document's frontmatter.

For writing documentation, refer to [reference documentation](./reference).

## Release Notes Configuration {#release-notes}

```yaml
releaseNotes:
  queryTemplates:
    fixed: # May include jql statements with ejs templates.
    unfixed:
```

```md title="release-notes.md"
<!-- release-notes-for-bugs?template=fixed&project=DevOps -->
```

```mdx title="release-notes.mdx"
{/* release-notes-for-bugs?template=fixed&project=DevOps */}
```

Taking the above `template=fixed&project=DevOps` as an example, `fixed` is the template name defined in `queryTemplates`, and the remaining `query` parameter `project=DevOps` will be passed as parameters to the ejs template to process the `fixed` template which in turn initiates a Jira [`jql`](https://www.atlassian.com/zh/software/jira/guides/jql/overview#what-is-jql) request at `https://jira.alauda.cn/rest/api/2/search?jql=<jql>`. This API requires authentication and needs environment variables `JIRA_USERNAME` and `JIRA_PASSWORD` to preview the results.

## Left Navigation Configuration {#sidebar}

```yaml
sidebar:
  collapsed: false # Optional, whether to default the left navigation to be collapsed. Defaults to collapsed. If there is not much document content, it can be set to false.
```

## Internal Document Routes Configuration {#internal-routes}

```yaml
internalRoutes: # Optional, supports glob matching, relative to the docs directory. Matched files will be ignored if the cli is enabled with the `-i, --ignore` option.
  - '*/internal/**/*'
```

## Only Include Document Routes Configuration {#only-include-routes}

```yaml
onlyIncludeRoutes: # Optional, supports glob matching, relative to the docs directory. Only routes/files under this configuration will be activated when the cli is enabled with the `-i, --ignore` option. Can be used in conjunction with `internalRoutes` to further exclude some routes within.
  - '*/internal/**/*'
internalRoutes:
  - '*/internal/overview.mdx'
```

## Language Highlight Plugin Configuration {#highlight}

```yaml
shiki:
  theme: # Optional, https://shiki.style/themes
  langs: # Optional, https://shiki.style/languages
  transformers: # Optional, only available in js/ts config, https://shiki.style/guide/transformers
```

:::warning
Languages that are not configured will prompt a warning on the command line and will fall back to `plaintext` rendering.
:::

## `sites.yaml` Configuration {#sites}

The `sites.yaml` configuration file is used to configure the sub-site information associated with the current documentation site. This defined information will be used when [referring to external site components](./mdx#externalsite) and building single-version documents.

```yaml
- name: connectors # Globally unique name
  base: /devops-connectors # Base path for site access
  version: v1.1 # Version for ExternalSite/ExternalSiteLink redirection when building multi-version sites

  displayName: # Site display name, defaults to name if not filled or no match for language.
    en: DevOps Connectors
    zh: DevOps 连接器

  # The following properties are used to pull images when building the full site. If not filled, this will be ignored during the final complete site package.
  # Generally, it is necessary to configure the relevant information for sub-site references, but not required for parent site references.
  repo: https://github.com/AlaudaDevops/connectors-operator # Site repository address. For internal GitLab repositories, the relevant slug can be used directly, such as `alauda/product-docs`.
  image: devops/connectors-docs # Site build image, used for pulling images when building the full site.
```

## Translation Configuration {#translate}

```yaml
translate:
  # System prompt message, ejs template. The passed parameters are `sourceLang`, `targetLang`, `userPrompt`, and `additionalPrompts`.
  # `sourceLang` and `targetLang` are the strings `中文` and `英文`, respectively.
  #     `userPrompt` is the global user configuration below, which may be empty.
  #     `additionalPrompts` is the `additionalPrompts` configuration in the document `frontmatter.i18n`, which may also be empty.
  # The default system prompt message is as follows; it can be modified based on actual needs.
  systemPrompt: |
## Role
You are a professional technical documentation engineer, skilled in writing high-quality <%= targetLang %> technical documentation. Please help me accurately translate the following <%= sourceLang %> into <%= targetLang %>, maintaining the style consistent with <%= targetLang %> technical documents.

## Rules
- The first message is the latest <%= sourceLang %> document that needs to be translated. The second message is a previously translated <%= targetLang %> document, which may be outdated. If not previously translated, it will be empty.
- The input format is MDX format, and the output format must also retain the original MDX format. Do not translate the JSX component names in it, such as <Overview />. Do not wrap it in unnecessary code blocks.
- Resource links in the document should not be translated or replaced.
- The content included in MDX components needs to be translated. The MDX component names and parameter values should not be translated. However, special MDX component parameter values need to be translated. For example:
  - In <Overview />, "Overview" is the component name and does not need to be translated.
  - In <Tab label="value">Component Content</Tab>, "label" is a key and does not need to be translated, while "value" is a parameter value that needs to be translated.
<%= terms %>
- If the following comments exist, retain them without translation and do not modify the comment content.
  - {/* release-notes-for-bugs */}
  - <!-- release-notes-for-bugs -->
- If the following comments exist, remove them entirely and do not keep.
  - {/* reference-start */}
  - {/* reference-end */}
  - <!-- reference-start -->
  - <!-- reference-end -->
- During the translation process, be sure to retain the original \\< and \\{ escape characters in the document without making any changes.
- Do not disrupt the original Markdown format during the translation, such as frontmatter, code blocks, lists, tables, etc. The content of frontmatter.ii8n should not be translated; it should be returned as is.

## Strategy
The translation work is divided into four steps:
1. Translate the <%= sourceLang %> document directly into <%= targetLang %>, maintaining the original format without omitting any information.
2. Identify specific issues in the direct translation from the first step, describing them accurately. Do not generalize and do not add any content or format not present in the original, including but not limited to:
 - Non-compliance with <%= targetLang %> expression habits. Clearly point out where it does not comply.
 - Sentences that are not fluent, indicating the positions without needing to provide suggestions for modification; repair during paraphrasing.
 - Ambiguous or difficult-to-understand phrases can be attempted to be explained.
3. Based on the direct translation result and the issues pointed out in the second step, rephrase while ensuring that the original meaning remains intact, making it easier to understand and more compliant with <%= targetLang %> technical documentation expression habits, while keeping the original format unchanged.
4. When there exist previously translated <%= targetLang %> documents, compare the results from step three with the previous <%= targetLang %> document in detail, ensuring no new segments (including text, code blocks, images, hyperlinks, etc.) are omitted. If the translation results within the segment are roughly similar in meaning, differing only in expression without introducing new content, that segment should retain the previously translated content without re-translation.

The final output should only include the complete result from the last step, no need to output any references to cue words or previous steps, and don't just return the additions.

<%= userPrompt %>

<%= additionalPrompts %>
  userPrompt: # optional, used to fill in the global parameters of the `ejs` template in `systemPrompt`
```

## Edit Documentation in Code Repository {#edit-repo}

```yaml
editRepoBaseUrl: alauda/doom/tree/main/docs # The prefix https://github.com/ can be omitted; it only takes effect when the `-R, --edit-repo` command line flag is enabled.
```

## Document Linting Configuration {#lint}

```yaml
lint:
  cspellOptions: # optional, cspell configuration options, refer to https://github.com/streetsidesoftware/cspell/tree/main/packages/cspell-eslint-plugin#options
```

## Algolia Search Configuration {#algolia}

```yaml
algolia:
  appId: # Algolia application ID
  apiKey: # Algolia API Key
  indexName: # Algolia index name
```

Please use `public/robots.txt` for Algolia Crawler Verification.

::: info

Due to the current architectural limitations of `rspress`, the Algolia search function needs to be implemented through a [custom theme](https://rspress.dev/guide/advanced/custom-theme). Therefore, to unify the use of related theme features, we provide the theme entry via `@alauda/doom/theme`. Please add the following theme configuration file to enable it:

```ts title "theme/index.ts"
export * from '@alauda/doom/theme'
```

:::

## Sitemap Configuration {#sitemap}

```yaml
siteUrl: https://docs.alauda.cn # Optional, site URL used for generating sitemap, only effective when the `-S, --site-url` command line flag is enabled.
```
