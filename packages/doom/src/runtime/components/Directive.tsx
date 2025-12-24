import { clsx } from 'clsx'
import { upperCase } from 'es-toolkit'
import { type ReactEventHandler, type ReactNode, useCallback } from 'react'

export interface DirectiveProps {
  type?: 'danger' | 'details' | 'info' | 'note' | 'tip' | 'warning'
  children: ReactNode
  className?: string
  title?: ReactNode
  open?: boolean
  onToggle?: (open: boolean) => void
}

export const Directive = ({
  className,
  type = 'info',
  title,
  children,
  open,
  onToggle,
}: DirectiveProps) => {
  const rootClassName = clsx('rp-callout', `rp-callout--${type}`, className)
  const titleNode = title || upperCase(type)
  const contentNode = <div className="rp-callout__content">{children}</div>

  const handleToggle: ReactEventHandler<HTMLDetailsElement> = useCallback(
    (ev) => {
      onToggle?.(ev.currentTarget.open)
    },
    [onToggle],
  )

  if (type === 'details') {
    return (
      <details className={rootClassName} open={open} onToggle={handleToggle}>
        <summary className="rp-callout__title">{titleNode}</summary>
        {contentNode}
      </details>
    )
  }

  return (
    <div className={rootClassName}>
      <div className="rp-callout__title">{titleNode}</div>
      {contentNode}
    </div>
  )
}

export default Directive
