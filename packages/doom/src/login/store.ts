import { useCallback, useSyncExternalStore } from 'react'
import type { Nullable } from 'x-fetch'

import { CLOUD_AUTH_TOKEN_KEY } from './constants.js'
import type { CloudAuth } from './types.js'
import { getAuthInfoFromToken, setLocalStorage } from './utils.js'

export const getCloudAuth = (): CloudAuth | null => {
  if (typeof localStorage === 'undefined') {
    return null
  }

  const token = localStorage.getItem(CLOUD_AUTH_TOKEN_KEY)

  if (token == null) {
    return null
  }

  return { token, detail: getAuthInfoFromToken(token) }
}

let authInfo: CloudAuth | null = getCloudAuth()

const subscribe = (onStoreChange: () => void) => {
  const listener = (_ev: Event) => {
    const ev = _ev as CustomEvent<Nullable<string>>
    setLocalStorage(CLOUD_AUTH_TOKEN_KEY, ev.detail)
    authInfo = getCloudAuth()
    onStoreChange()
  }
  document.addEventListener('cloud-auth-change', listener)
  return () => {
    document.removeEventListener('cloud-auth-change', listener)
  }
}

const getSnapshot = () => authInfo

export const useCloudAuth = () => {
  const authInfo = useSyncExternalStore(subscribe, getSnapshot)
  const setAuthBasic = useCallback((token?: string | null) => {
    document.dispatchEvent(
      new CustomEvent('cloud-auth-change', { detail: token }),
    )
  }, [])
  return {
    authInfo,
    setAuthBasic,
  }
}
