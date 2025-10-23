import { clsx } from 'clsx'
import { type ComponentType, useCallback, useState } from 'react'

import { Input, type InputProps } from '../Input/index.js'

export interface FocusInputProps extends InputProps {
  Component?: ComponentType<InputProps>
}

export const FocusInput = ({
  Component = Input,
  className,
  style,
  placeholder,
  value,
  onFocus,
  onBlur,
  ...props
}: FocusInputProps) => {
  const [active, setActive] = useState(!!value)
  const [focus, setFocus] = useState(false)
  const handleFocus = useCallback(
    (ev: React.FocusEvent<HTMLInputElement>) => {
      setActive(true)
      setFocus(true)
      onFocus?.(ev)
    },
    [onFocus],
  )
  const handleBlur = useCallback(
    (ev: React.FocusEvent<HTMLInputElement>) => {
      setActive(!!ev.target.value)
      setFocus(false)
      onBlur?.(ev)
    },
    [onBlur],
  )
  return (
    <div
      className={clsx(
        'focus-input',
        { 'focus-input--active': active, 'focus-input--focus': focus },
        className,
      )}
      style={style}
    >
      <Component onFocus={handleFocus} onBlur={handleBlur} {...props} />
      <span className="focus-input__placeholder">{placeholder}</span>
    </div>
  )
}
