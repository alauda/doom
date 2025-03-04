import { getCustomMDXComponent } from '@rspress/core/theme'
import { useState } from 'react'

import {
  allTermItems,
  namedTermItems,
  unnamedTermItems,
  type NormalizedTermItem,
} from '../../terms.js'
import { useTranslation } from '../hooks/index.js'

export interface TermsTableProps {
  named?: boolean
}

export const TermsTable = ({ named }: TermsTableProps) => {
  const [X] = useState(getCustomMDXComponent)
  const t = useTranslation()
  const noNamed = named === false
  const terms: NormalizedTermItem[] = named
    ? namedTermItems
    : noNamed
      ? unnamedTermItems
      : allTermItems

  const renderBadCases = (list?: string[]) =>
    list?.length ? (
      <X.ul>
        {list.map((item, index) => (
          <X.li key={index}>{item}</X.li>
        ))}
      </X.ul>
    ) : (
      '-'
    )

  return (
    <X.table>
      <thead>
        <X.tr>
          {noNamed || <X.th>{t('name')}</X.th>}
          <X.th>{t('chinese')}</X.th>
          <X.th>{t('chinese_bad_cases')}</X.th>
          <X.th>{t('english')}</X.th>
          <X.th>{t('english_bad_cases')}</X.th>
          <X.th>{t('description')}</X.th>
        </X.tr>
      </thead>
      <tbody>
        {terms.map((term, index) => (
          <X.tr key={term.name || index}>
            {noNamed || <X.td>{term.name || '-'}</X.td>}
            <X.td>{term.zh || term.en}</X.td>
            <X.td>{renderBadCases(term.badCases?.zh)}</X.td>
            <X.td>{term.en}</X.td>
            <X.td>{renderBadCases(term.badCases?.en)}</X.td>
            <X.td>{term.description || '-'}</X.td>
          </X.tr>
        ))}
      </tbody>
    </X.table>
  )
}

export default TermsTable
