---
description: Configure the `doom` documentation tool
weight: 1
sourceSHA: 1734866675471d4fc77ad60454f7672d8ef01c8f719d75b8c152d40886bc07e6
---

# Configuration {#configuration}

## Configuration File {#config-file}

In most cases, we only need to use a static `yaml` configuration file, supporting `doom.config.yaml` or `doom.config.yml`. For complex scenarios, such as requiring dynamic configuration or custom `rspress` plugins, `js/ts` configuration files can be used, supporting multiple file formats including `.js/.ts/.mjs/.mts/.cjs/.cts`.

For `js/ts` configuration files, we need to export the configuration. You can use the `defineConfig` function exported from `@alauda/doom/config` to enable type assistance:

```ts
import { defineConfig } from '@alauda/doom/config'

export default defineConfig({})
```

## Basic Configuration {#basic}

- `lang`: Default document language. To accommodate most projects, we support both Chinese and English documents by default. The default language is `en`. If the current documentation project does not require multilingual support, this can be set to `null` or `undefined`.
- `title`: Document title, displayed on the browser tab.
- `logo`: Logo at the top left of the document, supports image URLs or file paths. Absolute paths refer to files under the `public` directory, relative paths refer to files relative to the current tool directory. The default is the Alauda logo built into the `doom` package.
- `logoText`: Document title, displayed next to the logo at the top left.
- `icon`: Document favicon, defaults to the same as `logo`.
- `base`: Base path of the document, used when deploying to a non-root path, e.g., `product-docs`. Defaults to `/`.
- `outDir`: Build output directory, defaults to `dist/{base}/{version}`. If specified, it changes to `dist/{outDir}/{version}`, where `version` is optional. See [Multi-version Build](./deploy#多版本构建) for reference.

## API Documentation Configuration {#api}

```yaml
api:
  # CRD definition file paths, relative to the directory where doom.config.* is located, supports glob patterns, json/yaml files
  crds:
    - docs/shared/crds/*.yaml
  # OpenAPI definition file paths, relative to the directory where doom.config.* is located, supports glob patterns, json/yaml files
  openapis:
    - docs/shared/openapis/*.json
  # When rendering OpenAPI related resource definitions, they are inlined by default. To extract related resource definitions into separate files, configure the following options.
  # Reference https://doom.alauda.cn/apis/references/CodeQuality.html#v1alpha1.CodeQualitySpec
  references:
    v1alpha1.CodeQualityBranch: /apis/references/CodeQualityBranch#v1alpha1.CodeQualityBranch
  # Optional, API documentation path prefix. If the current business uses gateway or other proxy services, configure this option.
  pathPrefix: /apis
```

Refer to [API Documentation](./api) for writing documentation.

## Permission Documentation Configuration {#permission}

```yaml
# The following resource file paths are relative to the directory where doom.config.* is located, support glob patterns, json/yaml files
permission:
  functionresources:
    # `kubectl get functionresources`
    - docs/shared/functionresources/*.yaml
  roletemplates:
    # `kubectl get roletemplates -l auth.cpaas.io/roletemplate.official=true`
    - docs/shared/roletemplates/*.yaml
```

Refer to [Permission Documentation](./permission) for writing documentation.

## Reference Documentation Configuration {#reference}

```yaml
reference:
  - repo: alauda-public/product-doc-guide # Optional, referenced documentation repository address. If not filled, the current documentation repository address is used by default.
    branch: # [string] Optional, branch of the referenced documentation repository
    publicBase: # [string] Optional, when using a remote repository, the absolute path where static resources corresponding to /images/xx.png are located. Defaults to docs/public
    sources:
      - name: anchor # Name of the referenced document, used for referencing in documentation, globally unique
        path: docs/index.mdx#介绍 # Path of the referenced document, supports anchor positioning. For remote repositories, relative to the repository root; for local, relative to doom.config.* directory
        ignoreHeading: # [boolean] Optional, whether to ignore the heading. If true, the anchor heading will not be displayed in the referenced document.
        processors: # Optional, processors for referenced document content
          - type: ejsTemplate
            data: # ejs template parameters, accessed via `<%= data.xx %>`
        frontmatterMode: merge # Optional, mode for handling frontmatter of referenced documents. Defaults to ignore. Options: ignore/merge/replace/remove
```

### `frontmatterMode`

- `ignore`: Ignore the frontmatter of the referenced document, keep using the current document's frontmatter.
- `merge`: Merge the frontmatter of the referenced document. If keys conflict, the referenced document's values override the current document's.
- `replace`: Replace the current document's frontmatter with that of the referenced document.
- `remove`: Remove the current document's frontmatter.

Refer to [Reference Documentation](./reference#reference) for writing documentation.

## Release Notes Configuration {#release-notes}

```yaml
releaseNotes:
  queryTemplates:
    fixed: # JQL statements that may contain ejs templates
    unfixed:
```

```md title="release-notes.md"
<!-- release-notes-for-bugs?template=fixed&project=DevOps -->
```

```mdx title="release-notes.mdx"
{/* release-notes-for-bugs?template=fixed&project=DevOps */}
```

Taking `template=fixed&project=DevOps` as an example, `fixed` is the template name defined in `queryTemplates`. The remaining `query` parameter `project=DevOps` is passed as [`ejs`](https://github.com/mde/ejs) template parameters to the `fixed` template, which after processing is used as a jira [`jql`](https://www.atlassian.com/zh/software/jira/guides/jql/overview#what-is-jql) to initiate a request to `https://jira.alauda.cn/rest/api/2/search?jql=<jql>`. This API requires authentication, and the environment variables `JIRA_USERNAME` and `JIRA_PASSWORD` must be provided to preview successfully.

## Sidebar Configuration {#sidebar}

```yaml
sidebar:
  collapsed: false # Optional, whether to collapse the sidebar by default. Defaults to collapsed. When document content is small, consider setting to false.
```

## Internal Document Routes Configuration {#internal-routes}

```yaml
internalRoutes: # Optional, supports glob patterns, relative to the docs directory. Routes/files matched when CLI option `-i, --ignore` is enabled will be ignored.
  - '*/internal/**'
```

## Only Include Document Routes Configuration {#only-include-routes}

```yaml
onlyIncludeRoutes: # Optional, supports glob patterns, relative to the docs directory. When CLI option `-i, --ignore` is enabled, only routes/files under this configuration will be enabled. Can be combined with `internalRoutes` to further exclude some routes.
  - '*/internal/**'
internalRoutes:
  - '*/internal/overview.mdx'
```

## Syntax Highlighting Plugin Configuration {#highlight}

```yaml
shiki:
  theme: # optional, https://shiki.style/themes
  langs: # optional, https://shiki.style/languages
  transformers: # optional, only available in js/ts config, https://shiki.style/guide/transformers
```

:::warning
Unconfigured languages will trigger warnings in the command line and fallback to `plaintext` rendering.
:::

## `sites.yaml` Configuration {#sites}

The `sites.yaml` configuration file is used to configure subsite information associated with the current documentation site. This information is used by [External Site Components](./mdx#externalsite) and when building single-version documentation.

```yaml
- name: connectors # Unique name across the entire site
  base: /devops-connectors # Base path for site access
  version: v1.1 # Version used for ExternalSite/ExternalSiteLink redirection when building multi-version sites

  displayName: # Site display name. If not filled or language not matched, defaults to name
    en: DevOps Connectors
    zh: DevOps 连接器

  # The following properties are used to pull images when building the entire site. If not filled, this will be ignored during final packaging.
  # Usually required for subsite references, not required for parent site references.
  repo: https://github.com/AlaudaDevops/connectors-operator # Site repository address. For internal gitlab repositories, related slugs like `alauda/product-docs` can be used directly.
  image: devops/connectors-docs # Site build image, used to pull images when building the entire site.
```

## Translation Configuration {#translate}

```yaml
translate:
  # System prompt, ejs template, parameters passed include `sourceLang`, `targetLang`, `userPrompt`, `additionalPrompts`, `terms`, `titleTranslationPrompt`
  # Where `sourceLang` and `targetLang` are the strings `中文` and `英文`,
  #     `userPrompt` is the global user configuration below, may be empty
  #     `additionalPrompts` is the `additionalPrompts` configuration in document `frontmatter.i18n`, may be empty
  #     `terms` and `titleTranslationPrompt` are prompts dynamically generated based on terminology and title included in the document, used to guide AI translation according to terminology and title glossaries, may be empty
  # The default system prompt is as follows and can be modified according to actual needs
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

## Editing Documentation in Code Repository {#edit-repo}

```yaml
editRepoBaseUrl: alauda/doom/tree/main/docs # The https://github.com/ prefix can be omitted. Effective only when the CLI flag `-R, --edit-repo` is enabled.
```

## Documentation Linting Configuration {#lint}

```yaml
lint:
  cspellOptions: # Optional, cspell configuration options, refer to https://github.com/streetsidesoftware/cspell/tree/main/packages/cspell-eslint-plugin#options
```

## Algolia Search Configuration {#algolia}

```yaml
algolia: # Optional, Algolia search configuration, effective only when the CLI flag `-a, --algolia` is enabled
  appId: # Algolia Application ID
  apiKey: # Algolia API Key
  indexName: # Algolia index name
```

Please use `public/robots.txt` for Algolia crawler verification.

:::info

Due to current architectural limitations of `rspress`, using Algolia search requires implementing via [custom themes](https://rspress.dev/zh/guide/advanced/custom-theme). To unify usage of related theme features, we provide the `@alauda/doom/theme` theme entry. Please add the following theme configuration file to enable:

```ts title "theme/index.ts"
export * from '@alauda/doom/theme'
```

:::

## Sitemap Configuration {#sitemap}

```yaml
siteUrl: https://docs.alauda.cn # Optional, site URL used for generating sitemap, effective only when the CLI flag `-S, --site-url` is enabled
```
