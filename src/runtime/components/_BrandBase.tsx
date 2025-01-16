import { useSiteOverrides } from '../hooks/index.js'
import type { SiteBrand } from '../types.js'

export interface BrandBaseProps {
  type: keyof SiteBrand
}

export const BrandBase = ({ type }: BrandBaseProps) => {
  const { brand } = useSiteOverrides()
  return <>{brand?.[type]}</>
}
