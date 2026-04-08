import { COMMON_REFS, modelName } from '../utils.js'

import { X } from './_X.js'

export interface RefLinkProps {
  $ref?: string
}

export const RefLink = ({ $ref }: RefLinkProps) => {
  if (!$ref) {
    return null
  }

  // https://swagger.io/docs/specification/v3_0/components/#components-structure
  // #/components/schemas/, #/components/requestBodies/, #/components/responses/, etc.
  const ref = $ref.replace(/^#\/components\/[^/]+\//, '#')
  const plainRef = ref.slice(1)
  const refName = modelName(plainRef)
  return <X.a href={COMMON_REFS[plainRef] || ref}>{refName}</X.a>
}
