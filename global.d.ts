declare module '*.module.scss' {
  const classes: { [key: string]: string }
  export default classes
}

type MDXProvidedComponents = typeof import('@alauda/doom/runtime')

declare module 'doom-@api-crdsMap' {
  export default crdsMap
}

declare module 'doom-@api-openapisMap' {
  export default openapisMap
}

declare module 'doom-@permission-functionResourcesMap' {
  export default functionResourcesMap
}

declare module 'doom-@permission-roleTemplatesMap' {
  export default roleTemplatesMap
}
