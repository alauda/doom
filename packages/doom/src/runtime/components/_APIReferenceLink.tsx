import virtual from 'doom-@global-virtual'

import { ACP_BASE } from '../../shared/constants.js'

import { ExternalSiteLink } from './ExternalSiteLink.js'
import { X } from './_X.js'

export interface ReferenceLinkProps {
  name: string
}

const SELF_REFERENCE_BASES = new Set(['/', ACP_BASE])

export const APIReferenceLink = ({ name }: ReferenceLinkProps) => {
  const href = `/apis/references/${name}.html`

  if (SELF_REFERENCE_BASES.has(virtual.userBase)) {
    return <X.a href={href}>{name}</X.a>
  }

  return (
    <ExternalSiteLink name="acp" href={href}>
      {name}
    </ExternalSiteLink>
  )
}
