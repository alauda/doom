import { getCustomMDXComponent } from '@rspress/core/theme'
import { DEFAULT_COMMON_REFS, modelName } from '../utils.js'
import { usePageData } from '@rspress/core/runtime'
import { ExtendedPageData } from '../types.js'
import { useMemo } from 'react'

export interface RefLinkProps {
  $ref?: string
}

const X = getCustomMDXComponent()

export const RefLink = ({ $ref }: RefLinkProps) => {
  const { page } = usePageData() as ExtendedPageData
  const references: Record<string, string> = useMemo(
    () => ({
      ...DEFAULT_COMMON_REFS,
      ...page.references,
    }),
    [],
  )

  if (!$ref) {
    return null
  }

  const ref = $ref.replace('/components/schemas/', '')
  const refName = modelName(ref)
  return <X.a href={references[ref.slice(1)] || ref}>{refName}</X.a>
}
