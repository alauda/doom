# 权限说明文档

```mdx
<K8sPermissionTable functions={['devops-testplans', 'devops-testmodules']} />
```

## `props`

- `functions`: `string[]` - 必填，需要展示的 `FunctionResource` 资源名称数组

## 示例

| 功能 | 操作 | 平台管理员 | 平台审计人员 | 项目管理员 | 命名空间管理员 | 开发人员 | 集群管理员 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 测试计划
`devops-testplans` | 查看 | ✓ | ✓ | ✓ | ✓ | ✓ | ✕ |
| 创建 | ✓ | ✕ | ✓ | ✓ | ✓ | ✕ |
| 更新 | ✓ | ✕ | ✓ | ✓ | ✓ | ✕ |
| 删除 | ✓ | ✕ | ✓ | ✓ | ✓ | ✕ |
| 测试模块
`devops-testmodules` | 查看 | ✓ | ✓ | ✓ | ✓ | ✓ | ✕ |
| 创建 | ✓ | ✕ | ✓ | ✓ | ✓ | ✕ |
| 更新 | ✓ | ✕ | ✓ | ✓ | ✓ | ✕ |
| 删除 | ✓ | ✕ | ✓ | ✓ | ✓ | ✕ |

