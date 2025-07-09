declare module 'doom-@api-crdsMap' {
  export default crdsMap
}

declare module 'doom-@api-openapisMap' {
  export default openapisMap
}

declare module 'doom-@api-virtual' {
  export default virtual
}

declare module 'doom-@global-virtual' {
  export default virtual
}

declare module 'doom-@permission-functionResourcesMap' {
  export default functionResourcesMap
}

declare module 'doom-@permission-roleTemplatesMap' {
  export default roleTemplatesMap
}

declare module 'virtual-runtime-config' {
  import type { NormalizedRuntimeConfig } from '@rspress/shared'

  export const base: NormalizedRuntimeConfig['base']
}

declare module 'md-attr-parser' {
  const parseAttrs: (value?: string | null) => {
    prop: Record<string, string>
    eaten: string
  }
  export = parseAttrs
}
