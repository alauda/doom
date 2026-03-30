/* eslint-disable import-x/export */

import { X } from '../runtime/components/_X.js'

export * from '@rspress/core/theme-original'
export { EditLink } from './EditLink.js'
export { Layout } from './Layout.js'
export { CodeBlock } from './CodeBlock.js'
export { Search } from './Search.js'

export const getCustomMDXComponent = () => X
