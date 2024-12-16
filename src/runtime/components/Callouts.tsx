import { ReactNode } from 'react'

export interface CalloutsProps {
  children: ReactNode
}

export const Callouts = ({ children }: CalloutsProps) => {
  return <p className="my-4 leading-7 doom-callouts">{children}</p>
}

export default Callouts
