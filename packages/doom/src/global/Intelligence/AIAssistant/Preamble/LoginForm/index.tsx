import {
  type FormEvent,
  type FormHTMLAttributes,
  useRef,
  useState,
} from 'react'
import { Tooltip } from 'react-tooltip'
import { ApiMethod, ResponseError, xfetch } from 'x-fetch'

import {
  CLOUD_AUTH_ORIGIN_KEY,
  CLOUD_AUTH_ORIGIN_VALUES,
  CLOUD_AUTH_ORIGINS,
} from '../../../constants.ts'
import { useCloudAuth } from '../../../context.tsx'
import { ApiErrorAlert } from '../ApiErrorAlert/index.tsx'
import { Button } from '../Button/index.tsx'
import { CaptchaInput } from '../CaptchaInput/index.tsx'
import { FocusInput } from '../FocusInput/index.tsx'
import { FormItem } from '../FormItem/index.tsx'
import { Radio, RadioGroup } from '../Radio/index.ts'

import type { LoginError, LoginResponse, PasswordPubKey } from './types.ts'
import { cryptoPassword } from './utils.ts'

import QuestionCycleIcon from '@alauda/doom/assets/question-circle.svg?react'
import { useMemoizedFn, useTranslation } from '@alauda/doom/runtime'

export type LoginFormProps = FormHTMLAttributes<HTMLFormElement>

const isLoginError = (err: unknown): err is LoginError =>
  err instanceof ResponseError

export const LoginForm = ({ onSubmit, ...props }: LoginFormProps) => {
  const t = useTranslation()

  const [origin, setOrigin] = useState(() => {
    let origin = localStorage.getItem(CLOUD_AUTH_ORIGIN_KEY)
    if (origin == null || !CLOUD_AUTH_ORIGIN_VALUES.includes(origin)) {
      origin = CLOUD_AUTH_ORIGIN_VALUES[0]
      localStorage.setItem(CLOUD_AUTH_ORIGIN_KEY, origin)
    }
    return origin
  })

  const [loading, setLoading] = useState<boolean>()
  const [error, setError] = useState<LoginError>()

  const pwdPubkeyRef = useRef<PasswordPubKey>(null)

  const onRegionChange = useMemoizedFn(
    (ev: React.ChangeEvent<HTMLInputElement>) => {
      const origin = ev.target.value
      setOrigin(origin)
      setError(undefined)
      pwdPubkeyRef.current = null
      localStorage.setItem(CLOUD_AUTH_ORIGIN_KEY, origin)
    },
  )

  const { setAuthBasic } = useCloudAuth()

  const captchaId = error?.data?.extra?.captchaId

  const [timestamp, setTimestamp] = useState<number>()

  const handleSubmit = useMemoizedFn(async (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault()
    ev.stopPropagation()

    onSubmit?.(ev)

    const formData = new FormData(ev.currentTarget)
    const origin = formData.get('origin') as string
    formData.delete('origin')

    setLoading(true)

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

      setAuthBasic({
        origin,
        token: accessToken,
      })
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
      <FormItem>
        <RadioGroup
          name="origin"
          value={origin}
          onChange={onRegionChange}
          suffix={
            <>
              <QuestionCycleIcon className="region-tip" />
              <Tooltip anchorSelect=".region-tip" place="top-start">
                <div>{t('user_login_region_china_tip')}</div>
                <div>{t('user_login_region_global_tip')}</div>
              </Tooltip>
            </>
          }
        >
          {CLOUD_AUTH_ORIGINS.map(({ name, value }) => (
            <Radio
              key={name}
              label={t(`customer_portal_${name}`)}
              value={value}
            />
          ))}
        </RadioGroup>
      </FormItem>
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
