import { createContext, use } from 'react'

export const ForceRenderContext = createContext<{
  value: boolean
  setValue: () => void
}>(null!)

export const useForceRender = () => use(ForceRenderContext).setValue
