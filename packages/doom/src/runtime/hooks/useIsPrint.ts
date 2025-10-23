import { useSearchParams } from '@rspress/core/dist/runtime.js'
import { useState, useEffect, useCallback } from 'react'

import { FALSY_VALUES } from '../../shared/index.js'

export function useIsPrintQuery() {
  const [searchParams] = useSearchParams()

  const print = searchParams.get('print')

  return print != null && !FALSY_VALUES.has(print)
}

const getPrintMediaQuery = () => {
  if (typeof document === 'undefined') {
    return
  }
  return matchMedia('print')
}

export function useIsPrintMedia() {
  // eslint-disable-next-line @eslint-react/naming-convention/use-state
  const [printMediaQuery] = useState(getPrintMediaQuery)

  const [isPrint, setIsPrint] = useState(!!printMediaQuery?.matches)

  const onChange = useCallback((mqList: MediaQueryListEvent) => {
    setIsPrint(mqList.matches)
  }, [])

  useEffect(() => {
    printMediaQuery?.addEventListener('change', onChange)
    return () => printMediaQuery?.removeEventListener('change', onChange)
  }, [onChange, printMediaQuery])

  return isPrint
}

export function useIsPrint() {
  const isPrintQuery = useIsPrintQuery()
  const isPrintMedia = useIsPrintMedia()
  return isPrintQuery || isPrintMedia
}
