import { type ChangeEvent, createContext } from 'react'

export interface RadioGroupContext<T = unknown> {
  name: string
  value: T
  onChange?: (value: ChangeEvent<HTMLInputElement>) => void
}

export const RadioGroupContext = createContext<RadioGroupContext>(null!)
