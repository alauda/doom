declare module '*.module.scss' {
  const classes: { [key: string]: string }
  export default classes
}

type MDXProvidedComponents = typeof import('@alauda/doom/runtime')
