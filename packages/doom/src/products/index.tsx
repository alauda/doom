import { addLeadingSlash, NoSSR, useSite } from '@rspress/core/runtime'
import virtual from 'doom-@global-virtual'
import { use } from 'react'

import { BuildInfoContext } from '../shared/context.ts'
import { isUnversioned } from '../shared/helpers.js'

import { useIsPrint, useLang, useTranslation } from '@alauda/doom/runtime'
import classes from '@alauda/doom/styles/products.module.scss'

export interface BuildInfoItem {
  base: string
  version: string
  displayName?: {
    en: string
    zh?: string
    ru?: string
  }
}

export interface BuildInfoGroup {
  id: string
  items: BuildInfoItem[]
}

const Products = () => {
  const lang = useLang()

  const isPrint = useIsPrint()

  const { site } = useSite()

  const { groups: buildInfoGroups } = use(BuildInfoContext)

  return (
    <div className={classes.container}>
      {buildInfoGroups.map((group) => (
        <div key={group.id} className={classes.group}>
          <h2>{group.id.toUpperCase()}</h2>
          <ul>
            {group.items.map((item) => (
              <li key={item.base}>
                <a
                  className="rp-link"
                  href={
                    (isPrint ? 'https://docs.alauda.io' : '') +
                    (virtual.prefix || '') +
                    addLeadingSlash(item.base) +
                    (isUnversioned(virtual.version) ? '' : `/${item.version}`) +
                    (lang !== site.lang ? addLeadingSlash(lang) : '')
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {item.displayName?.[lang] ||
                    item.displayName?.en ||
                    item.base}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

export default () => {
  const t = useTranslation()
  return (
    <>
      <h1>{t('all_product_documentation')}</h1>
      <p>{t('explore_doc_all_products')}</p>
      <NoSSR>
        <Products />
      </NoSSR>
    </>
  )
}
