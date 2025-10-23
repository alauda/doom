import {
  type FormEvent,
  type FormHTMLAttributes,
  useRef,
  useState,
} from 'react'
import { ApiMethod, ResponseError, xfetch } from 'x-fetch'

import { ApiErrorAlert } from '../ApiErrorAlert/index.tsx'
import { Button } from '../Button/index.tsx'
import { CaptchaInput } from '../CaptchaInput/index.tsx'
import { FocusInput } from '../FocusInput/index.tsx'
import { FormItem } from '../FormItem/index.tsx'
import { useCloudAuth } from '../store.ts'
import { getCloudOrigin } from '../utils.ts'

import type { LoginError, LoginResponse, PasswordPubKey } from './types.ts'
import { cryptoPassword } from './utils.ts'

import { useMemoizedFn, useTranslation } from '@alauda/doom/runtime'

export interface LoginFormProps extends FormHTMLAttributes<HTMLFormElement> {
  onLoggedIn?: () => void
}

const isLoginError = (err: unknown): err is LoginError =>
  err instanceof ResponseError

export const LoginForm = ({
  onSubmit,
  onLoggedIn,
  ...props
}: LoginFormProps) => {
  const t = useTranslation()

  const [loading, setLoading] = useState<boolean>()
  const [error, setError] = useState<LoginError>()

  const pwdPubkeyRef = useRef<PasswordPubKey>(null)

  const { setAuthBasic } = useCloudAuth()

  const captchaId = error?.data?.extra?.captchaId

  const [timestamp, setTimestamp] = useState<number>()

  const handleSubmit = useMemoizedFn(async (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault()
    ev.stopPropagation()

    onSubmit?.(ev)

    const formData = new FormData(ev.currentTarget)

    setLoading(true)

    const origin = getCloudOrigin()

    if (pwdPubkeyRef.current == null) {
      try {
        pwdPubkeyRef.current = await xfetch<PasswordPubKey>(
          `${origin}/api/v1/pubkey`,
        )
      } catch (err) {
        setError(err as LoginError)
        setLoading(false)
        return
      }
    }

    formData.set(
      'password',
      cryptoPassword(pwdPubkeyRef.current, formData.get('password') as string),
    )

    if (captchaId) {
      formData.set('captchaId', captchaId)
    }

    try {
      const { accessToken } = await xfetch<LoginResponse>(
        `${origin}/api/v1/login`,
        {
          method: ApiMethod.POST,
          body: formData,
        },
      )

      setAuthBasic(accessToken)

      onLoggedIn?.()
    } catch (err) {
      if (!isLoginError(err)) {
        throw err
      }

      if (err.data?.reason === 'PubkeyExpireError') {
        pwdPubkeyRef.current = null
        await handleSubmit(ev)
        return
      }

      setError(err)
    } finally {
      setLoading(false)
    }
  })

  return (
    <form onSubmit={handleSubmit} {...props}>
      {error && <ApiErrorAlert error={error} />}
      <FormItem label={t('account_id')} required>
        <FocusInput name="tenant" placeholder={t('account_id')} />
      </FormItem>
      <FormItem label={t('username')} required>
        <FocusInput name="username" placeholder={t('username')} />
      </FormItem>
      <FormItem label={t('password')} required>
        <FocusInput
          name="password"
          type="password"
          placeholder={t('password')}
        />
      </FormItem>
      {captchaId && (
        <FormItem label={t('captcha')} required>
          <CaptchaInput
            Component={FocusInput}
            placeholder={t('captcha')}
            origin={origin}
            captchaId={captchaId}
            timestamp={timestamp}
            onTimestampChange={setTimestamp}
          />
        </FormItem>
      )}
      <FormItem>
        <Button type="primary" htmlType="submit" block loading={loading}>
          {t('login')}
        </Button>
      </FormItem>
    </form>
  )
}
