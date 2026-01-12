# Permission Description Document

```mdx
<K8sPermissionTable functions={['devops-testplans', 'devops-testmodules']} />
```

## `props`

- `functions`: `string[]` - Required. An array of `FunctionResource` resource names to be displayed.

## Example

| Function | Action | Platform Administrator | Platform auditors | Project Manager | Namespace Administrator | Developers | Cluster Administrator |
| --- | --- | --- | --- | --- | --- | --- | --- |
| testplans
`devops-testplans` | View | ✓ | ✓ | ✓ | ✓ | ✓ | ✕ |
| Create | ✓ | ✕ | ✓ | ✓ | ✓ | ✕ |
| Update | ✓ | ✕ | ✓ | ✓ | ✓ | ✕ |
| Delete | ✓ | ✕ | ✓ | ✓ | ✓ | ✕ |
| testmodules
`devops-testmodules` | View | ✓ | ✓ | ✓ | ✓ | ✓ | ✕ |
| Create | ✓ | ✕ | ✓ | ✓ | ✓ | ✕ |
| Update | ✓ | ✕ | ✓ | ✓ | ✓ | ✕ |
| Delete | ✓ | ✕ | ✓ | ✓ | ✓ | ✕ |

