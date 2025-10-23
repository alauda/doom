import { useMemo } from 'react'

import type { ApiError } from '../types.js'

import AlertIcon from '@alauda/doom/assets/alert.svg?react'
import { useTranslation } from '@alauda/doom/runtime'

export interface ApiErrorAlertProps {
  error: ApiError
}

export const ApiErrorAlert = ({ error }: ApiErrorAlertProps) => {
  const t = useTranslation()
  const message = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!error.response) {
      return t('ERR_INTERNET_DISCONNECTED')
    }
    const reason = error.data?.reason as
      | 'AccountDisabledError'
      | 'CaptchaError'
      | 'LoginError'
      | 'NetworkError'
      | 'TenantError'
      | 'TenantNotFoundError'
      | undefined
    const message = error.data?.message || error.message
    try {
      return reason ? t(reason) || reason : message
    } catch {
      return message
    }
  }, [error, t])
  return (
    <div className="api-error-alert">
      <AlertIcon className="api-error-alert__icon" />
      {message}
    </div>
  )
}
