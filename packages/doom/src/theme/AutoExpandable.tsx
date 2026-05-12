import { IconDown, SvgWrapper } from '@rspress/core/theme'
import { clsx } from 'clsx'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'

import { useIsPrint, useTranslation } from '../runtime/index.js'

import classes from '@alauda/doom/styles/auto-expandable.module.scss'

export const AutoExpandable = ({
  threshold = 240,
  children,
}: {
  threshold?: number
  children: ReactNode
}) => {
  const t = useTranslation()

  const ref = useRef<HTMLDivElement>(null)

  const isPrint = useIsPrint()

  const [expandable, setExpandable] = useState(false)

  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const containerEl = ref.current

    if (!containerEl || isPrint) {
      return
    }

    let observer: MutationObserver | undefined

    const calculate = () => {
      if (containerEl.scrollHeight > threshold) {
        setExpandable(true)
      }
      observer?.disconnect()
    }

    calculate()

    const tabItem = containerEl.closest('.rp-tabs__content__item--hidden')

    if (tabItem) {
      observer = new MutationObserver(calculate)
      observer.observe(tabItem, { attributeFilter: ['class'] })
      return () => {
        observer?.disconnect()
      }
    }
  }, [threshold, isPrint])

  const onExpandChange = useCallback(() => {
    setExpanded((expanded) => !expanded)
  }, [])

  return (
    <div ref={ref} className={`${classes.container} auto-expandable`}>
      <div
        className={clsx({
          expandable,
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
            {t(`show_${expanded ? 'less' : 'more'}`)}
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
