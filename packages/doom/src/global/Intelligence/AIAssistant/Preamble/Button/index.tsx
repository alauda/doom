import { clsx } from 'clsx'
import type { ButtonHTMLAttributes } from 'react'

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  type?: 'primary'
  htmlType?: 'submit' | 'reset' | 'button'
  block?: boolean
  loading?: boolean
}

export const Button = ({
  className,
  block,
  type,
  htmlType = 'button',
  loading,
  disabled = loading,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={clsx(
        'button',
        block && 'button--block',
        type && `button--${type}`,
        className,
      )}
      type={htmlType}
      disabled={disabled}
      {...props}
    />
  )
}
