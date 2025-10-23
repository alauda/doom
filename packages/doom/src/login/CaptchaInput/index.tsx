import { type ComponentType, useCallback, useMemo } from 'react'
import { normalizeUrl } from 'x-fetch'

import { FormItem } from '../FormItem/index.js'
import { Input, type InputProps } from '../Input/index.js'

import { useTranslation } from '@alauda/doom/runtime'

export interface CaptchaInputProps extends Omit<InputProps, 'type'> {
  Component?: ComponentType<InputProps>
  origin: string
  captchaId: string
  timestamp?: number
  onTimestampChange: (timestamp: number) => void
}

export const CaptchaInput = ({
  Component = Input,
  origin,
  captchaId,
  timestamp,
  onTimestampChange,
  ...props
}: CaptchaInputProps) => {
  const t = useTranslation()

  const captcha = useMemo(
    () => normalizeUrl(`${origin}/api/v1/captcha`, { captchaId, timestamp }),
    [origin, captchaId, timestamp],
  )

  const onRefresh = useCallback(() => {
    onTimestampChange(Date.now())
  }, [onTimestampChange])

  return (
    <div className="captcha-input">
      <FormItem
        suffix={
          <img
            className="captcha-input__captcha"
            src={captcha}
            onClick={onRefresh}
            alt={t('captcha')}
          />
        }
      >
        <Component name="captchaValue" {...props} />
      </FormItem>
    </div>
  )
}
