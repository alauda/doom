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
  name: 'Name',
  chinese: 'Chinese',
  english: 'English',
  description: 'Description',
  chinese_bad_cases: 'Chinese Bad Cases',
  english_bad_cases: 'English Bad Cases',
  download_pdf: 'Download PDF',
}

export type Translation = typeof en

const zh: Translation = {
  collapse_all: '全部收起',
  expand_all: '全部展开',
  crd_no_schema: '此 CRD 未定义或定义为空。',
  function: '功能',
  action: '操作',
  view: '查看',
  create: '创建',
  update: '更新',
  delete: '删除',
  name: '名称',
  chinese: '中文',
  english: '英文',
  description: '描述',
  chinese_bad_cases: '中文反例',
  english_bad_cases: '英文反例',
  download_pdf: '下载 PDF',
}

const ru: Translation = {
  collapse_all: 'Свернуть всё',
  expand_all: 'Развернуть всё',
  crd_no_schema: 'Этот CRD имеет пустую или не указанную схему.',
  function: 'Функция',
  action: 'Действие',
  view: 'Просмотр',
  create: 'Создать',
  update: 'Обновить',
  delete: 'Удалить',
  name: 'Название',
  chinese: 'Китайский',
  english: 'Английский',
  description: 'Описание',
  chinese_bad_cases: 'Примеры ошибок на китайском',
  english_bad_cases: 'Примеры ошибок на английском',
  download_pdf: 'Скачать PDF',
}

export const TRANSLATIONS = { en, zh, ru }
