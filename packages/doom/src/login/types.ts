import type { ResponseError } from 'x-fetch'

export interface ApiErrorOptions<
  R extends string = string,
  E extends object = object,
  T = unknown,
> {
  code: number
  reason: R
  message: string
  extra?: E
  details?: T[]
}

export type ApiError<
  T extends string = string,
  E extends object = object,
> = ResponseError<ApiErrorOptions<T, E>>

export type ValueOf<T> = T[keyof T]

export const TenantType = {
  Alauda: 'alauda',
  NONE: 'none',
  Tencent: 'tencent',
  Huawei: 'huawei',
} as const

export type TenantType = ValueOf<typeof TenantType>

export type UserType = 'serviceuser' | 'tenantuser'

export interface AuthTokenInfo {
  tenant_id: string
  tenant_type: TenantType
  preferred_username: string
  email: string
  user_id: string
  user_type: UserType
}

export interface AuthUser {
  id: string
  name: string
  type: UserType
  internal: boolean
}

export interface AuthInfo {
  type: TenantType
  tenant?: string
  user: AuthUser
}

export interface CloudAuth {
  token?: string
  detail?: AuthInfo
}
