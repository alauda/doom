import { FC } from 'react'

import { ExternalSiteBase } from './_ExternalSiteBase.js'

export interface ExternalSiteProps {
  name: string
}

export const ExternalSite: FC<ExternalSiteProps> = ExternalSiteBase

export default ExternalSite
