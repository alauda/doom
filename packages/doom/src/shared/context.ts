import { createContext } from 'react'

import type { BuildInfoGroup } from '../products/index.tsx'

export const BuildInfoContext = createContext<{
  groups: BuildInfoGroup[]
  setGroups: (items: BuildInfoGroup[]) => void
}>(null!)
