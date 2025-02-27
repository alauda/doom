import { useState, useEffect, useMemo, useCallback } from 'react'
import { useLocation } from 'react-router'

export function useIsPrintQuery() {
  const { search } = useLocation()

  const searchParams = useMemo(() => new URLSearchParams(search), [search])

  const isPrint = searchParams.get('print') === 'true'

  return isPrint
}

const getPrintMediaQuery = () => {
  if (typeof document === 'undefined') {
    return
  }
  return matchMedia('print')
}

export function useIsPrintMedia() {
  const [printMediaQuery] = useState(getPrintMediaQuery)

  const [isPrint, changeIsPrint] = useState(!!printMediaQuery?.matches)

  const onChange = useCallback((mqList: MediaQueryListEvent) => {
    changeIsPrint(!!mqList.matches)
  }, [])

  useEffect(() => {
    printMediaQuery?.addEventListener('change', onChange)
    return () => printMediaQuery?.removeEventListener('change', onChange)
  }, [printMediaQuery])

  return isPrint
}

export function useIsPrint() {
  const isPrintQuery = useIsPrintQuery()
  const isPrintMedia = useIsPrintMedia()
  return isPrintQuery || isPrintMedia
}
