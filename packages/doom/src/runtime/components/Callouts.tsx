import { clsx } from 'clsx'
import type { HTMLAttributes, ReactNode } from 'react'

export interface CalloutsProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export const Callouts = ({ className, children, ...props }: CalloutsProps) => {
  return (
    <div className={clsx('doom-callouts', className)} {...props}>
      {children}
    </div>
  )
}

export default Callouts
