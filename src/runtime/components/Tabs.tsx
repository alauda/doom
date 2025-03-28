import { Tabs as Tabs_ } from '@rspress/core/theme'
import {
  Children,
  forwardRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from 'react'

import { useIsPrint } from '../hooks/index.js'

export const Tabs: ForwardRefExoticComponent<
  Parameters<typeof Tabs_>[0] & RefAttributes<HTMLDivElement>
> = forwardRef(({ children, ...props }, ref) => {
  const isPrint = useIsPrint()
  return (
    <div className="doom-tabs" ref={ref}>
      {isPrint ? (
        Children.map(children, (child, index) => (
          <Tabs_ key={index} {...props}>
            {child}
          </Tabs_>
        ))
      ) : (
        <Tabs_ {...props}>{children}</Tabs_>
      )}
    </div>
  )
})

export default Tabs
