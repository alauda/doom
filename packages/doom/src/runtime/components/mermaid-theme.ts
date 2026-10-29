// v12's light default is redux-color; dark has to be named or diagrams stay on `dark`.
export const mermaidTheme = (isDark: boolean) =>
  isDark ? 'redux-dark-color' : 'redux-color'
