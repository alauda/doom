import type { ApiError } from '../types.js'

export interface PasswordPubKey {
  ts: string
  pubkey: string
}

export interface LoginResponse {
  accessToken: string
  expiresIn: string
  refreshToken?: string
  refreshExpiresIn?: string
}

export type LoginErrorReason =
  | 'CaptchaError'
  | 'LoginError'
  | 'NetworkError'
  | 'PubkeyExpireError'
  | 'TenantError'
  | 'TenantNotFoundError'

export interface LoginErrorExtra {
  captchaId?: string
  action?: 'UPDATE_PASSWORD'
  code: string
}

export type LoginError<T extends LoginErrorReason = LoginErrorReason> =
  ApiError<T, LoginErrorExtra>
