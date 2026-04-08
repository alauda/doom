import { NoSSR } from '@rspress/core/runtime'
import type { Options } from 'masonry-layout'
import {
  lazy,
  Suspense,
  useLayoutEffect,
  useRef,
  type HTMLAttributes,
} from 'react'

export interface MasonryProps extends HTMLAttributes<HTMLDivElement> {
  options?: Options
}

const LazyMasonry = lazy(() =>
  import('masonry-layout').then(({ default: MasonryLayout }) => {
    // eslint-disable-next-line @eslint-react/component-hook-factories
    const Masonry = ({ options, ...props }: MasonryProps) => {
      const ref = useRef<HTMLDivElement>(null)
      useLayoutEffect(() => {
        if (!ref.current) {
          return
        }

        const masonry = new MasonryLayout(ref.current, options)

        return () => {
          masonry.destroy?.()
        }
      }, [options])
      return <div ref={ref} {...props} />
    }
    return { default: Masonry }
  }),
)

export const Masonry = ({ options, ...props }: MasonryProps) => (
  <NoSSR>
    <Suspense>
      <LazyMasonry options={options} {...props} />
    </Suspense>
  </NoSSR>
)

export default Masonry
