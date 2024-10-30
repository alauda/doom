import { Link } from '@rspress/core/theme'
import { normalizeImagePath } from '@rspress/core/runtime'

import classes from '../../../styles/quick-nav.module.scss'

export interface QuickNavItem {
  icon: string
  title: string
  links: Array<{
    title: string
    href: string
  }>
}

export interface QuickNavProps {
  items: QuickNavItem[]
}

export const QuickNav = ({ items }: QuickNavProps) => {
  return (
    <ul className={classes.container}>
      {items.map((item, index) => (
        <li key={index} className={classes.item}>
          <div className={classes.title} title={item.title}>
            <img src={normalizeImagePath(item.icon)} alt={item.title} />
            {item.title}
          </div>
          <hr className={classes.divider} />
          <ul className={classes.links}>
            {item.links.map((link, index) => (
              <li key={index}>
                <Link href={link.href} title={link.title}>
                  {link.title}
                </Link>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  )
}

export default QuickNav
