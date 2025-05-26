import { COMMON_REFS, modelName } from '../utils.js'

import { X } from './_X.js'

export interface RefLinkProps {
  $ref?: string
}

export const RefLink = ({ $ref }: RefLinkProps) => {
  if (!$ref) {
    return null
  }

  const ref = $ref.replace('/components/schemas/', '')
  const refName = modelName(ref)
  return <X.a href={COMMON_REFS[ref.slice(1)] || ref}>{refName}</X.a>
}
