const en = {
  collapse_all: 'Collapse All',
  expand_all: 'Expand All',
  crd_no_schema: 'This CRD has an empty or unspecified schema.',
  function: 'Function',
  action: 'Action',
  view: 'View',
  create: 'Create',
  update: 'Update',
  delete: 'Delete',
}

const zh: typeof en = {
  collapse_all: '全部收起',
  expand_all: '全部展开',
  crd_no_schema: '此 CRD 未定义或定义为空。',
  function: '功能',
  action: '操作',
  view: '查看',
  create: '创建',
  update: '更新',
  delete: '删除',
}

export const TRANSLATIONS = { en, zh }

export type Locale = keyof typeof TRANSLATIONS
