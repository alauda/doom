import type { SetOptional } from 'type-fest'

export interface TermItem {
  en: string
  zh?: string
  ru?: string
  description?: string
  badCases?: {
    en?: string[]
    zh?: string[]
    ru?: string[]
  }
}

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
  name: TermName
}

export type NormalizedTermItem = SetOptional<NamedTermItem, 'name'>

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
