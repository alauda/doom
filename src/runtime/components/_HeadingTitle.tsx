import { getCustomMDXComponent } from '@rspress/core/theme'
import BananaSlug from 'github-slugger'
import { Children, type ReactNode, useMemo, useState } from 'react'

export interface HeadingTitleProps {
  slug?: string
  slugger?: BananaSlug
  level: 1 | 2 | 3 | 4 | 5 | 6
  children: ReactNode
}

export const HeadingTitle = ({
  slug,
  slugger,
  level,
  children,
}: HeadingTitleProps) => {
  const [X] = useState(getCustomMDXComponent)
  const HeadingComponents = useMemo(() => {
    return [null, X.h1, X.h2, X.h3, X.h4, X.h5, X.h6] as const
  }, [X])
  const HeadingComponent = HeadingComponents[level]
  const id = useMemo(
    () =>
      slug ||
      slugger?.slug(
        Children.toArray(children)
          .filter((it) => typeof it === 'string')
          .join(''),
      ),
    [slug, children],
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
