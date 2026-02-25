import { IconDown, SvgWrapper } from '@rspress/core/theme'
import { clsx } from 'clsx'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'

import { useIsPrint } from '../runtime/index.js'

import classes from '@alauda/doom/styles/auto-expandable.module.scss'

export const AutoExpandable = ({
  threshold = 240,
  children,
}: {
  threshold?: number
  children: ReactNode
}) => {
  const ref = useRef<HTMLDivElement>(null)

  const isPrint = useIsPrint()

  const [expandable, setExpandable] = useState(false)

  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (!ref.current || isPrint) {
      return
    }
    if (ref.current.scrollHeight > threshold) {
      // eslint-disable-next-line react-hooks/set-state-in-effect, @eslint-react/hooks-extra/no-direct-set-state-in-use-effect
      setExpandable(true)
    }
  }, [threshold, isPrint])

  const onExpandChange = useCallback(() => {
    setExpanded((expanded) => !expanded)
  }, [])

  return (
    <div ref={ref} className={classes.container}>
      <div
        className={clsx({
          [classes.expandable]: expandable,
          [classes.expanded]: expanded,
        })}
      >
        {children}
      </div>
      {expandable && (
        <div className={classes.actionContainer}>
          <button
            className={classes.action}
            type="button"
            onClick={onExpandChange}
            aria-expanded={expanded}
          >
            Show {expanded ? 'less' : 'more'}
            <SvgWrapper
              className={clsx(classes.arrow, {
                [classes.expanded]: expanded,
              })}
              icon={IconDown}
            ></SvgWrapper>
          </button>
        </div>
      )}
    </div>
  )
}
