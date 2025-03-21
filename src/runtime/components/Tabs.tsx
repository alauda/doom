import { Tabs as Tabs_ } from '@rspress/core/theme'
import {
  forwardRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from 'react'

export const Tabs: ForwardRefExoticComponent<
  Parameters<typeof Tabs_>[0] & RefAttributes<HTMLDivElement>
> = forwardRef(({ children, ...props }, ref) => {
  return (
    <div className="doom-tabs">
      <Tabs_ {...props} ref={ref}>
        {children}
      </Tabs_>
    </div>
  )
})

export default Tabs
