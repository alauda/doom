import { useSiteOverrides } from '../hooks/index.js'
import type { SiteBrand } from '../types.js'
import { handleCJKWhitespaces } from '../utils.js'

export interface BrandBaseProps {
  type: keyof SiteBrand
}

export const BrandBase = ({ type }: BrandBaseProps) => {
  const { brand } = useSiteOverrides()
  return <>{handleCJKWhitespaces(brand?.[type])}</>
}
