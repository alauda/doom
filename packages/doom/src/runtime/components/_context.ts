import { createContext, use } from 'react'

export const UidContext = createContext<string>('')

export const useUid = () => use(UidContext)

export const UidProvider = UidContext.Provider
