import type MasonryLayout from 'masonry-layout'
import { useLayoutEffect, useRef, type HTMLAttributes } from 'react'

export interface MasonryProps extends HTMLAttributes<HTMLDivElement> {
  options?: MasonryLayout.Options
}

export const Masonry = ({ options, ...props }: MasonryProps) => {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!ref.current) {
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const masonry = new (require('masonry-layout') as typeof MasonryLayout)(
      ref.current,
      options,
    )

    return () => {
      masonry.destroy?.()
    }
  }, [options])

  return <div ref={ref} {...props} />
}

export default Masonry
