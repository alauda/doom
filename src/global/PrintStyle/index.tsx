import { useIsPrintQuery } from '@alauda/doom/runtime'
import { useEffect } from 'react'

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
