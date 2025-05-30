import BananaSlug from 'github-slugger'
import { Children, type ReactNode, useMemo } from 'react'

import { X } from './_X.js'

export interface HeadingTitleProps {
  slug?: string
  slugger?: BananaSlug
  uid?: string
  level: 1 | 2 | 3 | 4 | 5 | 6
  children: ReactNode
}

// TODO: use context to simplify the usage of `slugger` and `uid`
export const HeadingTitle = ({
  slug,
  slugger,
  uid,
  level,
  children,
}: HeadingTitleProps) => {
  const HeadingComponents = useMemo(() => {
    return [null, X.h1, X.h2, X.h3, X.h4, X.h5, X.h6] as const
  }, [X])
  const HeadingComponent = HeadingComponents[level]
  const id = useMemo(
    () =>
      [
        uid,
        slug ||
          slugger?.slug(
            Children.toArray(children)
              .filter((it) => typeof it === 'string')
              .join(''),
          ),
      ]
        .filter(Boolean)
        .join('-') || undefined,
    [slug, uid, children],
  )
  return (
    <HeadingComponent id={id}>
      {children}
      <X.a className="header-anchor" href={`#${id}`} aria-hidden>
        #
      </X.a>
    </HeadingComponent>
  )
}
