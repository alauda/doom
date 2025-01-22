---
weight: 3
---

# Markdown

除了标准的 [gfm](https://github.github.com/gfm) 语法外，Doom 内置了一些额外的 Markdown 扩展功能。

## Callouts

源码标注组件

::: note

1. 请根据实际语言使用行内代码注释，如 `;`, `%`, `#`, `//`, `/** */`, `--` 和 `<!-- -->` 等
2. 如果需要将其视为代码注释，请使用 `[\!code callout]` 进行转义
3. 有时，`:::callouts` 由于嵌套缩进导致解析显示异常，可以使用 `<div class="doom-callouts">` 或 `<Callouts>` 组件代替

:::

````mdx
```sh
Memory overhead per virtual machine ≈ (1.002 × requested memory) \
              + 218 MiB \  # [\!code callout]
              + 8 MiB × (number of vCPUs) \  # [\!code callout]
              + 16 MiB × (number of graphics devices) \  # [\!code callout]
              + (additional memory overhead)  # [\!code callout]
```

:::callouts

1. Required for the processes that run in the `virt-launcher` pod.
2. Number of virtual CPUs requested by the virtual machine.
3. Number of virtual graphics cards requested by the virtual machine.
4. Additional memory overhead:
   - If your environment includes a Single Root I/O Virtualization (SR-IOV) network device or a Graphics Processing Unit (GPU), allocate 1 GiB additional memory overhead for each device.
   - If Secure Encrypted Virtualization (SEV) is enabled, add 256 MiB.
   - If Trusted Platform Module (TPM) is enabled, add 53 MiB.

:::
````

```sh
Memory overhead per virtual machine ≈ (1.002 × requested memory) \
              + 218 MiB \  # [!code callout]
              + 8 MiB × (number of vCPUs) \  # [!code callout]
              + 16 MiB × (number of graphics devices) \  # [!code callout]
              + (additional memory overhead)  # [!code callout]
```

:::callouts

1. Required for the processes that run in the `virt-launcher` pod.
2. Number of virtual CPUs requested by the virtual machine.
3. Number of virtual graphics cards requested by the virtual machine.
4. Additional memory overhead:
   - If your environment includes a Single Root I/O Virtualization (SR-IOV) network device or a Graphics Processing Unit (GPU), allocate 1 GiB additional memory overhead for each device.
   - If Secure Encrypted Virtualization (SEV) is enabled, add 256 MiB.
   - If Trusted Platform Module (TPM) is enabled, add 53 MiB.

:::

更多源码转换功能请参考 [Shiki Transformers](https://shiki.style/packages/transformers#transformers)。

## [Mermaid](https://mermaid.js.org)

图表绘制工具

````mdx
```mermaid
graph TD;
    A-->B;
    A-->C;
    B-->D;
    C-->D;
```
````

```mermaid
graph TD;
    A-->B;
    A-->C;
    B-->D;
    C-->D;
```

配合 [Markdown Preview Mermaid](https://github.com/mjbvz/vscode-markdown-mermaid) 可以在 VSCode 中实时预览。
