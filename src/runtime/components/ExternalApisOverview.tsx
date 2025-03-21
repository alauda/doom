import type { ExternalSiteProps } from './ExternalSite.js'
import { ExternalSiteBase } from './_ExternalSiteBase.js'

export const ExternalApisOverview = ({ name }: ExternalSiteProps) => (
  <ExternalSiteBase name={name} template="apisOverview" />
)

export default ExternalApisOverview
