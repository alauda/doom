import { useEffect } from 'react'

import { useIsPrintQuery } from '@alauda/doom/runtime'

export const PrintStyle = () => {
  const isPrint = useIsPrintQuery()

  useEffect(() => {
    if (typeof document === 'undefined') {
      return
    }
    const doc = document.documentElement
    doc.classList[isPrint ? 'add' : 'remove']('print')
  }, [isPrint])
}

export default PrintStyle
