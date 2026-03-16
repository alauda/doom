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

  // #/components/schemas/, #/components/requestBodies/, etc.
  const ref = $ref.replace(/^#\/components\/[^/]+\//, '#')
  const plainRef = ref.slice(1)
  const refName = modelName(plainRef)
  return (
    <X.a href={COMMON_REFS[plainRef] || (uid ? `#${uid}-${plainRef}` : ref)}>
      {refName}
    </X.a>
  )
}
