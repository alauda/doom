import type { ReactNode } from 'react'

export interface CalloutsProps {
  children: ReactNode
}

export const Callouts = ({ children }: CalloutsProps) => {
  return <div className="doom-callouts">{children}</div>
}

export default Callouts
