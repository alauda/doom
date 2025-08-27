import { type ReactNode, createContext, use, useMemo, useState } from 'react'

import { CLOUD_AUTH_ORIGIN_KEY, CLOUD_AUTH_TOKEN_KEY } from './constants.js'
import type { AuthInfo } from './types.js'
import { getAuthInfoFromToken, setLocalStorage } from './utils.js'

export interface CloudAuth {
  origin: string
  detail?: AuthInfo
}

export interface CloudAuthContext {
  authInfo: CloudAuth | null
  setAuthBasic: (authBasic?: { origin: string; token: string } | null) => void
}

export const CloudAuthContext = createContext<CloudAuthContext>(null!)

export const useCloudAuth = () => use(CloudAuthContext)

const getCloudAuth = (): CloudAuth | null => {
  const origin = localStorage.getItem(CLOUD_AUTH_ORIGIN_KEY)
  const token = localStorage.getItem(CLOUD_AUTH_TOKEN_KEY)

  if (origin == null) {
    return null
  }

  if (token == null) {
    return { origin }
  }

  return { origin, detail: getAuthInfoFromToken(token) }
}

export const CloudAuthProvider = ({ children }: { children: ReactNode }) => {
  const [authInfo, setAuthInfo] = useState(getCloudAuth)
  return (
    <CloudAuthContext
      value={useMemo(
        () => ({
          authInfo,
          setAuthBasic(authBasic) {
            // keep origin in localStorage for next login
            if (authBasic?.origin != null) {
              setLocalStorage(CLOUD_AUTH_ORIGIN_KEY, authBasic.origin)
            }
            setLocalStorage(CLOUD_AUTH_TOKEN_KEY, authBasic?.token)
            setAuthInfo(getCloudAuth)
          },
        }),
        [authInfo],
      )}
    >
      {children}
    </CloudAuthContext>
  )
}
