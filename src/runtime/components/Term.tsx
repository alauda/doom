import { capitalize } from 'es-toolkit'
import { useMemo } from 'react'

import type { TermName } from '../../terms.js'
import { useSiteOverrides } from '../hooks/index.js'
import { handleCJKWhitespaces } from '../utils.js'

export interface TermProps {
  name: TermName
  textCase?: 'lower' | 'upper' | 'capitalize'
}

export const Term = ({ name, textCase }: TermProps) => {
  const { terms } = useSiteOverrides()
  const text = useMemo(() => {
    const origin = handleCJKWhitespaces(terms?.[name])
    if (!origin) {
      return origin
    }
    switch (textCase) {
      case 'lower': {
        return origin.toLowerCase()
      }
      case 'upper': {
        return origin.toUpperCase()
      }
      case 'capitalize': {
        return capitalize(origin)
      }
      default: {
        return origin
      }
    }
  }, [terms, name, textCase])
  return text
}

export default Term
