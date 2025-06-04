import { namedTermItems, type NormalizedTermItem } from '../../terms.js'
import { useTranslation } from '../hooks/index.js'

import { X } from './_X.js'

export interface TermsTableProps {
  terms?: NormalizedTermItem[]
}

export const TermsTable = ({ terms }: TermsTableProps) => {
  const t = useTranslation()

  const normalized: NormalizedTermItem[] = terms ?? namedTermItems

  const withName = normalized.some(({ name }) => name)

  const renderBadCases = (list?: string[]) =>
    list?.length ? (
      <X.ul>
        {list.map((item, index) => (
          // eslint-disable-next-line @eslint-react/no-array-index-key
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
          {withName && <X.th>{t('name')}</X.th>}
          <X.th>{t('chinese')}</X.th>
          <X.th>{t('chinese_bad_cases')}</X.th>
          <X.th>{t('english')}</X.th>
          <X.th>{t('english_bad_cases')}</X.th>
          <X.th>{t('description')}</X.th>
        </X.tr>
      </thead>
      <tbody>
        {normalized.map((term, index) => (
          <X.tr key={term.name || index}>
            {withName && <X.td>{term.name || '-'}</X.td>}
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
