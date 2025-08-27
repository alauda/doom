import { clsx } from 'clsx'
import type { InputHTMLAttributes, Ref } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  ref?: Ref<HTMLInputElement>
  prefix?: string
  suffix?: string
}

export const Input = ({
  ref,
  className,
  prefix,
  suffix,
  ...props
}: InputProps) => {
  return (
    <div className="input__container">
      {prefix && <span className="input__prefix">{prefix}</span>}
      <input ref={ref} className={clsx('input', className)} {...props} />
      {suffix && <span className="input__suffix">{suffix}</span>}
    </div>
  )
}
