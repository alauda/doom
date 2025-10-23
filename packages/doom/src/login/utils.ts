import { decodeUrl } from 'ab64'
import siteData from 'virtual-site-data'

import type { AuthInfo, AuthTokenInfo, CloudAuth } from './types.ts'

export const setLocalStorage = (key: string, value?: string | null) => {
  if (value == null) {
    localStorage.removeItem(key)
  } else {
    localStorage.setItem(key, value)
  }
}

export const getAuthInfoFromToken = (
  token?: string | null,
): AuthInfo | undefined => {
  if (!token) {
    return
  }

  let authTokenInfo: AuthTokenInfo

  try {
    authTokenInfo = JSON.parse(decodeUrl(token.split('.')[1])) as AuthTokenInfo
  } catch (err) {
    console.error('jwt decode failed:', err)
    return
  }

  return {
    type: authTokenInfo.tenant_type,
    tenant: authTokenInfo.tenant_id,
    user: {
      id: authTokenInfo.user_id,
      name: authTokenInfo.preferred_username || authTokenInfo.email,
      type: authTokenInfo.user_type,
      internal: authTokenInfo.user_type === 'serviceuser',
    },
  }
}

export const isLoggedIn = (
  authInfo: CloudAuth | null,
): authInfo is CloudAuth & { detail: AuthInfo } => Boolean(authInfo?.detail)

export const isIoSite = () =>
  siteData.base.startsWith('/russian/') ||
  location.hostname.endsWith('.alauda.io')

export const getCloudOrigin = () =>
  `https://cloud.alauda.${isIoSite() ? 'io' : 'cn'}`
