import { ExternalSiteBase } from './_ExternalSiteBase.js'
import { ExternalSiteProps } from './ExternalSite.js'

export const ExternalApisOverview = ({ name }: ExternalSiteProps) => (
  <ExternalSiteBase name={name} template="apisOverview" />
)

export default ExternalApisOverview
