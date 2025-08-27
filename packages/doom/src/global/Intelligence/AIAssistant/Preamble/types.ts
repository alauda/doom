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
