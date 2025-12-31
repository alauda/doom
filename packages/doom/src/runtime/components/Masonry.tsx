import type { Options } from 'masonry-layout'
import { useLayoutEffect, useRef, type HTMLAttributes } from 'react'

export interface MasonryProps extends HTMLAttributes<HTMLDivElement> {
  options?: Options
}

let MasonryLayout: typeof import('masonry-layout')

if (typeof window !== 'undefined') {
  MasonryLayout = (await import('masonry-layout')).default
}

export const Masonry = ({ options, ...props }: MasonryProps) => {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!ref.current) {
      return
    }

    const masonry = new MasonryLayout!(ref.current, options)

    return () => {
      masonry.destroy?.()
    }
  }, [options])

  return <div ref={ref} {...props} />
}

export default Masonry
