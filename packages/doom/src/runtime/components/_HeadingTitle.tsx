import BananaSlug from '@rspress/shared/github-slugger'
import { isValidElement, type ReactNode, useMemo } from 'react'

import { X } from './_X.js'

export interface HeadingTitleProps {
  slug?: string
  slugger?: BananaSlug
  level: 1 | 2 | 3 | 4 | 5 | 6
  children: ReactNode
}

/**
 * Flatten a React node tree to its visible text. Unlike a plain
 * `Children.toArray().filter(string)`, this descends into element children, so
 * a heading like `<code>{method}</code> {summary}` still yields `method` even
 * when `summary` is `undefined` — instead of an empty slug that becomes
 * `id="undefined"` / `href="#undefined"`.
 */
const extractText = (node: ReactNode): string => {
  if (node == null || typeof node === 'boolean') {
    return ''
  }
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node)
  }
  if (Array.isArray(node)) {
    return (node as ReactNode[]).map(extractText).join('')
  }
  if (isValidElement(node)) {
    return extractText((node.props as { children?: ReactNode }).children)
  }
  return ''
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
    () => extractText(children).trim(),
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
