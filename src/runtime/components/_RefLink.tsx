import { getCustomMDXComponent } from '@rspress/core/theme'
import { useState } from 'react'

import { COMMON_REFS, modelName } from '../utils.js'

export interface RefLinkProps {
  $ref?: string
}

export const RefLink = ({ $ref }: RefLinkProps) => {
  const [X] = useState(getCustomMDXComponent)

  if (!$ref) {
    return null
  }

  const ref = $ref.replace('/components/schemas/', '')
  const refName = modelName(ref)
  return <X.a href={COMMON_REFS[ref.slice(1)] || ref}>{refName}</X.a>
}
