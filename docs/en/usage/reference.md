---
weight: 7
sourceSHA: ebb89470ba5bca9d172ff55b57b112b9a0376eec28cc74cdd7c8248f3772de44
---

# Referencing Documents

In Markdown files:

```md
<!-- reference-start#name -->

<!-- reference-end -->
```

In MDX files:

```mdx
{/* reference-start#name */}

{/* reference-end */}
```

The `name` above refers to the name of the referenced document. For more information, please refer to [Document Reference Configuration](./configuration#reference). If the referenced document content uses static resources from a remote repository, the related static resources will be automatically stored locally in the `<root>/public/_remotes/<name>` directory.

Here is an example using `<!-- reference-start#ref -->`:

## Document Reference Configuration {#reference}

```yaml
reference:
  - repo: alauda-public/product-doc-guide # Optional, repository address for the referenced document. If not provided, the current document repository address will be used by default.
    branch: # [string] Optional, branch of the referenced document repository.
    publicBase: # [string] Optional, the directory where static resources for remote repository located, corresponding to absolute paths like /images/xx.png. Default is docs/public.
    sources:
      - name: anchor # Name of the referenced document, used to reference within the document and must be globally unique.
        path: docs/index.mdx#introduction # Path to the referenced document, supports anchor targeting; for remote repositories, relative to the repository root directory, and for local, relative to the directory of doom.config.*.
        ignoreHeading: # [boolean] Optional, whether to ignore headings. If true, the anchor's title will not be displayed in the referenced document.
        processors: # Optional, processors for handling the content of the referenced document.
          - type: ejsTemplate
            data: # EJS template parameters, accessed via `<%= data.xx %>`.
        frontmatterMode: merge # Optional, mode for handling the frontmatter of the referenced document. Default is ignore. Possible values are ignore/merge/replace/remove.
```

### `frontmatterMode`

- `ignore`: Ignores the frontmatter of the referenced document and retains the frontmatter of the current document.
- `merge`: Merges the frontmatter of the referenced document. If there are the same keys, the values from the referenced document will overwrite those in the current document.
- `replace`: Replaces the frontmatter of the current document with that of the referenced document.
- `remove`: Removes the frontmatter of the current document.

For writing documentation, refer to [Document Reference](./reference#reference).
