import { COMMON_REFS, modelName } from '../utils.js'

import { X } from './_X.js'

export interface RefLinkProps {
  $ref?: string
}

export const RefLink = ({ $ref }: RefLinkProps) => {
  if (!$ref) {
    return null
  }

  // #/components/schemas/, #/components/requestBodies/, etc.
  const ref = $ref.replace(/^#\/components\/[^/]+\//, '#')
  const plainRef = ref.slice(1)
  const refName = modelName(plainRef)
  return <X.a href={COMMON_REFS[plainRef] || ref}>{refName}</X.a>
}
