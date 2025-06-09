/// <reference types="@total-typescript/ts-reset" />
/// <reference types="@alauda/doom/types" />

type MDXProvidedComponents = typeof import('@alauda/doom/runtime')

declare module '*.module.scss' {
  const classes: { [key: string]: string }
  export default classes
}

declare module '*.svg' {
  const content: string
  export default content
}

declare module '*.svg?react' {
  const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>
  export default ReactComponent
}
