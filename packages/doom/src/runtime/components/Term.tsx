import { capitalize } from 'es-toolkit'
import { useMemo } from 'react'

import type { TermName } from '../../terms.js'
import { useSiteOverrides } from '../hooks/index.js'
import { handleCJKWhitespaces } from '../utils.js'

import { Markdown } from './Markdown.js'

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
        return origin.split(/\b/).map(capitalize).join('')
      }
      default: {
        return origin
      }
    }
  }, [terms, name, textCase])
  return <Markdown inline>{text}</Markdown>
}

export default Term
