import { clsx } from 'clsx'
import type { HTMLAttributes, ReactNode } from 'react'

export interface CalloutProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode
}

export const Callout = ({ className, children, ...props }: CalloutProps) => {
  return (
    <span className={clsx('doom-callout', className)} {...props}>
      {children}
    </span>
  )
}

export default Callout
