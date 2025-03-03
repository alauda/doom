export interface TermItem {
  en: string
  zh?: string
  description?: string
  badCases?: {
    zh?: string[]
    en?: string[]
  }
}

export const unnamedTermItems: TermItem[] = []

const terms = {
  company: {
    en: 'Alauda',
    zh: '灵雀云',
    description: '公司品牌',
  },
  product: {
    en: 'Alauda Container Platform',
    zh: '灵雀云容器平台',
    description: '产品品牌',
  },
  productShort: {
    en: 'ACP',
    description: '产品品牌简称',
  },
} as const satisfies Record<string, TermItem>

export type TermName = keyof typeof terms

export type NamedTerms = Record<TermName, TermItem>

export interface NamedTermItem extends TermItem {
  name?: TermName
}

export const namedTerms: NamedTerms = terms

export const namedTermItems: NamedTermItem[] = Object.keys(terms).map(
  (name_) => {
    const name = name_ as TermName
    return {
      name,
      ...terms[name],
    }
  },
)

export const allTermItems = [...namedTermItems, ...unnamedTermItems]
