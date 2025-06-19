import { COMMON_REFS, modelName } from '../utils.js'

import { X } from './_X.js'
import { useUid } from './_context.js'

export interface RefLinkProps {
  $ref?: string
}

export const RefLink = ({ $ref }: RefLinkProps) => {
  const uid = useUid()

  if (!$ref) {
    return null
  }

  const ref = $ref.replace('/components/schemas/', '').slice(1)
  const refName = modelName(ref)
  return <X.a href={COMMON_REFS[ref] || `#${uid}-${ref}`}>{refName}</X.a>
}
