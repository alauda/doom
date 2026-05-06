import BananaSlug from '@rspress/shared/github-slugger'
import { Children, type ReactNode, useMemo } from 'react'

import { X } from './_X.js'

export interface HeadingTitleProps {
  slug?: string
  slugger?: BananaSlug
  level: 1 | 2 | 3 | 4 | 5 | 6
  children: ReactNode
}

// TODO: use context to simplify the usage of `slugger`
export const HeadingTitle = ({
  slug,
  slugger,
  level,
  children,
}: HeadingTitleProps) => {
  const HeadingComponents = useMemo(() => {
    return [null, X.h1, X.h2, X.h3, X.h4, X.h5, X.h6] as const
  }, [])
  const HeadingComponent = HeadingComponents[level]
  const slugFromChildren = useMemo(
    () =>
      // eslint-disable-next-line @eslint-react/no-children-to-array
      Children.toArray(children)
        .filter((it): it is string => typeof it === 'string' && !!it.trim())
        .join(''),
    [children],
  )
  const id = useMemo(
    () =>
      [slug || slugger?.slug(slugFromChildren)].filter(Boolean).join('-') ||
      undefined,
    [slug, slugger, slugFromChildren],
  )
  return (
    <HeadingComponent id={id}>
      <X.a className="rp-header-anchor" href={`#${id}`} aria-hidden>
        #
      </X.a>
      {children}
    </HeadingComponent>
  )
}
