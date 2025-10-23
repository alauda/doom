import { clsx } from 'clsx'
import {
  type ChangeEvent,
  type ReactElement,
  type ReactNode,
  cloneElement,
  useCallback,
  useState,
} from 'react'

import { useTranslation } from '@alauda/doom/runtime'

export interface FormItemProps<T> {
  label?: string
  children: ReactElement<{
    defaultValue?: T
    value?: T
    onChange?: (ev: ChangeEvent<{ value: T }>) => void
    required?: boolean
  }>
  required?: boolean
  prefix?: ReactNode
  suffix?: ReactNode
}

export const FormItem = <T,>({
  label,
  children,
  required,
  prefix,
  suffix,
}: FormItemProps<T>) => {
  const t = useTranslation()
  const {
    defaultValue,
    value,
    onChange: childOnChange,
    required: childRequired,
  } = children.props
  const [innerValue, setInnerValue] = useState(value ?? defaultValue)
  if (value != null && value !== innerValue) {
    setInnerValue(value)
  }
  const [dirty, setDirty] = useState(false)
  const onChange = useCallback(
    (ev: ChangeEvent<{ value: T }>) => {
      setDirty(true)
      childOnChange?.(ev)
      setInnerValue(ev.target.value)
    },
    [childOnChange],
  )
  required = childRequired ?? required

  const error = dirty && required && !innerValue

  return (
    <>
      <div className={clsx('form-item', error && 'form-item--error')}>
        {!!prefix && <span className="form-item__prefix">{prefix}</span>}
        {
          /* eslint-disable-next-line @eslint-react/no-clone-element */
          cloneElement(children, {
            value: innerValue,
            onChange,
            required,
          })
        }
        {!!suffix && <span className="form-item__suffix">{suffix}</span>}
      </div>
      {error && (
        <div className="form-item__error">
          {label || t('current_field')}
          {t('field_required')}
        </div>
      )}
    </>
  )
}
