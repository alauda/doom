# Permission Description Document

```mdx
<K8sPermissionTable functions={['acp-app', 'acp-alertsquery']} />
```

## `props`

- `functions`: `string[]` - Required. An array of `FunctionResource` resource names to be displayed.

## Example

| Function | Action | Platform Administrator | Platform auditors | Project Manager | Namespace Administrator | Developers | Cluster Administrator |
| --- | --- | --- | --- | --- | --- | --- | --- |
| app
`acp-app` | View | ✓ | ✓ | ✓ | ✓ | ✓ | ✕ |
| Create | ✓ | ✕ | ✓ | ✓ | ✓ | ✕ |
| Update | ✓ | ✕ | ✓ | ✓ | ✓ | ✕ |
| Delete | ✓ | ✕ | ✓ | ✓ | ✓ | ✕ |
| alertsquery
`acp-alertsquery` | View | ✓ | ✓ | ✓ | ✓ | ✓ | ✕ |
| Create | ✓ | ✕ | ✕ | ✕ | ✕ | ✕ |
| Update | ✓ | ✕ | ✕ | ✕ | ✕ | ✕ |
| Delete | ✓ | ✕ | ✕ | ✕ | ✕ | ✕ |

