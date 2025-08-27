import {
  type ChangeEvent,
  type ReactNode,
  useCallback,
  useId,
  useMemo,
  useState,
} from 'react'

import { RadioGroupContext } from './context.ts'

export interface RadioGroupProps {
  id?: string
  name?: string
  value?: string
  onChange?: (value: ChangeEvent<HTMLInputElement>) => void
  children?: ReactNode
  prefix?: ReactNode
  suffix?: ReactNode
}

export const RadioGroup = ({
  id: id_,
  name,
  value,
  onChange,
  children,
  prefix,
  suffix,
}: RadioGroupProps) => {
  const innerId = useId()

  const id = id_ || innerId

  name ??= id

  const [innerValue, setInnerValue] = useState(value ?? '')

  if (value != null && innerValue !== value) {
    setInnerValue(value)
  }

  const handleChange = useCallback(
    (ev: ChangeEvent<HTMLInputElement>) => {
      onChange?.(ev)
      setInnerValue(ev.target.value)
    },
    [onChange],
  )

  return (
    <div id={id} className="radio-group">
      <RadioGroupContext
        value={useMemo(
          () => ({
            name,
            value: innerValue,
            onChange: handleChange,
          }),
          [name, innerValue, handleChange],
        )}
      >
        {!!prefix && <span className="radio-group__prefix">{prefix}</span>}
        {children}
        {!!suffix && <span className="radio-group__suffix">{suffix}</span>}
      </RadioGroupContext>
    </div>
  )
}
