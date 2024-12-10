const en = {
  collapse_all: 'Collapse All',
  expand_all: 'Expand All',
  crd_no_schema: 'This CRD has an empty or unspecified schema.',
}

const zh: typeof en = {
  collapse_all: '全部收起',
  expand_all: '全部展开',
  crd_no_schema: '此 CRD 未定义或定义为空。',
}

export const TRANSLATIONS = { en, zh }

export type Locale = keyof typeof TRANSLATIONS
